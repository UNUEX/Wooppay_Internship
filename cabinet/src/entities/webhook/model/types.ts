export type WebhookEventType =
  | "payment.succeeded"
  | "payment.failed"
  | "payment.canceled"
  | "payment.expired"
  | "refund.succeeded";

// Событие, которое шлюз отправляет на сервер кабинета
export type WebhookEvent = {
  id: string; // по id кабинет отбрасывает дубликаты
  type: WebhookEventType;
  createdAt: string;
  data: {
    transactionId: string;
    status: string;
    amount: number; // в тиынах
    refundedAmount: number; // в тиынах
    method: string | null;
    cardLast4: string | null;
    errorCode: string | null;
  };
};

export type DeliveryAttempt = {
  at: string;
  httpStatus: number | null; // null — не достучались
  error?: string;
};

// Журнал доставки вебхука (со стороны шлюза)
export type WebhookDelivery = {
  id: string;
  event: WebhookEvent;
  status: "pending" | "delivered" | "failed";
  attempts: DeliveryAttempt[];
  nextAttemptAt: string | null;
};
