export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

// Сколько цифр левее курсора. Нужно, чтобы после переформатирования
// ("4242 4" -> "4242 42") курсор не прыгал в конец строки.
export function digitsBefore(value: string, caret: number): number {
  return onlyDigits(value.slice(0, caret)).length;
}

// Позиция в отформатированной строке сразу после n-й цифры
export function caretAfterDigits(formatted: string, n: number): number {
  if (n === 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) seen++;
    if (seen === n) return i + 1;
  }
  return formatted.length;
}
