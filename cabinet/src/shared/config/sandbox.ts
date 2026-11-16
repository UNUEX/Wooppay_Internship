// Песочница (sandbox): тестовые карты, как у настоящих эквайеров.
// Номер карты определяет, как ответит эмулятор банка. Все номера проходят Луна.

export type Scenario =
  | "approve" // успех без подтверждения
  | "three_ds" // банк требует 3-D Secure
  | "decline" // банк отклонил
  | "insufficient_funds" // недостаточно средств
  | "stolen" // карта в стоп-листе (пользователю — общий отказ)
  | "async" // банк отвечает не сразу: processing, потом успех
  | "transient"; // банк не ответил один раз (503), повтор проходит

export const TEST_CARDS: { number: string; scenario: Scenario; title: string }[] = [
  { number: "4242424242424242", scenario: "approve", title: "Успех без 3DS" },
  { number: "5555555555554444", scenario: "approve", title: "Успех без 3DS (Mastercard)" },
  { number: "4000000000003220", scenario: "three_ds", title: "Требует 3-D Secure" },
  { number: "4000000000000002", scenario: "decline", title: "Отказ банка" },
  { number: "4000000000009995", scenario: "insufficient_funds", title: "Недостаточно средств" },
  { number: "4000000000009979", scenario: "stolen", title: "Украденная карта (общий отказ)" },
  { number: "4000000000000077", scenario: "async", title: "Долгая обработка (~4 сек)" },
  { number: "4000000000000119", scenario: "transient", title: "Банк не ответил 1 раз (авто-повтор)" },
];

// Код на эмуляторе страницы банка (3-D Secure)
export const THREE_DS_TEST_CODE = "1234";
