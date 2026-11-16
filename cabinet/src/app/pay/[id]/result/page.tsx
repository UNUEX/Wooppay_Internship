import { Suspense } from "react";
import { PaymentResultPage } from "@/views/payment-result";

export default function Page() {
  return (
    <Suspense fallback={<p>Загрузка...</p>}>
      <PaymentResultPage />
    </Suspense>
  );
}
