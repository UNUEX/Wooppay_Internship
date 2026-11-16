"use client";
import { useEffect, useState } from "react";
import { ApiError } from "@/shared/api";
import { getTransaction } from "../api/transactionApi";
import type { Transaction } from "./types";

// Однократная загрузка транзакции для страниц оплаты, 3DS и кошелька
export function useTransaction(id: string) {
  const [state, setState] = useState<{ transaction: Transaction | null; errorCode: string | null }>({
    transaction: null,
    errorCode: null,
  });

  useEffect(() => {
    let cancelled = false;
    getTransaction(id).then(
      (transaction) => !cancelled && setState({ transaction, errorCode: null }),
      (e) => !cancelled && setState({ transaction: null, errorCode: e instanceof ApiError ? e.code : "unknown_error" }),
    );
    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}
