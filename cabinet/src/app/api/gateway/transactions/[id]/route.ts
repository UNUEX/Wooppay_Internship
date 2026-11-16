import { json, route, type IdParams } from "@/mocks/lib/http";
import { getPublicTransaction } from "@/mocks/gateway/transactions";

// ШЛЮЗ: GET /api/gateway/transactions/:id — статус для страницы оплаты клиента
export const GET = route<IdParams>(async (_req, { params }) => {
  const { id } = await params;
  return json(getPublicTransaction(id));
});
