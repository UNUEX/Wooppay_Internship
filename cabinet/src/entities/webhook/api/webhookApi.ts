import { request } from "@/shared/api";
import type { WebhookDelivery } from "../model/types";

export function getWebhookDeliveries(): Promise<WebhookDelivery[]> {
  return request<WebhookDelivery[]>("/api/gateway/webhook-deliveries");
}
