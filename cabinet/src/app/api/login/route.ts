import { NextResponse } from "next/server";
import { db, toSafeUser } from "@/mocks/db";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = db.users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }
  return NextResponse.json(toSafeUser(user));
}