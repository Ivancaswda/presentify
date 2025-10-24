'use client'
import React, {useEffect} from 'react'
import PromptBox from "@/app/workspace/_components/PromptBox";
import MyProjects from "@/app/workspace/_components/MyProjects";
import {useAuth} from "@/context/authContext";
import {useRouter} from "next/navigation";
import {LoaderOne} from "@/components/ui/loader";

const WorkspacePage = () => {
    const router = useRouter()
    const {user, isLoading} = useAuth()
    useEffect(() => {
        if (!user && !isLoading) {
            router.push("/sign-up");
        }
    }, [user, isLoading]);
    if (isLoading && !user) {
        return <div className='flex items-center justify-center w-screen h-screen'>
            <LoaderOne/>
        </div>
    }
    return (
        <div>
            <PromptBox/>
            <MyProjects/>
        </div>
    )
}
export default WorkspacePage
