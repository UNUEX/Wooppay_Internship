"use client";
import { useMemo, useState } from "react";
import { usePaymentAttempt, type Transaction } from "@/entities/transaction";
import { formatMoney, fromMinor } from "@/shared/lib";
import { Modal } from "@/shared/ui";
import { buildPaymentDataRequest } from "../lib/paymentDataRequest";

// Тестовые карты в "окне Google". Настоящий Google Pay требует загрузки
// https://pay.google.com/gp/p/js/pay.js и Google-аккаунта, а для продакшена —
// регистрации продавца в Google Pay & Wallet Console. Поэтому окно эмулируется,
// но запрос и форма ответа — как в настоящем API.
const TEST_CARDS = [
  { network: "VISA", last4: "1111", scenario: "approve", title: "Успешная оплата" },
  { network: "MASTERCARD", last4: "4444", scenario: "three_ds", title: "PAN_ONLY: потребуется 3-D Secure" },
  { network: "VISA", last4: "0002", scenario: "decline", title: "Отказ банка" },
] as const;

export function GooglePayButton({ transaction }: { transaction: Transaction }) {
  const attempt = usePaymentAttempt(transaction.id);
  const [sheetOpen, setSheetOpen] = useState(false);
  const request = useMemo(() => buildPaymentDataRequest(transaction), [transaction]);

  async function choose(card: (typeof TEST_CARDS)[number]) {
    setSheetOpen(false);
    // так выглядит ответ loadPaymentData(): нам нужен только токен
    const paymentData = {
      paymentMethodData: {
        info: { cardNetwork: card.network, cardDetails: card.last4 },
        tokenizationData: { type: "PAYMENT_GATEWAY", token: JSON.stringify({ ...card, emulator: "google_pay" }) },
      },
    };
    // продавец не расшифровывает токен — просто передаёт его в шлюз
    await attempt.submit({ method: "google_pay", token: paymentData.paymentMethodData.tokenizationData.token });
  }

  return (
    <div className="method-body">
      <p className="muted">Карта выбирается в окне Google. На нашу страницу данные карты не попадают.</p>
      <button className="pay-button dark" disabled={attempt.submitting} onClick={() => setSheetOpen(true)}>
        {attempt.submitting ? "Обработка..." : "Оплатить через Google Pay"}
      </button>
      {attempt.error && <p className="error">{attempt.error}</p>}

      <details>
        <summary className="muted">PaymentDataRequest, который уходит в Google Pay</summary>
        <pre>{JSON.stringify(request, null, 2)}</pre>
      </details>

      {/* закрыть окно — не ошибка: клиент передумал, ничего не показываем */}
      {sheetOpen && (
        <Modal title="Google Pay (эмуляция)" onClose={() => setSheetOpen(false)}>
          <p>
            {transaction.merchantName}: <b>{formatMoney(fromMinor(transaction.amount))}</b>
          </p>
          {TEST_CARDS.map((card) => (
            <button key={card.last4} className="sheet-option" onClick={() => choose(card)}>
              <b>{card.network} •••• {card.last4}</b>
              <span className="muted">{card.title}</span>
            </button>
          ))}
        </Modal>
      )}
    </div>
  );
}
