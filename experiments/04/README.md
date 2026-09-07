parcelroom

Webhook delivery, event identity and transactional state.

Use the simulator's normal, duplicate, late-arrival and interrupted-apply cases.
Compare the inbox, event journal and shipment snapshot. Two delivery envelopes
can contain the same event; a late event must not roll the shipment backward.
An interrupted apply must not leave half of the durable change behind.

Replay for failed deliveries is the next part of the workflow. POST /api/deliveries/:id/replay
creates a new envelope containing the original event and uses the healthy local
receiver. Keep the original failure in history. Unknown deliveries return 404;
nonfailed sources return 409. Replaying an already recovered event is harmless.

Refresh the relevant views after replay without losing the operator's note.
This models a single-process receiver, not external queues or distributed locks.

Run with Node 24+: npm ci, then npm run dev. Default web port 5173, API 3001.
Use npm run typecheck, npm test and npm run build to check the source.
