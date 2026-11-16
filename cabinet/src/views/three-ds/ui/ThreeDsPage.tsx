"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getErrorMessage, useTransaction } from "@/entities/transaction";
import { ThreeDsChallenge } from "@/features/confirm-3ds";

// Экран 3-D Secure. В реальности это страница банка (редирект или iframe)
export function ThreeDsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { transaction, errorCode } = useTransaction(id);
  const waiting = transaction?.status === "requires_action" && transaction.nextAction?.reason === "3ds";

  useEffect(() => {
    if (transaction && !waiting) router.replace(`/pay/${id}/result`);
  }, [transaction, waiting, id, router]);

  if (errorCode) return <p className="error">{getErrorMessage(errorCode)}</p>;
  if (!transaction || !waiting) return <p>Загрузка...</p>;
  return <ThreeDsChallenge transaction={transaction} />;
}
