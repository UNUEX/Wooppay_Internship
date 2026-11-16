import { NextResponse } from "next/server";
import type { WebhookEvent } from "@/entities/webhook";
import { db } from "@/mocks/db";
import { WEBHOOK_SECRET } from "@/mocks/gateway/config";
import { verifySignature } from "@/mocks/lib/signature";
import { applyGatewayEvent } from "@/mocks/webhookHandler";

// КАБИНЕТ: POST /api/webhooks/gateway — приём событий от платёжного шлюза.
// Правила хорошего обработчика:
// 1. проверить подпись по СЫРОМУ телу (до JSON.parse)
// 2. отбросить дубликаты по event.id
// 3. быстро ответить 2xx
// 4. на любой не-2xx шлюз повторит отправку позже
export async function POST(req: Request) {
  if (db.settings.webhookOutage) {
    return NextResponse.json({ error: "Сервер кабинета недоступен (эмуляция)" }, { status: 503 });
  }

  const raw = await req.text();
  if (!verifySignature(req.headers.get("webhook-signature"), raw, WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "Неверная подпись" }, { status: 401 });
  }

  const event = JSON.parse(raw) as WebhookEvent;
  return NextResponse.json({ received: true, result: applyGatewayEvent(event) });
}
