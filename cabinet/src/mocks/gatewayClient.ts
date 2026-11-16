import type { Transaction } from "@/entities/transaction";
import { HttpError } from "./lib/http";
import { GATEWAY_SECRET_KEY } from "./gateway/config";

// Клиент API шлюза на СЕРВЕРЕ кабинета (server-to-server).
// Секретный ключ используется только здесь и никогда не уходит в браузер.

async function call<T>(origin: string, path: string, body: unknown, idempotencyKey: string): Promise<T> {
  const res = await fetch(`${origin}/api/gateway${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GATEWAY_SECRET_KEY}`,
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new HttpError(res.status, data.error?.code ?? "gateway_error", data.error?.message ?? "Ошибка шлюза");
  }
  return data as T;
}

export function createGatewayTransaction(
  origin: string,
  paymentId: number,
  input: { amount: number; description: string; merchantName: string },
) {
  // ключ = id счёта: даже если запрос повторится, на счёт будет одна транзакция
  return call<Transaction>(origin, "/transactions", input, `payment-${paymentId}`);
}

export function refundGatewayTransaction(origin: string, transactionId: string, amount: number, idempotencyKey: string) {
  return call<{ refund: { id: string; amount: number } }>(
    origin,
    `/transactions/${transactionId}/refunds`,
    { amount },
    idempotencyKey,
  );
}
