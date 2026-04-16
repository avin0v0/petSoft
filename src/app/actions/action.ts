"use server";
import prisma from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { sleep } from "@/lib/utils";
import { authSchema, petFormSchema, petIdSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { checkAuth, GetPetById } from "@/lib/server-utils";
import { AuthError } from "next-auth";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//<<<<---------user actions--------->>>>
export async function logIn(prevSate: unknown, formData: unknown) {
    console.log("[logIn] formData type:", typeof formData, "instanceof FormData:", formData instanceof FormData, "value:", formData);
    if (!(formData instanceof FormData)) {
        return {
            message: "Invalid form Data",
        };
    }

    try {
        console.log("[logIn] email:", formData.get("email"), "password:", formData.get("password"));
        const email = String(formData.get("email") ?? "");
        const password = String(formData.get("password") ?? "");

        await signIn("credentials", {
            email,
            password,
            redirectTo: "/app/dashboard",
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin": {
                    return {
                        message: "Invalid credentials",
                    };
                }
                default: {
                    return {
                        message: "Error. Could not Sign in",
                    };
                }
            }
        }
        throw error;
    }
}

export async function logOut() {
    await signOut({ redirectTo: "/" });
}

export async function signUp(prevSate: unknown, formData: unknown) {
    if (!(formData instanceof FormData)) {
        return {
            message: "Invalid form Data",
        };
    }

    const formDataEntries = Object.fromEntries(formData.entries());
    const validatedFormData = authSchema.safeParse(formDataEntries);
    if (!validatedFormData.success) {
        return {
            message: "Invalid from data",
        };
    }

    const { email, password } = validatedFormData.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.create({
            data: {
                email,
                hashedPassword,
            },
        });
    } catch (error) {
        return {
            message: "User already exists or DB error",
        };
    }

    await signIn("credentials", {
        email,
        password,
        redirectTo: "/app/dashboard",
    });
}

// <<<<---------pet actions--------->>>>
export async function addPet(pet: unknown) {
    const session = await checkAuth();
    const validatedPet = petFormSchema.safeParse(pet);
    if (!validatedPet.success) {
        return {
            message: "Invalid Pet Data",
        };
    }

    try {
        await prisma.pet.create({
            data: {
                ...validatedPet.data,
                user: {
                    connect: {
                        id: session.user.id,
                    },
                },
            },
        });
    } catch (error) {
        return {
            message: "Sorry, your pet is not added!",
        };
    }

    revalidatePath("/app", "layout");
}

//editPet server action
export async function editPet(petId: unknown, newPetData: unknown) {
    const session = await checkAuth();
    if (!session?.user) {
        redirect("/login");
    }

    const validatedPetId = petIdSchema.safeParse(petId);
    const validatedPet = petFormSchema.safeParse(newPetData);
    if (!validatedPet.success || !validatedPetId.success) {
        return {
            message: "Invalid Pet Data",
        };
    }

    const pet = await GetPetById(validatedPetId.data);
    if (!pet) {
        return {
            message: "Pet not found",
        };
    }

    if (pet.userId !== session.user.id) {
        return {
            message: "Not authorized!",
        };
    }

    try {
        await prisma.pet.update({
            where: {
                id: validatedPetId.data,
            },
            data: validatedPet.data,
        });
    } catch (error) {
        console.log(error);
        return {
            message: "Sorry, your pet is not added!",
        };
    }

    revalidatePath("/app", "layout");
}

//checkoutPet server action
export async function checkoutPet(petId: unknown) {
    const session = await checkAuth();
    if (!session?.user) {
        redirect("/login");
    }

    const validatedPetId = petIdSchema.safeParse(petId);
    if (!validatedPetId.success) {
        return {
            message: "Invalid Pet Data",
        };
    }

    const pet = await GetPetById(validatedPetId.data);
    if (!pet) {
        return {
            message: "Pet not found",
        };
    }

    if (pet.userId !== session.user.id) {
        return {
            message: "Not authorized!",
        };
    }

    try {
        await prisma.pet.delete({
            where: {
                id: validatedPetId.data,
            },
        });
    } catch (error) {
        return {
            message: "Sorry, the pet could not be checked out!",
        };
    }

    revalidatePath("/app", "layout");
}

//<<<-----------payment actions----------->>>
export async function createCheckoutSession() {
    const session = await checkAuth();
    const requestHeaders = await headers();
    const forwardedProto = requestHeaders.get("x-forwarded-proto");
    const forwardedHost = requestHeaders.get("x-forwarded-host");
    const origin =
        requestHeaders.get("origin") ??
        (forwardedProto && forwardedHost ? `${forwardedProto}://${forwardedHost}` : null) ??
        process.env.CANONICAL_URL;

    console.log("[stripe-checkout] creating session", {
        userId: session.user.id,
        email: session.user.email,
        origin,
        webhookSecretConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    });

    const checkoutSession = await stripe.checkout.sessions.create({
        customer_email: session.user.email,
        metadata: {
            userId: session.user.id,
            email: session.user.email,
        },
        line_items: [
            {
                price: "price_1TMz25PtlKq7GXVjh1bVbqkh",
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${origin}/payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/payment?cancel=true`,
    });

    console.log("[stripe-checkout] session created", {
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
        customerEmail: checkoutSession.customer_email,
        metadata: checkoutSession.metadata,
    });

    return checkoutSession.url;
}

export async function confirmCheckoutSession(sessionId: string) {
    const session = await checkAuth();

    if (!sessionId) {
        console.log("[stripe-confirm] missing session id", { userId: session.user.id });
        return { message: "Missing checkout session id" };
    }

    console.log("[stripe-confirm] confirming session", {
        userId: session.user.id,
        email: session.user.email,
        sessionId,
    });

    try {
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

        console.log("[stripe-confirm] retrieved session", {
            sessionId: checkoutSession.id,
            paymentStatus: checkoutSession.payment_status,
            customerEmail: checkoutSession.customer_email,
            customerDetailsEmail: checkoutSession.customer_details?.email,
            metadata: checkoutSession.metadata,
        });

        const paymentComplete = checkoutSession.payment_status === "paid";
        const sessionMatchesUser =
            checkoutSession.metadata?.userId === session.user.id || checkoutSession.metadata?.email === session.user.email;

        if (!paymentComplete) {
            return { message: "Payment is not complete yet" };
        }

        if (!sessionMatchesUser) {
            console.log("[stripe-confirm] session does not match current user", {
                sessionId,
                currentUserId: session.user.id,
                currentUserEmail: session.user.email,
                metadata: checkoutSession.metadata,
            });
            return { message: "Checkout session does not belong to the current user" };
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                hasPaid: true,
            },
        });

        console.log("[stripe-confirm] prisma update success", {
            userId: updatedUser.id,
            email: updatedUser.email,
            hasPaid: updatedUser.hasPaid,
        });

        return { success: true };
    } catch (error) {
        console.log("[stripe-confirm] failed", {
            sessionId,
            error,
        });
        return { message: "Could not confirm checkout session" };
    }
}