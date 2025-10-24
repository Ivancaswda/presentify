'use client';
import {ConvexReactClient, ConvexProvider, useQuery} from "convex/react";
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { api } from "../../convex/_generated/api";

type User = {
    id: string;
    name: string;
    userId: string;
    email: string;
    image?: string;
    user_id: string;
    isPrem?: boolean;
    usedAttempts: number
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
    isPrem: boolean;
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("token");

        if (stored) {
            try {
                const decoded = jwtDecode<User>(stored);
                setToken(stored);
                setUser(decoded);
            } catch (e) {
                console.error("Ошибка декодирования JWT:", e);
                localStorage.removeItem("token");
            }
        }
        setIsLoading(false);
    }, []);

    const convexUser = useQuery(api.users.getUserByUserId, { userId: user?.userId ?? "" });

    useEffect(() => {
        if (convexUser) {
            setUser((prev) => ({
                ...prev!,
                ...convexUser,
            }));
        }
    }, [convexUser]);

    const login = (newToken: string) => {
        localStorage.setItem("token", newToken);
        const decoded = jwtDecode<User>(newToken);
        setToken(newToken);
        setUser(decoded);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };
    const remainingAttempts = user?.usedAttempts ?? 5;
    const maxAttempts = 5;
    const isPrem = user?.isPrem ?? false;

    return (
        <AuthContext.Provider value={{ user, token,setUser, isLoading, login, logout, isPrem, usedAttempts:remainingAttempts, maxAttempts }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};