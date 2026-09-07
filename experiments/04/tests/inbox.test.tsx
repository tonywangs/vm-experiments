// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DeliveryList } from "../client/components/DeliveryList";
afterEach(cleanup);
it("shows a delivery status and allows inspecting its provider payload", () => {
  render(
    <DeliveryList
      deliveries={[
        {
          id: "delivery-demo",
          eventId: "event-demo",
          shipmentId: "box-atlas",
          status: "applied",
          error: null,
          replayOf: null,
          receivedAt: "2026-06-12T10:00:00Z",
          event: {
            eventId: "event-demo",
            shipmentId: "box-atlas",
            revision: 2,
            status: "in_transit",
            location: "Sorting center",
            occurredAt: "2026-06-12T09:02:00Z",
          },
        },
      ]}
    />,
  );
  expect(screen.getByText("Applied")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /delivery-demo/ }));
  expect(screen.getByLabelText("Provider event payload").textContent).toContain(
    "Sorting center",
  );
});
