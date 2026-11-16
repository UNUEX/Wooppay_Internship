import { json, readJson, route } from "@/mocks/lib/http";
import { withIdempotency } from "@/mocks/lib/idempotency";
import { requireSecretKey } from "@/mocks/gateway/auth";
import { gatewayDb } from "@/mocks/gateway/store";
import { createTransaction } from "@/mocks/gateway/transactions";

// ШЛЮЗ: POST /api/gateway/transactions — создать транзакцию (сервер кабинета -> шлюз)
export const POST = route(async (req) => {
  requireSecretKey(req);
  // адрес для вебхуков. В реальности его указывают в кабинете шлюза.
  gatewayDb.webhookUrl = `${new URL(req.url).origin}/api/webhooks/gateway`;

  const body = await readJson<{ amount?: number; description?: string; merchantName?: string }>(req);
  const result = await withIdempotency(req.headers.get("idempotency-key"), "create", body, () =>
    createTransaction({ amount: body.amount, description: body.description, merchantName: body.merchantName }),
  );
  return json(result.body, result.status);
});
