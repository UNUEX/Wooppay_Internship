import type { WebhookEvent } from "@/entities/webhook";
import type { Payment } from "@/entities/payment";
import { fromMinor } from "@/shared/lib";
import { db } from "./db";

// Обработка события от шлюза на сервере кабинета.
// Должна быть идемпотентной и устойчивой к порядку:
// вебхуки могут прийти дважды и не в том порядке.
export function applyGatewayEvent(event: WebhookEvent): "processed" | "duplicate" | "ignored" {
  if (db.processedEventIds.has(event.id)) return "duplicate";

  const payment = db.payments.find((p) => p.transactionId === event.data.transactionId);
  if (!payment) return "ignored";

  const awaiting = payment.status === "pending" || payment.status === "failed";

  switch (event.type) {
    case "payment.succeeded":
      // если возврат пришёл раньше успеха (успех ретраился), статус назад не откатываем
      if (awaiting) {
        payment.status = "paid";
        payment.paidAt = event.createdAt;
        payment.lastError = null;
        copyMethod(payment, event);
      }
      break;
    case "payment.failed":
      // клиент ещё может попробовать снова — счёт остаётся открытым
      if (awaiting) {
        payment.status = "failed";
        payment.lastError = event.data.errorCode;
        copyMethod(payment, event);
      }
      break;
    case "payment.expired":
    case "payment.canceled":
      if (awaiting) payment.status = "expired";
      break;
    case "refund.succeeded": {
      // берём максимум: старое событие не должно уменьшить сумму возврата
      const refunded = fromMinor(event.data.refundedAmount);
      payment.refundedAmount = Math.max(payment.refundedAmount, refunded);
      payment.status = payment.refundedAmount >= payment.amount ? "refunded" : "partially_refunded";
      break;
    }
  }

  db.processedEventIds.add(event.id);
  return "processed";
}

function copyMethod(payment: Payment, event: WebhookEvent) {
  payment.method = (event.data.method as Payment["method"]) ?? payment.method;
  payment.cardLast4 = event.data.cardLast4;
}
