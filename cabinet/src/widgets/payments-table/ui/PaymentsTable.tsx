import { METHOD_LABELS, Payment, PayLink, PaymentStatusBadge, isAwaitingPayment, refundableAmount } from "@/entities/payment";
import { RefundButton } from "@/features/refund-payment";
import { formatMoney } from "@/shared/lib";

type Props = {
  payments: Payment[];
  onPaymentChange: () => void;
};

// виджет = таблица (данные сущности payment) + действие "вернуть" (фича refund-payment)
export function PaymentsTable({ payments, onPaymentChange }: Props) {
  return (
    <table>
      <thead>
        <tr>
          <th>№</th>
          <th>Клиент</th>
          <th>Описание</th>
          <th>Сумма</th>
          <th>Статус</th>
          <th>Оплата</th>
          <th>Дата</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {payments.map((p) => (
          <tr key={p.id}>
            <td>{p.id}</td>
            <td>{p.customer}</td>
            <td>{p.description}</td>
            <td>
              {formatMoney(p.amount)}
              {p.refundedAmount > 0 && <div className="muted">возвращено {formatMoney(p.refundedAmount)}</div>}
            </td>
            <td>
              <PaymentStatusBadge status={p.status} />
              {p.status === "failed" && <div className="muted">клиент может повторить</div>}
            </td>
            <td>
              {p.method ? `${METHOD_LABELS[p.method]}${p.cardLast4 ? ` •••• ${p.cardLast4}` : ""}` : "—"}
            </td>
            <td>{new Date(p.createdAt).toLocaleDateString("ru-RU")}</td>
            <td>
              {isAwaitingPayment(p) && <PayLink payUrl={p.payUrl} />}
              {refundableAmount(p) > 0 && <RefundButton payment={p} onRefunded={onPaymentChange} />}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
