import { NextResponse } from "next/server";
import { getPaymentsFor } from "@/mocks/db";
import { Payment, Report, Role } from "@/types";

function sum(items: Payment[]) {
  return items.reduce((total, p) => total + p.amount, 0);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));
  const role = searchParams.get("role") as Role;

  // отчёт считается по тем же платежам, которые пользователь видит в списке
  const list = getPaymentsFor(userId, role);
  const paid = list.filter((p) => p.status === "paid");
  const refunded = list.filter((p) => p.status === "refunded");

  const report: Report = {
    totalCount: list.length,
    paidCount: paid.length,
    refundedCount: refunded.length,
    paidSum: sum(paid),
    refundedSum: sum(refunded),
  };
  return NextResponse.json(report);
}
