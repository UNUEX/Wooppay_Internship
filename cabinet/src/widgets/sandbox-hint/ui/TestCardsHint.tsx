import { formatCardNumber } from "@/entities/card";
import { TEST_CARDS, THREE_DS_TEST_CODE } from "@/shared/config";

// Подсказка для проверяющего: какие тестовые карты что делают
export function TestCardsHint() {
  return (
    <details className="sandbox-hint">
      <summary>Тестовые карты (песочница)</summary>
      <p className="muted">
        Срок — любой в будущем, CVV — любые 3 цифры, имя — латиницей. Код 3-D Secure: {THREE_DS_TEST_CODE}.
      </p>
      <table>
        <tbody>
          {TEST_CARDS.map((card) => (
            <tr key={card.number}>
              <td><code>{formatCardNumber(card.number)}</code></td>
              <td>{card.title}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
