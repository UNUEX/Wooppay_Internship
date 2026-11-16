export type CardBrand = "visa" | "mastercard" | "mir" | "unknown";

// То, что клиент вводит в форму. Живёт только в памяти браузера до
// отправки в шлюз: не логируем, не кладём в localStorage и в URL.
export type CardInput = {
  number: string; // "4242 4242 4242 4242"
  expiry: string; // "MM/YY"
  cvc: string;
  holder: string;
};

// Безопасное представление карты: его можно показывать и хранить
export type CardSummary = {
  brand: CardBrand;
  last4: string;
};
