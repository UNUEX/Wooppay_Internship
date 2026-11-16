import { connection } from "next/server";
import { json } from "@/mocks/lib/http";
import { gatewayDb } from "@/mocks/gateway/store";

// ШЛЮЗ: GET /api/gateway/webhook-deliveries — журнал отправки вебхуков.
// В реальном шлюзе доступен в его личном кабинете после входа.
export async function GET() {
  await connection(); // данные меняются постоянно — не кэшировать при сборке
  return json(gatewayDb.deliveries.slice(0, 50));
}
