'use client';
import { usePetContext, useSearchContext } from '@/lib/hooks'
import { Pet } from '@/lib/type'
import { cn } from '@/lib/utils';
import Image from 'next/image'



export default function PetList() {
  const {pets,selectedPetId,handleChangeSelectedPetId} = usePetContext();
  const {searchQuery} = useSearchContext();

  //deriving state 
  const filteredPets = pets.filter(pet=>pet.name.toLowerCase().includes(searchQuery))
  return (
    <ul className='bg-white border-b border-black/[0.08]'>
      {filteredPets.map((pet)=>(
        <li key={pet.id}>
        <button onClick={()=>handleChangeSelectedPetId(pet.id)} 
        className={cn('flex items-center h-[70px] w-full cursor-pointer px-5 text-base gap-2 hover:bg-[#EFF1F2] focus:bg-[#EFF1F2] transition',{'bg-[#EFF1F2]':selectedPetId==pet.id})}>
          <Image 
            src={pet.imageUrl} 
            alt="pet's dp"
            width={45}
            height={45}
            className='w-[45px] h-[45px] rounded-full object-cover'/>
            <p className="font-semibold">{pet.name}</p>
        </button>
      </li>
    ))}
      
    </ul>
  )
}
