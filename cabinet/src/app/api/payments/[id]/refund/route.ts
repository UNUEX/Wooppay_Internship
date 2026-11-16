import { NextResponse } from "next/server";
import { db } from "@/mocks/db";
import { refundGatewayTransaction } from "@/mocks/gatewayClient";
import { HttpError } from "@/mocks/lib/http";
import { refundableAmount } from "@/entities/payment";
import { toMinor, validateAmount } from "@/shared/lib";

// Возврат: браузер -> сервер кабинета -> шлюз (с секретным ключом).
// Статус платежа здесь НЕ меняем — его поменяет вебхук refund.succeeded.
// Один источник правды — события шлюза.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payment = db.payments.find((p) => p.id === Number(id));
  if (!payment) {
    return NextResponse.json({ error: "Платёж не найден" }, { status: 404 });
  }

  const idempotencyKey = req.headers.get("idempotency-key");
  if (!idempotencyKey) {
    return NextResponse.json({ error: "Нужен заголовок Idempotency-Key" }, { status: 400 });
  }

  const { amount } = await req.json();
  const available = refundableAmount(payment);
  if (available === 0) {
    return NextResponse.json({ error: "Этот платёж нельзя вернуть" }, { status: 400 });
  }
  const amountError = validateAmount(amount, available);
  if (amountError) {
    return NextResponse.json({ error: amountError }, { status: 400 });
  }

  try {
    const result = await refundGatewayTransaction(
      new URL(req.url).origin,
      payment.transactionId,
      toMinor(amount),
      idempotencyKey,
    );
    return NextResponse.json(result);
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 502;
    const message = e instanceof HttpError ? e.message : "Платёжный шлюз недоступен";
    return NextResponse.json({ error: message }, { status });
  }
}
