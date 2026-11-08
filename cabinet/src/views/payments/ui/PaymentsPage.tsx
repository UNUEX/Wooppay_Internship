"use client";
import { useEffect, useState } from "react";
import { Payment, getPayments } from "@/entities/payment";
import { ProtectedPage, useAuth } from "@/features/auth";
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
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (user) getPayments(user).then(setPayments);
  }, [user]);

  function handlePaymentChange(updated: Payment) {
    setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  return (
    <div>
      <h1>Платежи</h1>
      <PaymentsTable payments={payments} onPaymentChange={handlePaymentChange} />
    </div>
  );
}
