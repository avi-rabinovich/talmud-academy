"""Manage this project's GitHub repository using the existing local Git sign-in.

Credentials stay in memory and are never printed or written to project files.
"""
import json
import subprocess
import sys
import urllib.request
import urllib.error

OWNER = 'avi-rabinovich'
REPO = 'talmud-academy'
BASE = f'/repos/{OWNER}/{REPO}'

def credentials():
    result = subprocess.run(['git', 'credential', 'fill'],
                            input=f'protocol=https\nhost=github.com\nusername={OWNER}\n\n',
                            text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError('GitHub sign-in is unavailable.')
    fields = dict(line.split('=', 1) for line in result.stdout.splitlines() if '=' in line)
    if not fields.get('password'):
        raise RuntimeError('GitHub sign-in returned no credential.')
    return fields['password']

token = credentials()

def api(path, method='GET', data=None, allow_missing=False):
    request = urllib.request.Request('https://api.github.com' + path,
        data=json.dumps(data).encode() if data is not None else None,
        headers={'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json',
                 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'Talmud-Academy-Setup',
                 'Content-Type': 'application/json'}, method=method)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read()
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as error:
        if error.code == 404 and allow_missing:
            return None
        details = json.loads(error.read())
        raise RuntimeError(f'GitHub returned {error.code}: {details.get("message", "Request failed")}') from None

try:
    mode = sys.argv[1]
    if mode == 'create':
        user = api('/user')
        if user['login'].lower() != OWNER:
            raise RuntimeError('The signed-in GitHub account does not match the requested owner.')
        repo = api(BASE, allow_missing=True)
        if repo is None:
            repo = api('/user/repos', 'POST', {'name': REPO, 'private': False,
                'description': 'A guided Talmud learning path with vocabulary and interactive daf-parsing quizzes.',
                'auto_init': False, 'has_wiki': False})
            print('Created:', repo['html_url'])
        else:
            print('Repository already exists:', repo['html_url'])
        print('Visibility:', 'private' if repo['private'] else 'public')
    elif mode == 'pages':
        pages = api(BASE + '/pages', allow_missing=True)
        if pages is None:
            pages = api(BASE + '/pages', 'POST', {'build_type': 'workflow'})
        elif pages.get('build_type') != 'workflow':
            raise RuntimeError('Existing Pages uses a different publishing source; not changing it automatically.')
        print('Pages:', pages['html_url'])
        api(BASE, 'PATCH', {'homepage': pages['html_url']})
    elif mode == 'status':
        runs = api(BASE + '/actions/workflows/pages.yml/runs?per_page=3', allow_missing=True)
        for run in (runs or {}).get('workflow_runs', []):
            print(json.dumps({k: run.get(k) for k in ('id','status','conclusion','html_url','head_sha')}))
    elif mode == 'dispatch':
        api(BASE + '/actions/workflows/pages.yml/dispatches', 'POST', {'ref':'main'})
        print('Publication requested.')
    else:
        raise RuntimeError('Use create, pages, status, or dispatch.')
except Exception as error:
    print(str(error), file=sys.stderr)
    sys.exit(1)
