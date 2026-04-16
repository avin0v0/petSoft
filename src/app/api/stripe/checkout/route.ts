import { checkAuth } from "@/lib/server-utils";
import { headers } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2025-07-30.basil",
});

export async function GET(request: Request) {
    const session = await checkAuth();
    const requestHeaders = await headers();
    const forwardedProto = requestHeaders.get("x-forwarded-proto");
    const forwardedHost = requestHeaders.get("x-forwarded-host");
    const origin =
        requestHeaders.get("origin") ??
        (forwardedProto && forwardedHost ? `${forwardedProto}://${forwardedHost}` : null) ??
        new URL(request.url).origin;

    const checkoutSession = await stripe.checkout.sessions.create({
        customer_email: session.user.email,
        metadata: {
            userId: session.user.id,
            email: session.user.email,
        },
        line_items: [
            {
                price: "price_1ScXOIPtlKq7GXVj5uh6LFXX",
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${origin}/payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/payment?cancel=true`,
    });

    return Response.redirect(checkoutSession.url ?? `${origin}/payment?cancel=true`, 303);
}