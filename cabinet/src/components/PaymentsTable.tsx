import { Payment } from "@/types";

type Props = {
  payments: Payment[];
  onRefund?: (id: number) => void;
};

export default function PaymentsTable({ payments, onRefund }: Props) {
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
              {p.status === "paid" && onRefund && (
                <button onClick={() => onRefund(p.id)}>Вернуть</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
