from __future__ import annotations

import json
import mimetypes
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1] / 'build'

CONFIG = {
    'status': True,
    'name': 'Headmaster (Open WebUI)',
    'version': 'visual-qa',
    'default_locale': 'en-US',
    'oauth': {'providers': {}, 'auto_redirect': False},
    'features': {
        'auth': True,
        'auth_trusted_header': False,
        'enable_signup_password_confirmation': False,
        'enable_ldap': False,
        'enable_signup': True,
        'enable_login_form': True,
        'enable_websocket': False,
    },
    'metadata': {
        'login_footer': 'Headmaster skin applied to the actual Open WebUI frontend. Open WebUI attribution retained.',
        'auth_logo_position': '',
    },
}


USER = {
    'id': 'visual-user',
    'name': 'Headmaster Operator',
    'email': 'visual@example.test',
    'role': 'admin',
    'profile_image_url': '/user.png',
    'token': 'visual-token',
    'permissions': {'chat': {'temporary': True, 'import': True}},
}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args) -> None:
        print('%s - %s' % (self.address_string(), fmt % args))

    def _json(self, payload, status=200):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/api/config':
            return self._json(CONFIG)
        if path == '/api/version':
            return self._json({'version': 'visual-qa', 'deployment_id': 'headmaster-openwebui-visual'})
        if path == '/api/v1/auths/':
            return self._json(USER)
        if path == '/api/v1/users/user/settings':
            return self._json({'ui': {'theme': 'dark', 'showControls': False, 'showChangelog': False}})
        if path == '/api/models':
            return self._json({'data': [{'id': 'headmaster-agent37', 'name': 'Headmaster Agent37'}]})
        if path.startswith('/api/v1/chats'):
            return self._json([])
        if path.startswith('/api/v1/folders'):
            return self._json([])
        if path.startswith('/api/v1/notes'):
            return self._json([])
        if path.startswith('/api/v1/channels'):
            return self._json([])
        if path.startswith('/api/v1/tools'):
            return self._json([])
        if path.startswith('/api/v1/configs/banners'):
            return self._json([])
        if path.startswith('/api/v1/terminals'):
            return self._json([])
        if path.startswith('/api/v1/users/visual-user/profile/image'):
            self.send_response(302)
            self.send_header('Location', '/user.png')
            self.end_headers()
            return
        if path.startswith('/ws/'):
            return self._json({'ok': False}, status=404)

        rel = path.lstrip('/') or 'index.html'
        file_path = (ROOT / rel).resolve()
        if not str(file_path).startswith(str(ROOT.resolve())) or not file_path.exists() or file_path.is_dir():
            file_path = ROOT / 'index.html'

        ctype = mimetypes.guess_type(file_path.name)[0] or 'application/octet-stream'
        body = file_path.read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        path = urlparse(self.path).path
        if path in {'/api/v1/auths/signin', '/api/v1/auths/signup'}:
            return self._json(USER)
        return self._json({'ok': True})


if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', 5051), Handler)
    print('visual mock server on http://127.0.0.1:5051')
    server.serve_forever()
