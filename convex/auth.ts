
import { v4 as uuidv4 } from 'uuid';
import {action} from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

import {internal, api} from "./_generated/api";

const registerHandler = async (ctx:any, args:any) => {
    const userExists = await ctx.runQuery(api.authInternal.findUserByEmail, {
        email: args.email,
    });

    if (userExists) throw new Error("Email already registered");

    const hashed = await bcrypt.hash(args.password, 10);
    const userId = uuidv4();

    const dbId:any = await ctx.runMutation(api.authInternal._createUser, {
        name: args.name,
        email: args.email,
        password: hashed,
        image: args.image,
        createdAt: Date.now(),
        userId,
        usedAttempts: 5,
        isPrem: false
    });

    return {
        id: dbId,
        userId,
        name: args.name,
        email: args.email,
        image: args.image ?? null,
        isPrem: false,
        usedAttempts: 5,
    };
};

export const registerUser = action({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
        image: v.optional(v.string()),
        isPrem: v.optional(v.boolean()),
        usedAttempts: v.optional(v.number()),

    },
    handler: registerHandler,
});

export const login = action({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const user:any = await ctx.runQuery(api.authInternal.findUserByEmail, {
            email: args.email,
        });

        if (!user) throw new Error("User not found");

        const isValid = await bcrypt.compare(args.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            image: user.image ?? null,
        };
    },
})

