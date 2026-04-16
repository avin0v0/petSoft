import prisma from "@/lib/db";
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


export async function POST(request:Request){
    const body = await request.text();
    const signature=request.headers.get("stripe-signature");

    console.log("[stripe-webhook] received request", {
        method: request.method,
        url: request.url,
        bodyLength: body.length,
        hasSignature: Boolean(signature),
        webhookSecretConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    });

    if (!signature) {
        console.log("webhook missing stripe-signature header");
        return Response.json(null, {status:400});
    }

    //verify the webHook came form stripe
    let event;
    try{
        event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET)

        console.log("[stripe-webhook] signature verified", {
            eventId: event.id,
            eventType: event.type,
            apiVersion: event.api_version,
        });
    }
    catch(error){
        console.log("[stripe-webhook] webhook verification failed", error)
        return Response.json(null, {status:400});
    }
    

    //fulfill-order
    switch(event.type){
        case "checkout.session.completed":
            const checkoutSession = event.data.object;
            const email = checkoutSession.customer_details?.email ?? checkoutSession.customer_email ?? checkoutSession.metadata?.email;

            console.log("[stripe-webhook] checkout.session.completed payload", {
                sessionId: checkoutSession.id,
                paymentStatus: checkoutSession.payment_status,
                customerId: checkoutSession.customer,
                customerEmail: checkoutSession.customer_email,
                customerDetailsEmail: checkoutSession.customer_details?.email,
                metadataEmail: checkoutSession.metadata?.email,
                resolvedEmail: email,
            });

            if (!email) {
                console.log("checkout.session.completed missing customer email", checkoutSession);
                return Response.json(null, {status:400});
            }

            try {
                const updatedUser = await prisma.user.update({
                where:{
                    email,
                },
                data:{
                    hasPaid: true,
                },
            });

                console.log("[stripe-webhook] prisma update success", {
                    userId: updatedUser.id,
                    email: updatedUser.email,
                    hasPaid: updatedUser.hasPaid,
                });
            } catch (error) {
                console.log("[stripe-webhook] prisma update failed", {
                    email,
                    error,
                });
                return Response.json(null, {status:500});
            }
        break;
        default:
            console.log("[stripe-webhook] unhandled event type", {
                eventType: event.type,
                eventId: event.id,
            });
        }
    return Response.json(null, {status:200});
}




