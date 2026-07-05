from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass
from typing import Any
from urllib.parse import quote

import aiohttp
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse, Response, StreamingResponse

router = APIRouter()

PROVIDER_SLUG = 'agent37'
LEGACY_KEY_ENV = 'AGENT37_API_KEY'
LEGACY_TEMPLATE_ENV = 'AGENT37_TEMPLATE'
LEGACY_DEFAULT_NAME_ENV = 'AGENT37_DEFAULT_AGENT_NAME'
LEGACY_CREDIT_ENV = 'AGENT37_INITIAL_CREDIT_MICROS'

HOSTING_BASE = os.getenv('RUNTIME_API_BASE_URL') or f'https://api.{PROVIDER_SLUG}.com'
INSTANCE_DOMAIN = os.getenv('RUNTIME_INSTANCE_DOMAIN') or f'{PROVIDER_SLUG}.app'
DEFAULT_TEMPLATE = os.getenv('RUNTIME_TEMPLATE') or os.getenv(LEGACY_TEMPLATE_ENV) or 'agent37-hermes'
DEFAULT_AGENT_NAME = os.getenv('RUNTIME_DEFAULT_NAME') or os.getenv(LEGACY_DEFAULT_NAME_ENV) or 'Headmaster runtime'
DEFAULT_CREDIT_MICROS = int(os.getenv('RUNTIME_INITIAL_CREDIT_MICROS') or os.getenv(LEGACY_CREDIT_ENV) or '1000000')

DESKTOP_CORS_ORIGINS = {'http://localhost:5173', 'http://127.0.0.1:5173', 'file://', 'null'}
DESKTOP_CORS_HEADERS = 'Authorization, Content-Type, X-Hermes-Session-Key, X-Hermes-Session-Token'
DESKTOP_CAPABILITIES = ['chat', 'files', 'integrations', 'model_selection']
PROFILE_COLUMNS = 'id,email,display_name,beta_approved,is_admin,organization_id,org_role,runtime_id,runtime_status,runtime_name,runtime_template,created_at'
CONFIG_VALUE_TYPES = {'string', 'number', 'boolean', 'enum', 'json'}
RUNTIME_ACTIONS = {'start', 'stop', 'restart', 'delete', 'update'}
MIN_INTEGRATION_SEARCH = 3
DEFAULT_INTEGRATION_LIMIT = 12
MAX_INTEGRATION_LIMIT = 24


@dataclass
class SupabaseUser:
    id: str
    email: str | None = None


class BffError(Exception):
    def __init__(self, status: int, code: str, message: str) -> None:
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message


class RuntimeApiError(BffError):
    pass


def json_error(exc: Exception) -> JSONResponse:
    if isinstance(exc, BffError):
        return JSONResponse({'error': {'code': exc.code, 'message': exc.message}}, status_code=exc.status)
    return JSONResponse({'error': {'code': 'internal_error', 'message': 'Internal server error'}}, status_code=500)


def bearer_from(headers: Any) -> str | None:
    auth = headers.get('authorization') or headers.get('Authorization') or ''
    parts = auth.split(None, 1)
    if len(parts) == 2 and parts[0].lower() == 'bearer' and parts[1].strip():
        return parts[1].strip()
    return None


def supabase_url() -> str:
    value = os.getenv('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('SUPABASE_URL')
    if not value:
        raise BffError(500, 'config_error', 'Supabase URL is not configured')
    return value.rstrip('/')


def supabase_anon_key() -> str:
    value = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') or os.getenv('SUPABASE_ANON_KEY')
    if not value:
        raise BffError(500, 'config_error', 'Supabase anon key is not configured')
    return value


def supabase_service_key() -> str:
    value = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    if not value:
        raise BffError(500, 'config_error', 'Supabase service role key is not configured')
    return value


def runtime_api_key() -> str:
    value = os.getenv('RUNTIME_API_KEY') or os.getenv(LEGACY_KEY_ENV)
    if not value:
        raise RuntimeApiError(500, 'config_error', 'RUNTIME_API_KEY is not set on the server')
    return value


def instance_base_url(runtime_id: str) -> str:
    return f'https://{runtime_id}.{INSTANCE_DOMAIN}'


def desktop_cors_headers(origin: str | None = None) -> dict[str, str]:
    headers = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': DESKTOP_CORS_HEADERS,
        'Access-Control-Max-Age': '600',
    }
    if origin in DESKTOP_CORS_ORIGINS:
        headers['Access-Control-Allow-Origin'] = origin or ''
        headers['Vary'] = 'Origin'
    return headers


