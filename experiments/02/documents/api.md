# HTTP reference

All endpoints use JSON and are under `/api`. The Vite development proxy forwards to the API port. Errors return `{ "error": "human-readable message" }`.

| Request | Result |
| --- | --- |
| `GET /health` | `{ ok: true }` |
| `GET /sources` | `{ sources: SourceSummary[] }`, including document counts and most recent completed import |
| `POST /sources/:sourceId/import` | Waits for import; returns `{ receipt: { sourceId, received, pages, completedAt } }` |
| `GET /documents` | `{ documents: Document[] }` |
| `GET /documents?sourceId=atlas` | Documents owned by the specified source |
| `GET /documents/:id` | `{ document: Document }`; URL-encode opaque local IDs |
| `POST /search` | Accepts `{ query: string, sourceId?: string }`; returns `SearchResult` |

Imports are serialized per source and the UI allows one import at a time. A failed import returns HTTP 502 and a useful error; the existing library remains available. Import atomicity after provider failure is outside this exercise.

Queries must contain 1–500 characters after the UI collects them; blank input receives HTTP 400. Source filters must identify Atlas or Beacon. Unknown source imports/documents receive HTTP 404. Search with no matches succeeds with empty evidence and an explanatory answer.

A successful import stores its receipt and persists documents in SQLite. Search itself does not write to the database. All timestamps are ISO 8601 UTC values, formatted locally in the browser.
