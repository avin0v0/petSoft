"use client";

import { usePetContext } from '@/lib/hooks'
//import { Pet } from '@/lib/type';
import Image from 'next/image'
import { useTransition } from 'react'
import PetButton from './pet-button';
import { checkoutPet } from '@/app/actions/action';
import { Pet } from '@prisma/client';

export default function PetDetails() {
  const {selectedPet} = usePetContext();
  return <section className='flex flex-col h-full w-full'>
    {
      !selectedPet ? <EmptyView/> : 
      (
        <>
          <TopBar pet={selectedPet}/>
          <OtherInfo pet={selectedPet}/>
          <Notes pet={selectedPet}/>
        </>
      )
    }
    
  </section>
}

type Props={
  pet: Pet;
}

function TopBar({pet} : Props){
  const {handleCheckoutPet} = usePetContext(); 
  //no more using client component usign server actions either!!
  const [isPending, startTransition] = useTransition();


  // photo and name sections ahead
  return (
    <div className='flex items-center py-6 px-5 border-b border-black/[0.08]'>
      <Image 
        src={pet.imageUrl}
        alt="Selected pet img"
        height={75}
        width={75}
        className="h-[75px] e-[75px] rounded-full object-cover"
      />
      <h2 className='text-3xl font-semibold leading-7 ml-5'>{pet.name}</h2>

      <div className='ml-auto space-x-3'>
        <PetButton actionType='edit'>Edit</PetButton>
        <PetButton
          actionType='checkout'
          disabled={isPending}
          onClick={ async () => await handleCheckoutPet(pet.id)}
        >
          Checkout
        </PetButton>
      </div>
    </div>
  );
}

function OtherInfo({pet}: Props){
  // Owner's details sections ahead
  return(
    <div className='flex justify-around py-10 px-5 text-center'>
      <div>
        <h3 className='text-[13px] font-medium uppercase text-zinc-700'>Owner Name</h3>
        <p className='mt-1 text-lg text-zinc-800'>{pet?.ownerName}</p>
      </div>

      <div>
        <h3 className='text-[13px] font-medium uppercase text-zinc-700'>Age</h3>
        <p className='mt-1 text-lg text-zinc-800'>{pet?.age}</p>
      </div>
    </div>
  )
}

function Notes({pet} : Props){
  //descriptions ahead!!!!
  return(<section className='bg-white px-7 py-5 rounded-md mb-9 mx-9 border border-black/[0.08] h-full'>{pet?.notes}</section>)
}

function EmptyView(){
  return(
    <>
    <p className='h-full flex justify-center items-center text-xl font-semibold text-black/50'>No Pet Selected!</p>
    </>
  )

}