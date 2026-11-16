import type { TransactionStatus } from "./types";

// Конечный автомат статусов: из каждого статуса можно перейти только
// в перечисленные. Мок-шлюз проверяет каждый переход — например, нельзя
// "оплатить" уже оплаченную или истёкшую транзакцию.
export const TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  created: ["processing", "requires_action", "succeeded", "failed", "canceled", "expired"],
  failed: ["processing", "requires_action", "succeeded", "failed", "canceled", "expired"], // новая попытка
  requires_action: ["processing", "succeeded", "failed", "canceled", "expired"],
  processing: ["succeeded", "failed"],
  succeeded: [],
  canceled: [],
  expired: [],
};

export function canTransition(from: TransactionStatus, to: TransactionStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

// можно ли начать (новую) попытку оплаты
export function canStartAttempt(status: TransactionStatus): boolean {
  return status === "created" || status === "failed";
}

// попытка закончилась — экран результата может прекратить опрос
export function isAttemptFinished(status: TransactionStatus): boolean {
  return status === "succeeded" || status === "failed" || status === "canceled" || status === "expired";
}
