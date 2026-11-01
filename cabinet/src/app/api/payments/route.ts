import { NextResponse } from "next/server";
import { getPaymentsFor } from "@/mocks/db";
import { Role } from "@/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));
  const role = searchParams.get("role") as Role;

  return NextResponse.json(getPaymentsFor(userId, role));
}
