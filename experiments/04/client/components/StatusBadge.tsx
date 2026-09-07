const labels: Record<string, string> = {
  label_created: "Label created",
  in_transit: "In transit",
  delivered: "Delivered",
  received: "Received",
  applied: "Applied",
  duplicate: "Duplicate",
  ignored: "Ignored",
  failed: "Failed",
};
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge badge-${status}`}>{labels[status] || status}</span>
  );
}
