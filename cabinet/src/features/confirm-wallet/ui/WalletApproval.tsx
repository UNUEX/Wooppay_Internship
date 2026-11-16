"use client";
import { useState } from "react";
import { getErrorMessage, type Transaction } from "@/entities/transaction";
import { ApiError } from "@/shared/api";
import { formatMoney, fromMinor } from "@/shared/lib";
import { answerWallet } from "../api/answerWallet";

// Эмуляция сайта провайдера электронного кошелька (чужой сайт со своим входом)
export function WalletApproval({ transaction }: { transaction: Transaction }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function answer(approve: boolean) {
    setBusy(true);
    setError(null);
    try {
      const { redirectUrl } = await answerWallet(transaction.id, approve);
      window.location.assign(redirectUrl);
    } catch (e) {
      setError(getErrorMessage(e instanceof ApiError ? e.code : null));
      setBusy(false);
    }
  }

  return (
    <div className="external-page wallet">
      <div className="external-brand">E-Wallet</div>
      <p>Вы вошли как <b>demo@wallet.test</b>, баланс <b>100 000 ₸</b></p>
      <p>
        Оплата продавцу «{transaction.merchantName}»: <b>{formatMoney(fromMinor(transaction.amount))}</b>
      </p>
      {error && <p className="error">{error}</p>}
      <button disabled={busy} onClick={() => answer(true)}>Подтвердить оплату</button>{" "}
      <button disabled={busy} onClick={() => answer(false)}>Отклонить</button>
    </div>
  );
}
