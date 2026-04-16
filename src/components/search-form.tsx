"use client";
import { useSearchContext } from "@/lib/hooks";


export default function SearchForm() {
  const {handleChangeSearchQuery,searchQuery} = useSearchContext();
  return (
    <form className="w-full h-full">
      <input 
      placeholder='Search'
      type="search"
      onChange={e => handleChangeSearchQuery(e.target.value)}
      value={searchQuery}
      className="w-full h-full bg-white/20 rounded-md px-5 outline-none transition
       focus:bg-white/50 hover:bg-white/30 placeholder:text-white/50"/>

    </form>
  )
}
