"use client";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/ProtectedPage";
import PaymentForm from "@/components/PaymentForm";
import { useAuth } from "@/context/AuthContext";
import { PaymentFormData } from "@/types";
import * as paymentService from "@/services/paymentService";

export default function NewPaymentPage() {
  return (
    <ProtectedPage>
      <NewPaymentContent />
    </ProtectedPage>
  );
}

function NewPaymentContent() {
  const { user } = useAuth();
  const router = useRouter();

  async function handleSubmit(data: PaymentFormData) {
    if (!user) return;
    await paymentService.createPayment(user, data);
    router.push("/payments");
  }

  return (
    <div>
      <h1>Новый платёж</h1>
      <PaymentForm onSubmit={handleSubmit} />
    </div>
  );
}
