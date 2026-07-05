from __future__ import annotations

import os
import time
from typing import Any
from urllib.parse import quote

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from open_webui.routers.headmaster_bff import (
    BffError,
    CONFIG_VALUE_TYPES,
    LEGACY_KEY_ENV,
    PROFILE_COLUMNS,
    RUNTIME_ACTIONS,
    get_profile_by_id,
    json_error,
    require_console_admin,
    runtime_control_call,
    supabase_rest,
    update_profile,
)

router = APIRouter()


def parse_int_query(request: Request, name: str, default: int, *, minimum: int = 1, maximum: int | None = None) -> int:
    try:
        value = int(request.query_params.get(name, str(default)))
    except ValueError:
        value = default
    value = max(minimum, value)
    if maximum is not None:
        value = min(maximum, value)
    return value


def sanitize_postgrest_search(value: str) -> str:
    return ''.join(ch for ch in value if ch not in ',()."*').strip()


def validate_config_value(value: Any, value_type: str) -> None:
    if value_type in {'string', 'enum'} and not isinstance(value, str):
        raise BffError(400, 'invalid_request', f'value must be a string for value_type "{value_type}"')
    if value_type == 'number' and not isinstance(value, (int, float)):
        raise BffError(400, 'invalid_request', 'value must be a number for value_type "number"')
    if value_type == 'boolean' and not isinstance(value, bool):
        raise BffError(400, 'invalid_request', 'value must be a boolean for value_type "boolean"')


async def get_target_runtime_id(user_id: str) -> str:
    profile = await get_profile_by_id(user_id, 'runtime_id')
    runtime_id = profile.get('runtime_id') if profile else None
    if not runtime_id:
        raise BffError(404, 'not_found', 'This user has no runtime yet')
    return str(runtime_id)


@router.get('/api/admin/users')
async def admin_list_users(request: Request) -> JSONResponse:
    try:
        await require_console_admin(request)
        q = sanitize_postgrest_search(request.query_params.get('q', ''))
        page = parse_int_query(request, 'page', 1)
        page_size = parse_int_query(request, 'pageSize', 20, maximum=100)
        offset = (page - 1) * page_size
        query = f'select={PROFILE_COLUMNS}&order=created_at.desc&limit={page_size}&offset={offset}'
        count_query = 'select=id'
        if q:
            encoded = quote(q)
            query += f'&or=(email.ilike.*{encoded}*,display_name.ilike.*{encoded}*)'
            count_query += f'&or=(email.ilike.*{encoded}*,display_name.ilike.*{encoded}*)'
        users = await supabase_rest('profiles', query=query)
        total_rows = await supabase_rest('profiles', query=count_query)
        return JSONResponse(
            {
                'users': users if isinstance(users, list) else [],
                'total': len(total_rows) if isinstance(total_rows, list) else 0,
                'page': page,
                'pageSize': page_size,
            }
        )
    except Exception as exc:
        return json_error(exc)


@router.patch('/api/admin/users')
async def admin_update_user(request: Request) -> JSONResponse:
    try:
        _token, admin = await require_console_admin(request)
        body = await request.json()
        target_id = str(body.get('id') or '').strip()
        if not target_id or not any(isinstance(body.get(key), bool) for key in ('beta_approved', 'is_admin')):
            raise BffError(400, 'invalid_request', 'id and at least one of beta_approved/is_admin are required')
        if target_id == admin.id and body.get('is_admin') is False:
            raise BffError(400, 'invalid_request', 'Cannot remove your own admin access')
        update = {key: body[key] for key in ('beta_approved', 'is_admin') if isinstance(body.get(key), bool)}
        data = await supabase_rest(
            'profiles',
            method='PATCH',
            query=f'id=eq.{quote(target_id)}&select={PROFILE_COLUMNS}',
            body=update,
            prefer='return=representation',
        )
        if not isinstance(data, list) or not data:
            raise BffError(404, 'not_found', 'User not found')
        return JSONResponse({'user': data[0]})
    except Exception as exc:
        return json_error(exc)


@router.get('/api/admin/users/{user_id}/runtime')
async def admin_get_user_runtime(user_id: str, request: Request) -> JSONResponse:
    try:
        await require_console_admin(request)
        runtime_id = await get_target_runtime_id(user_id)
        instance = await runtime_control_call(f'/instances/{quote(runtime_id)}')
        budget = None
        try:
            budget = await runtime_control_call(f'/instances/{quote(runtime_id)}/budget')
        except Exception:
            budget = None
        return JSONResponse({'instance': instance, 'budget': budget})
    except Exception as exc:
        return json_error(exc)


