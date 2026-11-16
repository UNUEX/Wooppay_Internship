import { onlyDigits } from "@/shared/lib";

export const CARD_NUMBER_LENGTH = 16;
export const CVC_LENGTH = 3;

// "4242424242424242" -> "4242 4242 4242 4242"
export function formatCardNumber(value: string): string {
  const digits = onlyDigits(value).slice(0, CARD_NUMBER_LENGTH);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

// "12" -> "12/", "1228" -> "12/28". Первая цифра 2..9 — месяц однозначен: "5" -> "05/"
export function formatExpiry(value: string, prev = ""): string {
  let digits = onlyDigits(value).slice(0, 4);
  if (digits.length === 1 && Number(digits) > 1) digits = `0${digits}`;
  // пользователь стирает "/" — не возвращаем её обратно
  const erasing = value.length < prev.length;
  if (digits.length === 2 && !erasing) return `${digits}/`;
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export function formatCvc(value: string): string {
  return onlyDigits(value).slice(0, CVC_LENGTH);
}

// имя на карте печатается латиницей заглавными буквами
export function formatHolder(value: string): string {
  return value.toUpperCase().replace(/\s{2,}/g, " ");
}
