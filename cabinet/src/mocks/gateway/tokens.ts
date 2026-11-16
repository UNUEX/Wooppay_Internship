import { detectBrand, validateCard, type CardInput, type CardSummary } from "@/entities/card";
import { TEST_CARDS, type Scenario } from "@/shared/config";
import { onlyDigits } from "@/shared/lib";
import { HttpError } from "../lib/http";
import { newId } from "../lib/ids";
import { TOKEN_TTL_MS } from "./config";
import { gatewayDb, type CardToken } from "./store";

// Любая валидная карта не из списка тестовых — успешная
function scenarioForCard(pan: string): Scenario {
  return TEST_CARDS.find((c) => c.number === pan)?.scenario ?? "approve";
}

// Токенизация: браузер отправляет данные карты ПРЯМО в шлюз и получает
// одноразовый токен. Сервер кабинета видит только токен — ему не нужно
// проходить тяжёлую сертификацию PCI DSS. В реальности это делают
// iframe / hosted fields шлюза, здесь — отдельный эндпоинт.
export function tokenizeCard(input: CardInput): { token: string; card: CardSummary } {
  // сервер повторяет ВСЕ проверки формы: запрос можно отправить в обход неё
  const errors = validateCard(input);
  const field = Object.keys(errors)[0] as keyof CardInput | undefined;
  if (field) throw new HttpError(400, "invalid_card", errors[field]!, field);

  const pan = onlyDigits(input.number);
  const scenario = scenarioForCard(pan);
  const token: CardToken = {
    id: newId("tok"),
    card: { brand: detectBrand(pan), last4: pan.slice(-4) },
    scenario,
    transientFailuresLeft: scenario === "transient" ? 1 : 0,
    used: false,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  };
  gatewayDb.tokens.set(token.id, token);
  return { token: token.id, card: token.card };
}

export function findUsableToken(id: unknown): CardToken {
  const token = typeof id === "string" ? gatewayDb.tokens.get(id) : undefined;
  if (!token || token.used || token.expiresAt < Date.now()) {
    throw new HttpError(400, "invalid_token", "Токен карты недействителен");
  }
  return token;
}
