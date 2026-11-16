import { HttpError } from "./http";

// Хранилище идемпотентности: ключ -> сохранённый ответ.
// Повтор запроса с тем же ключом не выполняет операцию заново,
// а возвращает тот же ответ. Так повтор "Оплатить" или "Вернуть"
// после обрыва сети не спишет и не вернёт деньги дважды.

type Entry =
  | { state: "in_flight"; fingerprint: string }
  | { state: "done"; fingerprint: string; status: number; body: unknown };

const g = globalThis as unknown as { idempotencyStore?: Map<string, Entry> };
const store = (g.idempotencyStore ??= new Map());

export type IdempotentResult = { status: number; body: unknown; replayed: boolean };

export async function withIdempotency(
  key: string | null,
  scope: string,
  payload: unknown,
  run: () => Promise<unknown> | unknown,
): Promise<IdempotentResult> {
  if (!key) throw new HttpError(400, "idempotency_key_required", "Нужен заголовок Idempotency-Key");

  const storeKey = `${scope}:${key}`;
  const fingerprint = JSON.stringify(payload);
  const existing = store.get(storeKey);

  if (existing) {
    // тот же ключ, но другие данные — это ошибка клиента, а не повтор
    if (existing.fingerprint !== fingerprint) {
      throw new HttpError(422, "idempotency_key_reused", "Ключ уже использован с другими параметрами");
    }
    if (existing.state === "in_flight") {
      throw new HttpError(409, "request_in_progress", "Запрос с этим ключом ещё выполняется");
    }
    return { status: existing.status, body: existing.body, replayed: true };
  }

  store.set(storeKey, { state: "in_flight", fingerprint });
  try {
    const body = await run();
    store.set(storeKey, { state: "done", fingerprint, status: 200, body });
    return { status: 200, body, replayed: false };
  } catch (e) {
    if (e instanceof HttpError && e.status < 500) {
      // бизнес-ошибку (4xx) запоминаем: повтор получит тот же ответ
      const body = { error: { code: e.code, message: e.message, field: e.field } };
      store.set(storeKey, { state: "done", fingerprint, status: e.status, body });
    } else {
      // 5xx — операция не выполнилась, ключ освобождаем, повтор разрешён
      store.delete(storeKey);
    }
    throw e;
  }
}
