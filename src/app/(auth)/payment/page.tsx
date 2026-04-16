import { Suspense } from "react";
import PaymentPageClient from "./payment-page-client";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PaymentPageClient />
    </Suspense>
  );
}

