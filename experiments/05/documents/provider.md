# Local visual review adapter

Contactsheet uses a deterministic adapter, so the application needs no API keys,
network access, or downloaded models. The bundled artwork is original fixture
material. Every frame receives a summary, palette, attention flag, and adapter
version. Repeated analysis of an asset gives the same result.

The small collection has four frames. The launch collection has 72 frames;
each frame is an independent upload even when it uses the same artwork. A batch
is complete only after every frame has a result and its JSON export has been
written. An export contains exactly one record per frame, in original order.

The adapter accepts an open file as an upload body. Its asynchronous delay models
the time a real provider spends consuming that body, so the caller retains the
file until the request finishes. It always closes the file on success or error.
The worker processes batches one at a time and frames concurrently within a batch.

Failed batches retain their identity and diagnostic events. Retry starts a new
attempt on the same batch. A worker restart returns any interrupted batch to the
queue. Completed historical reviews remain unchanged.

## HTTP surface

| Request | Result |
| --- | --- |
| `GET /api/health` | API liveness |
| `GET /api/catalog` | Local assets and available collection sizes |
| `GET /api/batches` | Review history, newest first |
| `POST /api/batches` | Submit `{ "name": "Campaign", "size": "small" }` (`small` or `launch`) |
| `GET /api/batches/:id` | Batch, ordered frames, and recent activity |
| `POST /api/batches/:id/retry` | Retry a failed batch using the same ID |
| `GET /api/batches/:id/export` | Download the completed JSON review |

The API returns `202` when it accepts work; acceptance does not imply the worker
has started it. Batch states are `queued`, `processing`, `completed`, and `failed`.
Validation errors return `400`, missing records `404`, and invalid state transitions
`409`. Structured API and worker logs include a batch ID for request correlation.

## Local development

`npm ci`, `npm run seed`, and `npm run dev` start the API, worker, and Vite frontend.
The development defaults use `.data/contactsheet.sqlite` and `.data/exports`.
Vite runs on port 5177; the API runs on 3005. Override `PORT` and `WEB_PORT` if
the deployed service already occupies these ports.

`npm run build` creates `dist/`. `npm start` serves the API and built frontend in
one process, while `npm run worker` starts its separate queue consumer. Running
the tests exercises a temporary database and temporary export directory.
Deployment commands and service paths are documented in `RUNBOOK.md`.
