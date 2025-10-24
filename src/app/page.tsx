'use client'
import React from 'react'
import { motion } from "motion/react";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import {Button} from "@/components/ui/button";
import {ArrowUpIcon} from "lucide-react";
import Link from "next/link";
import Carousel from "@/components/ui/carousel";
import Image from'next/image'
import {
    IconArrowWaveRightUp, IconBoxAlignRightFilled, IconBoxAlignTopLeft,
    IconClipboardCopy,
    IconFileBroken,
    IconSignature,
    IconTableColumn
} from "@tabler/icons-react";
import {BentoGrid, BentoGridItem} from "@/components/ui/bento-grid";
import {useAuth} from "@/context/authContext";
import {useRouter} from "next/navigation";


const slideData = [
    {
        title: "Создавай презентации с ИИ",
        button: "Попробовать сейчас",
        src: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
    {
        title: "Автоматизируй свой рабочий процесс",
        button: "Узнать больше",
        src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
    {
        title: "Искусственный интеллект для дизайнеров",
        button: "Смотреть демо",
        src: "https://images.unsplash.com/photo-1661961110388-76e9683e3585?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
    {
        title: "Презентации будущего уже здесь",
        button: "Создать проект",
        src: "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
];


const items = [
    {
        title: "Presentify - Генерация презентаций с ИИ",
        description: "Создавайте профессиональные презентации за секунды с помощью искусственного интеллекта.",
        header: <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="AI Presentation" className="w-full h-32 object-cover rounded-lg" />,
        icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Умный дизайн автоматически",
        description: "ИИ подбирает идеальные макеты, цвета и шрифты под ваш контент.",
        header: <img src="https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Design" className="w-full h-32 object-cover rounded-lg" />,
        icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Готовые шаблоны для любых целей",
        description: "Бизнес-презентации, образовательные материалы, креативные проекты и многое другое.",
        header: <img src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Templates" className="w-full h-32 object-cover rounded-lg" />,
        icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Интеллектуальное наполнение контентом",
        description: "ИИ помогает сформулировать тезисы и подбирает релевантные изображения.",
        header: <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Content Creation" className="w-full h-32 object-cover rounded-lg" />,
        icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Экспорт в любом формате",
        description: "PDF, PowerPoint, Google Slides — работайте в привычном формате.",
        header: <img src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Export" className="w-full h-32 object-cover rounded-lg" />,
        icon: <IconArrowWaveRightUp className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Редактирование одним кликом",
        description: "Легко меняйте дизайн всего слайда или отдельных элементов за секунды.",
        header: <img src="https://images.unsplash.com/photo-1565688534245-05d6b5be184a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Editing" className="w-full h-32 object-cover rounded-lg" />,
        icon: <IconBoxAlignTopLeft className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Коллаборация в реальном времени",
        description: "Работайте над презентацией вместе с коллегами из любой точки мира.",
        header: <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Collaboration" className="w-full h-32 object-cover rounded-lg" />,
        icon: <IconBoxAlignRightFilled className="h-4 w-4 text-neutral-500" />,
    },
];
const HomePage = () => {
    const {user} = useAuth()
    const router = useRouter()
    console.log(user)
    return (
        <div className='flex items-center justify-center flex-col gap-4'>
            <HeroHighlight>
                <motion.h1
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: [20, -5, 0],
                    }}
                    transition={{
                        duration: 0.5,
                        ease: [0.4, 0.0, 0.2, 1],
                    }}
                    className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto "
                >
                   Создайте лучшую презентацию всего мира вместе с <br/>
                    <Highlight className="text-black dark:text-white">
                        Presentify
                    </Highlight>
                </motion.h1>
            </HeroHighlight>
            <Link href='/workspace' >
                <Button className='py-5 px-6!'>
                    <ArrowUpIcon/>
                    Начать сейчас
                </Button>
            </Link>
            {user?.isPrem && (
                <section className="mt-16 px-4 py-12 bg-gradient-to-r from-green-600 via-aqua-600 to-blue-600 text-white rounded-lg shadow-xl max-w-4xl mx-auto animate-gradient">
                    <div className="flex items-center gap-4 justify-between">
                        <div className="space-y-4">
                            {/* Заголовок с анимацией */}
                            <motion.h2
                                className="text-3xl font-bold"
                                initial={{ opacity: 0, y: -50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                Вы теперь помогаете нам!
                            </motion.h2>
                            {/* Описание с анимацией */}
                            <motion.p
                                className="text-lg"
                                initial={{ opacity: 0, y: -50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                Команда Presentify выражает особенную благодарность вам, так как вы оформили подписку Premium и теперь имеете безграничные возможности на нашем сайте!
                            </motion.p>
                            {/* Кнопка с эффектами */}
                            <motion.button
                                className="px-6 py-2 bg-primary text-white font-semibold rounded-md shadow-md hover:bg-primary-dark transition-all duration-300 transform hover:scale-105"
                                onClick={() => router.push("/")}
                                whileHover={{ scale: 1.05 }}
                            >
                                Узнать о нас
                            </motion.button>
                        </div>
                        {/* Изображение с параллакс-эффектом */}
                        <motion.div
                            className="hidden md:block"
                            initial={{ x: 100 }}
                            animate={{ x: 0 }}
                            transition={{ duration: 1.2, type: "spring", stiffness: 50 }}
                        >
                            <Image src="/logo.png" alt="AI Features" width={300} height={200} className="rounded-lg w-[600px] h-full" />
                        </motion.div>
                    </div>
                </section>      )}
            <div className="relative overflow-hidden w-full h-full py-20">
                <Carousel slides={slideData} />
            </div>
            <BentoGrid className="max-w-4xl mx-auto">
                {items.map((item, i) => (
                    <BentoGridItem
                        key={i}
                        title={item.title}
                        description={item.description}
                        header={item.header}
                        icon={item.icon}
                        className={i === 3 || i === 6 ? "md:col-span-2" : ""}
                    />
                ))}
            </BentoGrid>

        </div>

    )
}

export default HomePage
