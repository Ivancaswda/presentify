'use client'
import React from 'react'
import {Button} from "@/components/ui/button";
import {FaFolder, FaUserCircle} from "react-icons/fa";
import {ArrowUpRightIcon} from "lucide-react";
import {useQuery} from "convex/react";
import {api} from "../../../convex/_generated/api";
import {useAuth} from "@/context/authContext";
import Image from "next/image";
import {format} from "date-fns";
import {ru} from "date-fns/locale";
import Link from "next/link";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

const ProfilePage = () => {
    const { user } = useAuth();

    const myProjects = useQuery(
        api.projects.getProjectsByUser,
        user ? { userId: user.userId } : "skip"
    );

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-400">
                Авторизуйтесь, чтобы увидеть профиль.
            </div>
        );
    }

    const totalProjects = myProjects?.length || 0;
    const displayName = user?.name || user?.userName || "U";
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-primary/5 to-background text-white px-8 md:px-16 py-12">
            {/* Профильная карточка */}
            <div className="bg-primary/10 border border-primary/20 rounded-3xl shadow-2xl p-8 flex flex-col md:flex-row items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                    {user?.image ? (
                        <Image
                            src={user?.image}
                            alt={displayName || "User"}
                            width={80}
                            height={80}
                            className="rounded-full border border-primary shadow-md"
                        />
                    ) : (
                        <Avatar>
                            <AvatarImage src={user?.image}/>
                            <AvatarFallback className='bg-primary'>
                                {displayName[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    )}
                    <div>
                        <h2 className="text-2xl text-black font-bold">{user.name || "Пользователь"}</h2>
                        <p className="text-gray-400">{user.email}</p>
                        <p className="text-gray-500 text-sm mt-1">
                            Зарегистрирован:{" "}
                            {user.createdAt
                                ? format(new Date(user.createdAt), "d MMMM yyyy", { locale: ru })
                                : "Недавно"}
                        </p>
                    </div>
                </div>
                <div className="text-center md:text-right mt-6 md:mt-0">
                    <h3 className="text-3xl font-bold text-primary">{totalProjects}</h3>
                    <p className="text-gray-400">проект(ов)</p>
                </div>
            </div>


            <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-2xl text-primary">Мои проекты</h2>
                <Link href='/workspace' >
                    <Button className="bg-primary text-white hover:bg-primary/90">
                        + Создать новый проект
                    </Button>
                </Link>

            </div>

            {myProjects && myProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {myProjects.map((project, index) => (
                        <Link
                            href={`/workspace/project/${project.projectId}/editor`}
                            key={index}
                            className="group"
                        >
                            <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all shadow-md hover:shadow-xl">
                                <Image
                                    width={400}
                                    height={240}
                                    src={"/dummy-image.png"}
                                    alt="preview"
                                    className="rounded-xl mb-3"
                                />
                                <h2 className="font-semibold text-black text-lg group-hover:text-primary transition-colors">
                                    {project?.userInputPrompt}
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    {project?.slideCount} слайдов
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                    {format(new Date(project.createdAt), "d MMMM yyyy", {
                                        locale: ru,
                                    })}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <Empty className="mt-20">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <FaFolder />
                        </EmptyMedia>
                        <EmptyTitle>Пока нет проектов</EmptyTitle>
                        <EmptyDescription>
                            Вы ещё не создавали проекты. Начните с создания вашего первого.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <div className="flex gap-2">
                            <Button className="bg-primary text-white hover:bg-primary/90">
                                Создать проект
                            </Button>
                            <Button variant="outline" className="border-primary text-primary">
                                Импортировать
                            </Button>
                        </div>
                    </EmptyContent>
                    <Button
                        variant="link"
                        asChild
                        className="text-muted-foreground"
                        size="sm"
                    >
                        <a href="#">
                            Подробнее <ArrowUpRightIcon />
                        </a>
                    </Button>
                </Empty>
            )}
        </div>
    );
};

export default ProfilePage;
