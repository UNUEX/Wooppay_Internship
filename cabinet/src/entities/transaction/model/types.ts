import type { CardSummary } from "@/entities/card";

// Транзакция — это платёж глазами ПЛАТЁЖНОГО ШЛЮЗА (эквайера).
// В кабинете есть свой Payment (счёт предпринимателя), а у шлюза — своя
// транзакция с подробным статусом. Связь: payment.transactionId.
//
// created          — шлюз создал транзакцию, клиент ещё не платил
// processing       — запрос ушёл в банк, ответа ещё нет
// requires_action  — нужно действие клиента (3DS, подтверждение в кошельке)
// succeeded        — деньги списаны
// failed           — попытка не удалась (можно попробовать снова)
// canceled/expired — оплатить уже нельзя
export type TransactionStatus =
  | "created"
  | "processing"
  | "requires_action"
  | "succeeded"
  | "failed"
  | "canceled"
  | "expired";

export type PaymentMethod = "card" | "google_pay" | "apple_pay" | "wallet";

// Что фронтенд должен сделать дальше. Решает шлюз, фронтенд только выполняет.
export type NextAction = {
  type: "redirect";
  url: string;
  reason: "3ds" | "wallet";
};

// Публичная часть транзакции — то, что шлюз отдаёт браузеру клиента.
// Здесь нет ни номера карты, ни секретов предпринимателя.
export type Transaction = {
  id: string;
  amount: number; // в тиынах (минимальных единицах)
  refundedAmount: number; // в тиынах
  currency: string;
  description: string;
  merchantName: string;
  status: TransactionStatus;
  method: PaymentMethod | null;
  card: CardSummary | null;
  nextAction: NextAction | null;
  lastError: { code: string } | null;
  attempts: number;
  createdAt: string;
  expiresAt: string;
};

export type ConfirmBody =
  | { method: "card"; token: string }
  | { method: "google_pay"; token: string }
  | { method: "apple_pay"; token: string }
  | { method: "wallet" };
