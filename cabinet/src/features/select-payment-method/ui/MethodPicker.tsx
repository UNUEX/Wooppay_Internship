"use client";
import type { PaymentMethod } from "@/entities/transaction";

const OPTIONS: { type: PaymentMethod; title: string; subtitle: string }[] = [
  { type: "card", title: "Банковская карта", subtitle: "Visa, Mastercard, Мир" },
  { type: "google_pay", title: "Google Pay", subtitle: "Карта из аккаунта Google" },
  { type: "apple_pay", title: "Apple Pay", subtitle: "Карта из Wallet" },
  { type: "wallet", title: "Электронный кошелёк", subtitle: "Подтверждение на сайте кошелька" },
];

type Props = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

// Обычные radio-кнопки: работают с клавиатуры и понятны скринридеру без лишнего кода
export function MethodPicker({ value, onChange }: Props) {
  return (
    <fieldset className="method-picker">
      <legend>Способ оплаты</legend>
      {OPTIONS.map((option) => (
        <label key={option.type} className={value === option.type ? "method selected" : "method"}>
          <input
            type="radio"
            name="payment-method"
            checked={value === option.type}
            onChange={() => onChange(option.type)}
          />
          <span>
            <b>{option.title}</b>
            <small>{option.subtitle}</small>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
