"use client";
import { useEffect, useState } from "react";
import { request } from "@/shared/api";

type Settings = { webhookOutage: boolean };

// Переключатель для демонстрации: "сервер кабинета упал".
// Пока включено, приём вебхуков отвечает 503 — видно, как шлюз повторяет доставку.
export function OutageToggle() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    request<Settings>("/api/webhooks/settings").then(setSettings, () => {});
  }, []);

  async function toggle(webhookOutage: boolean) {
    setSettings(
      await request<Settings>("/api/webhooks/settings", { method: "POST", body: JSON.stringify({ webhookOutage }) }),
    );
  }

  return (
    <label className="toggle">
      <input
        type="checkbox"
        checked={settings?.webhookOutage ?? false}
        disabled={!settings}
        onChange={(e) => toggle(e.target.checked)}
      />
      Эмулировать падение приёма вебхуков (кабинет отвечает 503)
    </label>
  );
}
