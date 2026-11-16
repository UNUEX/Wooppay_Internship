import { describe, expect, it, vi } from "vitest";
import { completeThreeDs, confirmTransaction, createTransaction, getPublicTransaction, refundTransaction } from "./transactions";
import { tokenizeCard } from "./tokens";

// вебхуки в юнит-тестах не отправляем
vi.mock("./webhooks", () => ({ emitEvent: vi.fn() }));

const newTxn = (amount = 10_000) => createTransaction({ amount, description: "Тест", merchantName: "Магазин" });

function payByCard(id: string, number: string) {
  const { token } = tokenizeCard({ number, expiry: "12/30", cvc: "123", holder: "IVAN PETROV" });
  return confirmTransaction(id, { method: "card", token });
}

describe("оплата картой", () => {
  it("успешная карта -> succeeded", () => {
    expect(payByCard(newTxn().id, "4242424242424242").status).toBe("succeeded");
  });

  it("3DS: редирект на банк, верный код -> succeeded", () => {
    const t = newTxn();
    const after = payByCard(t.id, "4000000000003220");
    expect(after.status).toBe("requires_action");
    expect(after.nextAction).toMatchObject({ type: "redirect", reason: "3ds" });
    completeThreeDs(t.id, { code: "1234" });
    expect(getPublicTransaction(t.id).status).toBe("succeeded");
  });

  it("3DS: неверный код -> failed, можно оплатить снова", () => {
    const t = newTxn();
    payByCard(t.id, "4000000000003220");
    completeThreeDs(t.id, { code: "0000" });
    expect(getPublicTransaction(t.id).lastError?.code).toBe("authentication_failed");
    expect(payByCard(t.id, "4242424242424242").status).toBe("succeeded");
  });

  it("украденная карта: клиент видит только card_declined", () => {
    const after = payByCard(newTxn().id, "4000000000009979");
    expect(after.lastError?.code).toBe("card_declined");
    expect(JSON.stringify(after)).not.toContain("stolen");
  });

  it("банк не ответил: 503, транзакция не изменилась, повтор проходит", () => {
    const t = newTxn();
    const { token } = tokenizeCard({ number: "4000000000000119", expiry: "12/30", cvc: "123", holder: "IVAN" });
    expect(() => confirmTransaction(t.id, { method: "card", token })).toThrow(/недоступен/);
    expect(getPublicTransaction(t.id).status).toBe("created");
    expect(confirmTransaction(t.id, { method: "card", token }).status).toBe("succeeded");
  });

  it("оплаченное нельзя оплатить ещё раз", () => {
    const t = newTxn();
    payByCard(t.id, "4242424242424242");
    expect(() => payByCard(t.id, "4242424242424242")).toThrow(/Уже оплачено/);
  });

  it("токен одноразовый", () => {
    const { token } = tokenizeCard({ number: "4242424242424242", expiry: "12/30", cvc: "123", holder: "IVAN" });
    confirmTransaction(newTxn().id, { method: "card", token });
    expect(() => confirmTransaction(newTxn().id, { method: "card", token })).toThrow(/Токен/);
  });

  it("сервер не принимает неверную карту в обход формы", () => {
    expect(() => tokenizeCard({ number: "4242424242424243", expiry: "12/30", cvc: "123", holder: "IVAN" })).toThrow();
    expect(() => tokenizeCard({ number: "4242424242424242", expiry: "01/20", cvc: "123", holder: "IVAN" })).toThrow();
  });

  it("новая попытка другим способом сбрасывает карту прошлой попытки", () => {
    const t = newTxn();
    payByCard(t.id, "4000000000000002"); // отказ
    const after = confirmTransaction(t.id, { method: "wallet" });
    expect(after.card).toBeNull();
    expect(after.nextAction?.reason).toBe("wallet");
  });
});

describe("возвраты", () => {
  it("частичный и полный, но не больше суммы", () => {
    const t = newTxn(10_000);
    payByCard(t.id, "4242424242424242");
    refundTransaction(t.id, 4_000);
    expect(() => refundTransaction(t.id, 7_000)).toThrow(/больше доступной/);
    refundTransaction(t.id, 6_000);
    expect(getPublicTransaction(t.id).refundedAmount).toBe(10_000);
  });

  it("неоплаченное вернуть нельзя", () => {
    expect(() => refundTransaction(newTxn().id, 100)).toThrow(/только оплаченный/);
  });
});
