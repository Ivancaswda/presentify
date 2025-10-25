'use client'
import React, {useState} from 'react'
import {Button} from "@/components/ui/button";
import {FaFolder} from "react-icons/fa";
import { ArrowUpRightIcon } from "lucide-react"

import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import {useQuery} from "convex/react";
import {api} from "../../../../convex/_generated/api";
import {getProjectsByUser} from "../../../../convex/projects";
import {useAuth} from "@/context/authContext";
import Image from "next/image";
import {ru} from "date-fns/locale";
import {format} from "date-fns";
import Link from "next/link";
const MyProjects = () => {
    const {user} = useAuth()
    if (!user) return
    const myProjects = useQuery(api.projects.getProjectsByUser, {userId: user?.userId})
    if (!myProjects) return
    console.log(myProjects)


    return (
        <div className='mx-32 mt-20'>
            <div className='flex justify-between items-center'>
                <h2 className='font-semibold text-2xl'>Мои проекты</h2>
                <Button>
                    + Создать новый проект
                </Button>
            </div>
            {myProjects.length ? <div className='grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4'>
                {myProjects.map((project, index) => (
                   <Link href={`/workspace/project/${project.projectId}/editor`}>
                       <div className='p-4 border rounded-2xl shadow mt-3 space-y-1' key={index}>
                           <Image width={122} height={122} src={'/dummy-image.png'} alt='fs'/>
                           <h2 className='font-semibold text-lg'>{project?.userInputPrompt}</h2>
                           <h2 className='text-gray-400 '>Всего: {project?.slideCount} слайдов</h2>
                           <p className='text-gray-400'>  {format(new Date(project.createdAt), "LLLL yyyy", { locale: ru })}</p>
                       </div>
                   </Link>

                ))}
            </div> : <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FaFolder/>
                    </EmptyMedia>
                    <EmptyTitle>Пока нету проектов</EmptyTitle>
                    <EmptyDescription>
                      Вы пока что не создали ни одного проекта, сделайте это прямо сейчас!
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <div className="flex gap-2">
                        <Button>Создать проект</Button>

                    </div>
                </EmptyContent>
                <Button
                    variant="link"
                    asChild
                    className="text-muted-foreground"
                    size="sm"
                >
                    <a href="#">
                        Узнать более <ArrowUpRightIcon />
                    </a>
                </Button>
            </Empty>}

        </div>
    )
}
export default MyProjects
