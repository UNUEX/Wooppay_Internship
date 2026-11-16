import { request } from "@/shared/api";

// В реальности форму 3DS показывает и обрабатывает банк-эмитент,
// а результат он отправляет в шлюз сам. Здесь эмулируем.
export function submitChallenge(transactionId: string, body: { code: string } | { cancel: true }) {
  return request<{ redirectUrl: string }>(`/api/gateway/transactions/${encodeURIComponent(transactionId)}/3ds`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
