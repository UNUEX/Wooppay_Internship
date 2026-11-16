// Алгоритм Луна (контрольная сумма номера карты).
// Идём по цифрам справа налево, каждую вторую удваиваем; если после
// удвоения получилось > 9, вычитаем 9. Сумма всех цифр должна делиться на 10.
// Ловит опечатку в одной цифре и большинство перестановок соседних цифр.
// Валидный по Луну номер НЕ значит, что карта существует — это решает банк.
export function isLuhnValid(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}
