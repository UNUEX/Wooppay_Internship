"use client";
import { getWebhookDeliveries, type WebhookDelivery } from "@/entities/webhook";
import { OutageToggle } from "@/features/simulate-webhook-outage";
import { usePolling } from "@/shared/hooks";

const STATUS_LABELS: Record<WebhookDelivery["status"], string> = {
  pending: "Повтор запланирован",
  delivered: "Доставлен",
  failed: "Не доставлен",
};

const time = (iso: string) => new Date(iso).toLocaleTimeString("ru-RU");

// Журнал вебхуков со стороны шлюза: что отправили, сколько было попыток,
// какой код ответа вернул сервер кабинета.
export function WebhookLog() {
  const { data: deliveries } = usePolling(getWebhookDeliveries, 1500);

  return (
    <div>
      <OutageToggle />
      {deliveries?.length === 0 && <p className="muted">Событий пока нет — оплатите какой-нибудь счёт.</p>}
      {deliveries?.map((d) => (
        <div key={d.id} className={`webhook webhook-${d.status}`}>
          <div>
            <code>{d.event.type}</code> · {STATUS_LABELS[d.status]} · <span className="muted">{time(d.event.createdAt)}</span>
          </div>
          <div className="muted">{d.event.id} · транзакция {d.event.data.transactionId}</div>
          <ol>
            {d.attempts.map((a, i) => (
              <li key={i}>{time(a.at)} → {a.httpStatus ?? `нет ответа (${a.error})`}</li>
            ))}
            {d.status === "pending" && d.nextAttemptAt && d.attempts.length > 0 && (
              <li className="muted">следующая попытка в {time(d.nextAttemptAt)}</li>
            )}
          </ol>
        </div>
      ))}
    </div>
  );
}
