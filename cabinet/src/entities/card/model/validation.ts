import { onlyDigits } from "@/shared/lib";
import { CARD_NUMBER_LENGTH, CVC_LENGTH } from "./format";
import { isLuhnValid } from "./luhn";
import type { CardInput } from "./types";

// Каждое правило возвращает текст ошибки или null.
// Эти же функции вызывает мок-шлюз: фронтенд проверяет для удобства
// клиента, сервер — для безопасности (запрос можно отправить в обход формы).

export function validateCardNumber(value: string): string | null {
  const digits = onlyDigits(value);
  if (digits.length === 0) return "Введите номер карты";
  if (digits.length !== CARD_NUMBER_LENGTH) return "Номер карты — 16 цифр";
  if (!isLuhnValid(digits)) return "Проверьте номер карты — в нём опечатка";
  return null;
}

// Карта действует до последнего дня указанного месяца включительно:
// "11/26" ещё валидна весь ноябрь 2026.
export function validateExpiry(value: string, now: Date = new Date()): string | null {
  if (value.trim() === "") return "Введите срок действия";
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return "Формат: ММ/ГГ";
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return "Месяц от 01 до 12";

  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  if (year < nowYear || (year === nowYear && month < nowMonth)) return "Срок действия карты истёк";
  if (year > nowYear + 20) return "Проверьте год";
  return null;
}

export function validateCvc(value: string): string | null {
  if (value === "") return "Введите CVV/CVC";
  if (value.length !== CVC_LENGTH || !/^\d+$/.test(value)) return "CVV/CVC — 3 цифры";
  return null;
}

const HOLDER_REGEX = /^[A-Z]+([ '.-][A-Z]+)*$/;

export function validateHolder(value: string): string | null {
  const name = value.trim();
  if (name === "") return "Введите имя, как на карте";
  if (!HOLDER_REGEX.test(name)) return "Только латинские буквы, как на карте";
  if (name.length < 2 || name.length > 26) return "От 2 до 26 символов";
  return null;
}

export type CardErrors = Partial<Record<keyof CardInput, string>>;

export function validateCard(card: CardInput, now?: Date): CardErrors {
  const errors: CardErrors = {};
  const number = validateCardNumber(card.number);
  const expiry = validateExpiry(card.expiry, now);
  const cvc = validateCvc(card.cvc);
  const holder = validateHolder(card.holder);
  if (number) errors.number = number;
  if (expiry) errors.expiry = expiry;
  if (cvc) errors.cvc = cvc;
  if (holder) errors.holder = holder;
  return errors;
}
