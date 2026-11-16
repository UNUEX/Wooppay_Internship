"use client";
import { useRef, useState } from "react";
import { BRAND_LABELS, detectBrand, type CardInput } from "@/entities/card";
import { getErrorMessage, usePaymentAttempt, type Transaction } from "@/entities/transaction";
import { ApiError } from "@/shared/api";
import { formatMoney, fromMinor, onlyDigits } from "@/shared/lib";
import { tokenizeCard } from "../api/tokenizeCard";
import { useCardForm } from "../model/useCardForm";

export function CardForm({ transaction }: { transaction: Transaction }) {
  const { values, errors, handlers, numberRef, expiryRef, cvcRef, holderRef, setError, validateAll } = useCardForm();
  const attempt = usePaymentAttempt(transaction.id);
  const [tokenizing, setTokenizing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // Токен переиспользуем, только если после сбоя сети клиент жмёт
  // "Оплатить" снова с теми же данными — тогда запрос будет тем же самым.
  const cachedToken = useRef<{ forCard: string; token: string } | null>(null);

  const brand = detectBrand(onlyDigits(values.number));
  const busy = tokenizing || attempt.submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setFormError(null);
    if (!validateAll()) return;

    const cardKey = JSON.stringify(values);
    let token = cachedToken.current?.forCard === cardKey ? cachedToken.current.token : null;

    if (!token) {
      setTokenizing(true);
      try {
        token = (await tokenizeCard(values)).token;
        cachedToken.current = { forCard: cardKey, token };
      } catch (err) {
        // сервер нашёл ошибку в конкретном поле — показываем её у поля
        if (err instanceof ApiError && err.field) setError(err.field as keyof CardInput, err.message);
        else setFormError(getErrorMessage(err instanceof ApiError ? err.code : null));
        return;
      } finally {
        setTokenizing(false);
      }
    }

    const outcome = await attempt.submit({ method: "card", token });
    if (outcome !== "retryable_error") cachedToken.current = null;
  }

  const error = formError ?? attempt.error;

  return (
    <form className="card-form" onSubmit={handleSubmit} noValidate>
      <label>
        Номер карты {brand !== "unknown" && <b className="brand">{BRAND_LABELS[brand]}</b>}
        <input
          ref={numberRef}
          value={values.number}
          onChange={handlers.onNumberChange}
          onBlur={() => handlers.onBlur("number")}
          aria-invalid={Boolean(errors.number)}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          maxLength={19}
          autoFocus
        />
      </label>
      {errors.number && <p className="error">{errors.number}</p>}

      <div className="row">
        <div>
          <label>
            Срок действия
            <input
              ref={expiryRef}
              value={values.expiry}
              onChange={handlers.onExpiryChange}
              onBlur={() => handlers.onBlur("expiry")}
              aria-invalid={Boolean(errors.expiry)}
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="ММ/ГГ"
              maxLength={5}
            />
          </label>
          {errors.expiry && <p className="error">{errors.expiry}</p>}
        </div>
        <div>
          {/* CVV скрыт через CSS (класс masked), а не type="password": иначе браузер
              предложит "сохранить пароль", а на телефоне откроется буквенная клавиатура */}
          <label>
            CVV/CVC
            <input
              ref={cvcRef}
              className="masked"
              value={values.cvc}
              onChange={handlers.onCvcChange}
              onBlur={() => handlers.onBlur("cvc")}
              aria-invalid={Boolean(errors.cvc)}
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="•••"
              maxLength={3}
            />
          </label>
          {errors.cvc && <p className="error">{errors.cvc}</p>}
        </div>
      </div>

      <label>
        Имя владельца
        <input
          ref={holderRef}
          value={values.holder}
          onChange={handlers.onHolderChange}
          onBlur={() => handlers.onBlur("holder")}
          aria-invalid={Boolean(errors.holder)}
          autoComplete="cc-name"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="IVAN PETROV"
          maxLength={26}
        />
      </label>
      {errors.holder && <p className="error">{errors.holder}</p>}

      {error && <p className="error">{error}</p>}
      <button type="submit" className="pay-button" disabled={busy}>
        {busy ? "Обработка..." : `Оплатить ${formatMoney(fromMinor(transaction.amount))}`}
      </button>
      <p className="muted">Данные карты уходят напрямую в платёжный шлюз. Продавец их не видит и не хранит.</p>
    </form>
  );
}
