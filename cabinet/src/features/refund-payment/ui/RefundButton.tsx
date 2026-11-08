"use client";
import { Payment } from "@/entities/payment";
import { refundPayment } from "../api/refundPayment";

type Props = {
  paymentId: number;
  onRefunded: (updated: Payment) => void; // сообщаем наверх, что платёж изменился
};

export function RefundButton({ paymentId, onRefunded }: Props) {
  async function handleClick() {
    const updated = await refundPayment(paymentId);
    onRefunded(updated);
  }

  return <button onClick={handleClick}>Вернуть</button>;
}
