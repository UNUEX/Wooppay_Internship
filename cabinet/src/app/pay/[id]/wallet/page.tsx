import { Suspense } from "react";
import { WalletPage } from "@/views/wallet";

export default function Page() {
  return (
    <Suspense fallback={<p>Загрузка...</p>}>
      <WalletPage />
    </Suspense>
  );
}
