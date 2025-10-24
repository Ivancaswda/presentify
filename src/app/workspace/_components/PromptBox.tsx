"use client";
import React, { useState } from "react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupTextarea,
} from "@/components/ui/input-group";
import { ArrowUp, Crown, Zap, Loader2, Sparkles, Gem } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";


const MAX_FREE_ATTEMPTS = 5;

const PromptBox = () => {
    const [userInput, setUserInput] = useState<string>("");
    const [slideCount, setSlideCount] = useState<string>("");
    const router = useRouter();
    const { user, isPrem } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);

    const [showUpgradeDialog, setShowUpgradeDialog] = useState<boolean>(false);

    const decreaseAttempts = useMutation(api.users.decreaseAttempts);
    const createProject = useMutation(api.projects.createProject);

    const handleCreateProject = async () => {
        if (!userInput || !slideCount) return;

        // Проверка лимитов для бесплатных пользователей
        if (!isPrem && user?.usedAttempts <= 0) {
            setShowUpgradeDialog(true);
            return;
        }

        try {
            setLoading(true);
            const projectId = uuidv4();
            const createdBy = user?.userId;


            if (!isPrem && user?.userId) {
                await decreaseAttempts({ userId: user.userId });
            }
            const result = await createProject({
                projectId,
                userInputPrompt: userInput,
                createdBy,
                slideCount,
                createdAt: Date.now()
            });

            console.log("✅ Project created:", result);



            toast.success("Проект успешно создан!");
            setUserInput("");
            setSlideCount("");
            router.push(`/workspace/project/${result.projectId}/outline`);
        } catch (error) {
            console.error("Ошибка создания проекта:", error);
            toast.error("Ошибка при создании проекта!");
        } finally {
            setLoading(false);
        }
    };

    const UsageDisplay = () => {
        if (isPrem) {
            return (
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-primary">Premium</span>
                    </div>
                    <div className="h-3 w-px bg-primary/30 mx-1" />
                    <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Безлимитно</span>
                    </div>
                </div>
            );
        }

        const usagePercentage = (user?.usedAttempts / MAX_FREE_ATTEMPTS) * 100;
        const isLow = user?.usedAttempts <= 2;

        return (
            <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg min-w-[140px]">
                <div className="flex items-center gap-1.5">
                    <Sparkles className={`w-3 h-3 ${isLow ? 'text-orange-500' : 'text-blue-500'}`} />
                    <span className={`text-sm font-medium ${isLow ? 'text-orange-600' : 'text-gray-700'}`}>
                        {user?.usedAttempts}/{MAX_FREE_ATTEMPTS}
                    </span>
                </div>
                <div className="flex-1 min-w-[60px]">
                    <Progress
                        value={usagePercentage}
                        className={`h-1.5 ${isLow ? 'bg-orange-200' : 'bg-gray-200'}`}

                    />
                </div>
            </div>
        );
    };
    const UpgradeDialog = () => (
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Crown className="w-6 h-6 text-yellow-500" />
                        Попытки закончились!
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        Вы использовали все 5 бесплатных попыток. Перейдите на Premium для безлимитного создания презентаций!
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20 rounded-lg p-4">
                        <h4 className="font-semibold text-primary mb-2">Преимущества Premium:</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-green-500" />
                                Безлимитное создание презентаций
                            </li>
                            <li className="flex items-center gap-2">
                                <Crown className="w-4 h-4 text-yellow-500" />
                                Приоритетная обработка ИИ
                            </li>
                            <li className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                Все премиум-шаблоны и стили
                            </li>
                            <li className="flex items-center gap-2">
                                <Gem className="w-4 h-4 text-blue-500" />
                                Экспорт в HD качестве
                            </li>
                        </ul>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowUpgradeDialog(false)}
                        className="flex-1"
                    >
                        Позже
                    </Button>
                    <Button
                        onClick={() => {
                            setShowUpgradeDialog(false);
                            router.push('/pricing');
                        }}
                        className="flex-1 bg-primary hover:bg-primary/90"
                    >
                        <Crown className="w-4 h-4 mr-2" />
                        Перейти на Premium
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
    const UpgradePrompt = () => {
        if (isPrem) return null;

        return (
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20 rounded-lg mt-2">
                <div className="flex items-center gap-2">
                    <Gem className="w-4 h-4 text-primary" />
                    <div>
                        <p className="text-sm font-medium text-gray-800">
                            {user?.usedAttempts > 0
                                ? `Осталось ${user?.usedAttempts} попыток`
                                : 'Попытки закончились'
                            }
                        </p>
                        <p className="text-xs text-gray-600">Перейдите на Premium для безлимитного доступа</p>
                    </div>
                </div>
                <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white text-xs h-8 px-3"
                    onClick={() => router.push('/pricing')}
                >
                    Обновить
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center mt-20">
            <div className="flex items-center justify-center flex-col w-full max-w-2xl">
                <h2 className="font-bold text-3xl text-center mb-4">
                    Создай презентацию своей мечты с{" "}
                    <span className="text-primary">Presentify</span>
                </h2>
                <p className="text-gray-700 text-center mb-6">
                    Опиши идею, а мы сгенерируем структуру и содержание слайдов.
                </p>

                <div className="w-full space-y-3">
                    <InputGroup>
                        <InputGroupTextarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            className="min-h-38"
                            placeholder="Введите описание презентации..."
                        />
                        <InputGroupAddon align="block-end">
                            <Select onValueChange={setSlideCount}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Кол-во слайдов" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Количество слайдов</SelectLabel>
                                        <SelectItem value="4-6">4–6</SelectItem>
                                        <SelectItem value="6-8">6–8</SelectItem>
                                        <SelectItem value="8-10">8–10</SelectItem>
                                        <SelectItem value="10-12">10–12</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            {/* Отображение статуса использования */}
                            <UsageDisplay />

                            <InputGroupButton
                                disabled={(!userInput || !slideCount) || loading || (!isPrem && user?.usedAttempts <= 0)}
                                className="rounded-full ml-auto bg-primary text-white h-9 w-9 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleCreateProject}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ArrowUp className="w-4 h-4" />
                                )}
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>

                    <UpgradePrompt />
                    <UpgradeDialog />

                    {!isPrem && user?.usedAttempts <= 2 && user?.usedAttempts > 0 && (
                        <div className={`p-3 rounded-lg text-center ${
                            user?.usedAttempts === 1
                                ? 'bg-red-50 border border-red-200'
                                : 'bg-orange-50 border border-orange-200'
                        }`}>
                            <p className={`text-sm font-medium ${
                                user?.usedAttempts === 1 ? 'text-red-700' : 'text-orange-700'
                            }`}>
                                {user?.usedAttempts === 1
                                    ? '⚠️ Осталась 1 попытка! Обновите тариф для безлимитного доступа.'
                                    : `⚠️ Осталось ${user?.usedAttempts} попытки. Обновите тариф для безлимитного доступа.`
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PromptBox;