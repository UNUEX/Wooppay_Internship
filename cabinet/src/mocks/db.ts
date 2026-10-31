import { Payment, SessionUser, User } from "@/types";

// globalThis нужен, чтобы данные не сбрасывались при перезагрузке модулей в dev-режиме
const g = globalThis as unknown as {
  db?: { users: User[]; payments: Payment[] };
};

if (!g.db) {
  g.db = {
    users: [
      { id: 1, name: "Админ", email: "admin@test.com", password: "admin123", role: "admin" },
      { id: 2, name: "Магазин", email: "shop@test.com", password: "shop123", role: "merchant" },
    ],
    payments: [
      { id: 1, customer: "Джон Ким", description: "Заказ №101", amount: 15000, status: "paid", createdAt: "2026-10-20T10:00:00.000Z", userId: 2 },
      { id: 2, customer: "Анна Ким", description: "Заказ №102", amount: 8200, status: "paid", createdAt: "2026-10-21T12:30:00.000Z", userId: 2 },
      { id: 3, customer: "Доу Ким", description: "Заказ №103", amount: 4500, status: "refunded", createdAt: "2026-10-22T09:15:00.000Z", userId: 2 },
    ],
  };
}

export const db = g.db!;

export function toSafeUser(user: User): SessionUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// админ видит все платежи, предприниматель только свои
export function getPaymentsFor(userId: number, role: string): Payment[] {
  if (role === "admin") return db.payments;
  return db.payments.filter((p) => p.userId === userId);
}