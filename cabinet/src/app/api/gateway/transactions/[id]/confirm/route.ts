import type { ConfirmBody } from "@/entities/transaction";
import { json, readJson, route, type IdParams } from "@/mocks/lib/http";
import { withIdempotency } from "@/mocks/lib/idempotency";
import { confirmTransaction } from "@/mocks/gateway/transactions";

// ШЛЮЗ: POST /api/gateway/transactions/:id/confirm — попытка оплаты (браузер клиента -> шлюз)
// Тело: { method: "card", token } | { method: "google_pay" | "apple_pay", token } | { method: "wallet" }
export const POST = route<IdParams>(async (req, { params }) => {
  const { id } = await params;
  const body = await readJson<ConfirmBody>(req);
  const result = await withIdempotency(req.headers.get("idempotency-key"), `confirm:${id}`, body, () =>
    confirmTransaction(id, body),
  );
  return json(result.body, result.status, result.replayed ? { "Idempotent-Replayed": "true" } : undefined);
});
