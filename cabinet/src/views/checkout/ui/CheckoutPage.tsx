"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { canStartAttempt, getErrorMessage, useTransaction } from "@/entities/transaction";
import { PaymentMethodsList } from "@/widgets/payment-methods";
import { PaymentSummary } from "@/widgets/payment-summary";
import { TestCardsHint } from "@/widgets/sandbox-hint";

// Страница оплаты для КЛИЕНТА (открывается по ссылке из кабинета, без входа)
export function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { transaction, errorCode } = useTransaction(id);
  const payable = transaction ? canStartAttempt(transaction.status) : false;

  // уже оплачено / в процессе / истекло — платить нечего, показываем статус
  useEffect(() => {
    if (transaction && !payable) router.replace(`/pay/${id}/result`);
  }, [transaction, payable, id, router]);

  if (errorCode) {
    return <p className="error">{errorCode === "transaction_not_found" ? "Ссылка на оплату недействительна." : getErrorMessage(errorCode)}</p>;
  }
  if (!transaction || !payable) return <p>Загрузка...</p>;

  return (
    <div className="checkout">
      <PaymentSummary transaction={transaction} />
      <div>
        <PaymentMethodsList transaction={transaction} />
        <TestCardsHint />
      </div>
    </div>
  );
}
