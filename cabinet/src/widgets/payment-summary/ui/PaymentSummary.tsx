import type { Transaction } from "@/entities/transaction";
import { formatMoney, fromMinor } from "@/shared/lib";

// Что и кому платим. Клиент должен видеть сумму до ввода карты.
export function PaymentSummary({ transaction }: { transaction: Transaction }) {
  return (
    <div className="summary">
      <div className="muted">{transaction.merchantName}</div>
      <div>{transaction.description}</div>
      <div className="summary-amount">{formatMoney(fromMinor(transaction.amount))}</div>
    </div>
  );
}
