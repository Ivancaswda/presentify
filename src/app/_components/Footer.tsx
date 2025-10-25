"use client";
import React, {useState} from "react";
import { FaTwitter, FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa";
import Image from "next/image";
import {toast} from "sonner";

const Footer = () => {
    const [userInput, setUserInput] = useState<string>('')

    return (
        <footer className="bg-primary text-white py-12 px-6 mt-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Левая колонка */}
                <div>
                    <div className='flex items-center gap-4 mb-4'>
                        <Image src='/logo.png' className='rounded-2xl' alt='logo' width={80} height={80}/>
                        <h2 className="text-2xl font-bold mb-4">Presentify</h2>

                    </div>
                     <p className="text-sm text-white/80 leading-relaxed">
                        Создавайте потрясающие презентации с помощью искусственного интеллекта.
                        Presentify помогает вам экономить время и впечатлять аудиторию.
                    </p>
                    <div className="flex gap-4 mt-5">
                        <a
                            href="#"
                            className="text-white/80 hover:text-white transition"
                            aria-label="Twitter"
                        >
                            <FaTwitter size={20} />
                        </a>
                        <a
                            href="#"
                            className="text-white/80 hover:text-white transition"
                            aria-label="Facebook"
                        >
                            <FaFacebook size={20} />
                        </a>
                        <a
                            href="#"
                            className="text-white/80 hover:text-white transition"
                            aria-label="LinkedIn"
                        >
                            <FaLinkedin size={20} />
                        </a>
                        <a
                            href="#"
                            className="text-white/80 hover:text-white transition"
                            aria-label="Instagram"
                        >
                            <FaInstagram size={20} />
                        </a>
                    </div>
                </div>

                {/* Средняя колонка */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Навигация</h3>
                    <ul className="space-y-2 text-white/80 text-sm">
                        <li>
                            <a href="/" className="hover:text-white transition">
                                Главная
                            </a>
                        </li>
                        <li>
                            <a href="/pricing" className="hover:text-white transition">
                                Цены
                            </a>
                        </li>
                        <li>
                            <a href="/workspace" className="hover:text-white transition">
                                Рабочее пространство
                            </a>
                        </li>
                        <li>
                            <a href="/contact" className="hover:text-white transition">
                                Контакты
                            </a>
                        </li>
                    </ul>
                </div>


                <div>
                    <h3 className="text-lg font-semibold mb-4">Подпишитесь на новости</h3>
                    <p className="text-white/80 text-sm mb-4">
                        Получайте обновления о новых функциях и советах по созданию
                        презентаций.
                    </p>
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="flex items-center gap-2"
                    >
                        <input value={userInput} onChange={(event) => setUserInput(event.target.value)}
                            type="email"
                            placeholder="Ваш email"
                            className="w-full px-3 py-2 rounded-lg text-black focus:outline-none"

                        />
                        <button  onClick={() => {
                            if (userInput !== '') {
                                setUserInput('');
                                toast.success('Электронная почта отправлена!')

                            }


                        }}
                            type="submit"
                            className="bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
                        >
                            OK
                        </button>
                    </form>
                </div>
            </div>

            <div className="border-t border-white/20 mt-12 pt-6 text-center text-sm text-white/60">
                © {new Date().getFullYear()} Presentify. Все права защищены.
            </div>
        </footer>
    );
};

export default Footer;
