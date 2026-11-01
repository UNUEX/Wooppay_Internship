import { NextResponse } from "next/server";
import { db, toSafeUser } from "@/mocks/db";
import { User } from "@/types";

export async function GET() {
  return NextResponse.json(db.users.map(toSafeUser));
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.name || !body.email || !body.password) {
    return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
  }
  if (db.users.some((u) => u.email === body.email)) {
    return NextResponse.json({ error: "Такой email уже есть" }, { status: 400 });
  }

  const user: User = {
    id: db.users.length + 1,
    name: body.name,
    email: body.email,
    password: body.password,
    role: body.role,
  };
  db.users.push(user);

  return NextResponse.json(toSafeUser(user));
}
