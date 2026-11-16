import { NextResponse } from "next/server";

// Ошибка шлюза с HTTP-статусом и кодом из контракта
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly field?: string,
  ) {
    super(message);
  }
}

export function json(body: unknown, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(body, { status, headers });
}

// Формат ошибки шлюза: { error: { code, message, field } }
export function errorResponse(e: unknown) {
  if (e instanceof HttpError) {
    return json({ error: { code: e.code, message: e.message, field: e.field } }, e.status);
  }
  // детали внутренней ошибки наружу не отдаём — только в лог
  console.error(e);
  return json({ error: { code: "internal_error", message: "Внутренняя ошибка" } }, 500);
}

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new HttpError(400, "invalid_json", "Тело запроса должно быть JSON");
  }
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

// Оборачивает обработчик: брошенная HttpError превращается в ответ по контракту
export function route<C>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      return errorResponse(e);
    }
  };
}

export type IdParams = { params: Promise<{ id: string }> };
