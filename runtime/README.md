contactsheet services

Setup for an Ubuntu 24.04 VM with systemd, Python 3 and Node 24+.
Run this on a disposable VM. The installer creates service configuration and
seeds a new database. It refuses to overwrite an existing deployment.

From experiments/05, as an existing non-root user:

    npm ci
    npm run build
    sudo env "PATH=$PATH" python3 ../../runtime/deploy.py "$PWD" --user "$(id -un)" --faults
    sudo systemctl start contactsheet-api contactsheet-worker

Node and the checkout need to be accessible to the service user. The installer
uses the Node executable found on PATH. Services aren't enabled at boot.

Files:

    /etc/contactsheet/                  environment files
    /var/lib/contactsheet/state/       SQLite databases
    /var/lib/contactsheet/exports/     generated reports
    /etc/systemd/system/contactsheet-api.service
    /etc/systemd/system/contactsheet-worker.service

The API serves the built frontend on 127.0.0.1:3005. From your laptop:

    ssh -L 3005:127.0.0.1:3005 user@host

Open localhost:3005.

With --faults, the installer adds three conditions:

    worker-local.env points the worker at preview.sqlite instead of live.sqlite
    the worker has LimitNOFILE=64 with concurrency set to 96
    the exports directory belongs to root and has mode 0755

Without --faults, the worker uses live.sqlite, its open-file limit is 1024,
and the exports directory belongs to the service user. Neither mode changes
the application source.

Things to inspect:

    systemctl cat contactsheet-worker
    systemctl show contactsheet-worker -p User -p EnvironmentFiles -p LimitNOFILE
    sudo journalctl -u contactsheet-worker -n 100 --no-pager
    ls -ld /var/lib/contactsheet/exports

The worker can stay alive while polling the wrong database. After correcting
that, a four-capture batch can succeed further into processing than a batch of
72. The adapter holds files open during concurrent work. Report publication
then depends on the worker being able to write to the exports directory.

To remove the faults from an existing deployment, point worker-local.env at
live.sqlite or remove its override, raise LimitNOFILE to 1024 or lower
WORKER_CONCURRENCY to 8, and give the exports directory to the service user.
Group permissions or an ACL also work; world-write permissions aren't needed.

After editing a unit or drop-in:

    sudo systemctl daemon-reload
    sudo systemctl restart contactsheet-api contactsheet-worker

Rebuild after frontend changes and restart the relevant service after source
changes. Check both batch sizes and the downloaded reports. Existing reports
should survive service restarts. Don't reseed the database to repair it.

The installer doesn't add /api/readiness. That endpoint is described in the
app notes and can be implemented against the worker heartbeat in SQLite.