@router.post('/api/admin/users/{user_id}/runtime')
async def admin_mutate_user_runtime(user_id: str, request: Request) -> JSONResponse:
    try:
        await require_console_admin(request)
        body = await request.json()
        runtime_id = await get_target_runtime_id(user_id)

        action = body.get('action')
        if action:
            if action not in RUNTIME_ACTIONS:
                raise BffError(400, 'invalid_request', f'action must be one of {", ".join(sorted(RUNTIME_ACTIONS))}')
            if action == 'delete':
                await runtime_control_call(f'/instances/{quote(runtime_id)}', method='DELETE')
                await update_profile(
                    user_id,
                    {'runtime_id': None, 'runtime_status': None, 'runtime_name': None, 'runtime_template': None},
                )
                return JSONResponse({'ok': True, 'deleted': True})
            endpoint = 'update' if action == 'update' else action
            await runtime_control_call(f'/instances/{quote(runtime_id)}/{endpoint}', method='POST')
            instance = await runtime_control_call(f'/instances/{quote(runtime_id)}')
            await update_profile(
                user_id, {'runtime_status': instance.get('status'), 'runtime_name': instance.get('name')}
            )
            return JSONResponse({'ok': True, 'instance': instance})

        if isinstance(body.get('monthly_cap_micros'), (int, float)):
            budget = await runtime_control_call(
                f'/instances/{quote(runtime_id)}/budget',
                method='PATCH',
                body={'monthly_cap_micros': body['monthly_cap_micros']},
            )
            return JSONResponse({'ok': True, 'budget': budget})

        if isinstance(body.get('name'), str):
            name = body['name'].strip()
            if not name:
                raise BffError(400, 'invalid_request', 'name cannot be empty')
            instance = await runtime_control_call(
                f'/instances/{quote(runtime_id)}', method='PATCH', body={'name': name}
            )
            await update_profile(user_id, {'runtime_name': instance.get('name')})
            return JSONResponse({'ok': True, 'instance': instance})

        if isinstance(body.get('signed_url_port'), int):
            instance = await runtime_control_call(f'/instances/{quote(runtime_id)}')
            if not any(port.get('port') == body['signed_url_port'] for port in instance.get('ports', [])):
                raise BffError(404, 'not_found', 'That port is not exposed by this runtime')
            signed = await runtime_control_call(
                f'/instances/{quote(runtime_id)}/signed-url',
                method='POST',
                body={'port': body['signed_url_port']},
            )
            return JSONResponse(signed)

        raise BffError(400, 'invalid_request', 'action, monthly_cap_micros, name, or signed_url_port is required')
    except Exception as exc:
        return json_error(exc)


@router.get('/api/admin/config')
async def admin_get_config(request: Request) -> JSONResponse:
    try:
        await require_console_admin(request)
        config = await supabase_rest('app_config', query='select=*&order=key.asc')
        return JSONResponse({'config': config if isinstance(config, list) else []})
    except Exception as exc:
        return json_error(exc)


@router.patch('/api/admin/config')
async def admin_patch_config(request: Request) -> JSONResponse:
    try:
        _token, admin = await require_console_admin(request)
        body = await request.json()
        key = str(body.get('key') or '').strip()
        if not key:
            raise BffError(400, 'invalid_request', 'key is required')
        if len(key) > 200:
            raise BffError(400, 'invalid_request', 'key is too long')
        value_type = body.get('value_type')
        if value_type is not None and value_type not in CONFIG_VALUE_TYPES:
            raise BffError(400, 'invalid_request', f'value_type must be one of {", ".join(sorted(CONFIG_VALUE_TYPES))}')
        existing = await supabase_rest('app_config', query=f'select=value_type&key=eq.{quote(key)}')
        existing_type = existing[0].get('value_type') if isinstance(existing, list) and existing else None
        if not existing_type and 'value' not in body:
            raise BffError(400, 'invalid_request', 'value is required when creating a new key')
        final_type = value_type or existing_type or 'string'
        if 'value' in body:
            validate_config_value(body['value'], final_type)
        update: dict[str, Any] = {'key': key, 'value_type': final_type, 'updated_by': admin.id}
        if 'value' in body:
            update['value'] = body['value']
        if 'description' in body:
            update['description'] = body['description']
        data = await supabase_rest(
            'app_config',
            method='POST',
            query='on_conflict=key&select=*',
            body=update,
            prefer='resolution=merge-duplicates,return=representation',
        )
        return JSONResponse({'config': data[0] if isinstance(data, list) and data else data})
    except Exception as exc:
        return json_error(exc)


