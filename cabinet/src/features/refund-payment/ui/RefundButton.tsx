"use client";
import { useRef, useState } from "react";
import { Payment, refundableAmount } from "@/entities/payment";
import { createIdempotencyKey, formatMoney } from "@/shared/lib";
import { ApiError } from "@/shared/api";
import { refundPayment } from "../api/refundPayment";

type Props = {
  payment: Payment;
  onRefunded: () => void; // сообщаем наверх: стоит перечитать список
};

// Возврат полной суммы или её части
export function RefundButton({ payment, onRefunded }: Props) {
  const available = refundableAmount(payment);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  // ключ живёт, пока не получен ответ: двойной клик или повтор не сделают два возврата
  const keyRef = useRef<{ amount: number; key: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(value.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) return setError("Введите сумму");
    if (amount > available) return setError(`Не больше ${formatMoney(available)}`);
    if (!window.confirm(`Вернуть клиенту ${formatMoney(amount)}? Отменить возврат нельзя.`)) return;

    if (keyRef.current?.amount !== amount) keyRef.current = { amount, key: createIdempotencyKey() };

    setBusy(true);
    setError("");
    try {
      await refundPayment(payment.id, amount, keyRef.current.key);
      keyRef.current = null;
      setOpen(false);
      setValue("");
      setSent(true); // статус обновится, когда придёт вебхук
      onRefunded();
    } catch (err) {
      setError((err as Error).message);
      if (!(err instanceof ApiError && err.retryable)) keyRef.current = null;
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <>
        <button onClick={() => { setOpen(true); setSent(false); }}>Вернуть</button>
        {sent && <div className="muted">Возврат отправлен, ждём подтверждения от шлюза</div>}
      </>
    );
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <input
        aria-label="Сумма возврата"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`до ${available}`}
        inputMode="decimal"
        disabled={busy}
        autoFocus
      />
      <button type="submit" disabled={busy}>{busy ? "..." : "OK"}</button>
      <button type="button" onClick={() => setOpen(false)} disabled={busy}>Отмена</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
