import type { CardSummary } from "@/entities/card";
import type { Transaction } from "@/entities/transaction";
import type { WebhookDelivery } from "@/entities/webhook";
import type { Scenario } from "@/shared/config";

// "База данных" платёжного шлюза. Это ДРУГАЯ система, не кабинет:
// у неё свои транзакции, а кабинет узнаёт о них через API и вебхуки.
// globalThis — чтобы данные не терялись при перезагрузке модулей в dev-режиме.

export type Refund = { id: string; amount: number; createdAt: string };

// Внутренняя запись: публичная Transaction + то, что видит только шлюз
export type TransactionRecord = Transaction & {
  refunds: Refund[];
  pendingScenario: Scenario | null; // что применить после успешного 3DS
  internalReason: string | null; // настоящая причина отказа — для антифрода, НЕ для клиента
};

// Токен карты. Номер карты и CVV тут НЕ хранятся (CVV по стандарту PCI DSS
// хранить нельзя вообще). В настоящем шлюзе номер лежит в отдельном
// зашифрованном хранилище, а наружу ходит только токен.
export type CardToken = {
  id: string;
  card: CardSummary;
  scenario: Scenario;
  transientFailuresLeft: number;
  used: boolean;
  expiresAt: number;
};

type GatewayDb = {
  transactions: Map<string, TransactionRecord>;
  tokens: Map<string, CardToken>;
  deliveries: WebhookDelivery[];
  // куда слать вебхуки. В реальности настраивается в личном кабинете шлюза.
  webhookUrl: string | null;
};

const g = globalThis as unknown as { gatewayDb?: GatewayDb };

export const gatewayDb: GatewayDb = (g.gatewayDb ??= {
  transactions: new Map(seedTransactions().map((t) => [t.id, t])),
  tokens: new Map(),
  deliveries: [],
  webhookUrl: null,
});

// Убираем внутренние поля перед отдачей в браузер
export function toPublic(rec: TransactionRecord): Transaction {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { refunds, pendingScenario, internalReason, ...publicPart } = rec;
  return publicPart;
}

// Демо-данные: транзакции для трёх стартовых платежей из mocks/db.ts
function seedTransactions(): TransactionRecord[] {
  const base = {
    currency: "KZT",
    merchantName: "Магазин",
    method: "card" as const,
    nextAction: null,
    lastError: null,
    attempts: 1,
    expiresAt: "2026-12-31T00:00:00.000Z",
    pendingScenario: null,
    internalReason: null,
    status: "succeeded" as const,
  };
  return [
    { ...base, id: "txn_seed_1", amount: 1_500_000, refundedAmount: 0, description: "Заказ №101", card: { brand: "visa", last4: "4242" }, createdAt: "2026-10-20T10:00:00.000Z", refunds: [] },
    { ...base, id: "txn_seed_2", amount: 820_000, refundedAmount: 0, description: "Заказ №102", card: { brand: "mastercard", last4: "4444" }, createdAt: "2026-10-21T12:30:00.000Z", refunds: [] },
    { ...base, id: "txn_seed_3", amount: 450_000, refundedAmount: 450_000, description: "Заказ №103", card: { brand: "visa", last4: "4242" }, createdAt: "2026-10-22T09:15:00.000Z", refunds: [{ id: "re_seed_3", amount: 450_000, createdAt: "2026-10-23T09:00:00.000Z" }] },
  ];
}
