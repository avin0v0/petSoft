"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogTrigger } from "./ui/dialog";
import PetFrom from "./pet-form";
import { useState } from "react";
import { flushSync } from "react-dom";

type PetButtonProps={
    actionType: "add" | "edit" | "checkout";
    children?: React.ReactNode;
    onClick?:() => void;
    disabled?: boolean;
}

export default function PetButton({
    disabled,
    actionType,
    children,
    onClick,}:PetButtonProps) {
        const [isFromOpen, setIsFormOpen] = useState(false);
       if(actionType==="checkout"){
       return <Button variant="secondary" disabled={disabled} onClick={onClick}>{children}</Button>
    }
        return (
            <Dialog open={isFromOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                    {actionType === "add" ? ( <Button size="icon"> <PlusIcon className="h-6 w-6"/> </Button>) : ( <Button variant="secondary"> {children} </Button>)}
                </DialogTrigger>
        
                <DialogContent>
                    <DialogHeader>
                        {actionType === "add" ? (<DialogTitle>Attach Pet Details</DialogTitle>) : (<DialogTitle>Edit Pet Details</DialogTitle>)}
                    </DialogHeader>
                        <PetFrom actionType={actionType} 
                        onFormSubmission={()=>{
                            flushSync(()=>{
                                setIsFormOpen(false)
                            })
                        }}/>
                </DialogContent>
            </Dialog>
        );
    }
