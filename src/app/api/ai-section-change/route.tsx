import { NextRequest, NextResponse } from "next/server";
import getServerUser from "@/lib/auth-server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

export async function POST(req: NextRequest) {
    try {
        const { oldHTML, userAiPrompt } = await req.json();
        const user = await getServerUser();

        if (!user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
Перепиши или обнови следующий HTML-код на основе пользовательской инструкции.

Инструкция пользователя: "${userAiPrompt}"

HTML-код:
${oldHTML}

Требования:
- Сохрани структуру макета;
- Используй классы TailwindCSS и Flowbite UI;
- Верни только HTML-элемент <div> (без markdown, комментариев и пояснений).
`;

        const result = await model.generateContent(prompt);
        const htmlResponse = result.response.text();

        const cleanHTML = htmlResponse
            .replace(/```html/g, "")
            .replace(/```/g, "")
            .trim();

        return NextResponse.json({ html: cleanHTML });
    } catch (err: any) {
        console.error("❌ Ошибка в /api/ai-section-change:", err.message || err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
