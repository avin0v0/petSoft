"use client";

import { logOut} from "@/app/actions/action";
import { Button } from "./ui/button";
import { useTransition } from "react";

export default function SignOutBtn() {
  const[isPending, startTansition] =useTransition();
  return <Button
     disabled={isPending}
     onClick={async () => {
     startTansition(async()=>{
     await logOut();
    });
  }}> 
    Sign Out </Button>
}
