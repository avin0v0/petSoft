import AppFooter from "@/components/app-footer";
import AppHeader from "@/components/app-header";
import BackgroundPattern from "@/components/background-pattern";
import React from "react";
import PetContextProvider from "@/contexts/pet-context-provider";
import prisma  from "@/lib/db";
import SearchContextProvider from "@/contexts/search-context-provider";
import { Toaster } from "sonner";
import { checkAuth, GetPetsByUserId } from "@/lib/server-utils";

export default async function Layout({children}:{children: React.ReactNode}) {
  //console.log("Layout rendering......")
 const session = await checkAuth();
  //console.log(session.user)
  const pets = await GetPetsByUserId(session.user.id);
  //const user = await prisma.user.findUnique()
 
  return (
    <>
    <BackgroundPattern/>
    <div className=" flex flex-col max-w-[1050px] mx-auto  min-h-screen px-4" >
        <AppHeader/>
        <SearchContextProvider>
          <PetContextProvider data={pets}>{children}</PetContextProvider>
        </SearchContextProvider>
        
        <AppFooter/>
    </div>
    <Toaster position="top-right"/> 
    </>
  )
}
