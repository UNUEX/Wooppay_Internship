import { NextResponse } from "next/server";
import { getPaymentsFor } from "@/mocks/db";
import type { Payment } from "@/entities/payment";
import type { Report } from "@/entities/report";
import type { Role } from "@/entities/user";

function sum(items: Payment[], pick: (p: Payment) => number) {
  // считаем в тиынах, чтобы не копить ошибку дробей
  return items.reduce((total, p) => total + Math.round(pick(p) * 100), 0) / 100;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));
  const role = searchParams.get("role") as Role;

  // отчёт считается по тем же платежам, которые пользователь видит в списке
  const list = getPaymentsFor(userId, role);
  // "оплачен" — всё, по чему деньги хоть раз поступили (в т.ч. потом возвращённые)
  const paid = list.filter((p) => p.status === "paid" || p.status === "partially_refunded" || p.status === "refunded");
  const refunded = list.filter((p) => p.refundedAmount > 0);

  const report: Report = {
    totalCount: list.length,
    paidCount: paid.length,
    refundedCount: refunded.length,
    paidSum: sum(paid, (p) => p.amount),
    refundedSum: sum(refunded, (p) => p.refundedAmount),
  };
  return NextResponse.json(report);
}
