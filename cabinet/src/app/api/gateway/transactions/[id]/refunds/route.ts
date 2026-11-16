import { json, readJson, route, type IdParams } from "@/mocks/lib/http";
import { withIdempotency } from "@/mocks/lib/idempotency";
import { requireSecretKey } from "@/mocks/gateway/auth";
import { gatewayDb } from "@/mocks/gateway/store";
import { refundTransaction } from "@/mocks/gateway/transactions";

// ШЛЮЗ: POST /api/gateway/transactions/:id/refunds — возврат (сервер кабинета -> шлюз)
export const POST = route<IdParams>(async (req, { params }) => {
  requireSecretKey(req);
  gatewayDb.webhookUrl = `${new URL(req.url).origin}/api/webhooks/gateway`;
  const { id } = await params;
  const body = await readJson<{ amount?: number }>(req);
  const result = await withIdempotency(req.headers.get("idempotency-key"), `refund:${id}`, body, () =>
    refundTransaction(id, body.amount),
  );
  return json(result.body, result.status);
});
