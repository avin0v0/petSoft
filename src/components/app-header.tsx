"use client"
import Logo from '@/components/logo'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export default function AppHeader() {
    const activePathname=usePathname()
  const routes = [
    {
        label:"Dashboard",
        path:"/app/dashboard"
    },
    {
        label:"Account",
        path:"/app/account"
    }
  ]
  return (
    <header className='flex justify-between border-white/10 border-b py-2 '>
        <Logo/>

        <nav>
            <ul className='flex gap-2 text-xs'>
                {routes.map(route => (
                <li key={route.path}>
                    <Link href={route.path} className={cn('text-white/70 rounded-sm px-2 py-1 hover:text-white focus:text-white transition',
                        {'bg-black/10 test-white/100':activePathname===route.path})}>
                            {route.label}
                    </Link>
                </li> 
            ))}
            </ul>
        </nav>
    </header>
  )
}