def with_desktop_cors(response: Response, request: Request) -> Response:
    for key, value in desktop_cors_headers(request.headers.get('origin')).items():
        response.headers[key] = value
    return response


async def parse_json_response(resp: aiohttp.ClientResponse) -> Any:
    text = await resp.text()
    if not text:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {'message': text}


async def supabase_user_from_token(token: str) -> SupabaseUser:
    headers = {'apikey': supabase_anon_key(), 'Authorization': f'Bearer {token}'}
    async with aiohttp.ClientSession() as session:
        async with session.get(f'{supabase_url()}/auth/v1/user', headers=headers) as resp:
            data = await parse_json_response(resp)
            if resp.status >= 400 or not isinstance(data, dict) or not data.get('id'):
                raise BffError(401, 'unauthorized', 'Not authenticated')
            return SupabaseUser(id=str(data['id']), email=data.get('email'))


async def require_user(request: Request) -> tuple[str, SupabaseUser]:
    token = bearer_from(request.headers)
    if not token:
        raise BffError(401, 'unauthorized', 'Sign in required')
    return token, await supabase_user_from_token(token)


async def supabase_sign_in(email: str, password: str) -> dict[str, Any]:
    headers = {'apikey': supabase_anon_key(), 'Content-Type': 'application/json'}
    payload = {'email': email, 'password': password}
    async with aiohttp.ClientSession() as session:
        async with session.post(f'{supabase_url()}/auth/v1/token?grant_type=password', headers=headers, json=payload) as resp:
            data = await parse_json_response(resp)
            if resp.status >= 400 or not isinstance(data, dict) or not data.get('access_token'):
                message = data.get('msg') or data.get('message') if isinstance(data, dict) else None
                raise BffError(401, 'invalid_credentials', message or 'Invalid credentials')
            return data


async def supabase_sign_up(email: str, password: str) -> dict[str, Any]:
    headers = {'apikey': supabase_anon_key(), 'Content-Type': 'application/json'}
    payload = {'email': email, 'password': password}
    async with aiohttp.ClientSession() as session:
        async with session.post(f'{supabase_url()}/auth/v1/signup', headers=headers, json=payload) as resp:
            data = await parse_json_response(resp)
            if resp.status >= 400 or not isinstance(data, dict):
                message = data.get('msg') or data.get('message') if isinstance(data, dict) else None
                raise BffError(resp.status, 'signup_failed', message or 'Sign up failed')
            return data


def service_headers(extra: dict[str, str] | None = None) -> dict[str, str]:
    key = supabase_service_key()
    return {'apikey': key, 'Authorization': f'Bearer {key}', **(extra or {})}


async def get_profile(user: SupabaseUser) -> dict[str, Any] | None:
    query = 'select=id,email,display_name,runtime_id,beta_approved,runtime_status,runtime_name,runtime_template'
    url = f'{supabase_url()}/rest/v1/profiles?{query}&id=eq.{quote(user.id)}'
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=service_headers()) as resp:
            data = await parse_json_response(resp)
            if resp.status >= 400:
                raise BffError(500, 'db_error', data.get('message', 'Profile lookup failed') if isinstance(data, dict) else 'Profile lookup failed')
            if isinstance(data, list) and data:
                return data[0]
            return None


async def upsert_profile(values: dict[str, Any]) -> None:
    headers = service_headers({
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal',
    })
    async with aiohttp.ClientSession() as session:
        async with session.post(f'{supabase_url()}/rest/v1/profiles?on_conflict=id', headers=headers, json=values) as resp:
            if resp.status >= 400:
                data = await parse_json_response(resp)
                raise BffError(500, 'db_error', data.get('message', 'Profile update failed') if isinstance(data, dict) else 'Profile update failed')


