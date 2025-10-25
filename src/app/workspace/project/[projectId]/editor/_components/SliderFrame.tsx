'use client'
import React, {useEffect, useRef, useState} from 'react'
import {useParams} from "next/navigation";
import {useMutation} from "convex/react";
import {api} from "../../../../../../../convex/_generated/api";
import {Button} from "@/components/ui/button";
import {ArrowRight, Loader2Icon, Sparkles} from "lucide-react";
import {Input} from "@/components/ui/input";

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
cursor: text;
}

h1, h2, h3 {
font-size: clamp(20px, 3vw, 40px);
font-weight: 700;
margin: 0.5em 0;
}

p, li, span {
font-size: clamp(14px, 1.5vw, 20px);
margin: 0.3em 0;
} </style>

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

const SliderFrame = ({slide, colors, setUpdatedSlider}: any) => {
    const { projectId } = useParams();
    const [loading, setLoading] = useState(false);
    const [userAiPrompt, setUserAiPrompt] = useState('');
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const selectedElementRef = useRef<HTMLElement | null>(null);
    const updateSliderMutation = useMutation(api.projects.updateSlider);

    const final_code = HTML_DEFAULT
        .replace("{code}", slide?.html || "<div class='p-10 text-center text-gray-400'>Пустой слайд</div>");

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        const doc = iframe.contentDocument;
        if (!doc) return;

        // Вставляем HTML
        doc.open();
        doc.write(final_code);
        doc.close();

        const init = () => {
            if (!doc.body) return;

            // Функция для добавления обработки картинок
            const setupImages = () => {
                const images = doc.querySelectorAll("img");
                images.forEach((img) => {
                    // Эффект наведения
                    img.style.transition = "outline 0.2s";
                    img.addEventListener("mouseenter", () => {
                        img.style.outline = "2px dashed #3b82f6";
                    });
                    img.addEventListener("mouseleave", () => {
                        img.style.outline = "";
                    });

                    // Клик для замены картинки
                    img.addEventListener("click", (e) => {
                        e.stopPropagation(); // чтобы не срабатывали другие клики
                        const fileInput = document.createElement("input");
                        fileInput.type = "file";
                        fileInput.accept = "image/*";
                        fileInput.onchange = async (ev) => {
                            const file = (ev.target as HTMLInputElement).files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = async () => {
                                img.src = reader.result as string;

                                const newHTML = iframe.contentDocument?.body?.innerHTML || "";
                                setUpdatedSlider && setUpdatedSlider(newHTML);

                                await updateSliderMutation({
                                    projectId,
                                    slideIndex: slide.index,
                                    html: newHTML,
                                });
                            };
                            reader.readAsDataURL(file);
                        };
                        fileInput.click();
                    });
                });
            };

            // Редактирование текста
            const handleClick = (event: MouseEvent) => {
                const target = event.target as HTMLElement;
                if (!target) return;

                if (target.tagName === "IMG") return; // картинки обрабатываем отдельно

                // снимаем выделение с предыдущего
                if (selectedElementRef.current && selectedElementRef.current !== target) {
                    selectedElementRef.current.style.outline = "";
                    selectedElementRef.current.removeAttribute("contenteditable");
                }

                // выделяем новый элемент
                selectedElementRef.current = target;
                target.style.outline = "2px solid #3b82f6";
                target.setAttribute("contenteditable", "true");
                target.focus();

                const handleInput = async () => {
                    const newHTML = iframe.contentDocument?.body?.innerHTML || "";
                    setUpdatedSlider && setUpdatedSlider(newHTML);
                    await updateSliderMutation({
                        projectId,
                        slideIndex: slide.index,
                        html: newHTML,
                    });
                };

                target.addEventListener("input", handleInput, { once: true });
            };

            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === "Escape" && selectedElementRef.current) {
                    selectedElementRef.current.style.outline = "";
                    selectedElementRef.current.removeAttribute("contenteditable");
                    selectedElementRef.current = null;
                }
            };

            // Применяем обработку
            setupImages();
            doc.body.addEventListener("click", handleClick);
            doc.body.addEventListener("keydown", handleKeyDown);

            return () => {
                doc.body.removeEventListener("click", handleClick);
                doc.body.removeEventListener("keydown", handleKeyDown);
            };
        };

        if (doc.readyState === "complete") init();
        else iframe.onload = init;

    }, [slide.html]);


// AI редактирование выделенного элемента
    const handleAiChange = async () => {
        if (!selectedElementRef.current || !userAiPrompt.trim()) return;
        setLoading(true);


const selectedEl = selectedElementRef.current;
const iframe = iframeRef.current;
if (!iframe) return;

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

    const newHTML = iframe.contentDocument?.body?.innerHTML || data.html;
    setUpdatedSlider && setUpdatedSlider(newHTML);

    await updateSliderMutation({
      projectId,
      slideIndex: slide.index,
      html: newHTML,
      aiPrompt: userAiPrompt,
    });
  }
} catch (err) {
  console.error("Ошибка при AI редактировании:", err);
} finally {
  setUserAiPrompt('');
  setLoading(false);
}


    };
    console.log(userAiPrompt.trim() ? true : false)

    return ( <div className="relative m-4 border border-gray-700 rounded-lg overflow-hidden shadow-xl">
        {/* AI-инпут всегда закреплён */} <div className="absolute top-2 right-2 z-50 bg-white text-black px-3 py-2 rounded-lg shadow-md flex gap-2 items-center"> <Sparkles className="h-4 w-4" />
        <Input
            value={userAiPrompt}
            onChange={(e) => setUserAiPrompt(e.target.value)}
            disabled={loading}
            placeholder="редактируйте с ИИ"
            className="w-52"
        />
        <Button
            onClick={handleAiChange}
            disabled={loading || !userAiPrompt.trim()}
            size="sm"
            variant="ghost"
        >
            {loading ? <Loader2Icon className="animate-spin" /> : <ArrowRight />} </Button> </div>


        <iframe
            ref={iframeRef}
            className="w-full h-[140vh] flex items-center justify-center bg-black"
            sandbox="allow-scripts allow-same-origin allow-forms"
        />
    </div>


);
};

export default SliderFrame;
