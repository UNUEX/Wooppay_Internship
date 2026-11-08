import { request } from "@/shared/api";
import { Payment } from "@/entities/payment";

export function refundPayment(id: number) {
  return request<Payment>(`/api/payments/${id}/refund`, { method: "POST" });
}
