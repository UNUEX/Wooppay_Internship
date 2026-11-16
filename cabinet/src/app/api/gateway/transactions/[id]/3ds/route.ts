import { json, readJson, route, type IdParams } from "@/mocks/lib/http";
import { completeThreeDs } from "@/mocks/gateway/transactions";

// ШЛЮЗ: POST /api/gateway/transactions/:id/3ds — ответ "страницы банка".
// В реальности результат 3DS шлюзу присылает банк-эмитент, а не наш фронтенд.
export const POST = route<IdParams>(async (req, { params }) => {
  const { id } = await params;
  return json(completeThreeDs(id, await readJson(req)));
});
