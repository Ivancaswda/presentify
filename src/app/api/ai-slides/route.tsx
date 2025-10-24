import { NextRequest, NextResponse } from "next/server";
import getServerUser from "@/lib/auth-server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY!;

const slidesPrompt = `
Создай современный слайд в тёмной цветовой теме, занимающий всю ширину и высоту экрана.
Используй TailwindCSS и Flowbite UI.
Текст должен быть лаконичным, не выходить за границы контейнера.
Избегай слишком крупных шрифтов — сохрани читаемую иерархию.
Применяй адаптивный и сбалансированный макет с аккуратными отступами и выравниванием.
Верни только HTML-элемент <div> (без markdown и комментариев).
`;

export async function POST(req: NextRequest) {
    try {
        const { messages, projectDetail } = await req.json();
        const user = await getServerUser();
        if (!user || !user.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Берём только нужные данные
        const topic = projectDetail?.topic || projectDetail?.userInputPrompt || "AI presentation";
        const slideInfo = messages?.[0]?.content || "Default slide";

        const prompt = `
${slidesPrompt}

Project topic: "${topic}"
Slide info: "${slideInfo}"
`;

        const result = await model.generateContent(prompt);
        let htmlResponse = result.response.text()
            .replace(/```html/g, "")
            .replace(/```/g, "")
            .trim();
        if (!/<img/i.test(htmlResponse)) {
            const unsplashRes = await fetch(
                `https://api.unsplash.com/photos/random?query=${encodeURIComponent(topic)}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
            );
            const unsplashData = await unsplashRes.json();

            const imageUrl = unsplashData?.urls?.regular || null;

            if (imageUrl) {
                const imageBlock = `
          <div class="w-full mt-6 flex justify-center">
            <img src="${imageUrl}" alt="${topic}" class="rounded-xl shadow-lg max-h-[400px] object-cover" />
          </div>
        `;
                // Вставляем перед закрывающим </div> или в конец
                htmlResponse = htmlResponse.replace(/<\/div>\s*$/, `${imageBlock}</div>`);
            }
        }


        return NextResponse.json({ html: htmlResponse });
    } catch (err: any) {
        console.error("❌ Ошибка в /api/ai-slides:", err.message || err);

        // ✅ Ретраи при перегрузке
        if (err.message?.includes("overloaded")) {
            return NextResponse.json(
                { error: "Gemini перегружен, попробуйте снова через несколько секунд.", code: "MODEL_OVERLOADED" },
                { status: 503 }
            );
        }

        if (err?.response?.status === 429) {
            return NextResponse.json(
                { error: "🚦 Превышен лимит запросов API. Попробуйте позже.", code: "QUOTA_EXCEEDED" },
                { status: 429 }
            );
        }

        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
