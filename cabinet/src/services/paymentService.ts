import { Payment, SessionUser } from "@/types";
import { request } from "./request";

export function getPayments(user: SessionUser) {
  return request<Payment[]>(`/api/payments?userId=${user.id}&role=${user.role}`);
}
