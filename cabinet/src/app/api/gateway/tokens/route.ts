import type { CardInput } from "@/entities/card";
import { json, readJson, route } from "@/mocks/lib/http";
import { tokenizeCard } from "@/mocks/gateway/tokens";

// ШЛЮЗ: POST /api/gateway/tokens — данные карты -> одноразовый токен.
// Данные карты идут из браузера сразу в шлюз, минуя сервер кабинета.
export const POST = route(async (req) => {
  const body = await readJson<Partial<CardInput>>(req);
  return json(
    tokenizeCard({
      number: String(body.number ?? ""),
      expiry: String(body.expiry ?? ""),
      cvc: String(body.cvc ?? ""),
      holder: String(body.holder ?? ""),
    }),
  );
});
