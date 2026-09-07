contactsheet

An API and a background worker, both using SQLite.

The systemd installer is in ../../runtime/. It can install a working service
configuration or one with database, file-limit and directory-permission faults.
Local npm run dev runs without that service configuration.

Submit a small batch of four captures, then a batch of 72. Inspect the queue,
worker logs and resulting downloads. Preserve the three historical batches.
New reports should remain readable after restarting both services.

GET /api/readiness is an extension to implement. A heartbeat younger than 5000 ms in
the API's database returns 200 with ready=true and workerAgeMs. A missing or
stale heartbeat returns 503 with ready=false. Missing age is null; otherwise
it is nonnegative. /api/health remains a liveness check when the worker stops.

In a Linux deployment, inspect the effective environment, per-process limits
and export-directory ownership alongside application logs.
The workload is one batch at a time. Recovery from a worker killed midway
through an active batch is not implemented.

Run with Node 24+: npm ci, then npm run dev. Default dev web port 5177, API 3005.
Use npm run typecheck, npm test and npm run build to check the source.
