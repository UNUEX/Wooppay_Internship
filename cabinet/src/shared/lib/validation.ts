// Общие правила проверки полей. Ничего не знают о платежах и пользователях,
// поэтому их можно использовать в любой форме и на сервере.
// Каждое правило возвращает текст ошибки или null, если всё хорошо.

// ошибки формы: для каждого поля — текст ошибки
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function hasErrors<T>(errors: FieldErrors<T>): boolean {
  return Object.values(errors).some(Boolean);
}

export function firstError<T>(errors: FieldErrors<T>): string | undefined {
  return Object.values(errors).find(Boolean) as string | undefined;
}

// только буквы (русские или латинские), слова через пробел или дефис: "Анна", "Jean-Luc Ким"
const NAME_REGEX = /^[A-Za-zА-Яа-яЁё]+([ -][A-Za-zА-Яа-яЁё]+)*$/;

export function validateName(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return "Введите имя";
  const name = value.trim();
  if (name.length < 2 || name.length > 50) return "Имя должно быть от 2 до 50 символов";
  if (!NAME_REGEX.test(name)) return "Имя может содержать только буквы, пробел и дефис";
  return null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return "Введите email";
  if (!EMAIL_REGEX.test(value.trim())) return "Неверный формат email";
  return null;
}

export function validateMaxLength(value: unknown, max: number): string | null {
  if (value === undefined || value === null) return null; // поле необязательное
  if (typeof value !== "string") return "Неверное значение";
  if (value.trim().length > max) return `Не больше ${max} символов`;
  return null;
}

export function validateMinLength(value: unknown, min: number): string | null {
  if (typeof value !== "string" || value.length < min) return `Не меньше ${min} символов`;
  return null;
}

export function validateAmount(value: unknown, max: number): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Введите сумму числом";
  if (value <= 0) return "Сумма должна быть больше 0";
  if (value > max) return `Сумма не может быть больше ${max.toLocaleString("ru-RU")}`;
  // не больше 2 знаков после запятой (копейки/тиыны)
  if (Math.abs(value * 100 - Math.round(value * 100)) > 1e-9) return "Не больше 2 знаков после запятой";
  return null;
}
