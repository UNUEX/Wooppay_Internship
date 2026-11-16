import { json, readJson, route, type IdParams } from "@/mocks/lib/http";
import { completeWallet } from "@/mocks/gateway/transactions";

// ШЛЮЗ: POST /api/gateway/transactions/:id/wallet — решение клиента на "сайте кошелька"
export const POST = route<IdParams>(async (req, { params }) => {
  const { id } = await params;
  return json(completeWallet(id, await readJson(req)));
});