@router.delete('/api/admin/config')
async def admin_delete_config(request: Request) -> JSONResponse:
    try:
        await require_console_admin(request)
        key = request.query_params.get('key')
        if not key:
            raise BffError(400, 'invalid_request', 'key is required')
        await supabase_rest('app_config', method='DELETE', query=f'key=eq.{quote(key)}', prefer='return=minimal')
        return JSONResponse({'ok': True})
    except Exception as exc:
        return json_error(exc)


@router.get('/api/admin/announcements')
async def admin_list_announcements(request: Request) -> JSONResponse:
    try:
        await require_console_admin(request)
        announcements = await supabase_rest('announcements', query='select=*&order=created_at.desc')
        return JSONResponse({'announcements': announcements if isinstance(announcements, list) else []})
    except Exception as exc:
        return json_error(exc)


@router.post('/api/admin/announcements')
async def admin_create_announcement(request: Request) -> JSONResponse:
    try:
        _token, admin = await require_console_admin(request)
        body = await request.json()
        title = str(body.get('title') or '').strip()
        text = str(body.get('body') or '').strip()
        if not title or not text:
            raise BffError(400, 'invalid_request', 'title and body are required')
        data = await supabase_rest(
            'announcements',
            method='POST',
            query='select=*',
            body={'title': title, 'body': text, 'created_by': admin.id},
            prefer='return=representation',
        )
        return JSONResponse({'announcement': data[0] if isinstance(data, list) and data else data})
    except Exception as exc:
        return json_error(exc)


@router.patch('/api/admin/announcements')
async def admin_update_announcement(request: Request) -> JSONResponse:
    try:
        await require_console_admin(request)
        body = await request.json()
        announcement_id = str(body.get('id') or '').strip()
        if not announcement_id or not isinstance(body.get('active'), bool):
            raise BffError(400, 'invalid_request', 'id and active are required')
        data = await supabase_rest(
            'announcements',
            method='PATCH',
            query=f'id=eq.{quote(announcement_id)}&select=*',
            body={'active': body['active']},
            prefer='return=representation',
        )
        if not isinstance(data, list) or not data:
            raise BffError(404, 'not_found', 'Announcement not found')
        return JSONResponse({'announcement': data[0]})
    except Exception as exc:
        return json_error(exc)


@router.get('/api/admin/messages')
async def admin_list_messages(request: Request) -> JSONResponse:
    try:
        await require_console_admin(request)
        messages = await supabase_rest('messages', query='select=*&order=created_at.desc')
        profiles = await supabase_rest('profiles', query='select=id,email')
        email_by_id = (
            {row.get('id'): row.get('email') for row in profiles if isinstance(row, dict)}
            if isinstance(profiles, list)
            else {}
        )
        if isinstance(messages, list):
            for message in messages:
                if isinstance(message, dict):
                    message['sender_email'] = email_by_id.get(message.get('sender_id'))
        return JSONResponse({'messages': messages if isinstance(messages, list) else []})
    except Exception as exc:
        return json_error(exc)


@router.patch('/api/admin/messages')
async def admin_mark_message_read(request: Request) -> JSONResponse:
    try:
        await require_console_admin(request)
        body = await request.json()
        message_id = str(body.get('id') or '').strip()
        if not message_id:
            raise BffError(400, 'invalid_request', 'id is required')
        await supabase_rest(
            'messages',
            method='PATCH',
            query=f'id=eq.{quote(message_id)}',
            body={'read_by_admin': True},
            prefer='return=minimal',
        )
        return JSONResponse({'ok': True})
    except Exception as exc:
        return json_error(exc)


