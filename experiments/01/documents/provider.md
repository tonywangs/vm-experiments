# Local adapter and API notes

The local adapter simulates a service that reads a capture and produces research findings. It is deterministic, consumes no API keys, and never calls an external model. The fixture selector is meant for exploring normal, delayed, and failed work.

## Analysis inputs and output

An analysis receives a snapshot of the selected capture, the submitted question, and a fixture profile. Each request is a separate attempt with its own ID. The provider returns a promise for a report containing a summary and findings. Each finding references stable evidence IDs belonging to its capture.

| Profile | Delay | Outcome |
| --- | ---: | --- |
| `normal` | 900 ms | Success |
| `slow` | 6,000 ms | Success |
| `fast` | 250 ms | Success |
| `failure` | 800 ms | Recoverable error |

Provider calls operate independently. More than one call for a capture can be in progress. The provider does not manage the application's current attempt, publication, selection, or retries.

The report includes the submitted question in its metadata and summary. The findings are deliberately broad canned observations based on saved evidence. Improving their intelligence is outside the exercise.

## HTTP surface

All responses are JSON; unsuccessful requests return `{ "error": "message" }`.

- `GET /api/health` returns `{ "ok": true }`.
- `GET /api/captures` returns `{ "captures": [...] }` with summaries.
- `GET /api/captures/:id` returns `{ "capture", "latestRun", "publishedRun" }`.
- `POST /api/captures/:id/runs` accepts `{ "question": "...", "profile": "normal" }` and returns HTTP 202 with `{ "run": ... }`.
- `GET /api/runs/:id` returns `{ "run": ... }`.

Questions must contain non-whitespace text and be at most 800 characters. `profile` defaults to `normal`. The exact submitted question is stored with the attempt. Run statuses are `running`, `succeeded`, and `failed`; failed runs contain a readable error and successful runs contain a report.

The capture-detail endpoint also simulates a storage read: Atlas takes 100 ms, Relay 650 ms, and Prism 40 ms. It returns the snapshot obtained for that request. These delays are independent of analysis time. The frontend refreshes capture details every 1,200 ms.

## Local architecture

`server/index.ts` starts Express. `server/app.ts` creates the application and routes. The analysis service starts provider work without blocking the POST response. The repository owns the SQLite connection, schema, seeding, and stored attempts.

`client/App.tsx` coordinates selection, the question editor, and the analysis controls. Capture detail loading and polling live in a hook. The report and attempt status are separate components because they represent different pieces of the research workflow.

SQLite state survives browser refreshes. The development process executes provider work in memory; recovery of unfinished work after a server restart is not implemented or required in this exercise.

## Testing hooks

`createApp({ databasePath: ':memory:', detailLatency: false, provider })` constructs an isolated Express app. The optional provider implements `(input) => Promise<Report>`, making it possible to control completion order without waiting for fixture delays. The store and analysis service are also available through `app.locals` for test teardown. Wait for active work with `app.locals.analysis.waitForIdle()` before closing the store.
