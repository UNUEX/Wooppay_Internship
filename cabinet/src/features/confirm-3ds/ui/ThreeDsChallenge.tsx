"use client";
import { useState } from "react";
import { BRAND_LABELS } from "@/entities/card";
import { getErrorMessage, type Transaction } from "@/entities/transaction";
import { ApiError } from "@/shared/api";
import { THREE_DS_TEST_CODE } from "@/shared/config";
import { formatMoney, fromMinor, onlyDigits } from "@/shared/lib";
import { submitChallenge } from "../api/submitChallenge";

// Эмуляция страницы банка-эмитента для 3-D Secure.
// Клиент видит, ЧТО подтверждает: продавца, сумму, карту.
export function ThreeDsChallenge({ transaction }: { transaction: Transaction }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(body: { code: string } | { cancel: true }) {
    setBusy(true);
    setError(null);
    try {
      const { redirectUrl } = await submitChallenge(transaction.id, body);
      window.location.assign(redirectUrl); // банк возвращает клиента обратно
    } catch (e) {
      setError(getErrorMessage(e instanceof ApiError ? e.code : null));
      setBusy(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 4) return setError("Код — 4 цифры");
    void send({ code });
  }

  return (
    <form className="external-page bank" onSubmit={handleSubmit} noValidate>
      <div className="external-brand">Банк-эмитент · 3-D Secure</div>
      <h1>Подтвердите покупку</h1>
      <table>
        <tbody>
          <tr><td>Продавец</td><td>{transaction.merchantName}</td></tr>
          <tr><td>Сумма</td><td>{formatMoney(fromMinor(transaction.amount))}</td></tr>
          {transaction.card && (
            <tr><td>Карта</td><td>{BRAND_LABELS[transaction.card.brand]} •••• {transaction.card.last4}</td></tr>
          )}
        </tbody>
      </table>
      <label>
        Код из SMS
        <input
          value={code}
          onChange={(e) => setCode(onlyDigits(e.target.value).slice(0, 4))}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={4}
          autoFocus
        />
      </label>
      <p className="muted">Тестовый код: {THREE_DS_TEST_CODE}. Любой другой — ошибка подтверждения.</p>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={busy}>Подтвердить</button>{" "}
      <button type="button" disabled={busy} onClick={() => send({ cancel: true })}>Отменить</button>
    </form>
  );
}
