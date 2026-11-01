import { Payment, PaymentFormData, SessionUser } from "@/types";
import { request } from "./request";

export function getPayments(user: SessionUser) {
  return request<Payment[]>(`/api/payments?userId=${user.id}&role=${user.role}`);
}

export function createPayment(user: SessionUser, data: PaymentFormData) {
  return request<Payment>("/api/payments", {
    method: "POST",
    body: JSON.stringify({ ...data, userId: user.id }),
  });
}

export function refundPayment(id: number) {
  return request<Payment>(`/api/payments/${id}/refund`, { method: "POST" });
}
