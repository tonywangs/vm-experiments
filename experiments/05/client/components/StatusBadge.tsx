import type { BatchStatus } from "../types";

const labels: Record<BatchStatus, string> = {
  queued: "In queue", processing: "Reviewing", completed: "Complete", failed: "Needs attention",
};
export function StatusBadge({ status }: { status: BatchStatus }) {
  return <span className={`status status-${status}`}><span aria-hidden="true" />{labels[status]}</span>;
}
