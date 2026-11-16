"use client";
import { usePaymentAttempt, type Transaction } from "@/entities/transaction";

// Электронный кошелёк (по аналогии с PayPal, Qiwi и т.п.): клиента
// перенаправляют на сайт кошелька, он входит и подтверждает оплату,
// затем кошелёк возвращает его обратно. Адрес редиректа выдаёт шлюз.
export function WalletPayButton({ transaction }: { transaction: Transaction }) {
  const attempt = usePaymentAttempt(transaction.id);

  return (
    <div className="method-body">
      <p className="muted">Вы перейдёте на сайт кошелька, чтобы войти и подтвердить оплату.</p>
      <button className="pay-button" disabled={attempt.submitting} onClick={() => attempt.submit({ method: "wallet" })}>
        {attempt.submitting ? "Переход..." : "Перейти в кошелёк"}
      </button>
      {attempt.error && <p className="error">{attempt.error}</p>}
    </div>
  );
}
