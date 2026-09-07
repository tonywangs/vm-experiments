# Parcelwave local provider contract

This is a deterministic carrier stand-in for development. It models webhook delivery semantics, not a real network integration. Event identifiers are generated locally so scenarios can be repeated without resetting the database.

## Two identifiers with different lifetimes

A **shipment** is the domain object. An **event** is an immutable complete snapshot for that shipment. A **delivery** is one attempt to bring an event to this receiver.

```json
{
  "deliveryId": "dlv_demo_1",
  "event": {
    "eventId": "evt_demo_1",
    "shipmentId": "box-atlas",
    "revision": 2,
    "status": "in_transit",
    "location": "Regional sorting center",
    "occurredAt": "2026-06-12T09:02:00.000Z"
  }
}
```

Send an envelope to `POST /api/webhooks/parcelwave`. A valid accepted envelope returns HTTP 202 with the recorded delivery, including its final processing status. A failed local application is represented in that delivery's `status` and `error`; 202 means the envelope was recorded, not that its snapshot was applied.

Every redelivery gets a fresh `deliveryId` but retains the original `eventId` and event data. Reusing an envelope's `deliveryId` is a caller error and returns 409. Provider event IDs are globally unique and stable. The provider never assigns conflicting payloads to the same event ID.

## Revision semantics

Revisions are positive integers ordered within one shipment. Every event carries a full snapshot, so a newer revision can be applied without waiting for missing revisions. Timestamps are descriptive and may be skewed; compare revisions to select the current snapshot. A distinct event with a revision equal to the current snapshot is acknowledged and journaled but does not change the snapshot.

The processed event journal records unique, successfully handled events, including ones whose snapshots are older than the current state. It is not a delivery-attempt log. The inbox holds all delivery attempts, including failures and duplicates.

| Delivery status | Meaning |
| --- | --- |
| Received | Envelope has been stored; application has not finished |
| Applied | New event advanced the shipment snapshot |
| Ignored | New event was processed, but its revision did not advance the shipment |
| Duplicate | This logical event has already been successfully processed |
| Failed | Processing failed; the original event remains eligible for replay |

## Local simulator

`GET /api/simulator/scenarios` lists the four controls. Send `{ "shipmentId": "box-atlas", "scenario": "duplicate" }` to `POST /api/simulator/play` to exercise one of them. The response contains the generated deliveries in arrival order. All handling is synchronous and deterministic for the given starting snapshot.

- `normal`: one new revision, one delivery.
- `duplicate`: one new revision and event, two different delivery IDs.
- `out-of-order`: a delivered snapshot at N+2, followed by an in-transit snapshot at N+1.
- `interrupted`: one new revision with a simulated interruption immediately after the event journal write.

The simulator's `failAfterJournal` envelope flag belongs to local transport metadata. It is not part of the provider event and must not be included in the event when replaying. It is accepted by the local webhook endpoint too, which makes the same failure reproducible with a focused HTTP test.

## Reading and recovery

- `GET /api/health`: process health.
- `GET /api/shipments`: current snapshots.
- `GET /api/shipments/:id`: `{ shipment, deliveries, journal }`, newest records first.
- `POST /api/deliveries/:id/replay`: the requested operator recovery action. The stored source must be failed. Create a fresh envelope with its exact event and record `replayOf` on the new delivery. Healthy replay omits the simulation fault.

A successfully processed event can have several failed historical deliveries. Replaying any of them later should simply produce a duplicate if the event was already recovered. The source failure remains unchanged.

## Storage boundary

Delivery attempts must remain observable even when application fails. Conversely, an event only belongs in the processed journal if its shipment application decision completed successfully. SQLite transactions are available through the repository. This experiment serves all receiver calls synchronously in one Node process.

`DATABASE_PATH=:memory:` is useful for small tests. Use a temporary file to verify behavior after closing and reopening the store. `npm run seed` resets only the configured database and should be used with the API stopped.
