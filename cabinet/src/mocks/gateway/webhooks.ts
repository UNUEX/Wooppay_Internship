import type { WebhookDelivery, WebhookEvent, WebhookEventType } from "@/entities/webhook";
import { newId } from "../lib/ids";
import { buildSignatureHeader } from "../lib/signature";
import { WEBHOOK_RETRY_DELAYS_MS, WEBHOOK_SECRET } from "./config";
import { gatewayDb, type TransactionRecord } from "./store";

// Отправка вебхуков кабинету.
// Гарантия "как минимум один раз": если кабинет не ответил 2xx, шлюз
// повторяет с растущей задержкой. Поэтому одно событие может прийти
// несколько раз — кабинет обязан отбрасывать дубликаты по event.id.

export function emitEvent(type: WebhookEventType, rec: TransactionRecord) {
  const event: WebhookEvent = {
    id: newId("evt"),
    type,
    createdAt: new Date().toISOString(),
    data: {
      transactionId: rec.id,
      status: rec.status,
      amount: rec.amount,
      refundedAmount: rec.refundedAmount,
      method: rec.method,
      cardLast4: rec.card?.last4 ?? null,
      errorCode: rec.lastError?.code ?? null,
    },
  };

  const delivery: WebhookDelivery = {
    id: newId("whd"),
    event,
    status: "pending",
    attempts: [],
    nextAttemptAt: new Date().toISOString(),
  };
  gatewayDb.deliveries.unshift(delivery);

  const url = gatewayDb.webhookUrl;
  if (!url) return; // адрес ещё не настроен (бывает только в юнит-тестах)
  // отправляем асинхронно: ответ клиенту не ждёт кабинет
  setTimeout(() => void deliver(delivery, url), 0);
}

async function deliver(delivery: WebhookDelivery, url: string) {
  const body = JSON.stringify(delivery.event);
  let httpStatus: number | null = null;
  let error: string | undefined;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Webhook-Signature": buildSignatureHeader(WEBHOOK_SECRET, body),
      },
      body,
      signal: AbortSignal.timeout(5_000),
    });
    httpStatus = res.status;
  } catch (e) {
    error = e instanceof Error ? e.message : "network error";
  }

  delivery.attempts.push({ at: new Date().toISOString(), httpStatus, error });

  if (httpStatus !== null && httpStatus >= 200 && httpStatus < 300) {
    delivery.status = "delivered";
    delivery.nextAttemptAt = null;
    return;
  }

  const delay = WEBHOOK_RETRY_DELAYS_MS[delivery.attempts.length - 1];
  if (delay === undefined) {
    // попытки кончились — в реальности алерт и ручная переотправка
    delivery.status = "failed";
    delivery.nextAttemptAt = null;
    return;
  }
  delivery.nextAttemptAt = new Date(Date.now() + delay).toISOString();
  setTimeout(() => void deliver(delivery, url), delay);
}
