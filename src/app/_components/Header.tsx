'use client'
import React from 'react'
import {useAuth} from "@/context/authContext";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {CrownIcon, DiamondIcon, FolderIcon, LogOutIcon, UserIcon} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {FaComputer} from "react-icons/fa6"; // <-- импортируем хук
const Header = () => {
    const {user ,logout} = useAuth()
    const router = useRouter()
    const pathname = usePathname();
    console.log(user)
    const displayName = user?.name || user?.userName || "U";
    return (
        <div className='flex py-3 items-center justify-between px-10 shadow-lg'>
            <Link href={'/'} >
                <Image src='/logo.png' className='rounded-md object-cover' alt='Logo' width={40} height={40} />
            </Link>


            {!user ? <Button>
                Начать
            </Button> : <div className='flex  items-center gap-4'>

                {pathname.includes('workspace') ? <Button className='flex justify-center gap-4 items-center'>
                    <DiamondIcon/>
                    Поменять план
                </Button> :   <Link href='/workspace' >
                    <Button>
                        <FaComputer/>
                        На панель управления
                    </Button>
                </Link>}
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Avatar >
                            <AvatarImage src={user?.image}/>
                            <AvatarFallback className='bg-primary text-white'>
                                {displayName[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <div className='flex flex-col gap-2'>

                            <Button variant='outline'>
                                <Link className='flex items-center gap-2' href='/pricing' >
                                    <CrownIcon/>
                                    Premium+
                                </Link>
                            </Button>
                            <Button variant='outline'>
                                <Link className='flex items-center gap-2' href='/profile' >
                                    <UserIcon/>
                                    Профиль
                                </Link>
                            </Button>

                            <Link href='/projects' >
                                <Button variant='outline'>
                                    <FolderIcon/>
                                    Мои проекты
                                </Button>
                            </Link>

                            <Button onClick={() => {
                                logout()
                                router.push('/sign-up')
                            }} variant='outline'>
                                <LogOutIcon/>
                                Выйти
                            </Button>
                        </div>
                    </DropdownMenuContent>


                </DropdownMenu>

            </div>}
        </div>
    )
}
export default Header
