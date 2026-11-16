import type { Payment, PaymentStatus } from "./types";

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Ожидает оплаты",
  failed: "Ошибка оплаты",
  paid: "Оплачен",
  partially_refunded: "Частичный возврат",
  refunded: "Возвращён",
  expired: "Истёк",
};

export const METHOD_LABELS: Record<NonNullable<Payment["method"]>, string> = {
  card: "Карта",
  google_pay: "Google Pay",
  apple_pay: "Apple Pay",
  wallet: "Кошелёк",
};

// сколько ещё можно вернуть клиенту
export function refundableAmount(payment: Payment): number {
  if (payment.status !== "paid" && payment.status !== "partially_refunded") return 0;
  return Math.round((payment.amount - payment.refundedAmount) * 100) / 100;
}

// клиент ещё может оплатить по ссылке
export function isAwaitingPayment(payment: Payment): boolean {
  return payment.status === "pending" || payment.status === "failed";
}
