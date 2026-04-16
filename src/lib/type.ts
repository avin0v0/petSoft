
import {Pet} from "@prisma/client";

export type PetEssentials = Omit<Pet, 'id'|'createdAt'|'updatedAt'|'userId'>;

/*
export type Pet = {
    id: string;
    name: string;
    ownerName: string;
    imageUrl: string;
    age: number;
    notes: string;
};
*/
