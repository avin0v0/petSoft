"use client";
import { logIn, signUp } from "@/app/actions/action";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import AuthFormBtn from "./auth-form-btn";
import { useActionState } from "react";

type AuthFormProps = {
  type: "login" | "signup"

};



export function AuthForm({type}:AuthFormProps) {
  const [signUpError, dispatchSignup] = useActionState(signUp, undefined);
  const [logInError, dispatchlogIn] = useActionState(logIn, undefined);

  return (
    <form action={type==='login' ? dispatchlogIn : dispatchSignup}>
        <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input name="email" id="email" type="email" required maxLength={100}/>
        </div>
 
        <div className="mb-4 mt-2 space-y-1">
            <Label htmlFor="email">Password</Label>
            <Input type="password" name="password" id="password" required maxLength={100}/>
        </div>

        <AuthFormBtn type={type}/>
        {signUpError && <p className="text-red-500 text-sm mt-2">{signUpError.message}</p>}
        {logInError && <p className="text-red-500 text-sm mt-2">{logInError.message}</p>}

    </form>
    
  )
}
