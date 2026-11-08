"use client";
import { useRouter } from "next/navigation";
import { PaymentFormData } from "@/entities/payment";
import { ProtectedPage, useAuth } from "@/features/auth";
import { PaymentForm, createPayment } from "@/features/create-payment";

export function NewPaymentPage() {
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
    await createPayment(user, data);
    router.push("/payments");
  }

  return (
    <div>
      <h1>Новый платёж</h1>
      <PaymentForm onSubmit={handleSubmit} />
    </div>
  );
}
