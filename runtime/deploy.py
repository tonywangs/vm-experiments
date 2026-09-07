#!/usr/bin/env python3
"""Install the contactsheet service pair on a disposable Linux VM."""
import argparse
import os
from pathlib import Path
import pwd
import re
import shutil
import subprocess


def unit(role, app, node, user, group, faults):
    limit = 64 if role == 'worker' and faults else 1024
    entry = 'worker' if role == 'worker' else 'index'
    return f'''[Unit]
Description=contactsheet {role}
After=network.target

[Service]
Type=simple
User={user}
Group={group}
WorkingDirectory={app}
Environment=PATH={Path(node).parent}:/usr/local/bin:/usr/bin:/bin
EnvironmentFile=/etc/contactsheet/{role}.env
ExecStart={node} --import tsx server/{entry}.ts
Restart=on-failure
RestartSec=2
LimitNOFILE={limit}
MemoryMax=512M
TasksMax=64
CPUQuota=100%
NoNewPrivileges=yes
TimeoutStopSec=10

[Install]
WantedBy=multi-user.target
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('app', type=Path)
    parser.add_argument('--user', required=True, help='existing non-root service account')
    parser.add_argument('--faults', action='store_true', help='install the three failure conditions')
    args = parser.parse_args()
    if os.geteuid() != 0:
        parser.error('run with sudo, preserving the PATH used to install Node')
    app = args.app.resolve()
    account = pwd.getpwnam(args.user)
    if account.pw_uid == 0:
        parser.error('use a non-root service account')
    import grp
    group = grp.getgrgid(account.pw_gid).gr_name
    node, npm = shutil.which('node'), shutil.which('npm')
    if not node or not npm:
        parser.error('Node and npm must be on PATH')
    for value in (str(app), node, args.user, group):
        if not re.fullmatch(r'[A-Za-z0-9_./-]+', value):
            parser.error('paths and account names must contain no whitespace or special characters')
    for relative in ('server/index.ts', 'server/worker.ts', 'dist/index.html', 'node_modules/tsx'):
        if not (app / relative).exists():
            parser.error('run npm ci and npm run build in the app directory first')
    config, data = Path('/etc/contactsheet'), Path('/var/lib/contactsheet')
    units = [Path('/etc/systemd/system') / f'contactsheet-{role}.service' for role in ('api', 'worker')]
    targets = [config, data, *units, *[Path(str(p) + '.d') for p in units]]
    if any(p.exists() or p.is_symlink() for p in targets):
        parser.error('deployment paths already exist; refusing to overwrite data or service configuration')
    def run(command, **kwargs):
        subprocess.run(command, check=True, **kwargs)
    run(['runuser', '-u', args.user, '--', node, '--version'])
    config.mkdir(mode=0o755)
    data.mkdir(mode=0o755)
    for name in ('state', 'exports'):
        path = data / name
        path.mkdir(mode=0o755)
        os.chown(path, account.pw_uid, account.pw_gid)
    env = dict(os.environ, DATABASE_PATH=str(data / 'state/live.sqlite'),
               EXPORT_DIR=str(data / 'exports'), PORT='3005', WORKER_CONCURRENCY='96')
    run(['runuser', '-u', args.user, '--', npm, 'run', 'seed'], cwd=app, env=env)
    base = ''.join(f'{key}={env[key]}\n' for key in ('DATABASE_PATH', 'EXPORT_DIR', 'PORT', 'WORKER_CONCURRENCY'))
    for role, path in zip(('api', 'worker'), units):
        (config / f'{role}.env').write_text(base)
        path.write_text(unit(role, app, node, args.user, group, args.faults))
        path.chmod(0o644)
    if args.faults:
        (config / 'worker-local.env').write_text('DATABASE_PATH=/var/lib/contactsheet/state/preview.sqlite\n')
        drop = Path(str(units[1]) + '.d')
        drop.mkdir()
        (drop / '40-local.conf').write_text('[Service]\nEnvironmentFile=/etc/contactsheet/worker-local.env\n')
        os.chown(data / 'exports', 0, 0)
    run(['systemctl', 'daemon-reload'])
    print('Installed. Services are stopped. Start them with:')
    print('sudo systemctl start contactsheet-api contactsheet-worker')


if __name__ == '__main__':
    main()
