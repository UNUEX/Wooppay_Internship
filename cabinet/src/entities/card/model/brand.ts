import type { CardBrand } from "./types";

// Платёжная система определяется по первым цифрам номера (BIN).
// Упрощённые диапазоны — только для подсказки в интерфейсе.
export function detectBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return "visa";
  if (/^220[0-4]/.test(digits)) return "mir";
  if (/^5[1-5]/.test(digits)) return "mastercard";
  const first4 = Number(digits.slice(0, 4));
  if (digits.length >= 4 && first4 >= 2221 && first4 <= 2720) return "mastercard";
  return "unknown";
}

export const BRAND_LABELS: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  mir: "Мир",
  unknown: "",
};
