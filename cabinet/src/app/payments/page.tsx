"use client";
import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import PaymentsTable from "@/components/PaymentsTable";
import { useAuth } from "@/context/AuthContext";
import { Payment } from "@/types";
import * as paymentService from "@/services/paymentService";

export default function PaymentsPage() {
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
    if (user) paymentService.getPayments(user).then(setPayments);
  }, [user]);

  async function handleRefund(id: number) {
    const updated = await paymentService.refundPayment(id);
    setPayments(payments.map((p) => (p.id === id ? updated : p)));
  }

  return (
    <div>
      <h1>Платежи</h1>
      <PaymentsTable payments={payments} onRefund={handleRefund} />
    </div>
  );
}
