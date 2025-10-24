'use client';
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/authContext";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, Zap, Check, Sparkles } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function SignUpForm() {
    const register = useAction(api.auth.registerUser);
    const router = useRouter();
    const { login: setLogin } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            setLoading(true);
            const user = await register(form);
            const token = await fetch("/api/jwt", {
                method: "POST",
                body: JSON.stringify(user),
                headers: { "Content-Type": "application/json" },
            }).then((res) => res.json()).then(res => res.token);

            setLogin(token);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Ошибка регистрации");
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = {
        length: form.password.length >= 8,
        uppercase: /[A-Z]/.test(form.password),
        number: /[0-9]/.test(form.password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(form.password),
    };

    const strengthScore = Object.values(passwordStrength).filter(Boolean).length;
    const [googleLoading, setGoogleLoading] = useState(false);
    const handleGoogleAuth = async () => {
        try {
            setGoogleLoading(true);

            // Запускаем Google OAuth flow
            const authWindow = window.open(
                '/api/google', // Или ваш OAuth endpoint
                'Google Auth',
                'width=500,height=600'
            );

            // Слушаем сообщения от popup окна
            const handleMessage = (event: MessageEvent) => {
                if (event.origin !== window.location.origin) return;

                if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                    const { token, user } = event.data;
                    login(token);
                    router.push('/');
                    authWindow?.close();
                    window.removeEventListener('message', handleMessage);
                }
            };

            window.addEventListener('message', handleMessage);

        } catch (error) {
            console.error('Google auth error:', error);
            setGoogleLoading(false);
        }
    };
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-purple-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-gray-600">Создаем ваш аккаунт...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-purple-50">
            <div className="container flex gap-8 px-8 relative min-h-screen items-center justify-center lg:max-w-none">
                {/* Компактный бокс слева */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden lg:flex flex-col bg-gradient-to-br from-primary to-purple-600 p-8 text-white rounded-2xl shadow-xl w-80 h-96"
                >
                    <div className="flex items-center gap-2 mb-8">
                        <Zap className="h-6 w-6 text-yellow-300" />
                        <span className="text-xl font-bold">Presentify</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-yellow-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">AI-Презентации</h3>
                                    <p className="text-white/80 text-sm">Создавайте за секунды</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-yellow-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Профессионально</h3>
                                    <p className="text-white/80 text-sm">Готовые шаблоны</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Check className="w-5 h-5 text-yellow-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Бесплатные попытки</h3>
                                    <p className="text-white/80 text-sm">5 презентаций в подарок</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-white/60 text-sm">
                        Присоединяйтесь к тысячам пользователей
                    </div>
                </motion.div>

                {/* Правая часть - Форма */}
                <div className="flex-1 max-w-md">
                    <div className="w-full flex flex-col justify-center space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col space-y-2 text-center lg:text-left"
                        >
                            <div className="lg:hidden flex justify-center mb-4">
                                <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-2 rounded-lg">
                                    <Zap className="h-5 w-5" />
                                    <span className="text-lg font-bold">Presentify</span>
                                </div>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                                Создайте аккаунт
                            </h1>
                            <p className="text-sm text-gray-600">
                                Начните создавать удивительные презентации с ИИ
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
                                        <label htmlFor="name" className="text-sm font-medium text-gray-700">
                                            Полное имя
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                                            placeholder="Иван Иванов"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
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
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                value={form.password}
                                                onChange={handleChange}
                                                required
                                                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                                                placeholder="Создайте надежный пароль"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>

                                        {/* Индикатор сложности пароля */}
                                        {form.password && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="space-y-2 pt-2"
                                            >
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4].map((level) => (
                                                        <div
                                                            key={level}
                                                            className={`h-1 flex-1 rounded-full transition-all ${
                                                                level <= strengthScore
                                                                    ? level === 1
                                                                        ? "bg-red-400"
                                                                        : level === 2
                                                                            ? "bg-orange-400"
                                                                            : level === 3
                                                                                ? "bg-yellow-400"
                                                                                : "bg-green-400"
                                                                    : "bg-gray-200"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Check className={`h-3 w-3 ${passwordStrength.length ? "text-green-500" : "text-gray-400"}`} />
                                                        <span>8+ символов</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Check className={`h-3 w-3 ${passwordStrength.uppercase ? "text-green-500" : "text-gray-400"}`} />
                                                        <span>Заглавная</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Check className={`h-3 w-3 ${passwordStrength.number ? "text-green-500" : "text-gray-400"}`} />
                                                        <span>Цифра</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Check className={`h-3 w-3 ${passwordStrength.special ? "text-green-500" : "text-gray-400"}`} />
                                                        <span>Спецсимвол</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : null}
                                    {loading ? "Регистрация..." : "Создать аккаунт"}
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
                                onClick={handleGoogleAuth}
                                className="w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg transition-all duration-200"
                            >
                                {googleLoading ? (
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                ) : (
                                    <FcGoogle className="w-5 h-5 mr-2" />
                                )}
                                {googleLoading ? "Вход..." : "Google"}
                            </Button>

                            <div className="text-center text-sm text-gray-600">
                                Уже есть аккаунт?{" "}
                                <a
                                    href="/sign-in"
                                    className="font-semibold text-primary hover:underline transition-colors"
                                >
                                    Войдите
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}