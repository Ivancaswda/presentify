// lib/jwt.ts
import jwt from 'jsonwebtoken';

export interface TokenPayload {
    email: string;
    userName: string;
    userId: string;
    isPrem?: boolean;
    usedAttempts?: number;
    image?: string;
}

export function generateToken(payload: TokenPayload): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }

    return jwt.sign(
        {
            ...payload,
            timestamp: Date.now()
        },
        secret,
        {
            expiresIn: '7d',
            issuer: 'presentify',
            audience: 'presentify-web'
        }
    );
}

export function verifyToken(token: string): TokenPayload {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }

    try {
        const decoded = jwt.verify(token, secret, {
            issuer: 'presentify',
            audience: 'presentify-web'
        }) as TokenPayload & { timestamp?: number };

        // Удаляем служебные поля если нужно
        const { timestamp, ...cleanPayload } = decoded;

        return cleanPayload as TokenPayload;
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        } else if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token expired');
        } else {
            throw new Error('Token verification failed');
        }
    }
}

// Вспомогательная функция для извлечения данных из токена без проверки
export function decodeToken(token: string): TokenPayload | null {
    try {
        const decoded = jwt.decode(token) as TokenPayload;
        return decoded;
    } catch {
        return null;
    }
}