@router.get('/api/admin/health')
async def admin_health(request: Request) -> JSONResponse:
    try:
        await require_console_admin(request)
        checks = {
            'supabase': bool(os.getenv('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('SUPABASE_URL')),
            'service_role': bool(os.getenv('SUPABASE_SERVICE_ROLE_KEY')),
            'runtime_api': bool(os.getenv('RUNTIME_API_KEY') or os.getenv(LEGACY_KEY_ENV)),
        }
        return JSONResponse({'ok': all(checks.values()), 'checks': checks, 'ts': int(time.time())})
    except Exception as exc:
        return json_error(exc)


@router.get('/api/admin/organizations')
async def admin_list_organizations(request: Request) -> JSONResponse:
    try:
        await require_console_admin(request)
        orgs = await supabase_rest('organizations', query='select=*&order=created_at.desc')
        profiles = await supabase_rest('profiles', query='select=organization_id&organization_id=not.is.null')
        counts: dict[str, int] = {}
        if isinstance(profiles, list):
            for row in profiles:
                org_id = row.get('organization_id') if isinstance(row, dict) else None
                if org_id:
                    counts[str(org_id)] = counts.get(str(org_id), 0) + 1
        result = []
        if isinstance(orgs, list):
            result = [
                {**org, 'member_count': counts.get(str(org.get('id')), 0)} for org in orgs if isinstance(org, dict)
            ]
        return JSONResponse({'organizations': result})
    except Exception as exc:
        return json_error(exc)


@router.post('/api/admin/organizations')
async def admin_create_organization(request: Request) -> JSONResponse:
    try:
        _token, admin = await require_console_admin(request)
        body = await request.json()
        name = str(body.get('name') or '').strip()
        if not name:
            raise BffError(400, 'invalid_request', 'name is required')
        data = await supabase_rest(
            'organizations',
            method='POST',
            query='select=*',
            body={'name': name, 'created_by': admin.id},
            prefer='return=representation',
        )
        org = data[0] if isinstance(data, list) and data else data
        admin_email = str(body.get('admin_email') or '').strip()
        if admin_email and isinstance(org, dict) and org.get('id'):
            await supabase_rest(
                'profiles',
                method='PATCH',
                query=f'email=eq.{quote(admin_email)}',
                body={'organization_id': org['id'], 'org_role': 'admin'},
                prefer='return=minimal',
            )
        return JSONResponse({'organization': org})
    except Exception as exc:
        return json_error(exc)


@router.get('/api/admin/organizations/{org_id}/members')
async def admin_list_org_members(org_id: str, request: Request) -> JSONResponse:
    try:
        await require_console_admin(request)
        users = await supabase_rest(
            'profiles', query=f'select={PROFILE_COLUMNS}&organization_id=eq.{quote(org_id)}&order=created_at.desc'
        )
        return JSONResponse({'users': users if isinstance(users, list) else []})
    except Exception as exc:
        return json_error(exc)


@router.patch('/api/admin/organizations/{org_id}/members')
async def admin_update_org_member(org_id: str, request: Request) -> JSONResponse:
    try:
        await require_console_admin(request)
        body = await request.json()
        user_id = str(body.get('user_id') or '').strip()
        if not user_id:
            raise BffError(400, 'invalid_request', 'user_id is required')
        update: dict[str, Any] = {}
        if isinstance(body.get('beta_approved'), bool):
            update['beta_approved'] = body['beta_approved']
        if 'org_role' in body:
            if body['org_role'] is None:
                update['org_role'] = None
                update['organization_id'] = None
            elif body['org_role'] in {'admin', 'member'}:
                update['org_role'] = body['org_role']
            else:
                raise BffError(400, 'invalid_request', 'org_role must be admin, member, or null')
        if not update:
            raise BffError(400, 'invalid_request', 'Nothing to update')
        data = await supabase_rest(
            'profiles',
            method='PATCH',
            query=f'id=eq.{quote(user_id)}&organization_id=eq.{quote(org_id)}&select={PROFILE_COLUMNS}',
            body=update,
            prefer='return=representation',
        )
        if not isinstance(data, list) or not data:
            raise BffError(404, 'not_found', 'User not found in this organization')
        return JSONResponse({'user': data[0]})
    except Exception as exc:
        return json_error(exc)


@router.post('/api/admin/organizations/{org_id}/invite')
async def admin_create_org_invite(org_id: str, request: Request) -> JSONResponse:
    try:
        _token, admin = await require_console_admin(request)
        body = await request.json()
        org_role = 'admin' if body.get('org_role') == 'admin' else 'member'
        orgs = await supabase_rest('organizations', query=f'select=id&id=eq.{quote(org_id)}')
        if not isinstance(orgs, list) or not orgs:
            raise BffError(404, 'not_found', 'Organization not found')
        data = await supabase_rest(
            'org_invitations',
            method='POST',
            query='select=token,org_role,expires_at',
            body={'organization_id': org_id, 'org_role': org_role, 'created_by': admin.id},
            prefer='return=representation',
        )
        return JSONResponse({'invitation': data[0] if isinstance(data, list) and data else data})
    except Exception as exc:
        return json_error(exc)
