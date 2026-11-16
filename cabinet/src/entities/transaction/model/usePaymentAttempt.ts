"use client";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/shared/api";
import { createIdempotencyKey } from "@/shared/lib";
import { confirmTransaction } from "../api/transactionApi";
import { getErrorMessage } from "./errorMessages";
import type { ConfirmBody, Transaction } from "./types";

// "navigated"       — шлюз ответил, клиент ушёл дальше (3DS / результат)
// "retryable_error" — неизвестно, дошёл ли запрос (сеть/5xx): можно повторить ТО ЖЕ самое
// "error"           — шлюз отклонил запрос
export type AttemptOutcome = "navigated" | "retryable_error" | "error";

// Общая логика всех способов оплаты (карта, Google Pay, Apple Pay, кошелёк):
// отправить попытку и пойти туда, куда скажет шлюз.
export function usePaymentAttempt(transactionId: string) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Одна операция = один ключ идемпотентности. Операция определяется
  // телом запроса: тот же способ и тот же токен — тот же ключ.
  const operationRef = useRef<{ body: string; key: string } | null>(null);
  const inFlightRef = useRef(false);

  const submit = useCallback(
    async (body: ConfirmBody): Promise<AttemptOutcome> => {
      if (inFlightRef.current) return "error"; // защита от двойного клика
      inFlightRef.current = true;
      setSubmitting(true);
      setError(null);

      const bodyText = JSON.stringify(body);
      if (operationRef.current?.body !== bodyText) {
        operationRef.current = { body: bodyText, key: createIdempotencyKey() };
      }

      try {
        const transaction = await confirmTransaction(transactionId, body, operationRef.current.key);
        operationRef.current = null;
        goNext(transaction, router.push);
        return "navigated";
      } catch (e) {
        const apiError = e instanceof ApiError ? e : new ApiError(0, "unknown_error", "");
        if (apiError.code === "payment_already_succeeded" || apiError.code === "payment_expired") {
          router.push(`/pay/${transactionId}/result`);
          return "navigated";
        }
        setError(getErrorMessage(apiError.code));
        // При сетевой ошибке НЕ знаем, прошла ли оплата. Ключ сохраняем:
        // повторное нажатие отправит тот же ключ, и шлюз вернёт уже
        // готовый результат вместо двойного списания.
        if (apiError.retryable) return "retryable_error";
        operationRef.current = null;
        return "error";
      } finally {
        inFlightRef.current = false;
        setSubmitting(false);
      }
    },
    [transactionId, router],
  );

  return { submit, submitting, error };
}

function goNext(transaction: Transaction, push: (url: string) => void) {
  // 3DS и кошелёк — страницы ДРУГИХ систем (банка, провайдера),
  // поэтому настоящий редирект, а не переход внутри приложения
  if (transaction.nextAction?.type === "redirect") {
    window.location.assign(transaction.nextAction.url);
    return;
  }
  push(`/pay/${transaction.id}/result`);
}
