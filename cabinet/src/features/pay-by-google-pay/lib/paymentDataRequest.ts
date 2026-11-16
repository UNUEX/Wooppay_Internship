import type { Transaction } from "@/entities/transaction";

// Запрос к Google Pay API в формате из публичной документации:
// https://developers.google.com/pay/api/web/reference/request-objects
// Именно такой объект передаётся в paymentsClient.loadPaymentData(request).
export function buildPaymentDataRequest(transaction: Transaction) {
  return {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: "CARD",
        parameters: {
          // PAN_ONLY — карта сохранена в аккаунте Google (может потребоваться 3DS);
          // CRYPTOGRAM_3DS — карта токенизирована на телефоне, 3DS уже встроен
          allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
          allowedCardNetworks: ["MASTERCARD", "VISA"],
        },
        tokenizationSpecification: {
          // Google зашифрует данные карты для НАШЕГО шлюза. Продавец получит только
          // зашифрованный токен и передаст его в шлюз как есть.
          type: "PAYMENT_GATEWAY",
          parameters: { gateway: "example", gatewayMerchantId: "exampleGatewayMerchantId" },
        },
      },
    ],
    merchantInfo: { merchantName: transaction.merchantName },
    transactionInfo: {
      totalPriceStatus: "FINAL",
      // Google Pay принимает сумму строкой в основных единицах: "15000.00"
      totalPrice: (transaction.amount / 100).toFixed(2),
      currencyCode: transaction.currency,
      countryCode: "KZ",
    },
  };
}
