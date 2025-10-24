// convex/users.ts
import { v } from 'convex/values'
import { action, mutation, query } from "./_generated/server";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export const createUser = mutation({
    args: {
        email: v.string(),
        name: v.string(),
        password: v.string(),
        image: v.optional(v.string()), // добавляем опциональное поле image
    },
    handler: async (ctx, args) => {
        const userId = uuidv4();
        console.log(userId);

        const userData = {
            ...args,
            image: args.image ?? null,
            createdAt: Date.now(),
            userId: userId,
            isPrem: false,
            usedAttempts: 5,
        };

        return await ctx.db.insert("users", userData);
    },
});

export const getUserByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
    },
});

export const syncUser = mutation({
    args: {
        name: v.string(),
        email: v.optional(v.string()),
        userId: v.string(),
        image: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();

        if (existingUser) return;

        const userData = {
            ...args,
            image: args.image?? null,
            createdAt: Date.now(),
            isPrem: false,
            usedAttempts: 5,
            password: "", // добавляем обязательное поле password
        };

        return await ctx.db.insert('users', userData);
    }
});

export const updateUser = mutation({
    args: {
        userId: v.string(),
        email: v.optional(v.string()),
        name: v.optional(v.string()),
        image: v.optional(v.string()),
    },
    handler: async(ctx, args) => {
        const user = await ctx.db.query('users').withIndex('by_user_id', (q) => q.eq('userId', args.userId)).first();

        if (!user) throw new Error('User is not found in db');

        await ctx.db.patch(user._id, {
            ...(args.email && { email: args.email }),
            ...(args.name && { name: args.name }),
            ...(args.image && { image: args.image })
        });
    }
});

export const removeUser = mutation({
    args: {
        userId: v.string()
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query('users')
            .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
            .first();

        if (user) {
            await ctx.db.delete(user._id);
        }
    }
});

export const getUsers = query({
    handler: async (ctx) => {
        const me = await ctx.auth.getUserIdentity();
        const users = await ctx.db.query('users').collect();
        return users;
    }
});

export const getUserByUserId = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db.query('users').withIndex('by_user_id', (q) => q.eq('userId', args.userId)).first();
        return user!;
    }
});

export const listUsers = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query('users').collect();
    }
});

export const updateUserProfile = mutation({
    args: {
        userId: v.string(),
        name: v.optional(v.string()),
        image: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();

        if (!user) throw new Error("User not found");

        return await ctx.db.patch(user._id, {
            ...(args.name && { name: args.name }),
            ...(args.image && { image: args.image }),
        });
    },
});

export const upgradeToPrem = mutation({
    args: {
        email: v.string(),
        lemonSqueezyCustomerId: v.string(),
        lemonSqueezyOrderId: v.string(),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        console.log(args.email);

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (!user) throw new Error("User not found");

        await ctx.db.patch(user._id, {
            isPrem: true,
            proSince: Date.now(),
            lemonSqueezyCustomerId: args.lemonSqueezyCustomerId,
            lemonSqueezyOrderId: args.lemonSqueezyOrderId,
        });

        return { success: true };
    },
});

export const decreaseAttempts = mutation({
    args: {
        userId: v.string()
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();

        if (!user) throw new Error("User not found");

        const currentAttempts = user.usedAttempts ?? 5;
        const newAttempts = Math.max(0, currentAttempts - 1);

        await ctx.db.patch(user._id, {
            usedAttempts: newAttempts
        });

        return newAttempts;
    }
});