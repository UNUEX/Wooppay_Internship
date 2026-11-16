"use client";
import { useEffect, useState } from "react";
import { getTransaction, isAttemptFinished, type Transaction } from "@/entities/transaction";
import { ApiError } from "@/shared/api";
import { STATUS_POLL_INTERVAL_MS, STATUS_POLL_TIMEOUT_MS } from "@/shared/config";
import { sleep } from "@/shared/lib";

type State = {
  transaction: Transaction | null;
  errorCode: string | null;
  timedOut: boolean; // финального статуса так и не дождались
};

// Опрос статуса (polling) до финального результата.
// Почему не верим адресу после редиректа ("?status=success"):
// его может подделать кто угодно. Источник правды — только шлюз.
export function useTransactionStatus(transactionId: string): State {
  const [state, setState] = useState<State>({ transaction: null, errorCode: null, timedOut: false });

  useEffect(() => {
    let cancelled = false; // страница закрыта — прекращаем опрос
    const startedAt = Date.now();

    async function poll() {
      while (!cancelled) {
        try {
          const transaction = await getTransaction(transactionId);
          if (cancelled) return;
          setState({ transaction, errorCode: null, timedOut: false });
          if (isAttemptFinished(transaction.status)) return;
        } catch (e) {
          if (cancelled) return;
          setState((prev) => ({ ...prev, errorCode: e instanceof ApiError ? e.code : "unknown_error" }));
          // 404 повторять бессмысленно, сетевые ошибки — повторяем
          if (e instanceof ApiError && !e.retryable) return;
        }
        if (Date.now() - startedAt > STATUS_POLL_TIMEOUT_MS) {
          setState((prev) => ({ ...prev, timedOut: true }));
          return;
        }
        await sleep(STATUS_POLL_INTERVAL_MS);
      }
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [transactionId]);

  return state;
}
