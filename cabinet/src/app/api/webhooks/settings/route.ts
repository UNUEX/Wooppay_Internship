import { NextResponse, connection } from "next/server";
import { db } from "@/mocks/db";

// Для демонстрации: можно "уронить" приём вебхуков и посмотреть, как шлюз повторяет
export async function GET() {
  await connection();
  return NextResponse.json(db.settings);
}

export async function POST(req: Request) {
  const body = await req.json();
  db.settings.webhookOutage = body.webhookOutage === true;
  return NextResponse.json(db.settings);
}
