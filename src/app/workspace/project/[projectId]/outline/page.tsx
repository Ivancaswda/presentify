"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import SliderStyle from "@/app/workspace/project/[projectId]/outline/_components/SliderStyle";
import OutlineSection from "@/app/workspace/project/[projectId]/outline/_components/OutlineSection";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {LoaderOne} from "@/components/ui/loader";
import {FaMagic, FaSave} from "react-icons/fa";

const OutlinePage = () => {
    const { projectId } = useParams();
    const router = useRouter();

    const project = useQuery(
        api.projects.getProjectDetails,
        projectId ? { projectId: projectId as string } : "skip"
    );

    const updateProjectOutline = useMutation(api.projects.updateProjectSlider);

    const [outline, setOutline] = useState(project?.outline || []);
    const [selectedStyle, setSelectedStyle] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    console.log(project)
    // Синхронизация состояния с проектом
    useEffect(() => {
        if (project) {
            setOutline(project.outline || []);
            setSelectedStyle(project.designStyle || null);
        }
    }, [project]);

    // Генерация плана презентации через AI
    const handleGenerateOutline = async () => {
        if (!project) return toast.error("Проект не найден!");

        try {
            setLoading(true);
            toast.message("Генерация плана презентации...");

            const res = await fetch("/api/ai-outliner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userInput: project.userInputPrompt,
                    slideCount: project.slideCount,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("❌ Ошибка:", data);
                toast.error(data.error || "Ошибка при генерации!");
                return;
            }

            // Обновляем state для UI
            setOutline(data);
            toast.success("План презентации успешно сгенерирован!");
        } catch (err: any) {
            console.error(err);
            toast.error("Ошибка при обращении к AI!");
        } finally {
            setLoading(false);
        }
    };

    // Обновление конкретного слайда
    const handleUpdateOutline = async (slideNo: number, updatedSlide: any) => {
        const updatedOutline = outline.map(slide =>
            slide.slideNo === slideNo ? { ...slide, ...updatedSlide } : slide
        );

        setOutline(updatedOutline);

        if (!project?._id) return;

        try {
            await updateProjectOutline({
                projectId: project._id,
                outline: updatedOutline,
                designStyle: project.designStyle || null,
            });
        } catch (err) {
            console.error(err);
            toast.error("Ошибка при сохранении изменений слайда!");
        }
    };

    // Сохранение всего проекта (outline + стиль)
    const onUpdateSlider = async () => {
        if (!project?._id) return toast.error("Проект не найден!");
        if (!selectedStyle) return toast.error("Выберите стиль!");

        try {
            setSaving(true);
            toast.message("Сохранение настроек...");

            const normalizedOutline = outline.map(item => ({
                ...item,
                slideNo: String(item.slideNo),
            }));

            await updateProjectOutline({
                projectId: project._id,
                designStyle: selectedStyle,
                outline: normalizedOutline,
            });

            router.push(`/workspace/project/${projectId}/editor`);
            toast.success("Проект успешно обновлён!");
        } catch (error: any) {
            console.error(error);
            toast.error("Ошибка при сохранении!");
        } finally {
            setSaving(false);
        }
    };

    if (project === undefined) {
        return <div className='flex items-center justify-center w-screen h-screen'>
            <LoaderOne/>
        </div>;
    }

    if (project === null) {
        return <div className="p-6 text-red-500 flex mt-20 items-center justify-center">
            Проект не найден 😢</div>;
    }


    return (
        <div className="flex items-center justify-center mt-20">
            <div className="max-w-3xl w-full px-4">
                <h2 className="font-semibold text-2xl mb-6">Настройки</h2>


                <SliderStyle selectStyle={(value: any) => setSelectedStyle(value)} />


                <div className="mt-6 flex justify-center w-full">
                    <Button
                        onClick={handleGenerateOutline}
                        disabled={loading || outline.length !== 0}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition disabled:opacity-50"
                    >
                        <FaMagic/>
                        {loading ? "Генерация..." : "Сгенерировать план"}
                    </Button>
                </div>


                <div className="mt-8">
                    <OutlineSection
                        handleUpdateOutline={handleUpdateOutline}
                        loading={loading}
                        outline={outline}
                    />
                </div>


                <div className="flex justify-center mt-8 mb-16">
                    <Button
                        onClick={onUpdateSlider}
                        disabled={saving || outline.length === 0}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                        <FaSave/>
                        {saving ? "Сохранение..." : "Сохранить изменения"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OutlinePage;
