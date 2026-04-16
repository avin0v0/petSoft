import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs";
import { getUserByEmail } from "./server-utils";
import {authSchema} from "@/lib/validations";

export const config ={
    trustHost: true,
    pages:{
        signIn: "/login",
    },
    providers: [
        Credentials({
            
            async authorize(credentials){
                //runs on login 


                //validation
                const validatedFormData = authSchema.safeParse(credentials)
                if(!validatedFormData.success){
                    return null;
                }

                //extract values
                const{email,password} = validatedFormData.data;
                const user= await getUserByEmail(email);
                if(!user){
                    console.log("no user found");
                    return null;
                }
                const passwordMatch = await bcrypt.compare(
                    password,
                    user.hashedPassword
                );
                if(!passwordMatch){
                    console.log("Invalid password")
                    return null;
                }
                return user;
            },
        }),
    ], 
    callbacks: {
        //runs on every request with middleware
        authorized: async ({auth, request}) => {
            const isLoggedIn = Boolean(auth?.user);
            const isTryingToAccessApp = request.nextUrl.pathname.includes('/app');
            // In NextAuth v5, `auth.user` may not include custom fields on every request.
            // Prefer the JWT token for custom claims like `hasPaid`.
            const authWithToken = auth as typeof auth & { token?: { hasPaid?: boolean; email?: string } };
            let hasPaid = Boolean(authWithToken?.token?.hasPaid ?? (auth?.user as any)?.hasPaid);

            if (isLoggedIn && !hasPaid) {
                const email = authWithToken?.token?.email ?? auth?.user?.email;

                if (email) {
                    const userFromDB = await getUserByEmail(email);
                    hasPaid = Boolean(userFromDB?.hasPaid);
                }
            }

            if(!isLoggedIn && isTryingToAccessApp){
                return false;
            }
           
            if(isLoggedIn && isTryingToAccessApp && !hasPaid){
                return Response.redirect(new URL("/payment", request.nextUrl));
            }

            if(isLoggedIn && isTryingToAccessApp && hasPaid){
                return true;
            }

            if(isLoggedIn && 
                (request.nextUrl.pathname.includes("/login") || 
                request.nextUrl.pathname.includes("/signup"))
                && hasPaid) {
                    return Response.redirect(new URL("/app/dashboard", request.nextUrl));
                }

            if(isLoggedIn && !isTryingToAccessApp && !hasPaid){
                if((request.nextUrl.pathname.includes("/login") || request.nextUrl.pathname.includes("/signup"))){
                    return Response.redirect(new URL("/payment", request.nextUrl));
                }
                return true;
            }
            //it took me 1 month to find a minor error!
            if(!isLoggedIn && !isTryingToAccessApp){
                return true;
            }

            return false;
        },
        jwt: async ({token,user, trigger}) => {
            if(user){
                token.userId = user.id!;
                token.email = user.email!;
                token.hasPaid = user.hasPaid;
            }

            if(trigger === "update"){
                //on every run
                const userFromDB = await getUserByEmail(token.email);
                if(userFromDB){
                    token.hasPaid=userFromDB.hasPaid;
                }
            }
            return token;
        },
        session:({session, token}) => {
                session.user.id = token.userId;
                session.user.hasPaid = token.hasPaid;
            return session;
        },
    },
    
}satisfies NextAuthConfig;

export const {
    auth,
    signIn,
    signOut,
    handlers: { GET, POST }} = 
    NextAuth(config);

