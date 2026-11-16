"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import { usePaymentAttempt, type Transaction } from "@/entities/transaction";
import { formatMoney, fromMinor } from "@/shared/lib";
import { Modal } from "@/shared/ui";
import { buildApplePayRequest, isApplePayAvailable } from "../lib/applePayRequest";

const noopSubscribe = () => () => {};

const TEST_CARDS = [
  { network: "VISA", last4: "1881", scenario: "approve", title: "Face ID подтверждён" },
  { network: "MASTERCARD", last4: "0005", scenario: "decline", title: "Отказ банка" },
] as const;

// Как работает настоящий Apple Pay (что здесь эмулируется):
// 1. new ApplePaySession(3, request).begin()
// 2. onvalidatemerchant: БЭКЕНД с сертификатом продавца получает сессию у Apple
// 3. клиент подтверждает Face ID -> onpaymentauthorized(event.payment.token)
// 4. токен отправляем в шлюз -> session.completePayment(SUCCESS | FAILURE)
export function ApplePayButton({ transaction }: { transaction: Transaction }) {
  const attempt = usePaymentAttempt(transaction.id);
  const [sheetOpen, setSheetOpen] = useState(false);
  const request = useMemo(() => buildApplePayRequest(transaction), [transaction]);
  // на сервере window нет, поэтому серверное значение — false
  const nativeAvailable = useSyncExternalStore(noopSubscribe, isApplePayAvailable, () => false);

  async function choose(card: (typeof TEST_CARDS)[number]) {
    setSheetOpen(false);
    await attempt.submit({ method: "apple_pay", token: JSON.stringify({ ...card, emulator: "apple_pay" }) });
  }

  return (
    <div className="method-body">
      <p className="muted">
        {nativeAvailable
          ? "Apple Pay доступен на этом устройстве, но для демо используется эмуляция."
          : "На этом устройстве Apple Pay недоступен (нужен Safari на устройстве Apple). Используется эмуляция."}
      </p>
      <button className="pay-button dark" disabled={attempt.submitting} onClick={() => setSheetOpen(true)}>
        {attempt.submitting ? "Обработка..." : "Оплатить через Apple Pay"}
      </button>
      {attempt.error && <p className="error">{attempt.error}</p>}

      <details>
        <summary className="muted">ApplePayPaymentRequest</summary>
        <pre>{JSON.stringify(request, null, 2)}</pre>
      </details>

      {sheetOpen && (
        <Modal title="Apple Pay (эмуляция)" onClose={() => setSheetOpen(false)}>
          <p>
            {request.total.label}: <b>{formatMoney(fromMinor(transaction.amount))}</b>
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
