'use client';
import { usePetContext } from "@/lib/hooks";


export default function Stats() {
  const {numberOfPets} = usePetContext();
  return (
    <div>
        <section className="text-center">
          <p className="text-2xl font-medium leading-6">{numberOfPets}</p>
          <p className="">current guests</p>
        </section>
    </div>
  )
}
