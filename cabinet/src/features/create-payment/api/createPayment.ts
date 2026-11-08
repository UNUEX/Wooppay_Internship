import { request } from "@/shared/api";
import { Payment, PaymentFormData } from "@/entities/payment";
import { SessionUser } from "@/entities/user";

export function createPayment(user: SessionUser, data: PaymentFormData) {
  return request<Payment>("/api/payments", {
    method: "POST",
    body: JSON.stringify({ ...data, userId: user.id }),
  });
}
