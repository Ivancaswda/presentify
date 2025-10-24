// convex/authInternal.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from 'uuid';

export const findUserById = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();
    },
});

export const findUserByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
    },
});

export const _createUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        userId: v.string(),
        password: v.string(),
        isPrem: v.optional(v.boolean()),
        usedAttempts: v.optional(v.number()),
        image: v.optional(v.string()),
        createdAt: v.number(),
    },
    handler: async (ctx, args) => {
        const userData = {
            ...args,
            image: args.image ?? null,
        };
        return await ctx.db.insert("users", userData);
    },
});

export const googleAuth = mutation({
    args: {
        email: v.string(),
        name: v.string(),
        image: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { email, name, image } = args;

        let user = await ctx.db
            .query('users')
            .withIndex('by_email', (q) => q.eq('email', email))
            .first();

        if (user) {
            // обновляем существующего пользователя
            await ctx.db.patch(user._id, {
                name,
                image: image ?? user.image,
            });
        } else {
            // создаем нового
            const userId = uuidv4();
            const userData = {
                name,
                email,
                userId,
                password: "",
                image: image ?? null,
                createdAt: Date.now(),
                isPrem: false,
                usedAttempts: 5,
            };
            const id = await ctx.db.insert('users', userData);
            user = await ctx.db.get(id);
        }

        // Получаем актуальный объект из базы, чтобы вернуть клиенту
        user = await ctx.db
            .query('users')
            .withIndex('by_email', (q) => q.eq('email', email))
            .first();

        if (!user) throw new Error("Failed to create or fetch user");

        return {
            id: user._id,
            userId: user.userId,
            name: user.name,
            email: user.email,
            image: user.image,
            isPrem: user.isPrem ?? false,
            usedAttempts: user.usedAttempts ?? 5,
        };
    }
});
