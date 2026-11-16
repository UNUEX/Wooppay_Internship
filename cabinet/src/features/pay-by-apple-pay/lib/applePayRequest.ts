import type { Transaction } from "@/entities/transaction";

// ApplePayPaymentRequest по документации Apple:
// https://developer.apple.com/documentation/apple_pay_on_the_web/applepaypaymentrequest
// Передаётся в new ApplePaySession(3, request).
export function buildApplePayRequest(transaction: Transaction) {
  return {
    countryCode: "KZ",
    currencyCode: transaction.currency,
    supportedNetworks: ["visa", "masterCard"],
    // supports3DS обязателен: Apple Pay сам подтверждает оплату на устройстве
    // (Face ID / Touch ID), поэтому отдельный шаг 3DS обычно не нужен
    merchantCapabilities: ["supports3DS"],
    total: { label: transaction.merchantName, amount: (transaction.amount / 100).toFixed(2) },
  };
}

// Настоящая проверка доступности: работает только в Safari на устройствах Apple
// и только на HTTPS-домене, подтверждённом в Apple Developer.
export function isApplePayAvailable(): boolean {
  const session = (window as unknown as { ApplePaySession?: { canMakePayments(): boolean } }).ApplePaySession;
  try {
    return Boolean(session?.canMakePayments());
  } catch {
    return false;
  }
}
