import { z } from "zod";
import { DEFAULT_PET_IMG } from "./constants";

export const petIdSchema = z.string().cuid();


export const petFormSchema = z.object({
        name: z.string().trim().min(1,{message:"Name is required"}).max(100),
        ownerName: z.string().trim().min(5,{message:"Owner Name is required"}).max(100),
        imageUrl:  z.union([z.literal(""),z.string().trim().url({message: "Image Url must be a valid url"})]),
        age: z.coerce.number().int().positive().max(9999),
        notes:z.union([z.literal(""),z.string().trim().max(1000)])
    }).transform(data=>({
        ...data,
        imageUrl: data.imageUrl || DEFAULT_PET_IMG,
}));

export type TPetField = z.infer<typeof petFormSchema>


export const authSchema = z.object({
    email: z.string().email().max(100),
    password: z.string().max(100),
});
export type TAuth = z.infer<typeof authSchema>
