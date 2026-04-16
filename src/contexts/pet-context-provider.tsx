"use client";
import { addPet, checkoutPet, editPet } from "@/app/actions/action";
import { PetEssentials } from "@/lib/type";
import { Pet } from "@prisma/client";
//import { Pet } from "@/lib/type";
import { useState,createContext, useOptimistic, startTransition } from "react"
import { toast } from "sonner";

type PetContextProviderProps={
    data: Pet[];
    children: React.ReactNode;
};

type TPetContext={
    pets: Pet[];
    selectedPetId: Pet['id'] | null;
    handleChangeSelectedPetId: (id: string) => void;
    handleEditPet:(petId: Pet['id'], newPetData :PetEssentials)=>Promise<void>;
    selectedPet: Pet | undefined;
    numberOfPets: number | null;
    handleAddPet:(newPet: PetEssentials) => Promise<void>;
    handleCheckoutPet:(id:Pet['id']) => Promise<void>;
    getOnwer: (ownername: Pet['ownerName']) => Pet[];
}
export const PetContext = createContext<TPetContext | null>(null)

export default function PetContextProvider({data,children}:PetContextProviderProps){
    //console.log(data.length)
    //state
    //const [pets,setPets] = useState(data);
    const [optimisticPets, setOptimisticPets] = useOptimistic(data, (state, {action, payload}) => {
        switch (action) {
            case "add":
                return [...state, { id: Math.random().toString(), ...payload }];
            case "edit":
                return state.map(pet =>
                    pet.id === payload.id ? { ...pet, ...payload.newPetData } : pet
                );
            case "checkout":
                return state.filter((pet)=>pet.id !== payload);

            default:
                return state;
        }
    });
    const [selectedPetId,setSelectedPetId] = useState<string | null>(null);

    //derived state
    const selectedPet = optimisticPets.find(pet=>pet.id === selectedPetId)
    const numberOfPets = optimisticPets.length;
    //event handlers/ actions
    const handleAddPet= async (newPet: PetEssentials)=>{
        setOptimisticPets({action: "add", payload: newPet});
        const error = await addPet(newPet);
        if(error){
            //alert(error.message);
            toast.warning(error.message);
            return;
        }
    };

    const handleEditPet = async (petId: Pet['id'], newPetData: PetEssentials ) =>{
        setOptimisticPets({action: "edit", payload: {id: petId,newPetData}})
       const error = await editPet(petId, newPetData);
            if(error){
                //alert(error.message);
                toast.warning(error.message);
                return;
            }
    };

    const handleCheckoutPet=async (petId:Pet['id'])=>{
        setOptimisticPets({action: "checkout" , payload: petId});
        const error = await checkoutPet(petId);
        if(error){
            toast.warning(error.message);
            return;
        }
        setSelectedPetId(null);
    };

    const handleChangeSelectedPetId = (id:Pet['id']) => {
        setSelectedPetId(id);
    };

    const getOnwer = (ownername:Pet['ownerName'])=>{
        return optimisticPets.filter(pet => pet.ownerName === ownername);
    }


  return (
    <PetContext.Provider 
    value={{
        pets:optimisticPets,
        selectedPetId,
        selectedPet,
        numberOfPets,
        handleCheckoutPet,
        handleEditPet,
        handleChangeSelectedPetId,
        handleAddPet,
        getOnwer
    }}>
        {children}
    </PetContext.Provider>
  )
} 

function onFormSubmission() {
    throw new Error("Function not implemented.");
}

