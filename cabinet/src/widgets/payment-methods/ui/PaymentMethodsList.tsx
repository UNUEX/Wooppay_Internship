"use client";
import { useState } from "react";
import { getErrorMessage, type PaymentMethod, type Transaction } from "@/entities/transaction";
import { MethodPicker } from "@/features/select-payment-method";
import { CardForm } from "@/features/pay-by-card";
import { GooglePayButton } from "@/features/pay-by-google-pay";
import { ApplePayButton } from "@/features/pay-by-apple-pay";
import { WalletPayButton } from "@/features/pay-by-wallet";

// Виджет собирает фичи вместе: выбор способа + форма выбранного способа.
// Сами фичи друг о друге не знают (правило FSD: фича не импортирует фичу).
export function PaymentMethodsList({ transaction }: { transaction: Transaction }) {
  const [method, setMethod] = useState<PaymentMethod>(transaction.method ?? "card");

  return (
    <div className="panel">
      {/* после неудачной попытки объясняем, что случилось, и даём попробовать снова */}
      {transaction.status === "failed" && transaction.lastError && (
        <p className="error">Предыдущая попытка не удалась: {getErrorMessage(transaction.lastError.code)}</p>
      )}
      <MethodPicker value={method} onChange={setMethod} />
      {method === "card" && <CardForm transaction={transaction} />}
      {method === "google_pay" && <GooglePayButton transaction={transaction} />}
      {method === "apple_pay" && <ApplePayButton transaction={transaction} />}
      {method === "wallet" && <WalletPayButton transaction={transaction} />}
    </div>
  );
}
