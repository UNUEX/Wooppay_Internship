"use client";
import { useCallback, useEffect, useState } from "react";

// Периодически перезагружает данные (например, список платежей:
// статусы в нём меняются по вебхукам, без участия пользователя).
// fetcher должен быть стабильным (useCallback или функция вне компонента),
// иначе опрос будет перезапускаться на каждом рендере.
export function usePolling<T>(fetcher: () => Promise<T>, intervalMs: number) {
  const [data, setData] = useState<T | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function load() {
      try {
        const result = await fetcher();
        if (!cancelled) setData(result);
      } catch {
        // временная ошибка — попробуем на следующем круге
      }
      if (!cancelled) timer = setTimeout(load, intervalMs);
    }

    void load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fetcher, intervalMs, version]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  return { data, refresh };
}
