import type { BatchEvent } from "../types";

export function EventTimeline({ events }: { events: BatchEvent[] }) {
  return <details className="activity">
    <summary>Review activity <span>{events.length} events</span></summary>
    <ol>{events.map((event) => <li key={event.id}>
      <time dateTime={event.at}>{new Date(event.at).toLocaleTimeString()}</time>
      <p>{event.message}</p>
    </li>)}</ol>
  </details>;
}
