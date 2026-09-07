vm-experiments

A few TypeScript apps I used on an Ubuntu VM.

01  traceboard    screenshot analysis, overlapping requests
02  fieldnotes    document imports and search
03  frameboard    image annotations and revisions
04  parcelroom    webhook delivery and replay
05  contactsheet  batch processing with a separate worker

These versions still have bugs. Notes are in each directory.

Requires Node 24+.

    cd experiments/01
    npm ci
    npm run dev

Open localhost:5173. The API uses port 3001. For 05, use 5177 and 3005.

Over SSH:

    ssh -L 5173:127.0.0.1:5173 user@host

Checks:

    npm run typecheck
    npm test -- --maxWorkers=1 --no-file-parallelism
    npm run build

npm run seed resets the app's data. Stop the app before running it.

05's systemd fault setup isn't included yet; npm run dev runs the app without it.
