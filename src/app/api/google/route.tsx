// app/api/auth/google/route.ts
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { generateToken } from "@/lib/generateToken";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
    try {
        const { access_token } = await req.json();

        if (!access_token) {
            return NextResponse.json({ error: "Missing Google access token" }, { status: 400 });
        }

        // Получаем данные пользователя от Google
        const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!googleRes.ok) {
            return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
        }

        const googleUser = await googleRes.json();
        const { email, name, picture } = googleUser;

        if (!email) {
            return NextResponse.json({ error: "Google account email is required" }, { status: 400 });
        }

        // Используем Convex mutation для создания/обновления пользователя
        const user = await convex.mutation(api.authInternal.googleAuth, {
            email,
            name: name || "Google User",
            image: picture,
        });

        console.log("Google auth user:", user);

        // Проверяем что user объект корректен
        if (!user || !user.email) {
            console.error("Invalid user object returned:", user);
            return NextResponse.json({ error: "Failed to create/update user" }, { status: 500 });
        }

        // Генерируем JWT токен
        const token = generateToken({
            email: user.email,
            userName: user.name,
            userId: user.userId,
            isPrem: user.isPrem || false,
            usedAttempts: user.usedAttempts || 5
        });

        const response = NextResponse.json({
            message: "Google login successful",
            token,
            user: {
                id: user.id,
                userId: user.userId,
                email: user.email,
                name: user.name,
                image: user.image,
                isPrem: user.isPrem || false,
                usedAttempts: user.usedAttempts || 5,
            },
        });

        // Устанавливаем cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (err) {
        console.error("❌ Google login error:", err);
        return NextResponse.json({
            error: err instanceof Error ? err.message : "Server error"
        }, { status: 500 });
    }
}