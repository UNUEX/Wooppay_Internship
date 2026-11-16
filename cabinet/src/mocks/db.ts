import type { Payment } from "@/entities/payment";
import type { Role, SessionUser, User } from "@/entities/user";

// "База данных" кабинета предпринимателя.
// Платёжный шлюз — отдельная система со своей базой (mocks/gateway/store.ts).

type CabinetDb = {
  users: User[];
  payments: Payment[];
  // id уже обработанных вебхуков — защита от повторной доставки
  processedEventIds: Set<string>;
  // переключатель "сервер кабинета упал", чтобы увидеть повторы вебхуков
  settings: { webhookOutage: boolean };
};

// globalThis нужен, чтобы данные не сбрасывались при перезагрузке модулей в dev-режиме
const g = globalThis as unknown as { cabinetDb?: CabinetDb };

function seedPayment(p: Pick<Payment, "id" | "customer" | "description" | "amount" | "createdAt"> & Partial<Payment>): Payment {
  return {
    status: "paid",
    refundedAmount: 0,
    paidAt: p.createdAt,
    userId: 2,
    transactionId: `txn_seed_${p.id}`,
    payUrl: `/pay/txn_seed_${p.id}`,
    method: "card",
    cardLast4: "4242",
    lastError: null,
    ...p,
  };
}

if (!g.cabinetDb) {
  g.cabinetDb = {
    users: [
      { id: 1, name: "Админ", email: "admin@test.com", password: "admin123", role: "admin" },
      { id: 2, name: "Магазин", email: "shop@test.com", password: "shop123", role: "merchant" },
    ],
    // транзакции с такими же id заведены в демо-данных шлюза
    payments: [
      seedPayment({ id: 1, customer: "Джон Ким", description: "Заказ №101", amount: 15000, createdAt: "2026-10-20T10:00:00.000Z" }),
      seedPayment({ id: 2, customer: "Анна Ким", description: "Заказ №102", amount: 8200, createdAt: "2026-10-21T12:30:00.000Z", cardLast4: "4444" }),
      seedPayment({ id: 3, customer: "Доу Ким", description: "Заказ №103", amount: 4500, createdAt: "2026-10-22T09:15:00.000Z", status: "refunded", refundedAmount: 4500 }),
    ],
    processedEventIds: new Set(),
    settings: { webhookOutage: false },
  };
}

export const db = g.cabinetDb!;

export function toSafeUser(user: User): SessionUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// админ видит все платежи, предприниматель только свои
export function getPaymentsFor(userId: number, role: Role): Payment[] {
  if (role === "admin") return db.payments;
  return db.payments.filter((p) => p.userId === userId);
}
