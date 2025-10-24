'use client';
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, Zap } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import {toast} from "sonner";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
export default function SignInPage() {
    const login = useAction(api.auth.login);
    const { login: setLogin, user, setUser } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            setLoading(true);
            const user = await login({ email, password });
            const token = await fetch("/api/jwt", {
                method: "POST",
                body: JSON.stringify(user),
                headers: { "Content-Type": "application/json" },
            }).then((res) => res.json()).then(res => res.token);

            console.log("🎫 JWT токен получен:", token);
            setLogin(token);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Ошибка входа");
        } finally {
            setLoading(false);
        }
    };


    const [googleLoading, setGoogleLoading] = useState(false);
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const { data } = await axios.post("/api/google", {
                    access_token: tokenResponse.access_token,
                });
                console.log(data)

                localStorage.setItem("token", data.token);
                toast.success("Добро пожаловать, " + data.user.name);
                setUser(data.user);
                router.replace("/workspace");

            } catch (err: any) {
                console.error(err);
                toast.error("Ошибка входа через Google");
            }
        },
        onError: () => toast.error("Не удалось войти через Google"),
    });

    useEffect(() => {
        if (user) {
            router.push("/");
        }
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-purple-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-gray-600">Входим в систему...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-purple-50">
            <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
                {/* Левая часть - Брендинг */}
                <div className="relative hidden h-full flex-col bg-gradient-to-br from-primary to-purple-600 p-10 text-white lg:flex">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative z-20 flex items-center text-lg font-medium"
                    >
                        <Zap className="mr-2 h-6 w-6" />
                        Presentify
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative z-20 mt-auto"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <Zap className="h-12 w-12 text-yellow-300" />
                            <h1 className="text-4xl font-bold">Presentify</h1>
                        </div>
                        <blockquote className="space-y-2">
                            <p className="text-lg">
                                "Создавайте впечатляющие презентации с помощью ИИ за секунды."
                            </p>
                            <footer className="text-sm text-white/80">
                                Присоединяйтесь к тысячам довольных пользователей
                            </footer>
                        </blockquote>
                    </motion.div>
                </div>

                {/* Правая часть - Форма */}
                <div className="lg:p-8">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col space-y-2 text-center lg:text-left"
                        >
                            <div className="lg:hidden flex justify-center mb-6">
                                <div className="flex items-center gap-3">
                                    <Zap className="h-8 w-8 text-primary" />
                                    <h1 className="text-2xl font-bold text-primary">Presentify</h1>
                                </div>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                                С возвращением!
                            </h1>
                            <p className="text-sm text-gray-600">
                                Введите ваши данные для входа в аккаунт
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="grid gap-6"
                        >
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                            placeholder="your@email.com"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                            Пароль
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                placeholder="Введите пароль"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-md transition-all duration-200"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : null}
                                    {loading ? "Вход..." : "Войти в аккаунт"}
                                </Button>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-500">Или продолжите с</span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                type="button"
                                disabled={googleLoading}
                                onClick={() => googleLogin()}
                                className="w-full border-gray-300 transition hover:scale-105 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg transition-all duration-200"
                            >
                                {googleLoading ? (
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                ) : (
                                    <FcGoogle className="w-5 h-5 mr-2" />
                                )}
                                {googleLoading ? "Вход..." : "Google"}
                            </Button>

                            <div className="text-center text-sm text-gray-600">
                                Нет аккаунта?{" "}
                                <a
                                    href="/sign-up"
                                    className="font-semibold text-primary hover:underline transition-colors"
                                >
                                    Зарегистрируйтесь
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}