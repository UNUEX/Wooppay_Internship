// В кабинете сумма хранится в тенге (например 1500.5).
// Платёжный шлюз (как и настоящие шлюзы) принимает сумму в минимальных
// единицах — тиынах — целым числом: 150050. Дробные числа для денег опасны:
// в JS 0.1 + 0.2 !== 0.3. Поэтому на границе с шлюзом переводим туда-обратно.

export function toMinor(amount: number): number {
  return Math.round(amount * 100);
}

export function fromMinor(minor: number): number {
  return minor / 100;
}

export function formatMoney(amount: number): string {
  return `${amount.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₸`;
}
