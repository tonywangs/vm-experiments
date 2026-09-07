traceboard

Overlapping analysis requests, slow selection loads and failed retries.

Try a slow analysis followed by a fast one with a different question. Switch
captures while requests are pending. Fail an analysis after a report exists.

Desired behavior: only the most recently requested analysis can publish for its
capture. Keep the previous report visible while new work runs or fails, with
the question that produced it. Selection changes must not accept stale loads.
Retry uses the failed attempt's question and the currently selected fixture,
without replacing the editor draft. Refresh should preserve server state.

Published reports and current attempts need separate state, including retry
behavior. Process death during a running job is outside this model.

Run with Node 24+: npm ci, then npm run dev. Default web port 5173, API 3001.
Use npm run typecheck, npm test and npm run build to check the source.
