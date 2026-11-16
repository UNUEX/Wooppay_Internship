import { Suspense } from "react";
import { CheckoutPage } from "@/views/checkout";

// маршрут Next.js: только связывает адрес /pay/:id со страницей из слоя views.
// id платежа известен только при запросе, поэтому страница ждёт его в Suspense.
export default function Page() {
  return (
    <Suspense fallback={<p>Загрузка...</p>}>
      <CheckoutPage />
    </Suspense>
  );
}
