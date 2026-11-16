import type { PaymentMethod } from "@/entities/transaction/@x/payment";

// Статус счёта в кабинете предпринимателя. Меняется ТОЛЬКО по вебхукам
// от платёжного шлюза — не по действиям в браузере клиента.
// pending            — счёт выставлен, клиент ещё не оплатил
// failed             — последняя попытка не удалась, но клиент может попробовать снова
// paid               — оплачен
// partially_refunded — часть суммы возвращена
// refunded           — возвращено всё
// expired            — время на оплату вышло
export type PaymentStatus = "pending" | "failed" | "paid" | "partially_refunded" | "refunded" | "expired";

export type Payment = {
  id: number;
  customer: string;
  description: string;
  amount: number; // в тенге
  refundedAmount: number; // в тенге
  status: PaymentStatus;
  createdAt: string;
  paidAt: string | null;
  userId: number;
  // связь со шлюзом
  transactionId: string;
  payUrl: string; // ссылка, которую предприниматель отправляет клиенту
  method: PaymentMethod | null;
  cardLast4: string | null;
  lastError: string | null; // код ошибки последней неудачной попытки
};

// данные из формы нового платежа
export type PaymentFormData = {
  customer: string;
  description: string;
  amount: number;
};
