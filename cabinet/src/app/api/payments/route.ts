import { NextResponse } from "next/server";
import { db, getPaymentsFor } from "@/mocks/db";
import { createGatewayTransaction } from "@/mocks/gatewayClient";
import { validatePayment, type Payment } from "@/entities/payment";
import type { Role } from "@/entities/user";
import { firstError, hasErrors, toMinor } from "@/shared/lib";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));
  const role = searchParams.get("role") as Role;

  return NextResponse.json(getPaymentsFor(userId, role));
}

// Выставить счёт: кабинет создаёт платёж "ожидает оплаты" и регистрирует
// транзакцию в платёжном шлюзе. Клиент получит ссылку и оплатит сам.
export async function POST(req: Request) {
  const body = await req.json();

  // сервер проверяет данные сам: фронтенду доверять нельзя
  const errors = validatePayment(body);
  if (hasErrors(errors)) {
    return NextResponse.json({ error: firstError(errors), errors }, { status: 400 });
  }

  const merchant = db.users.find((u) => u.id === body.userId);
  if (!merchant) return NextResponse.json({ error: "Пользователь не найден" }, { status: 400 });

  const id = Math.max(0, ...db.payments.map((p) => p.id)) + 1;
  const description = (body.description ?? "").trim();

  // запрос сервер -> сервер с секретным ключом. Шлюз принимает сумму в тиынах.
  let transactionId: string;
  try {
    const transaction = await createGatewayTransaction(new URL(req.url).origin, id, {
      amount: toMinor(body.amount),
      description: description || `Счёт №${id}`,
      merchantName: merchant.name,
    });
    transactionId = transaction.id;
  } catch {
    return NextResponse.json({ error: "Платёжный шлюз недоступен, попробуйте позже" }, { status: 502 });
  }

  const payment: Payment = {
    id,
    customer: body.customer.trim(),
    description,
    amount: body.amount,
    refundedAmount: 0,
    status: "pending",
    createdAt: new Date().toISOString(),
    paidAt: null,
    userId: body.userId,
    transactionId,
    payUrl: `/pay/${transactionId}`,
    method: null,
    cardLast4: null,
    lastError: null,
  };
  db.payments.push(payment);

  return NextResponse.json(payment);
}
