import { NextResponse } from "next/server";
import { db, getPaymentsFor } from "@/mocks/db";
import { validatePayment, type Payment } from "@/entities/payment";
import type { Role } from "@/entities/user";
import { firstError, hasErrors } from "@/shared/lib";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));
  const role = searchParams.get("role") as Role;

  return NextResponse.json(getPaymentsFor(userId, role));
}

export async function POST(req: Request) {
  const body = await req.json();

  // сервер проверяет данные сам: фронтенду доверять нельзя
  const errors = validatePayment(body);
  if (hasErrors(errors)) {
    return NextResponse.json({ error: firstError(errors), errors }, { status: 400 });
  }

  const payment: Payment = {
    id: db.payments.length + 1,
    customer: body.customer.trim(),
    description: (body.description ?? "").trim(),
    amount: body.amount,
    status: "paid",
    createdAt: new Date().toISOString(),
    userId: body.userId,
  };
  db.payments.push(payment);

  return NextResponse.json(payment);
}
