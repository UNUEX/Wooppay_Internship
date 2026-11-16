import { describe, expect, it } from "vitest";
import { TEST_CARDS } from "@/shared/config";
import { isLuhnValid } from "./luhn";
import { detectBrand } from "./brand";
import { formatCardNumber, formatExpiry } from "./format";
import { validateCardNumber, validateCvc, validateExpiry, validateHolder } from "./validation";

describe("алгоритм Луна", () => {
  it.each(TEST_CARDS)("тестовая карта $number валидна", ({ number }) => {
    expect(isLuhnValid(number)).toBe(true);
  });

  it("ловит опечатку в одной цифре", () => {
    expect(isLuhnValid("4242424242424243")).toBe(false);
  });

  it("не принимает не-цифры", () => {
    expect(isLuhnValid("4242 4242")).toBe(false);
  });
});

describe("номер карты", () => {
  it("форматируется группами по 4", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatCardNumber("42424")).toBe("4242 4");
    expect(formatCardNumber("4242-4242 4242424242429999")).toBe("4242 4242 4242 4242");
  });

  it("требует 16 цифр", () => {
    expect(validateCardNumber("4242 4242 4242")).toMatch(/16 цифр/);
    expect(validateCardNumber("4242 4242 4242 4242")).toBeNull();
  });

  it("определяет платёжную систему", () => {
    expect(detectBrand("4242")).toBe("visa");
    expect(detectBrand("5555")).toBe("mastercard");
    expect(detectBrand("2200")).toBe("mir");
  });
});

describe("срок действия", () => {
  const now = new Date(2026, 10, 16); // 16 ноября 2026

  it("форматируется как ММ/ГГ", () => {
    expect(formatExpiry("12")).toBe("12/");
    expect(formatExpiry("5")).toBe("05/");
    expect(formatExpiry("1228")).toBe("12/28");
    expect(formatExpiry("12", "12/")).toBe("12"); // стирание слэша
  });

  it("текущий месяц ещё валиден, прошлый — нет", () => {
    expect(validateExpiry("11/26", now)).toBeNull();
    expect(validateExpiry("10/26", now)).toMatch(/истёк/);
  });

  it("месяц 13 — ошибка", () => {
    expect(validateExpiry("13/27", now)).toMatch(/Месяц/);
  });
});

describe("CVV и имя", () => {
  it("CVV — ровно 3 цифры", () => {
    expect(validateCvc("12")).not.toBeNull();
    expect(validateCvc("123")).toBeNull();
  });

  it("имя — только латиница", () => {
    expect(validateHolder("IVAN PETROV")).toBeNull();
    expect(validateHolder("ИВАН ПЕТРОВ")).toMatch(/латинские/);
  });
});
