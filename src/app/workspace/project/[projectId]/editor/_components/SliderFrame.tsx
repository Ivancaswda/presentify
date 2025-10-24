'use client'
import React, {useEffect, useRef, useState} from 'react'
import {useParams} from "next/navigation";
import {GoogleGenerativeAI} from "@google/generative-ai";
import {useMutation} from "convex/react";
import {api} from "../../../../../../../convex/_generated/api";
import FloatingActionTool from "@/app/workspace/project/[projectId]/editor/_components/FloatingActionTool";

const HTML_DEFAULT = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>AI Slide</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    background: #111827;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  .slide-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    background: #111827;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .slide-content {
    width: 100%;
    height: 100%;
    padding: 2rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: white;
  }

  .slide-content * {
    max-width: 100%;
    overflow-wrap: break-word;
  }

  .slide-text {
    font-size: clamp(14px, 2vw, 36px);
    line-height: 1.3;
  }

  h1, h2, h3 {
    font-size: clamp(20px, 3vw, 40px);
    font-weight: 700;
    margin: 0.5em 0;
  }

  p, li, span {
    font-size: clamp(14px, 1.5vw, 20px);
    margin: 0.3em 0;
  }
</style>
</head>
<body>
  <div class="slide-wrapper">
    <div class="slide-content" id="slideContent">
      {code}
    </div>
  </div>

<script>
function fitSlide() {
  const wrapper = document.querySelector('.slide-wrapper');
  const content = document.getElementById('slideContent');
  if (!wrapper || !content) return;

  content.style.transform = 'none';

  const scaleX = wrapper.clientWidth / content.scrollWidth;
  const scaleY = wrapper.clientHeight / content.scrollHeight;
  const scale = Math.min(scaleX, scaleY, 1);

  content.style.transform = \`translate(-50%, -50%) scale(\${scale})\`;
  content.style.top = '50%';
  content.style.left = '50%';
  content.style.position = 'absolute';
}

window.addEventListener('load', fitSlide);
window.addEventListener('resize', fitSlide);
</script>
</body>
</html>`;




const SliderFrame = ({slide, colors, setUpdatedSlider}:any) => {
    const { projectId } = useParams();
    const [loading, setLoading] = useState<boolean>(false)
    const [updateFilter, setUpdateFilter] = useState()
    const updateSliderMutation = useMutation(api.projects.updateSlider);
   const final_code = HTML_DEFAULT
        .replace("colorCodes", JSON.stringify(colors || { primary: "#3b82f6" }))
        .replace("{code}", slide?.html || "<div class='p-10 text-center text-gray-400'>Пустой слайд</div>");


    const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
    const [hoverElement, setHoverElement] = useState<HTMLElement | null>(null);
    const [resModification, setResModification] = useState<{x: number, y: number} | null>(null);
    const selectedElementRef = useRef<HTMLElement | null>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [cardPosition, setCardPosition] = useState<{x: number, y:number}|null>(null)


    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        const doc = iframe.contentDocument;
        if (!doc) return;

        doc.open();
        doc.write(final_code);
        doc.close();

        const init = () => {
            if (!doc.body) return;

            doc.body.setAttribute("tabIndex", "0");

            const handleClick = (event: MouseEvent) => {
                event.stopPropagation();
                const target = event.target as HTMLElement;

                // снимаем outline с предыдущего
                if (selectedElement && selectedElement !== target) {
                    selectedElement.style.outline = "";
                    selectedElement.removeAttribute("contenteditable");
                    selectedElement.removeEventListener("input", handleInput);
                }

                // выделяем новый
                selectedElementRef.current = target;
                setSelectedElement(target);
                target.style.outline = "2px solid blue";
                target.setAttribute("contenteditable", "true");
                target.focus();

                const rect = target.getBoundingClientRect();
                const iframeRect = iframe.getBoundingClientRect();
                setCardPosition({
                    x: iframeRect.left + rect.left + rect.width / 2,
                    y: iframeRect.top + rect.bottom,
                });

                // слушаем изменение текста
                target.addEventListener("input", handleInput);
            };

            const handleInput = async (e: Event) => {
                if (!selectedElementRef.current) return;
                const newHTML = selectedElementRef.current.outerHTML;

                // обновляем локально
                setUpdatedSlider && setUpdatedSlider(iframe.contentDocument?.body?.innerHTML || newHTML);

                // сохраняем в Convex
                await updateSliderMutation({
                    projectId,
                    slideIndex: slide.index,
                    html: iframe.contentDocument?.body?.innerHTML || newHTML
                });
            };

            doc.body.addEventListener("click", handleClick);

            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === "Escape" && selectedElement) {
                    selectedElement.style.outline = "";
                    selectedElement.removeAttribute("contenteditable");
                    selectedElement.removeEventListener("input", handleInput);
                    setSelectedElement(null);
                }
            };

            doc.body.addEventListener("keydown", handleKeyDown);
        };

        if (doc.readyState === "complete" && doc.body) {
            init();
        } else {
            iframe.onload = init;
        }
    }, [slide.html, colors]);






    const handleAiSectionChange = async (userAiPrompt: string) => {
        setLoading(true);
        const selectedEl = selectedElementRef.current;
        const iframe = iframeRef.current;

        if (!selectedEl || !iframe) {
            setLoading(false);
            return;
        }

        const oldHTML = selectedEl.outerHTML;

        try {
            const res = await fetch("/api/ai-section-change", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oldHTML, userAiPrompt }),
            });

            const data = await res.json();

            if (res.ok && data.html) {
                selectedEl.outerHTML = data.html;

                const updatedSliderCode = iframe.contentDocument?.body?.innerHTML || data.html;
                setUpdatedSlider(updatedSliderCode);


                await updateSliderMutation({
                    projectId,
                    slideIndex: slide.index,
                    html: updatedSliderCode,
                    aiPrompt: userAiPrompt
                });
            }
        } catch (err) {
            console.error("Ошибка при AI генерации секции:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="m-4">
            <iframe
                ref={iframeRef}
                className="w-full h-screen flex items-center justify-center border-2 border-gray-300 rounded-lg"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
            <FloatingActionTool loading={loading}  position={cardPosition}
                                 onClose={() => setCardPosition(null)}
                                 handleAiChange={(value:any) => handleAiSectionChange(value) }
            />
        </div>
    );
}
export default SliderFrame
