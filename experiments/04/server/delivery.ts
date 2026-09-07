import type { Store } from "./repository";
import type { Delivery, DeliveryEnvelope } from "./types";

export function createReceiver(store: Store) {
  function receive(
    envelope: DeliveryEnvelope,
    replayOf: string | null = null,
  ): Delivery {
    store.openDelivery(envelope, replayOf);
    const { event, deliveryId } = envelope;
    console.info(
      JSON.stringify({
        action: "delivery.received",
        deliveryId,
        eventId: event.eventId,
        shipmentId: event.shipmentId,
        revision: event.revision,
        replayOf,
      }),
    );
    try {
      if (store.hasProcessed(deliveryId)) {
        return store.finishDelivery(deliveryId, "duplicate");
      }
      store.recordEvent(envelope);
      if (envelope.failAfterJournal)
        throw new Error(
          "Simulated storage interruption; delivery can be replayed.",
        );
      store.updateShipment(event);
      console.info(
        JSON.stringify({
          action: "delivery.applied",
          deliveryId,
          eventId: event.eventId,
        }),
      );
      return store.finishDelivery(deliveryId, "applied");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected receiver failure";
      console.warn(
        JSON.stringify({
          action: "delivery.failed",
          deliveryId,
          eventId: event.eventId,
          error: message,
        }),
      );
      return store.finishDelivery(deliveryId, "failed", message);
    }
  }
  return { receive };
}
