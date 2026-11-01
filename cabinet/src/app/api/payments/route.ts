import { NextResponse } from "next/server";
import { db, getPaymentsFor } from "@/mocks/db";
import { Payment, Role } from "@/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));
  const role = searchParams.get("role") as Role;

  return NextResponse.json(getPaymentsFor(userId, role));
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.customer || !body.amount || body.amount <= 0) {
    return NextResponse.json({ error: "Укажите клиента и сумму больше 0" }, { status: 400 });
  }

  const payment: Payment = {
    id: db.payments.length + 1,
    customer: body.customer,
    description: body.description,
    amount: body.amount,
    status: "paid",
    createdAt: new Date().toISOString(),
    userId: body.userId,
  };
  db.payments.push(payment);

  return NextResponse.json(payment);
}
