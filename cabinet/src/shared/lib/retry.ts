// Ключ идемпотентности — уникальная строка для ОДНОЙ операции (одной попытки
// оплаты, одного возврата). Если запрос ушёл, а ответ потерялся, повторяем
// запрос с тем же ключом — сервер вернёт сохранённый результат вместо того,
// чтобы списать или вернуть деньги второй раз.
export function createIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Задержка перед повтором растёт: ~300мс, ~600мс, ~1200мс...
// Случайный разброс нужен, чтобы после сбоя тысячи клиентов
// не ударили в сервер в одну и ту же секунду.
export function backoffDelay(attempt: number, baseMs = 300, maxMs = 5000): number {
  const exp = Math.min(maxMs, baseMs * 2 ** attempt);
  return exp / 2 + Math.random() * (exp / 2);
}
