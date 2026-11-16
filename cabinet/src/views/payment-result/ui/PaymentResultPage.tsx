"use client";
import { useParams } from "next/navigation";
import { PaymentResult } from "@/widgets/payment-status";

// Экраны успеха / ошибки / ожидания для клиента
export function PaymentResultPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="narrow">
      <PaymentResult transactionId={id} />
    </div>
  );
}
