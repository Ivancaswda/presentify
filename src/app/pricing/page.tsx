'use client'
import React from 'react'
import {CheckIcon, CrownIcon, StarIcon, Zap} from 'lucide-react'
import { useAuth } from "@/context/authContext";
import getServerUser from "@/lib/auth-server";
import {Button} from "@/components/ui/button";


const PricingPage =   () => {
    const CHEСKOUT_URL = "https://presentify.lemonsqueezy.com/buy/f7995104-12ba-4ecc-b3e8-8779b43de0c9";
    const {user} =  useAuth()
    console.log(user)
    const features = {
        free: [
            "Доступно генерация путевок",
            "Узнавайте лучшее время для путешествий",
            "Базовые функции ИИ бесплатно",
            "Ограниченное количество запросов",
            "Стандартная скорость обработки"
        ],
        premium: [
            "ИИ отвечает на 15% быстрее",
            "Все ИИ функции платформы",
            "Приоритетная поддержка 24/7",
            "Безлимитное количество запросов",
            "Экспорт в высоком качестве",
            "Премиум шаблоны и дизайны",
            "Ранний доступ к новым функциям",
            "Персональная настройка ИИ"
        ]
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-16 px-4">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-6">
                    Выберите свой тариф
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Начните создавать удивительные презентации с помощью искусственного интеллекта
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 max-w-6xl w-full justify-center items-stretch">
                {/* Бесплатный тариф */}
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 flex-1 flex flex-col border-2 border-gray-100 hover:border-primary/20 transition-all duration-300 hover:shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <StarIcon className="w-8 h-8 text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Базовый</h2>
                        <p className="text-gray-600">Идеально для начала работы</p>
                    </div>

                    <div className="text-center mb-8">
                        <div className="text-4xl font-bold text-gray-800 mb-2">0 ₽</div>
                        <p className="text-gray-500 text-sm">навсегда</p>
                    </div>

                    <ul className="space-y-4 mb-8 flex-grow">
                        {features.free.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <Button
                        variant="outline"
                        className="w-full py-6 text-lg font-semibold border-2 hover:border-primary hover:bg-primary/5 transition-colors"
                        disabled
                    >
                        Текущий план
                    </Button>
                </div>

                {/* Премиум тариф */}
                <div className="bg-gradient-to-br from-primary to-primary/90 rounded-3xl shadow-2xl p-8 md:p-10 flex-1 flex flex-col text-white relative transform hover:scale-105 transition-all duration-300">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold px-6 py-2 rounded-full text-sm shadow-lg">
                        🏆 ПОПУЛЯРНЫЙ ВЫБОР
                    </div>

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CrownIcon className="w-8 h-8 text-yellow-300" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">AI-Premium</h2>
                        <p className="text-white/80">Максимальная производительность</p>
                    </div>

                    <div className="text-center mb-8">
                        <div className="text-4xl font-bold mb-2">199.99 RUB</div>
                        <p className="text-white/70 text-sm">в месяц • Отмена в любой момент</p>
                    </div>

                    <ul className="space-y-4 mb-8 flex-grow">
                        {features.premium.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <CheckIcon className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                                <span className="text-white/95">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <Button
                        disabled={user?.isPrem}
                        className={`w-full py-6 text-lg font-semibold bg-white text-primary hover:bg-gray-100 transition-all ${
                            user?.isPrem ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'
                        }`}
                    >
                        <a className="flex items-center justify-center gap-3 w-full" target='_blank' href={CHEСKOUT_URL}>
                            <Zap className="w-5 h-5" />
                            {user?.isPrem ? 'Премиум активен 🎉' : 'Начать Premium'}
                        </a>
                    </Button>

                    {user?.isPrem && (
                        <div className="text-center mt-4">
                            <p className="text-yellow-300 text-sm font-semibold">
                                ✅ Вы наслаждаетесь всеми преимуществами Premium!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Дополнительная информация */}
            <div className="mt-16 text-center max-w-4xl">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                    <h3 className="text-2xl font-bold text-primary mb-4">Часто задаваемые вопросы</h3>
                    <div className="grid md:grid-cols-2 gap-6 text-left">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Можно ли отменить подписку?</h4>
                            <p className="text-gray-600">Да, вы можете отменить подписку в любой момент.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Доступны ли пробные периоды?</h4>
                            <p className="text-gray-600">К сожалению пока что нет!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default PricingPage
