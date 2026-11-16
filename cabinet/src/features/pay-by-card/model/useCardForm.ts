"use client";
import { useRef, useState, type ChangeEvent } from "react";
import {
  CARD_NUMBER_LENGTH,
  CVC_LENGTH,
  formatCardNumber,
  formatCvc,
  formatExpiry,
  formatHolder,
  validateCard,
  validateCardNumber,
  validateCvc,
  validateExpiry,
  validateHolder,
  type CardErrors,
  type CardInput,
} from "@/entities/card";
import { caretAfterDigits, digitsBefore, onlyDigits } from "@/shared/lib";

type Field = keyof CardInput;

// порядок полей = порядок автоперехода
const ORDER: Field[] = ["number", "expiry", "cvc", "holder"];

const VALIDATORS: Record<Field, (value: string) => string | null> = {
  number: validateCardNumber,
  expiry: (v) => validateExpiry(v),
  cvc: validateCvc,
  holder: validateHolder,
};

export function useCardForm() {
  const [values, setValues] = useState<CardInput>({ number: "", expiry: "", cvc: "", holder: "" });
  const [errors, setErrors] = useState<CardErrors>({});

  const numberRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);
  const cvcRef = useRef<HTMLInputElement>(null);
  const holderRef = useRef<HTMLInputElement>(null);

  function focusField(field: Field) {
    const refs = { number: numberRef, expiry: expiryRef, cvc: cvcRef, holder: holderRef };
    refs[field].current?.focus();
  }

  function setError(field: Field, error: string | null) {
    setErrors((prev) => ({ ...prev, [field]: error ?? undefined }));
  }

  function setField(field: Field, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    // если ошибка уже показана — проверяем заново, чтобы она исчезла, как только поле исправлено
    if (errors[field]) setError(field, VALIDATORS[field](value));
  }

  // Поле заполнено целиком: проверяем и, если верно, переводим фокус дальше.
  // С ошибкой фокус остаётся — клиент должен её увидеть и исправить.
  function completeField(field: Field, value: string) {
    const error = VALIDATORS[field](value);
    setError(field, error);
    const next = ORDER[ORDER.indexOf(field) + 1];
    if (!error && next) focusField(next);
  }

  function onNumberChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const caret = input.selectionStart ?? input.value.length;
    const caretAtEnd = caret === input.value.length;
    const digitsLeftOfCaret = digitsBefore(input.value, caret);

    const formatted = formatCardNumber(input.value);
    setField("number", formatted);

    if (!caretAtEnd) {
      // правка в середине номера: возвращаем курсор на место после переформатирования
      const position = caretAfterDigits(formatted, digitsLeftOfCaret);
      requestAnimationFrame(() => input.setSelectionRange(position, position));
    }
    const grew = formatted.length > values.number.length;
    if (grew && caretAtEnd && onlyDigits(formatted).length === CARD_NUMBER_LENGTH) completeField("number", formatted);
  }

  function onExpiryChange(e: ChangeEvent<HTMLInputElement>) {
    const formatted = formatExpiry(e.target.value, values.expiry);
    setField("expiry", formatted);
    if (formatted.length === 5 && formatted.length > values.expiry.length) completeField("expiry", formatted);
  }

  function onCvcChange(e: ChangeEvent<HTMLInputElement>) {
    const formatted = formatCvc(e.target.value);
    setField("cvc", formatted);
    if (formatted.length === CVC_LENGTH && formatted.length > values.cvc.length) completeField("cvc", formatted);
  }

  function onHolderChange(e: ChangeEvent<HTMLInputElement>) {
    const formatted = formatHolder(e.target.value);
    setField("holder", formatted);
    // частая ошибка — не та раскладка; подсказываем сразу
    if (/[А-Яа-яЁё]/.test(formatted)) setError("holder", "Переключите раскладку: имя латиницей, как на карте");
  }

  // при уходе с поля проверяем, только если в нём что-то введено
  function onBlur(field: Field) {
    if (values[field] !== "") setError(field, VALIDATORS[field](values[field]));
  }

  // полная проверка перед отправкой; фокус — на первое поле с ошибкой
  function validateAll(): boolean {
    const all = validateCard(values);
    setErrors(all);
    const firstInvalid = ORDER.find((f) => all[f]);
    if (firstInvalid) focusField(firstInvalid);
    return !firstInvalid;
  }

  return {
    values,
    errors,
    numberRef,
    expiryRef,
    cvcRef,
    holderRef,
    setError,
    validateAll,
    handlers: { onNumberChange, onExpiryChange, onCvcChange, onHolderChange, onBlur },
  };
}
