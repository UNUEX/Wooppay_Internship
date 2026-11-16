"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getErrorMessage, useTransaction } from "@/entities/transaction";
import { WalletApproval } from "@/features/confirm-wallet";

// Экран провайдера электронного кошелька (эмуляция чужого сайта)
export function WalletPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { transaction, errorCode } = useTransaction(id);
  const waiting = transaction?.status === "requires_action" && transaction.nextAction?.reason === "wallet";

  useEffect(() => {
    if (transaction && !waiting) router.replace(`/pay/${id}/result`);
  }, [transaction, waiting, id, router]);

  if (errorCode) return <p className="error">{getErrorMessage(errorCode)}</p>;
  if (!transaction || !waiting) return <p>Загрузка...</p>;
  return <WalletApproval transaction={transaction} />;
}
