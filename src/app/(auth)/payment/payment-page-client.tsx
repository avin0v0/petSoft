"use client";

import { confirmCheckoutSession } from "@/app/actions/action";
import H1 from "@/components/h1";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentPageClient() {
  const searchParams = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(false);

  const success = searchParams.get("success");
  const cancel = searchParams.get("cancel");
  const sessionId = searchParams.get("session_id");

  const handleAccessPetSoft = async () => {
    if (!sessionId || isConfirming) {
      window.location.assign("/app/dashboard");
      return;
    }

    setIsConfirming(true);

    try {
      await confirmCheckoutSession(sessionId);
    } finally {
      window.location.assign("/app/dashboard");
    }
  };

  return (
    <main className="flex flex-col items-center space-y-10">
      <H1>PetSoft access requries payment</H1>

      {success && (
        <Button onClick={handleAccessPetSoft} disabled={isConfirming}>
          Access PetSoft
        </Button>
      )}

      {!success && (
        <Button asChild>
          <Link href="/api/stripe/checkout">Unlock <b className="text-yellow-400">180 DAYS</b> Access</Link>
        </Button>
      )}

      {success && (
        <p className="text-sm text-green-700">
          You payment is successful. You are now premium lifetime member of PetSoft
        </p>
      )}
      {cancel && (
        <p className="text-sm text-red-700">Payment Failed.Try Again</p>
      )}
    </main>
  );
}