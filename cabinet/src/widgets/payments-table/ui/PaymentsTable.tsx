import { Payment } from "@/entities/payment";
import { RefundButton } from "@/features/refund-payment";

type Props = {
  payments: Payment[];
  onPaymentChange: (updated: Payment) => void;
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
            <td>{p.amount} ₸</td>
            <td>{p.status === "paid" ? "Оплачен" : "Возвращён"}</td>
            <td>{new Date(p.createdAt).toLocaleDateString("ru-RU")}</td>
            <td>
              {p.status === "paid" && (
                <RefundButton paymentId={p.id} onRefunded={onPaymentChange} />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
