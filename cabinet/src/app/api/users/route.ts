import { NextResponse } from "next/server";
import { db, toSafeUser } from "@/mocks/db";
import { validateUser, type User } from "@/entities/user";
import { firstError, hasErrors } from "@/shared/lib";

export async function GET() {
  return NextResponse.json(db.users.map(toSafeUser));
}

export async function POST(req: Request) {
  const body = await req.json();

  // сервер проверяет данные сам: фронтенду доверять нельзя
  const errors = validateUser(body, { isEdit: false });
  if (hasErrors(errors)) {
    return NextResponse.json({ error: firstError(errors), errors }, { status: 400 });
  }

  const email = body.email.trim();
  if (db.users.some((u) => u.email === email)) {
    return NextResponse.json({ error: "Такой email уже есть" }, { status: 400 });
  }

  const user: User = {
    id: db.users.length + 1,
    name: body.name.trim(),
    email,
    password: body.password,
    role: body.role,
  };
  db.users.push(user);

  return NextResponse.json(toSafeUser(user));
}
