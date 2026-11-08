import { FieldErrors, validateAmount, validateMaxLength, validateName } from "@/shared/lib";
import { PaymentFormData } from "./types";

export const MAX_PAYMENT_AMOUNT = 10_000_000;
export const MAX_DESCRIPTION_LENGTH = 200;

// Что такое "правильный платёж". Используется и в форме (фронтенд), и в API (бэкенд).
export function validatePayment(data: Partial<Record<keyof PaymentFormData, unknown>>) {
  const errors: FieldErrors<PaymentFormData> = {};

  const customer = validateName(data.customer);
  if (customer) errors.customer = customer;

  const description = validateMaxLength(data.description, MAX_DESCRIPTION_LENGTH);
  if (description) errors.description = description;

  const amount = validateAmount(data.amount, MAX_PAYMENT_AMOUNT);
  if (amount) errors.amount = amount;

  return errors;
}
