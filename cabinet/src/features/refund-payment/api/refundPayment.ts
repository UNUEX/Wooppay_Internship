import { request } from "@/shared/api";

// Возврат идёт через сервер кабинета: только у него есть секретный ключ шлюза.
// Ответ — только подтверждение, что шлюз принял возврат. Статус платежа
// обновится позже, когда придёт вебхук refund.succeeded.
export function refundPayment(id: number, amount: number, idempotencyKey: string) {
  return request<{ refund: { id: string } }>(`/api/payments/${id}/refund`, {
    method: "POST",
    body: JSON.stringify({ amount }),
    idempotencyKey,
  });
}
