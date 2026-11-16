import type { CardSummary } from "@/entities/card";
import { canStartAttempt, canTransition, type ConfirmBody, type TransactionStatus } from "@/entities/transaction";
import type { Scenario } from "@/shared/config";
import { THREE_DS_TEST_CODE } from "@/shared/config";
import { HttpError } from "../lib/http";
import { newId } from "../lib/ids";
import { ASYNC_PROCESSING_MS, MAX_ATTEMPTS, TRANSACTION_TTL_MS } from "./config";
import { gatewayDb, toPublic, type TransactionRecord } from "./store";
import { findUsableToken } from "./tokens";
import { emitEvent } from "./webhooks";

// ---------- создание (вызывает сервер кабинета) ----------

export function createTransaction(input: { amount: unknown; description: unknown; merchantName: unknown }) {
  const { amount, description, merchantName } = input;
  if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
    throw new HttpError(400, "invalid_amount", "Сумма — целое число тиынов больше нуля", "amount");
  }

  const now = Date.now();
  const rec: TransactionRecord = {
    id: newId("txn"),
    amount,
    refundedAmount: 0,
    currency: "KZT",
    description: typeof description === "string" ? description.slice(0, 200) : "",
    merchantName: typeof merchantName === "string" ? merchantName : "Магазин",
    status: "created",
    method: null,
    card: null,
    nextAction: null,
    lastError: null,
    attempts: 0,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + TRANSACTION_TTL_MS).toISOString(),
    refunds: [],
    pendingScenario: null,
    internalReason: null,
  };
  gatewayDb.transactions.set(rec.id, rec);
  return toPublic(rec);
}

// ---------- чтение ----------

export function getRecord(id: string): TransactionRecord {
  const rec = gatewayDb.transactions.get(id);
  if (!rec) throw new HttpError(404, "transaction_not_found", "Платёж не найден");
  expireIfNeeded(rec);
  return rec;
}

export function getPublicTransaction(id: string) {
  return toPublic(getRecord(id));
}

// ---------- попытка оплаты (вызывает браузер клиента) ----------

export function confirmTransaction(id: string, body: ConfirmBody) {
  const rec = getRecord(id);
  assertCanStartAttempt(rec);

  // Сначала всё проверяем и только потом меняем транзакцию:
  // если запрос упадёт на проверке, состояние останется прежним.
  let scenario: Scenario;
  let card: CardSummary | null = null;
  switch (body.method) {
    case "card": {
      const token = findUsableToken(body.token);
      // "банк не ответил": 503 ДО изменения состояния, поэтому повтор безопасен
      if (token.transientFailuresLeft > 0) {
        token.transientFailuresLeft--;
        throw new HttpError(503, "acquirer_unavailable", "Банк временно недоступен");
      }
      token.used = true; // токен одноразовый
      card = token.card;
      scenario = token.scenario;
      break;
    }
    case "google_pay":
    case "apple_pay": {
      const wallet = decodeWalletToken(body.token);
      card = wallet.card;
      scenario = wallet.scenario;
      break;
    }
    case "wallet": {
      startAttempt(rec, "wallet", null);
      setStatus(rec, "requires_action");
      // клиент подтверждает оплату на сайте провайдера кошелька
      rec.nextAction = { type: "redirect", url: `/pay/${rec.id}/wallet`, reason: "wallet" };
      return toPublic(rec);
    }
    default:
      throw new HttpError(400, "invalid_method", "Неизвестный способ оплаты", "method");
  }

  startAttempt(rec, body.method, card);
  applyScenario(rec, scenario);
  return toPublic(rec);
}

// ---------- 3-D Secure (страница банка-эмитента) ----------

export function completeThreeDs(id: string, input: { code?: unknown; cancel?: unknown }) {
  const rec = getRecord(id);
  if (rec.status !== "requires_action" || rec.nextAction?.reason !== "3ds") {
    throw new HttpError(409, "no_pending_action", "Платёж не ждёт подтверждения");
  }
  rec.nextAction = null;
  if (input.cancel === true) fail(rec, "authentication_canceled");
  else if (input.code === THREE_DS_TEST_CODE) applyScenario(rec, rec.pendingScenario ?? "approve");
  else fail(rec, "authentication_failed");
  rec.pendingScenario = null;
  return { redirectUrl: `/pay/${rec.id}/result` };
}

// ---------- электронный кошелёк (страница провайдера) ----------

export function completeWallet(id: string, input: { approve?: unknown }) {
  const rec = getRecord(id);
  if (rec.status !== "requires_action" || rec.nextAction?.reason !== "wallet") {
    throw new HttpError(409, "no_pending_action", "Платёж не ждёт подтверждения");
  }
  rec.nextAction = null;
  if (input.approve === true) succeed(rec);
  else fail(rec, "wallet_declined");
  return { redirectUrl: `/pay/${rec.id}/result` };
}

