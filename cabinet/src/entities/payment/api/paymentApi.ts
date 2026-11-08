import { request } from "@/shared/api";
import type { SessionUser } from "@/entities/user/@x/payment";
import { Payment } from "../model/types";

export function getPayments(user: SessionUser) {
  return request<Payment[]>(`/api/payments?userId=${user.id}&role=${user.role}`);
}
