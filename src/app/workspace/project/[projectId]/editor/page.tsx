'use client'
import React, {useEffect, useRef, useState} from 'react'
import OutlineSection from "@/app/workspace/project/[projectId]/outline/_components/OutlineSection";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { toast } from "sonner";
import SliderFrame from "@/app/workspace/project/[projectId]/editor/_components/SliderFrame";
import {Button} from "@/components/ui/button";
import {FileDownIcon, Loader2Icon} from "lucide-react";
import PptxGenJS from "pptxgenjs";
import html2canvas from 'html2canvas';
import {FaMagic} from "react-icons/fa";
import {LoaderFive, LoaderOne} from "@/components/ui/loader";
import {Dialog} from "@/components/ui/dialog";
const EditorPage = () => {
    const saveNewSliders = useMutation(api.projects.saveNewSliders)
    const { projectId } = useParams();
    const updateProjectOutline = useMutation(api.projects.updateProjectSlider);
    const project = useQuery(
        api.projects.getProjectDetails,
        projectId ? { projectId: projectId as string } : "skip"
    );
    const [localOutline, setLocalOutline] = useState(project?.outline || []);
    const containerRef = useRef<HTMLDivElement |null>(null)

    const [loading, setLoading] = useState(false);
    const [sliders, setSliders] = useState<any[]>([]);

    const [downloadLoading, setDownloadLoading] = useState<boolean>(false)
    useEffect(() => {
        if (project) {
            setLocalOutline(project.outline || []);
            setSliders(
                project.sliders?.map((s: any, index: number) => ({
                    index,
                    html: s.html,
                })) || []
            );
        }
    }, [project]);
    useEffect(() => {
        if (!project) return;

        if (project.sliders && project.sliders.length > 0) {
            setSliders(
                project.sliders.map((s: any, index: number) => ({
                    index,
                    html: s.html,
                }))
            );
        }
    }, [project]);
    const generateSlide = async (slide: any, index: number, attempt = 1): Promise<any> => {
        try {
            const res = await fetch("/api/ai-slides", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ role: "user", content: slide.slidePoint || "Untitled slide" }],
                    projectDetail: project,
                }),
            });

            const data = await res.json();

            if (res.ok && data.html) {
                return { index, html: data.html };
            } else if (data.code === "MODEL_OVERLOADED" && attempt <= 5) {
                await new Promise(r => setTimeout(r, attempt * 2000)); // экспоненциальная задержка
                return generateSlide(slide, index, attempt + 1);
            } else {
                return { index, html: `<div class='text-red-500'>Ошибка при генерации слайда ${index + 1}</div>` };
            }
        } catch (err) {
            if (attempt <= 5) {
                await new Promise(r => setTimeout(r, attempt * 2000));
                return generateSlide(slide, index, attempt + 1);
            }
            return { index, html: `<div class='text-red-500'>Ошибка при генерации слайда ${index + 1}</div>` };
        }
    };

    const handleGenerateSlides = async () => {
        if (!project || !project.outline || project.outline.length === 0) return;
        setLoading(true);
        toast.message("Генерация слайдов...");

        const generatedSlides: any[] = [];
        for (const [index, slide] of project.outline.entries()) {
            const result = await generateSlide(slide, index);
            generatedSlides.push(result);
        }

        setSliders(generatedSlides);
        setLoading(false);
        toast.success("✅ Все слайды готовы!");

        // сразу сохраняем в Convex
        await saveNewSliders({
            projectId,
            sliders: generatedSlides.map((s, i) => ({
                slideNo: i + 1,
                html: s.html,
            })),
        });
    };
    const updateSliderCode = (updateSlideCode:string, index:number) => {
        setSliders((prev:any) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                code: updateSlideCode
            }
            return updated
        });

    }
    const exportAllIframesToPPT = async () => {
        if (!containerRef.current) {
            console.warn('Container ref is not available');
            return;
        }

        setDownloadLoading(true);

        try {
            const pptx = new PptxGenJS();
            pptx.layout = 'LAYOUT_WIDE';

            const iframes = containerRef.current.querySelectorAll('iframe');

            for (let i = 0; i < iframes.length; i++) {
                const iframe = iframes[i] as HTMLIFrameElement;

                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (!iframeDoc) {
                    console.warn(`Iframe ${i + 1} document not available`);
                    continue;
                }

                // Берем основной div внутри body
                const slideElement = iframeDoc.querySelector('body > div') || iframeDoc.body;
                if (!slideElement) {
                    console.warn(`Slide element not found in iframe ${i + 1}`);
                    continue;
                }

                console.log(`Exporting slide ${i + 1}...`);

                try {
                    // Используем html2canvas для конвертации
                    const canvas = await html2canvas(slideElement as HTMLElement, {
                        backgroundColor: '#ffffff',
                        scale: 2, // для лучшего качества
                        useCORS: true,
                    });

                    const dataUrl = canvas.toDataURL('image/png');

                    // Добавляем слайд в PPT
                    const slide = pptx.addSlide();
                    slide.addImage({
                        data: dataUrl,
                        x: 0,
                        y: 0,
                        w: 10,
                        h: 5.625, // 16:9
                        sizing: { type: 'contain', w: 10, h: 5.625 },
                    });

                } catch (err) {
                    console.error(`Error converting slide ${i + 1} to image:`, err);
                    continue;
                }
            }

            if (pptx.slides.length > 0) {
                await pptx.writeFile({
                    fileName: `MyProjectSlides-${new Date().toISOString().split('T')[0]}.pptx`,
                });
                console.log(`Successfully exported ${pptx.slides.length} slides`);
            } else {
                console.warn('No slides were exported');
            }

        } catch (error) {
            console.error('Error exporting to PPT:', error);
        } finally {
            setDownloadLoading(false);
        }
    };
    const handleUpdateOutline = async (slideNo: number, updatedSlide: any) => {
        setLocalOutline(prev =>
            prev.map(slide =>
                slide.slideNo === slideNo ? { ...slide, ...updatedSlide } : slide
            )
        );

        if (!project?._id) return;
        try {
            await updateProjectOutline({
                projectId: project._id,
                outline: localOutline.map(slide =>
                    slide.slideNo === slideNo ? { ...slide, ...updatedSlide } : slide
                ),
                designStyle: project.designStyle || null,
            });
        } catch (err) {
            console.error(err);
        }
    };
    if (project === undefined) return <div className='flex items-center justify-center w-screen h-screen'>
        <LoaderOne/>
    </div>;
    if (project === null) return <div className="p-6 text-red-500 flex mt-20 items-center justify-center">
        Проект не найден 😢</div>;

    return (
        <div className="md:flex-row flex-col flex w-screen  bg-gray-950 overflow-hidden">
            {loading &&   <Dialog open={loading}>
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 animate-in zoom-in fade-in duration-300">
                        <Loader2Icon className="w-10 h-10 text-primary animate-spin" />
                        <LoaderFive text="Генерация слайдов..." />
                        <p className="text-sm text-gray-400 text-center max-w-sm">
                            Мы создаём ваши слайды на основе плана и стиля проекта.
                            Пожалуйста, подождите пару минут 💫
                        </p>
                    </div>
                </div>
            </Dialog> }

            <div className="w-[420px]   min-h-screen md:h-full border-l border-gray-800 bg-gray-900  overflow-y-auto p-6">
                <OutlineSection
                    handleUpdateOutline={handleUpdateOutline}
                    loading={loading}
                    outline={localOutline}
                />
                <div className="mt-6 flex justify-center">
                    {sliders.length === 0 &&       <Button
                        onClick={handleGenerateSlides}
                        disabled={loading}

                        className="bg-primary text-white fixed bottom-20  transform left-1/2 -translate-x-1/2 px-4 py-6 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        <FaMagic/>
                        {loading ? "Генерация..." : "Сгенерировать слайды"}
                    </Button>}

                </div>
            </div>

            <div
                ref={containerRef}
                className=" flex flex-col  w-full items-center justify-start gap-12 overflow-y-auto py-12 px-8"
            >
                {loading ? (
                    <div className="text-gray-400 text-center mt-40">Генерация слайдов...</div>
                ) : sliders.length > 0 ? (
                    sliders.map((slide, index) => (
                        <div key={index} className="flex w-full justify-center ">
                            <div className="shadow-2xl w-[90%] border border-gray-800 rounded-xl overflow-hidden bg-black/20">
                                <SliderFrame
                                    setUpdatedSlider={(updatedSlideCode: string) =>
                                        updateSliderCode(updatedSlideCode, index)
                                    }
                                    slide={slide}
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-400 text-center mt-40">Нет слайдов для отображения</div>
                )}
            </div>
            {sliders?.length !== 0 &&     <Button onClick={exportAllIframesToPPT} size='lg' className='fixed bottom-20 transform left-1/2 -translate-x-1/2'>
                {downloadLoading ? <Loader2Icon className={'animate-spin'}/> : <FileDownIcon/>}

                Экспортировать в ppt
            </Button>}

        </div>
    );
};

export default EditorPage;
