import type { CardInput, CardSummary } from "@/entities/card";
import { request } from "@/shared/api";

// Данные карты уходят напрямую в шлюз, назад приходит одноразовый токен.
// Дальше (в confirm) ходит только токен — номер карты больше нигде не нужен.
export function tokenizeCard(card: CardInput): Promise<{ token: string; card: CardSummary }> {
  return request("/api/gateway/tokens", { method: "POST", body: JSON.stringify(card) });
}
