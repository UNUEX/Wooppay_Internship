"use client";
import Link from "next/link";
import { BRAND_LABELS } from "@/entities/card";
import { getErrorMessage, type Transaction } from "@/entities/transaction";
import { useTransactionStatus } from "@/features/track-payment-status";
import { formatMoney, fromMinor } from "@/shared/lib";

// Экраны успеха / ошибки / ожидания. Статус — только с сервера шлюза.
export function PaymentResult({ transactionId }: { transactionId: string }) {
  const { transaction, errorCode, timedOut } = useTransactionStatus(transactionId);

  if (!transaction) {
    if (errorCode === "transaction_not_found") return <p className="error">Платёж не найден.</p>;
    return (
      <div className="panel result">
        <p>Загружаем статус платежа…</p>
        {errorCode && <p className="muted">{getErrorMessage(errorCode)} Пробуем ещё раз…</p>}
      </div>
    );
  }

  return (
    <div className={`panel result result-${transaction.status}`}>
      <ResultBody transaction={transaction} timedOut={timedOut} />
      <table>
        <tbody>
          <tr><td>Сумма</td><td>{formatMoney(fromMinor(transaction.amount))}</td></tr>
          {transaction.card && (
            <tr><td>Карта</td><td>{BRAND_LABELS[transaction.card.brand]} •••• {transaction.card.last4}</td></tr>
          )}
          <tr><td>Номер платежа</td><td><code>{transaction.id}</code></td></tr>
        </tbody>
      </table>
    </div>
  );
}

function ResultBody({ transaction, timedOut }: { transaction: Transaction; timedOut: boolean }) {
  switch (transaction.status) {
    case "succeeded":
      return (
        <>
          <div className="result-icon success">✓</div>
          <h1>Оплата прошла</h1>
          <p>Продавец получит подтверждение автоматически — эту страницу можно закрыть.</p>
        </>
      );
    case "failed":
      return (
        <>
          <div className="result-icon fail">!</div>
          <h1>Оплата не прошла</h1>
          <p>{getErrorMessage(transaction.lastError?.code)}</p>
          <p className="muted">Деньги не списаны.</p>
          <Link className="pay-button" href={`/pay/${transaction.id}`}>Попробовать снова</Link>
        </>
      );
    case "expired":
    case "canceled":
      return (
        <>
          <div className="result-icon fail">×</div>
          <h1>Счёт закрыт</h1>
          <p>{getErrorMessage("payment_expired")}</p>
        </>
      );
    case "requires_action":
      return (
        <>
          <h1>Нужно подтверждение</h1>
          <p>Платёж ждёт подтверждения в банке или кошельке.</p>
          {transaction.nextAction && <a className="pay-button" href={transaction.nextAction.url}>Продолжить</a>}
        </>
      );
    default:
      // created / processing — банк ещё не ответил
      return (
        <>
          <h1>Проверяем оплату…</h1>
          <p>
            {timedOut
              ? "Банк отвечает дольше обычного. Не оплачивайте повторно — продавец получит результат автоматически."
              : "Обычно это занимает несколько секунд. Не закрывайте страницу."}
          </p>
        </>
      );
  }
}
