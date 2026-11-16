"use client";
import { useState } from "react";
import Link from "next/link";
import { Payment, PaymentFormData, PayLink } from "@/entities/payment";
import { ProtectedPage, useAuth } from "@/features/auth";
import { PaymentForm, createPayment } from "@/features/create-payment";
import { formatMoney } from "@/shared/lib";

export function NewPaymentPage() {
  return (
    <ProtectedPage>
      <NewPaymentContent />
    </ProtectedPage>
  );
}

function NewPaymentContent() {
  const { user } = useAuth();
  const [created, setCreated] = useState<Payment | null>(null);

  async function handleSubmit(data: PaymentFormData) {
    if (!user) return;
    setCreated(await createPayment(user, data));
  }

  // Счёт выставлен: деньги ещё НЕ получены. Предприниматель отправляет
  // клиенту ссылку, клиент платит сам, статус поменяется по вебхуку.
  if (created) {
    return (
      <div>
        <h1>Счёт выставлен</h1>
        <p>
          Счёт №{created.id} для «{created.customer}» на {formatMoney(created.amount)} ожидает оплаты.
          Отправьте клиенту ссылку:
        </p>
        <PayLink payUrl={created.payUrl} />
        <p>
          <button onClick={() => setCreated(null)}>Выставить ещё</button>{" "}
          <Link href="/payments">К списку платежей</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1>Новый платёж</h1>
      <PaymentForm onSubmit={handleSubmit} />
    </div>
  );
}
