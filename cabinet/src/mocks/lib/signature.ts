import { createHmac, timingSafeEqual } from "node:crypto";

// Подпись вебхука: HMAC-SHA256(secret, "<timestamp>.<тело>").
// Заголовок: "Webhook-Signature: t=1700000000,v1=<hex>".
// Зачем: адрес вебхука публичный. Без подписи любой мог бы прислать
// кабинету "payment.succeeded" — и неоплаченный счёт стал бы оплаченным.
// timestamp защищает от повторной отправки старого запроса (replay).

export function signPayload(secret: string, timestamp: number, body: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

export function buildSignatureHeader(secret: string, body: string, now = Date.now()): string {
  const t = Math.floor(now / 1000);
  return `t=${t},v1=${signPayload(secret, t, body)}`;
}

export function verifySignature(
  header: string | null,
  body: string,
  secret: string,
  toleranceSec = 300,
  now = Date.now(),
): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = Number(parts.t);
  if (!Number.isFinite(t) || !parts.v1) return false;
  if (Math.abs(now / 1000 - t) > toleranceSec) return false;

  const expected = Buffer.from(signPayload(secret, t, body), "hex");
  const actual = Buffer.from(parts.v1, "hex");
  // сравнение за постоянное время — подпись нельзя подобрать по времени ответа
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
