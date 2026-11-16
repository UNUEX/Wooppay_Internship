import { beforeEach, describe, expect, it } from "vitest";
import type { WebhookEvent, WebhookEventType } from "@/entities/webhook";
import { buildSignatureHeader, verifySignature } from "./lib/signature";
import { withIdempotency } from "./lib/idempotency";
import { HttpError } from "./lib/http";
import { applyGatewayEvent } from "./webhookHandler";
import { db } from "./db";

let seq = 0;
function event(type: WebhookEventType, refundedAmount = 0): WebhookEvent {
  return {
    id: `evt_test_${++seq}`,
    type,
    createdAt: new Date().toISOString(),
    data: { transactionId: "txn_test", status: "", amount: 100_000, refundedAmount, method: "card", cardLast4: "4242", errorCode: null },
  };
}

describe("кабинет обрабатывает вебхуки", () => {
  beforeEach(() => {
    db.payments = db.payments.filter((p) => p.transactionId !== "txn_test");
    db.payments.push({
      id: 999, customer: "Тест", description: "", amount: 1000, refundedAmount: 0, status: "pending",
      createdAt: "", paidAt: null, userId: 2, transactionId: "txn_test", payUrl: "", method: null, cardLast4: null, lastError: null,
    });
  });
  const payment = () => db.payments.find((p) => p.transactionId === "txn_test")!;

  it("payment.succeeded -> «Оплачен»", () => {
    applyGatewayEvent(event("payment.succeeded"));
    expect(payment().status).toBe("paid");
    expect(payment().cardLast4).toBe("4242");
  });

  it("неудачная попытка -> «Ошибка», но потом оплата всё равно проходит", () => {
    applyGatewayEvent(event("payment.failed"));
    expect(payment().status).toBe("failed");
    applyGatewayEvent(event("payment.succeeded"));
    expect(payment().status).toBe("paid");
  });

  it("повторная доставка того же события игнорируется", () => {
    const e = event("payment.succeeded");
    expect(applyGatewayEvent(e)).toBe("processed");
    expect(applyGatewayEvent(e)).toBe("duplicate");
  });

  it("частичный возврат: сумма в тиынах переводится в тенге", () => {
    applyGatewayEvent(event("payment.succeeded"));
    applyGatewayEvent(event("refund.succeeded", 30_000)); // 300 ₸
    expect(payment().refundedAmount).toBe(300);
    expect(payment().status).toBe("partially_refunded");
  });

  it("события не по порядку не откатывают статус", () => {
    applyGatewayEvent(event("refund.succeeded", 100_000)); // возврат дошёл раньше успеха
    applyGatewayEvent(event("payment.succeeded"));
    expect(payment().status).toBe("refunded");
  });

  it("старое событие возврата не уменьшает сумму", () => {
    applyGatewayEvent(event("payment.succeeded"));
    applyGatewayEvent(event("refund.succeeded", 60_000));
    applyGatewayEvent(event("refund.succeeded", 30_000));
    expect(payment().refundedAmount).toBe(600);
  });
});

describe("подпись вебхука", () => {
  const secret = "whsec_test";
  const body = JSON.stringify({ id: "evt_1", type: "payment.succeeded" });

  it("правильная подпись проходит, подделка — нет", () => {
    const header = buildSignatureHeader(secret, body);
    expect(verifySignature(header, body, secret)).toBe(true);
    expect(verifySignature(header, body.replace("succeeded", "failed"), secret)).toBe(false);
    expect(verifySignature(buildSignatureHeader("other", body), body, secret)).toBe(false);
  });

  it("старый запрос (replay) не проходит", () => {
    const header = buildSignatureHeader(secret, body, Date.now() - 10 * 60 * 1000);
    expect(verifySignature(header, body, secret)).toBe(false);
  });
});

describe("идемпотентность", () => {
  it("повтор с тем же ключом не выполняет операцию второй раз", async () => {
    let charges = 0;
    const run = () => ({ charged: ++charges });
    await withIdempotency("k1", "test", { amount: 1 }, run);
    const second = await withIdempotency("k1", "test", { amount: 1 }, run);
    expect(charges).toBe(1);
    expect(second.replayed).toBe(true);
  });

  it("тот же ключ с другими данными — ошибка", async () => {
    await withIdempotency("k2", "test", { amount: 1 }, () => ({}));
    await expect(withIdempotency("k2", "test", { amount: 2 }, () => ({}))).rejects.toMatchObject({
      code: "idempotency_key_reused",
    });
  });

  it("после 5xx повтор разрешён", async () => {
    let calls = 0;
    const flaky = () => {
      if (++calls === 1) throw new HttpError(503, "down", "down");
      return { ok: true };
    };
    await expect(withIdempotency("k3", "test", {}, flaky)).rejects.toBeInstanceOf(HttpError);
    expect((await withIdempotency("k3", "test", {}, flaky)).body).toEqual({ ok: true });
  });
});
