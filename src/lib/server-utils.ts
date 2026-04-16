import "server-only";

import { redirect } from "next/navigation";
import { auth } from "./auth";
import {Pet, User} from "@prisma/client"
import prisma from "./db"

export async function checkAuth(){
    const session = await auth();
        if(!session?.user){
            redirect("/login")
        }

        if (!session.user.hasPaid && session.user.email) {
            const userFromDB = await getUserByEmail(session.user.email);

            if (userFromDB?.hasPaid) {
                session.user.hasPaid = true;
            }
        }

    return session;
}

export async function GetPetById(petId:Pet['id']){
    const pet = await prisma.pet.findUnique({
        where:{
            id:petId,
        },
        select:{
            userId: true,
        },
    });
    return pet;
}

export async function GetPetsByUserId(userId:User['id']){
    const pets = await prisma.pet.findMany({
        where:{
            userId:userId,
        },
    });
    return pets;
}

export async function getUserByEmail(email:User["email"]){
    const user= await prisma.user.findUnique({
        where:{
            email,
        }
    });
    return user;
}