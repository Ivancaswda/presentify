import React, {useState} from 'react'

// types.ts
export interface DesignStyle {
    styleName: string;
    icon: string;
    bannerImage: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        gradient: string;
    };
    designGuide: string;
    theme: string;
}

const DESIGN_STYLES: DesignStyle[] = [
    {
        styleName: "Профессиональный Синий 💼",
        icon: "💼",
        bannerImage:
            "https://images.unsplash.com/photo-1581090700227-1e37b190418e?q=80&w=1200&auto=format&fit=crop",
        colors: {
            primary: "#0A66C2",
            secondary: "#B4C6E7",
            accent: "#AAB6C2",
            background: "#F0F4FF",
            gradient: "linear-gradient(135deg, #0A66C2, #AAB6C2)",
        },
        designGuide:
            "Создай профессиональную презентацию в корпоративном стиле с синими и белыми тонами, современными шрифтами без засечек и аккуратной версткой.",
        theme: "linear",
    },
    {
        styleName: "Минималистичный Белый ⚪",
        icon: "⚪",
        bannerImage:
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
        colors: {
            primary: "#FFFFFF",
            secondary: "#E0E0E0",
            accent: "#CCCCCC",
            background: "#FAFAFA",
            gradient: "linear-gradient(135deg, #EDEDED, #FFFFFF)",
        },
        designGuide:
            "Создай минималистичную презентацию с белым фоном, черным текстом и легкими серыми акцентами. Используй простую типографику и чистую структуру.",
        theme: "clean",
    },
    {
        styleName: "Современный Градиент 🎨",
        icon: "🎨",
        bannerImage:
            "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1200&auto=format&fit=crop",  // ← заменено
        colors: {
            primary: "#0275FF",
            secondary: "#AB82EF",
            accent: "#00D9FF",
            background: "#F5F9FF",
            gradient: "linear-gradient(135deg, #AB82EF, #00D9FF, #0275FF)",
        },
        designGuide:
            "Создай современную презентацию с яркими градиентами, эффектами стекла и трендовой типографикой. Идеально подходит для IT и креативных тем.",
        theme: "gradient",
    },
    {
        styleName: "Элегантный Тёмный 🖤",
        icon: "🖤",
        bannerImage:
            "https://images.unsplash.com/photo-1514790193030-c89d266d5a9d?q=80&w=1200&auto=format&fit=crop",
        colors: {
            primary: "#1F1F1F",
            secondary: "#404040",
            accent: "#FFD700",
            background: "#0D0D0D",
            gradient: "linear-gradient(135deg, #1F1F1F, #0D0D0D, #000000)",
        },
        designGuide:
            "Создай роскошную презентацию в тёмных тонах с золотыми акцентами, изящными шрифтами и кинематографическим настроением.",
        theme: "star",
    },
    {
        styleName: "Креативный Пастель 🌼",
        icon: "🌼",
        bannerImage:
        "https://img.freepik.com/premium-photo/high-angle-view-multi-colored-crayons-against-drawing_1048944-16909079.jpg?semt=ais_hybrid",

        colors: {
            primary: "#A6E3E9",
            secondary: "#F9F7F7",
            accent: "#F6AE2D",
            background: "#FFF9E3",
            gradient: "linear-gradient(135deg, #A6E3E9, #F6AE2D, #A8D7E5)",
        },
        designGuide:
            "Создай презентацию в пастельных тонах с мягкими цветами, округлыми формами и легкими иллюстрациями. Отлично подходит для дизайнеров и творческих проектов.",
        theme: "palette",
    },
    {
        styleName: "Стартап Питч 🚀",
        icon: "🚀",
        bannerImage:
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
        colors: {
            primary: "#0052CC",
            secondary: "#1E90FF",
            accent: "#36B37E",
            background: "#E9F5FF",
            gradient: "linear-gradient(135deg, #0052CC, #36B37E)",
        },
        designGuide:
            "Создай современную питч-презентацию для стартапа с четкими заголовками, динамичной версткой и уверенным визуальным стилем.",
        theme: "modern",
    },
    {
        styleName: "Футуристичный Неон ⚡",
        icon: "⚡",
        bannerImage:
            "https://images.unsplash.com/photo-1609921141835-710b7fa6e438?q=80&w=1200&auto=format&fit=crop",
        colors: {
            primary: "#38B6FF",
            secondary: "#9333EA",
            accent: "#00FFFF",
            background: "#0B0B2A",
            gradient: "linear-gradient(135deg, #38B6FF, #9333EA, #00FFFF)",
        },
        designGuide:
            "Создай футуристичную презентацию с неоновыми эффектами, темным фоном и киберпанк-шрифтами. Идеально для технологий и инноваций.",
        theme: "neon",
    },
];




const SliderStyle = ({selectStyle}:any) => {

    const [selectedStyle, setSelectedStyle] = useState<string>('')


    return (
        <div className='mt-5'>
            <h2 className='font-semibold text-xl'>Выберите слайдер стилистику</h2>

            <div className='flex items-center justify-center gap-3 flex-wrap'>
                {DESIGN_STYLES.map((item, index) => (
                    <div className={`cursor-pointer ${item.styleName === selectedStyle && 'p-2 border-2 border-primary rounded-2xl'}`}
                         onClick={() => {
                             setSelectedStyle(item.styleName);
                             selectStyle(item)
                         }} key={index}>
                        <img src={item.bannerImage} alt={item.styleName}
                        width={300} height={300} className='w-full hover:scale-105  transition-all h-[120px] rounded-2xl object-cover'
                        />
                        <h2 className='font-medium'>{item.styleName}</h2>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default SliderStyle
