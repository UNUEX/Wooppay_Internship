"use client";
import { useState } from "react";
import { PaymentFormData, validatePayment } from "@/entities/payment";
import { FieldErrors, hasErrors } from "@/shared/lib";

type Props = {
  onSubmit: (data: PaymentFormData) => Promise<void>;
};

export function PaymentForm({ onSubmit }: Props) {
  const [customer, setCustomer] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<PaymentFormData>>({});
  const [error, setError] = useState(""); // ошибка от сервера

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const data: PaymentFormData = {
      customer: customer.trim(),
      description: description.trim(),
      amount: amount === "" ? NaN : Number(amount),
    };

    // 1) проверка на фронтенде: сразу показываем ошибки под полями
    const errors = validatePayment(data);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    // 2) отправка на сервер (он проверит ещё раз)
    try {
      await onSubmit(data);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input placeholder="Клиент" value={customer} onChange={(e) => setCustomer(e.target.value)} />
      {fieldErrors.customer && <p className="error">{fieldErrors.customer}</p>}

      <input placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />
      {fieldErrors.description && <p className="error">{fieldErrors.description}</p>}

      <input type="number" step="0.01" placeholder="Сумма" value={amount} onChange={(e) => setAmount(e.target.value)} />
      {fieldErrors.amount && <p className="error">{fieldErrors.amount}</p>}

      {error && <p className="error">{error}</p>}
      <button type="submit">Выставить платёж</button>
    </form>
  );
}
