import { backoffDelay, sleep } from "@/shared/lib";

// Ошибка запроса. Наследуется от Error, поэтому старый код
// `(err as Error).message` продолжает работать.
export class ApiError extends Error {
  constructor(
    public readonly status: number, // 0 — ответа не было (сеть/таймаут)
    public readonly code: string,
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  // 5xx, 429 и обрыв сети — временные проблемы, запрос можно повторить.
  // 4xx — ошибка в самом запросе, повтор ничего не изменит.
  get retryable(): boolean {
    return this.status === 0 || this.status === 429 || this.status >= 500;
  }
}

type Options = RequestInit & {
  // Для POST повторять безопасно ТОЛЬКО с ключом идемпотентности,
  // иначе повтор "Оплатить" может списать деньги дважды.
  idempotencyKey?: string;
  retries?: number;
};

export async function request<T>(url: string, options: Options = {}): Promise<T> {
  const { idempotencyKey, retries, ...init } = options;
  const method = (init.method ?? "GET").toUpperCase();
  const canRetry = method === "GET" || Boolean(idempotencyKey);
  const maxRetries = canRetry ? (retries ?? 2) : 0;

  for (let attempt = 0; ; attempt++) {
    try {
      return await send<T>(url, init, idempotencyKey);
    } catch (e) {
      const error = toApiError(e);
      if (!error.retryable || attempt >= maxRetries) throw error;
      await sleep(backoffDelay(attempt));
    }
  }
}

async function send<T>(url: string, init: RequestInit, idempotencyKey?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const res = await fetch(url, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string>) },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // поддерживаем оба формата ошибок:
    // старый кабинета { error: "текст" } и шлюза { error: { code, message, field } }
    const err = data?.error;
    if (typeof err === "string") throw new ApiError(res.status, "error", err);
    throw new ApiError(res.status, err?.code ?? "unknown_error", err?.message ?? "Ошибка запроса", err?.field);
  }
  return data as T;
}

function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;
  if (e instanceof DOMException && e.name === "TimeoutError") {
    return new ApiError(0, "timeout", "Сервер долго не отвечает");
  }
  return new ApiError(0, "network_error", "Нет соединения с сервером");
}
