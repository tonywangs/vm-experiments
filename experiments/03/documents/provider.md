# Local layout adapter and HTTP API

The adapter in `server/fixtures/provider.ts` is deterministic. It selects fixture
prompts by frame ID and scales source pixel locations to the selected revision's
intrinsic dimensions. This stands in for a visual model and requires no API keys,
network calls, credentials, or machine learning setup. Repeated requests for the
same revision produce the same suggestions. Suggestions do not write to SQLite.

A layout suggestion contains `label`, `body`, `sourceX`, and `sourceY`. The last two
fields use **source image pixels**, not browser pixels. A reviewer can use one as
a draft, edit its text, then save it like any other comment. The UI must keep these
locations consistent with hand-placed review comments.

## Existing API

All error responses are JSON with an `error` string. IDs in paths are URL-encoded.

- `GET /api/health` returns `{ ok: true, application: "frameboard", provider: "local-v1" }`.
- `GET /api/frames` returns `{ frames: Frame[] }`.
- `GET /api/frames/:frameId?revision=:revisionId` returns
  `{ frame, revision, revisions, annotations }`. Omit the query to select the frame's
  current revision. `annotations` includes open and resolved comments for that
  exact revision. A missing frame or mismatched revision returns 404.
- `POST /api/frames/:frameId/revisions/:revisionId/annotations` accepts
  `{ x, y, body }` and returns 201 with `{ annotation }`. The comment starts open.
  The server trims outer whitespace. A blank comment or a comment longer than
  2000 characters, invalid coordinates, or missing fields returns 400.
- `GET /api/frames/:frameId/revisions/:revisionId/suggestions` returns
  `{ suggestions: LayoutSuggestion[] }`; a mismatched revision returns 404.

## API to add for resolution

`PATCH /api/frames/:frameId/revisions/:revisionId/annotations/:annotationId`
accepts `{ resolved: boolean }` and returns 200 with `{ annotation }`, containing
the persisted updated annotation. Repeating the same boolean is harmless.
A missing or non-boolean `resolved` returns 400. A missing annotation or any
mismatch between its frame/revision and the URL returns 404 without modifying it.
This is a state update, not a toggle: retries must not flip the state back.

## Useful probes

```sh
curl -s http://127.0.0.1:3001/api/frames/checkout
curl -s 'http://127.0.0.1:3001/api/frames/checkout?revision=checkout-v1'
curl -s http://127.0.0.1:3001/api/frames/onboarding/revisions/onboarding-v1/suggestions
```

Use the `PORT` assigned to your attempt if it differs from 3001. Request logs show
method, path, status, and elapsed milliseconds. Creation logs show annotation and
scope IDs plus stored coordinates, so it is possible to inspect behavior without
querying database internals.
