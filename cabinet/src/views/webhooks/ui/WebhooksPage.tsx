"use client";
import { ProtectedPage } from "@/features/auth";
import { WebhookLog } from "@/widgets/webhook-log";

// Журнал вебхуков — только для админа
export function WebhooksPage() {
  return (
    <ProtectedPage role="admin">
      <h1>Вебхуки от платёжного шлюза</h1>
      <WebhookLog />
    </ProtectedPage>
  );
}
