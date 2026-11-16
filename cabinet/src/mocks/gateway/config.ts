// Настройки мок-шлюза (эквайера). В реальном проекте секреты лежат
// в переменных окружения, а не в коде. Здесь — тестовые значения.

// Секретный ключ кабинета для запросов к шлюзу. НИКОГДА не попадает в браузер.
export const GATEWAY_SECRET_KEY = process.env.GATEWAY_SECRET_KEY ?? "sk_test_cabinet";

// Общий секрет для подписи вебхуков (знают шлюз и сервер кабинета)
export const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? "whsec_test_cabinet";

export const TRANSACTION_TTL_MS = 24 * 60 * 60 * 1000; // счёт можно оплатить в течение суток
export const TOKEN_TTL_MS = 15 * 60 * 1000;
export const MAX_ATTEMPTS = 5;

// Повторы доставки вебхука. В реальных шлюзах — минуты и часы
// (до нескольких суток), здесь сокращено для наглядности.
export const WEBHOOK_RETRY_DELAYS_MS = [2_000, 5_000, 15_000, 30_000];

// Через сколько "долгая" транзакция (processing) получит ответ банка
export const ASYNC_PROCESSING_MS = 4_000;
