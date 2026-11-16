import { request } from "@/shared/api";

// В реальности решение клиента шлюзу присылает провайдер кошелька
export function answerWallet(transactionId: string, approve: boolean) {
  return request<{ redirectUrl: string }>(`/api/gateway/transactions/${encodeURIComponent(transactionId)}/wallet`, {
    method: "POST",
    body: JSON.stringify({ approve }),
  });
}
