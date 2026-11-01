"use client";
import { useState } from "react";
import { PaymentFormData } from "@/types";

type Props = {
  onSubmit: (data: PaymentFormData) => Promise<void>;
};

export default function PaymentForm({ onSubmit }: Props) {
  const [customer, setCustomer] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await onSubmit({ customer, description, amount: Number(amount) });
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Клиент" value={customer} onChange={(e) => setCustomer(e.target.value)} required />
      <input placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input type="number" placeholder="Сумма" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      {error && <p className="error">{error}</p>}
      <button type="submit">Выставить платёж</button>
    </form>
  );
}
