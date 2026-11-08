import { NextResponse } from "next/server";
import { db, toSafeUser } from "@/mocks/db";
import { validateUser } from "@/entities/user";
import { firstError, hasErrors } from "@/shared/lib";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = db.users.find((u) => u.id === Number(id));

  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }

  const body = await req.json();

  // сервер проверяет данные сам: фронтенду доверять нельзя
  const errors = validateUser(body, { isEdit: true });
  if (hasErrors(errors)) {
    return NextResponse.json({ error: firstError(errors), errors }, { status: 400 });
  }

  const email = body.email.trim();
  const emailTaken = db.users.some((u) => u.email === email && u.id !== user.id);
  if (emailTaken) {
    return NextResponse.json({ error: "Такой email уже есть" }, { status: 400 });
  }

  user.name = body.name.trim();
  user.email = email;
  user.role = body.role;
  if (body.password) user.password = body.password; // пустой пароль = не меняем

  return NextResponse.json(toSafeUser(user));
}
