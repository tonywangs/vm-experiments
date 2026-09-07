vm-experiments

Five small systems for poking at state, concurrency and the difference between
source code and a running process. TypeScript, React, Express, SQLite. Local
fixtures throughout. No model keys or external providers.

01 / traceboard
Screenshot analysis with overlapping jobs. Request order and completion order
are different things. Published results, pending work and editor drafts need
separate lifetimes.

02 / fieldnotes
A paginated document importer and a search interface. Empty pages can have a
next cursor. IDs are local to a source. Citations should survive a reordered
list.

03 / frameboard
Comments pinned to image revisions. Browser coordinates, rendered image size
and stored coordinates don't agree unless you make them. Includes zoom,
portrait images and revision-local drafts.

04 / parcelroom
A webhook receiver with duplicate deliveries, out-of-order revisions and an
interrupted write. Delivery history and event identity are separate concerns.
SQLite transactions make the distinction useful.

05 / contactsheet
An API and worker on the same Linux machine. Jobs in SQLite, reports on disk,
heartbeats for readiness. Separate systemd environments, file-descriptor limits
and directory ownership can break a perfectly healthy-looking process.

The checked-in versions preserve the rough edges. Each directory has notes on
what to reproduce. The smoke tests pass on the original versions and don't cover
all of the interesting behavior.

Running one

Node 24 or newer, npm. Pick one directory:

    cd experiments/01
    npm ci
    npm run dev

Vite listens on 127.0.0.1:5173, the API on 127.0.0.1:3001. Experiment 05 uses 5177 and 3005 instead. Run one experiment at
a time with the defaults. For a remote machine:

    ssh -L 5173:127.0.0.1:5173 user@host

Then open http://127.0.0.1:5173 locally. SQLite data stays on the machine running
the API. npm run seed resets that experiment's data; stop it first.

    npm run typecheck
    npm test -- --maxWorkers=1 --no-file-parallelism
    npm run build

The fifth experiment runs locally too, but its original failure conditions
lived in a separate systemd deployment. This repo contains the application
source, not that VM's configuration or a fault-injection installer. Its README
records the service boundaries and expected behavior.

Provider and API contracts live in each app's documents/ directory.

The original Linux deployment used Ubuntu 24.04. The applications are portable. No cloud account setup, SSH keys,
VM addresses, generated databases or session logs are included.
