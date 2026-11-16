"use client";
import { useCallback } from "react";
import { getPayments } from "@/entities/payment";
import { ProtectedPage, useAuth } from "@/features/auth";
import { usePolling } from "@/shared/hooks";
import { PaymentsTable } from "@/widgets/payments-table";

export function PaymentsPage() {
  return (
    <ProtectedPage>
      <PaymentsContent />
    </ProtectedPage>
  );
}

function PaymentsContent() {
  const { user } = useAuth();
  // Статусы меняются по вебхукам от шлюза (клиент оплатил, возврат прошёл),
  // поэтому список перечитываем раз в 3 секунды.
  const load = useCallback(() => (user ? getPayments(user) : Promise.resolve([])), [user]);
  const { data: payments, refresh } = usePolling(load, 3000);

  return (
    <div>
      <h1>Платежи</h1>
      {payments ? <PaymentsTable payments={payments} onPaymentChange={refresh} /> : <p>Загрузка...</p>}
    </div>
  );
}