async def update_profile(user_id: str, values: dict[str, Any]) -> None:
    headers = service_headers({'Content-Type': 'application/json', 'Prefer': 'return=minimal'})
    async with aiohttp.ClientSession() as session:
        async with session.patch(f'{supabase_url()}/rest/v1/profiles?id=eq.{quote(user_id)}', headers=headers, json=values) as resp:
            if resp.status >= 400:
                data = await parse_json_response(resp)
                raise BffError(500, 'db_error', data.get('message', 'Profile update failed') if isinstance(data, dict) else 'Profile update failed')


async def supabase_rest(
    table: str,
    *,
    method: str = 'GET',
    query: str = '',
    body: Any = None,
    prefer: str | None = None,
) -> Any:
    headers = service_headers({'Content-Type': 'application/json'})
    if prefer:
        headers['Prefer'] = prefer
    url = f'{supabase_url()}/rest/v1/{table}' + (f'?{query}' if query else '')
    async with aiohttp.ClientSession() as session:
        async with session.request(method, url, headers=headers, json=body) as resp:
            data = await parse_json_response(resp)
            if resp.status >= 400:
                message = data.get('message') if isinstance(data, dict) else None
                raise BffError(500, 'db_error', message or f'{table} request failed')
            return data


async def get_profile_by_id(user_id: str, columns: str = PROFILE_COLUMNS) -> dict[str, Any] | None:
    data = await supabase_rest('profiles', query=f'select={columns}&id=eq.{quote(user_id)}')
    return data[0] if isinstance(data, list) and data else None


