import { request } from "@/shared/api";
import type { ConfirmBody, Transaction } from "../model/types";

const BASE = "/api/gateway/transactions";

export function getTransaction(id: string): Promise<Transaction> {
  return request<Transaction>(`${BASE}/${encodeURIComponent(id)}`);
}

// Попытка оплаты выбранным способом. Ключ идемпотентности обязателен:
// при обрыве сети request() повторит запрос с тем же ключом,
// и шлюз не проведёт оплату второй раз.
export function confirmTransaction(id: string, body: ConfirmBody, idempotencyKey: string): Promise<Transaction> {
  return request<Transaction>(`${BASE}/${encodeURIComponent(id)}/confirm`, {
    method: "POST",
    body: JSON.stringify(body),
    idempotencyKey,
  });
}
