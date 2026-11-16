"use client";
import { useState } from "react";

// Ссылка на оплату, которую предприниматель отправляет клиенту
export function PayLink({ payUrl }: { payUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(`${window.location.origin}${payUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span className="pay-link">
      <a href={payUrl} target="_blank" rel="noreferrer">Ссылка на оплату</a>
      <button type="button" onClick={copy}>{copied ? "Скопировано" : "Копировать"}</button>
    </span>
  );
}
