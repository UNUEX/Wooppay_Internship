import { NextResponse } from "next/server";
import { db } from "@/mocks/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payment = db.payments.find((p) => p.id === Number(id));

  if (!payment) {
    return NextResponse.json({ error: "Платёж не найден" }, { status: 404 });
  }
  if (payment.status === "refunded") {
    return NextResponse.json({ error: "Платёж уже возвращён" }, { status: 400 });
  }

  payment.status = "refunded";
  return NextResponse.json(payment);
}
