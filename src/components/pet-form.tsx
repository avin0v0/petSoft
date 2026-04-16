"use client";

import React from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { usePetContext } from "@/lib/hooks";
import PetFormButton from "./pet-form-btn";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DEFAULT_PET_IMG } from "@/lib/constants";
import { petFormSchema, TPetField } from "@/lib/validations";

type PetFormProps={
    actionType: "add" | "edit";
    onFormSubmission: () => void;
};


export default function PetFrom({actionType, onFormSubmission}:PetFormProps) {
    const { selectedPet, handleAddPet, handleEditPet} = usePetContext();
    /*
    //form details setup!
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const pet = {
            id: crypto.randomUUID(),
            name: formData.get("name") as string,
            ownerName: formData.get("ownerName") as string,
            imageUrl: 
            (formData.get("imageUrl") as string) || 
            "https://bytegrad.com/course-assets/react-nextjs/pet-placeholder.png",
            age: +(formData.get("age") as string),
            notes: formData.get("notes") as string,
        };
        
        if(actionType==="add"){
            handleAddPet(pet);
        }
        else if(actionType === "edit"){
            handleEditPet(selectedPet!.id,pet);
        }
        onFormSubmission();

    };
    */
    //type TPetField={name: string; ownerName: string; imageUrl: string; age:number; notes:string};
    
    
    const { register, formState: { errors }, trigger, getValues } =
        useForm<TPetField>({
            resolver: zodResolver(petFormSchema),
            defaultValues: {
                name: selectedPet?.name,
                ownerName: selectedPet?.ownerName,
                imageUrl: selectedPet?.imageUrl,
                age: selectedPet?.age,
                notes: selectedPet?.notes,
            }
        });

  return (
    <form action={async(formData)=>{
        const result = await trigger();
        if(!result) return;

        onFormSubmission();
        
        const petData=getValues();
        petData.imageUrl = petData.imageUrl || DEFAULT_PET_IMG;


        /*
        we can do the same with getValues() function!
        const petData={
            id: crypto.randomUUID(),
            name: formData.get("name") as string,
            ownerName: formData.get("ownerName") as string,
            imageUrl:
                (formData.get("imageUrl") as string) ||
                "https://bytegrad.com/course-assets/react-nextjs/pet-placeholder.png",
            age: Number(formData.get("age") as string),
            notes: formData.get("notes") as string,
        }
        */
        
        
        
        if(actionType==="add"){
            await handleAddPet(petData)
        }
    
        else if(actionType==="edit"){
            await handleEditPet(selectedPet!.id,petData)
        }

        
        
    }} 
    className="flex flex-col">
        <div className="space-y-3">
            <div className="space-y-3">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')}  
                ></Input>
                {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-3">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input id="ownerName" type="text" {...register('ownerName')}></Input>
                {errors.ownerName && <p className="text-red-500">{errors.ownerName.message}</p>}
            </div>

            <div className="space-y-3">
                <Label htmlFor="imageUrl">Image Url</Label>
                <Input id="imageUrl" type="text" {...register('imageUrl')}></Input>
                {errors.imageUrl && <p className="text-red-500">{errors.imageUrl.message}</p>}
            </div>

            <div className="space-y-3">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" {...register('age')}></Input>
                {errors.age && <p className="text-red-500">{errors.age.message}</p>}
            </div>

            <div className="space-y-3">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={3} {...register('notes')}></Textarea>
                {errors.notes && <p className="text-red-500">{errors.notes.message}</p>}
            </div>
        </div>
        
        <PetFormButton actionType={actionType}/>




    </form>
  )
}