// ---------- возврат (вызывает сервер кабинета) ----------

export function refundTransaction(id: string, amount: unknown) {
  const rec = getRecord(id);
  if (rec.status !== "succeeded") {
    throw new HttpError(409, "not_refundable", "Вернуть можно только оплаченный платёж");
  }
  if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
    throw new HttpError(400, "invalid_amount", "Сумма возврата — целое число тиынов больше нуля", "amount");
  }
  if (amount > rec.amount - rec.refundedAmount) {
    throw new HttpError(400, "amount_too_large", "Сумма возврата больше доступной", "amount");
  }

  const refund = { id: newId("re"), amount, createdAt: new Date().toISOString() };
  rec.refunds.push(refund);
  rec.refundedAmount += amount;
  emitEvent("refund.succeeded", rec);
  return { refund, transaction: toPublic(rec) };
}

// ---------- внутренняя логика ----------

function assertCanStartAttempt(rec: TransactionRecord) {
  if (rec.status === "succeeded") throw new HttpError(409, "payment_already_succeeded", "Уже оплачено");
  if (rec.status === "expired" || rec.status === "canceled") {
    throw new HttpError(410, "payment_expired", "Платёж закрыт");
  }
  if (!canStartAttempt(rec.status)) throw new HttpError(409, "payment_in_progress", "Платёж уже обрабатывается");
  if (rec.attempts >= MAX_ATTEMPTS) {
    setStatus(rec, "canceled");
    emitEvent("payment.canceled", rec);
    throw new HttpError(410, "payment_expired", "Превышено число попыток оплаты");
  }
}

// Новая попытка: всё, что осталось от прошлой (карта, ошибка), сбрасываем
function startAttempt(rec: TransactionRecord, method: TransactionRecord["method"], card: CardSummary | null) {
  rec.attempts++;
  rec.method = method;
  rec.card = card;
  rec.lastError = null;
  rec.internalReason = null;
  rec.nextAction = null;
}

// Как "банк" ответил на списание
function applyScenario(rec: TransactionRecord, scenario: Scenario) {
  switch (scenario) {
    case "approve":
    case "transient":
      return succeed(rec);
    case "three_ds":
      setStatus(rec, "requires_action");
      rec.pendingScenario = "approve";
      // настоящий 3DS: редирект на страницу банка-эмитента, потом обратно
      rec.nextAction = { type: "redirect", url: `/pay/${rec.id}/3ds`, reason: "3ds" };
      return;
    case "decline":
      return fail(rec, "card_declined");
    case "insufficient_funds":
      return fail(rec, "insufficient_funds");
    case "stolen":
      // клиенту — общий отказ, настоящая причина — только внутри шлюза
      rec.internalReason = "stolen_card";
      return fail(rec, "card_declined");
    case "async":
      // ответ банка придёт позже: клиент узнает опросом статуса, кабинет — вебхуком
      setStatus(rec, "processing");
      setTimeout(() => {
        if (rec.status === "processing") succeed(rec);
      }, ASYNC_PROCESSING_MS);
      return;
  }
}

function succeed(rec: TransactionRecord) {
  setStatus(rec, "succeeded");
  emitEvent("payment.succeeded", rec);
}

function fail(rec: TransactionRecord, code: string) {
  setStatus(rec, "failed");
  rec.lastError = { code };
  emitEvent("payment.failed", rec);
}

function setStatus(rec: TransactionRecord, to: TransactionStatus) {
  if (rec.status !== to && !canTransition(rec.status, to)) {
    throw new HttpError(409, "invalid_transition", `Нельзя перейти из ${rec.status} в ${to}`);
  }
  rec.status = to;
}

function expireIfNeeded(rec: TransactionRecord) {
  const open = rec.status === "created" || rec.status === "failed" || rec.status === "requires_action";
  if (open && Date.parse(rec.expiresAt) < Date.now()) {
    rec.status = "expired";
    rec.nextAction = null;
    emitEvent("payment.expired", rec);
  }
}

// Токен Google Pay / Apple Pay. В реальности — зашифрованный блоб,
// который расшифровывает шлюз своим ключом. Наш эмулятор кладёт JSON.
function decodeWalletToken(token: unknown): { scenario: Scenario; card: CardSummary } {
  try {
    const parsed = JSON.parse(String(token)) as { scenario?: string; network?: string; last4?: string };
    const scenario: Scenario =
      parsed.scenario === "decline" || parsed.scenario === "three_ds" ? parsed.scenario : "approve";
    const brand = parsed.network === "MASTERCARD" ? "mastercard" : "visa";
    return { scenario, card: { brand, last4: String(parsed.last4 ?? "0000").slice(-4) } };
  } catch {
    throw new HttpError(400, "invalid_token", "Неверный платёжный токен");
  }
}
