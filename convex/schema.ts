import {defineSchema, defineTable} from "convex/server";
import {v} from 'convex/values'
export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.optional(v.string()),
        userId: v.string(),
        password: v.optional(v.string()),
        image: v.optional(v.union(v.string(), v.null())),
        createdAt: v.optional(v.number()),
        isPrem: v.optional(v.boolean()),
        lemonSqueezyCustomerId: v.optional(v.string()),
        lemonSqueezyOrderId: v.optional(v.string()),
        proSince: v.optional(v.number()),
        usedAttempts: v.optional(v.number())

    }).index('by_user_id', ["userId"])
        .index('by_email', ['email']),
    projects: defineTable({
        projectId: v.string(),
        userInputPrompt: v.string(),
        createdBy: v.string(),
        createdAt: v.any(),
        slideCount: v.string(),
        sliders: v.optional(
            v.array(
                v.object({
                    slideNo: v.number(),
                    html: v.string(),
                    aiPrompt: v.optional(v.string()),
                })
            )
        ),
        outline: v.optional(
            v.array(
                v.object({
                    slideNo: v.any(),
                    slidePoint: v.any(),
                    outline: v.any(),
                })
            )
        ),
            designStyle: v.optional(v.object({
                styleName: v.string(),
                icon: v.string(),
                bannerImage: v.string(),
                colors: v.object({
                    primary: v.string(),
                    secondary: v.string(),
                    accent: v.string(),
                    background: v.string(),
                    gradient: v.string(),
                }),
                designGuide: v.string(),
                theme: v.string(),
            })),
        updatedAt: v.optional(v.any())
    }).index('by_project_id', ['projectId'])

})