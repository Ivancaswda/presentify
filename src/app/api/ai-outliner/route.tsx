import {NextRequest, NextResponse} from "next/server";
import getServerUser from "@/lib/auth-server";
import {GoogleGenerativeAI} from "@google/generative-ai";


import {redirect} from "next/navigation";


const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const outlinePrompt = `
Сгенерируй структуру презентации PowerPoint по теме "{userInput}".

Создай {slideCount} слайдов. Каждый слайд должен содержать:
- название темы ("slidePoint");
- краткое описание в 2 строки ("outline"), объясняющее, о чём этот слайд.

Структура презентации должна быть следующей:
1. Первый слайд — приветственный экран.
2. Второй слайд — экран с оглавлением / планом.
3. Последний слайд — экран "Спасибо за внимание".

Верни ответ строго в формате JSON следующего вида:

[
  {
    "slideNo": "",
    "slidePoint": "",
    "outline": ""
  }
]
`;
export function cleanJSON(content: string) {
    // Удаляем markdown-разметку и лишние пробелы
    return content.replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/\n/g, "")
        .replace(/\s{2,}/g, " ")
        .replace(/\r?\n|\r/g, "")
        .trim();
}

export function safeParseJSON(jsonString: string) {
    const cleaned = cleanJSON(jsonString);
    try {
        return { ok: true, data: JSON.parse(cleaned) };
    } catch (error: any) {
        return { ok: false, raw: jsonString, error: error.message };
    }
}


export async function POST(req: NextRequest) {
    try {
        const {  userInput, slideCount } = await req.json();
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: "No authorized" }, { status: 401 });
        }






        if (!user || !user.userId) {
            return NextResponse.json({ error: "No authorized"})
        }



        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        const prompt = outlinePrompt.replace('{userInput}', userInput)
            .replace('{slideCount}', slideCount)
        const fullPrompt = [
            { role: "system", content:   prompt},
        ];

        const result = await model.generateContent(fullPrompt.map(m => m.content).join("\n"));

        const parsed = safeParseJSON(result.response.text());
        if (!parsed.ok) {
            return NextResponse.json({ error: "Некорректный JSON от Gemini", raw: result.response.text() }, { status: 500 });
        }

        return NextResponse.json(parsed.data);

    } catch (err: any) {

        console.error("❌ Ошибка в /api/budget Gemini SDK:", err);


        if (err?.response?.status === 429) {
            return NextResponse.json(
                { error: "🚦 Лимит токенов на API-ключ достигнут. Попробуйте позже.", code: "QUOTA_EXCEEDED" },
                { status: 429 }
            );
        }


        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
