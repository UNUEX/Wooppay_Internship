import { Suspense } from "react";
import { ThreeDsPage } from "@/views/three-ds";

export default function Page() {
  return (
    <Suspense fallback={<p>Загрузка...</p>}>
      <ThreeDsPage />
    </Suspense>
  );
}
