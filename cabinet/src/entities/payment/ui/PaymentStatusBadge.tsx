import { STATUS_LABELS } from "../model/status";
import type { PaymentStatus } from "../model/types";

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABELS[status]}</span>;
}