async def is_console_admin(user: SupabaseUser) -> bool:
    if not (os.getenv('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('SUPABASE_URL')) or not os.getenv('SUPABASE_SERVICE_ROLE_KEY'):
        return os.getenv('NODE_ENV') != 'production'
    profile = await get_profile_by_id(user.id, 'is_admin')
    return bool(profile and profile.get('is_admin') is True)


async def require_console_admin(request: Request) -> tuple[str, SupabaseUser]:
    token, user = await require_user(request)
    if not await is_console_admin(user):
        raise BffError(403, 'forbidden', 'Console admin required')
    return token, user


def parse_int_query(request: Request, name: str, default: int, *, minimum: int = 1, maximum: int | None = None) -> int:
    try:
        value = int(request.query_params.get(name, str(default)))
    except ValueError:
        value = default
    value = max(minimum, value)
    if maximum is not None:
        value = min(maximum, value)
    return value


def clamp_integration_limit(value: str | None) -> int:
    try:
        parsed = int(value or str(DEFAULT_INTEGRATION_LIMIT))
    except ValueError:
        parsed = DEFAULT_INTEGRATION_LIMIT
    return min(max(parsed, 1), MAX_INTEGRATION_LIMIT)


def require_toolkit(value: Any) -> str:
    toolkit = str(value or '').strip()
    if not toolkit:
        raise BffError(400, 'invalid_request', 'toolkit is required')
    return toolkit


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


async def runtime_control_call(path: str, method: str = 'GET', body: dict[str, Any] | None = None) -> Any:
    headers = {'Authorization': f'Bearer {runtime_api_key()}', 'Content-Type': 'application/json'}
    async with aiohttp.ClientSession() as session:
        async with session.request(method, f'{HOSTING_BASE}/v1{path}', headers=headers, json=body) as resp:
            data = await parse_json_response(resp)
            if resp.status >= 400:
                message = None
                code = 'error'
                if isinstance(data, dict):
                    err = data.get('error') if isinstance(data.get('error'), dict) else data
                    message = err.get('message') if isinstance(err, dict) else None
                    code = err.get('code') if isinstance(err, dict) and err.get('code') else code
                if resp.status == 402 and message:
                    message = f'{message} (Runtime provider payment required — fund the wallet, then retry.)'
                raise RuntimeApiError(resp.status, code, message or resp.reason)
            return data


async def instance_json_call(runtime_id: str, path: str, method: str = 'GET', body: dict[str, Any] | None = None) -> Any:
    headers = {'Authorization': f'Bearer {runtime_api_key()}', 'Content-Type': 'application/json'}
    async with aiohttp.ClientSession() as session:
        async with session.request(method, f'{instance_base_url(runtime_id)}{path}', headers=headers, json=body) as resp:
            data = await parse_json_response(resp)
            if resp.status >= 400:
                message = data.get('message') if isinstance(data, dict) else None
                raise RuntimeApiError(resp.status, 'error', message or resp.reason)
            return data


async def get_current_runtime(user: SupabaseUser) -> tuple[str, dict[str, Any]]:
    if not (os.getenv('RUNTIME_API_KEY') or os.getenv(LEGACY_KEY_ENV)) and os.getenv('NODE_ENV') != 'production':
        instance = {
            'id': 'dev-runtime',
            'status': 'running',
            'template': DEFAULT_TEMPLATE,
            'name': DEFAULT_AGENT_NAME,
            'ports': [{'port': 3737, 'default': True, 'url': 'http://localhost:8642'}],
        }
        return 'dev-runtime', instance

    profile = await get_profile(user)
    if not profile or profile.get('beta_approved') is not True:
        raise BffError(403, 'not_approved', 'Your account is pending approval before a runtime can be used.')

    runtime_id = profile.get('runtime_id')
    if runtime_id:
        instance = await runtime_control_call(f'/instances/{quote(str(runtime_id))}')
        await update_profile(user.id, {'runtime_status': instance.get('status'), 'runtime_name': instance.get('name')})
        return str(runtime_id), instance

    email = user.email or profile.get('email')
    display_name = profile.get('display_name') or (email.split('@')[0] if email else None) or 'Headmaster user'
    create_body = {
        'template': DEFAULT_TEMPLATE,
        'user': user.id,
        'name': f'Gcaplabs-{email}' if email else f"{display_name}'s Headmaster",
        'metadata': {'app': 'headmaster-console', 'supabase_user_id': user.id, 'email': email},
    }
    if DEFAULT_CREDIT_MICROS > 0:
        create_body['budget'] = {'credit_micros': DEFAULT_CREDIT_MICROS}
    instance = await runtime_control_call('/instances', method='POST', body=create_body)
    runtime_id = str(instance['id'])
    await upsert_profile({
        'id': user.id,
        'email': email,
        'display_name': display_name,
        'runtime_id': runtime_id,
        'runtime_status': instance.get('status'),
        'runtime_name': instance.get('name'),
        'runtime_template': instance.get('template'),
    })
    return runtime_id, instance


def group_models_by_provider(models: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[str, dict[str, Any]] = {}
    for model in models:
        key = model.get('provider') or model.get('owned_by') or 'default'
        entry = grouped.setdefault(str(key), {'name': str(key), 'available_models': []})
        if model.get('id'):
            entry['available_models'].append(str(model['id']))
    return [
        {
            'slug': slug,
            'name': entry['name'],
            'runtime_provider': slug,
            'base_url': '',
            'available_models': entry['available_models'],
            'enabled': True,
        }
        for slug, entry in grouped.items()
    ]


async def build_provision_response(request: Request, token: str, user: SupabaseUser) -> dict[str, Any]:
    runtime_id, _instance = await get_current_runtime(user)
    origin = str(request.base_url).rstrip('/')
    models = None
    if runtime_id != 'dev-runtime':
        try:
            models = await instance_json_call(runtime_id, '/v1/models')
        except Exception:
            models = None
    providers = group_models_by_provider(models.get('data', [])) if isinstance(models, dict) else []
    return {
        'mode': 'headmaster_remote',
        'backend': 'managed-runtime',
        'user': {'id': user.id, 'username': user.email or user.id, 'role': 'user'},
        'capabilities': DESKTOP_CAPABILITIES,
        'runtime': {
            'base_url': origin,
            'api_base_path': '/api/v1',
            'health_url': f'{origin}/api/v1/health',
            'validate_url': f'{origin}/api/desktop/runtime/validate',
            'version_url': f'{origin}/api/v1/version',
            'ttl_seconds': 3600,
        },
        'cloud_container_config': {
            'endpoint_url': origin,
            'container_id': runtime_id,
            'forward_auth_token': token,
            'forward_auth_expires_at': None,
        },
        'session_namespace': f'headmaster:{user.id}',
        'providers': providers,
        'default_model': models.get('default_model') if isinstance(models, dict) else None,
        'default_provider': models.get('default_provider') if isinstance(models, dict) else None,
        'app_settings': {
            'app_name': 'Headmaster',
            'app_short_name': 'Headmaster',
            'theme_mode': 'dark',
            'default_locale': 'en',
        },
    }


@router.post('/api/auth/login')
async def login(request: Request) -> JSONResponse:
    try:
        body = await request.json()
        email = str(body.get('email') or body.get('username') or '').strip()
        password = str(body.get('password') or '')
        if not email or not password:
            raise BffError(400, 'invalid_request', 'email/username and password are required')
        data = await supabase_sign_in(email, password)
        return JSONResponse({
            'access_token': data.get('access_token'),
            'refresh_token': data.get('refresh_token'),
            'token_type': 'bearer',
            'expires_in': data.get('expires_in'),
            'user': data.get('user'),
        })
    except Exception as exc:
        return json_error(exc)


@router.post('/api/auth/register')
async def register(request: Request) -> JSONResponse:
    try:
        body = await request.json()
        email = str(body.get('email') or '').strip()
        password = str(body.get('password') or '')
        if not email or not password:
            raise BffError(400, 'invalid_request', 'email and password are required')
        if len(password) < 8:
            raise BffError(400, 'invalid_request', 'Password must be at least 8 characters.')
        data = await supabase_sign_up(email, password)
        if not data.get('access_token'):
            return JSONResponse({'confirmation_required': True, 'user': data.get('user')})
        return JSONResponse({
            'access_token': data.get('access_token'),
            'refresh_token': data.get('refresh_token'),
            'token_type': 'bearer',
            'expires_in': data.get('expires_in'),
            'user': data.get('user'),
        })
    except Exception as exc:
        return json_error(exc)


@router.get('/api/auth/me')
async def me(request: Request) -> JSONResponse:
    try:
        _token, user = await require_user(request)
        return JSONResponse({'id': user.id, 'username': user.email or user.id, 'role': 'user'})
    except Exception as exc:
        return json_error(exc)


@router.post('/api/auth/refresh')
async def refresh(request: Request) -> JSONResponse:
    try:
        token, _user = await require_user(request)
        return JSONResponse({'access_token': token, 'token_type': 'bearer', 'expires_in': 3600})
    except Exception as exc:
        return json_error(exc)


@router.api_route('/api/desktop/provision/current', methods=['GET', 'POST', 'OPTIONS'])
@router.api_route('/api/desktop/provision', methods=['GET', 'POST', 'OPTIONS'])
async def provision(request: Request) -> Response:
    if request.method == 'OPTIONS':
        return Response(status_code=204, headers=desktop_cors_headers(request.headers.get('origin')))
    try:
        token, user = await require_user(request)
        return with_desktop_cors(JSONResponse(await build_provision_response(request, token, user)), request)
    except Exception as exc:
        return with_desktop_cors(json_error(exc), request)


@router.api_route('/api/desktop/runtime/validate', methods=['POST', 'OPTIONS'])
async def validate_runtime(request: Request) -> Response:
    if request.method == 'OPTIONS':
        return Response(status_code=204, headers=desktop_cors_headers(request.headers.get('origin')))
    try:
        await require_user(request)
        body = await request.json() if request.headers.get('content-type', '').startswith('application/json') else {}
        requested = body.get('requested_capability') if isinstance(body, dict) else None
        return with_desktop_cors(JSONResponse({
            'allowed': not requested or requested in DESKTOP_CAPABILITIES,
            'capabilities': DESKTOP_CAPABILITIES,
            'role': 'user',
            'ttl_seconds': 300,
        }), request)
    except Exception as exc:
        return with_desktop_cors(json_error(exc), request)


@router.api_route('/api/chat/integrations/toolkits', methods=['GET', 'OPTIONS'])
async def list_integration_toolkits(request: Request) -> Response:
    if request.method == 'OPTIONS':
        return Response(status_code=204, headers=desktop_cors_headers(request.headers.get('origin')))
    try:
        _token, user = await require_user(request)
        search = (request.query_params.get('search') or '').strip()
        if search and len(search) < MIN_INTEGRATION_SEARCH:
            return with_desktop_cors(JSONResponse({'toolkits': [], 'nextCursor': None}), request)
        cursor = (request.query_params.get('cursor') or '').strip()
        limit = clamp_integration_limit(request.query_params.get('limit'))
        runtime_id, _instance = await get_current_runtime(user)
        params = []
        if search:
            params.append(f'search={quote(search)}')
        if cursor:
            params.append(f'cursor={quote(cursor)}')
        params.append(f'limit={limit}')
        data = await runtime_control_call(f'/instances/{quote(runtime_id)}/integrations/toolkits?{"&".join(params)}')
        items = data.get('items') if isinstance(data, dict) else []
        next_cursor = data.get('nextCursor') if isinstance(data, dict) else None
        return with_desktop_cors(JSONResponse({'toolkits': items if isinstance(items, list) else [], 'nextCursor': next_cursor or None}), request)
    except Exception as exc:
        return with_desktop_cors(json_error(exc), request)


@router.api_route('/api/chat/integrations/connections', methods=['GET', 'OPTIONS'])
async def list_integration_connections(request: Request) -> Response:
    if request.method == 'OPTIONS':
        return Response(status_code=204, headers=desktop_cors_headers(request.headers.get('origin')))
    try:
        _token, user = await require_user(request)
        runtime_id, _instance = await get_current_runtime(user)
        data = await runtime_control_call(f'/instances/{quote(runtime_id)}/integrations/connections')
        connections = data.get('connections') if isinstance(data, dict) else []
        return with_desktop_cors(JSONResponse({'connections': connections if isinstance(connections, list) else []}), request)
    except Exception as exc:
        return with_desktop_cors(json_error(exc), request)


@router.api_route('/api/chat/integrations/connect', methods=['POST', 'OPTIONS'])
async def connect_integration_toolkit(request: Request) -> Response:
    if request.method == 'OPTIONS':
        return Response(status_code=204, headers=desktop_cors_headers(request.headers.get('origin')))
    try:
        _token, user = await require_user(request)
        body = await request.json()
        toolkit = require_toolkit(body.get('toolkit') if isinstance(body, dict) else None)
        runtime_id, _instance = await get_current_runtime(user)
        data = await runtime_control_call(
            f'/instances/{quote(runtime_id)}/integrations/connect',
            method='POST',
            body={'toolkit': toolkit},
        )
        return with_desktop_cors(JSONResponse({
            'redirectUrl': data.get('redirectUrl') if isinstance(data, dict) else None,
            'connectedAccountId': data.get('connectedAccountId') if isinstance(data, dict) else None,
        }), request)
    except Exception as exc:
        return with_desktop_cors(json_error(exc), request)


@router.api_route('/api/chat/integrations/register-mcp', methods=['POST', 'OPTIONS'])
async def register_integration_mcp(request: Request) -> Response:
    if request.method == 'OPTIONS':
        return Response(status_code=204, headers=desktop_cors_headers(request.headers.get('origin')))
    try:
        await require_user(request)
        body = await request.json()
        require_toolkit(body.get('toolkit') if isinstance(body, dict) else None)
        # Agent37/Composio attaches the runtime provider integration on the hosting side.
        # This route is intentionally kept as a compatibility no-op for the OAuth callback flow.
        return with_desktop_cors(JSONResponse({'ok': True, 'registered': True, 'provider': 'managed-runtime'}), request)
    except Exception as exc:
        return with_desktop_cors(json_error(exc), request)


@router.api_route('/api/chat/integrations/connections/{connection_id}', methods=['DELETE', 'OPTIONS'])
async def disconnect_integration_connection(connection_id: str, request: Request) -> Response:
    if request.method == 'OPTIONS':
        return Response(status_code=204, headers=desktop_cors_headers(request.headers.get('origin')))
    try:
        _token, user = await require_user(request)
        connection = str(connection_id or '').strip()
        if not connection:
            raise BffError(400, 'invalid_request', 'connection id is required')
        runtime_id, _instance = await get_current_runtime(user)
        await runtime_control_call(
            f'/instances/{quote(runtime_id)}/integrations/connections/{quote(connection)}',
            method='DELETE',
        )
        return with_desktop_cors(JSONResponse({'ok': True}), request)
    except Exception as exc:
        return with_desktop_cors(json_error(exc), request)


class HeadmasterDesktopV1ProxyMiddleware:
    """Pure-ASGI bridge for Headmaster Desktop Supabase-bearer `/api/v1/*` calls.

    OpenWebUI owns many `/api/v1/*` routes too. This middleware only intercepts
    requests that carry a valid Supabase bearer token from the desktop. Everything
    else falls through to OpenWebUI unchanged.
    """

    def __init__(self, app: Any) -> None:
        self.app = app

    async def __call__(self, scope: dict[str, Any], receive: Any, send: Any) -> None:
        if scope.get('type') != 'http':
            await self.app(scope, receive, send)
            return

        path = scope.get('path') or ''
        method = scope.get('method') or 'GET'
        if not path.startswith('/api/v1/'):
            await self.app(scope, receive, send)
            return

        headers = {k.decode('latin1').lower(): v.decode('latin1') for k, v in scope.get('headers', [])}
        origin = headers.get('origin')
        if method == 'OPTIONS' and origin in DESKTOP_CORS_ORIGINS:
            response = Response(status_code=204, headers=desktop_cors_headers(origin))
            await response(scope, receive, send)
            return

        token = bearer_from(headers)
        if not token:
            await self.app(scope, receive, send)
            return

        try:
            user = await supabase_user_from_token(token)
        except Exception:
            await self.app(scope, receive, send)
            return

        try:
            runtime_id, _instance = await get_current_runtime(user)
            response = await self._proxy(scope, receive, path, runtime_id, headers, origin)
        except Exception as exc:
            response = json_error(exc)
            for key, value in desktop_cors_headers(origin).items():
                response.headers[key] = value
        await response(scope, receive, send)

    async def _read_body(self, receive: Any) -> bytes:
        chunks: list[bytes] = []
        more_body = True
        while more_body:
            message = await receive()
            if message.get('type') != 'http.request':
                break
            chunks.append(message.get('body', b''))
            more_body = bool(message.get('more_body'))
        return b''.join(chunks)

    async def _proxy(
        self,
        scope: dict[str, Any],
        receive: Any,
        path: str,
        runtime_id: str,
        incoming_headers: dict[str, str],
        origin: str | None,
    ) -> Response:
        method = scope.get('method') or 'GET'
        query = scope.get('query_string', b'').decode('latin1')
        suffix = path[len('/api/v1/'):]
        upstream_url = f'{instance_base_url(runtime_id)}/v1/{suffix}' + (f'?{query}' if query else '')
        body = None if method in {'GET', 'HEAD'} else await self._read_body(receive)
        forward_headers = {
            key: value
            for key, value in incoming_headers.items()
            if key.lower() not in {'host', 'content-length', 'authorization'}
        }
        forward_headers['Authorization'] = f'Bearer {runtime_api_key()}'

        session = aiohttp.ClientSession()
        upstream = await session.request(method, upstream_url, headers=forward_headers, data=body)
        response_headers = {
            key: value
            for key, value in upstream.headers.items()
            if key.lower() not in {'content-encoding', 'content-length', 'transfer-encoding'}
        }
        response_headers.update(desktop_cors_headers(origin))

        async def body_iter():
            try:
                async for chunk in upstream.content.iter_chunked(65536):
                    yield chunk
            finally:
                upstream.close()
                await session.close()

        return StreamingResponse(body_iter(), status_code=upstream.status, headers=response_headers)


@router.get('/api/headmaster/bff/health')
async def bff_health() -> JSONResponse:
    configured = all([
        os.getenv('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('SUPABASE_URL'),
        os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') or os.getenv('SUPABASE_ANON_KEY'),
        os.getenv('SUPABASE_SERVICE_ROLE_KEY'),
        os.getenv('RUNTIME_API_KEY') or os.getenv(LEGACY_KEY_ENV),
    ])
    return JSONResponse({'ok': True, 'configured': configured, 'ts': int(time.time())})
