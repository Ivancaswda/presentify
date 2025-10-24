import {mutation, query} from "./_generated/server";
import {v} from 'convex/values'
export const createProject = mutation({
    args: {
        projectId: v.string(),
        userInputPrompt: v.string(),
        createdBy: v.string(),
        createdAt: v.any(),
        slideCount: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert('projects', {
            projectId: args.projectId,
            userInputPrompt: args.userInputPrompt,
            createdBy: args.createdBy,
            createdAt: args.createdAt,
            slideCount: args.slideCount,
        })
        return { success: true, projectId: args.projectId };
    }
})
export const getProjectDetails = query({
    args: {
        projectId: v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("projects")
            .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
            .first();
    }
})

export const updateProjectSlider = mutation({
    args: {
        projectId: v.id('projects'),
        designStyle: v.any(),
        outline: v.any()
    },
    handler: async (ctx, args) => {
        const project = ctx.db.get(args.projectId);
        if (!project) throw new Error("Проект не найден!");

        await ctx.db.patch(args.projectId, {
            outline:args.outline,
            designStyle: args.designStyle,
            updatedAt: Date.now(),
        })
    }
})

export const saveNewSliders = mutation({
    args: {
        projectId: v.string(),
        sliders: v.array(
                v.object({
                    slideNo: v.number(),
                    html: v.string(),
                    aiPrompt: v.optional(v.string()),
                })
            ),
    },
    handler: async (ctx, args) => {
        const project = await ctx.db
            .query("projects")
            .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
            .unique(); // вернёт объект с _id

        if (!project) throw new Error("Проект не найден!");

        await ctx.db.patch(project._id, {
            sliders: args.sliders,
            updatedAt: Date.now(),
        });

        return {success: true, count: args.sliders.length}

    }
})

export const updateSlider = mutation({
    args: {
        projectId: v.string(),        // ID проекта
        slideIndex: v.number(),       // индекс слайда в массиве sliders
        html: v.string(),             // обновленный HTML слайда
        aiPrompt: v.optional(v.string()) // опционально сохраняем prompt
    },
    handler: async (ctx, args) => {

        const project = await ctx.db
            .query("projects")
            .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
            .unique();

        if (!project) throw new Error("Проект не найден!");

        const sliders = project.sliders || [];


        sliders[args.slideIndex] = {
            ...sliders[args.slideIndex],
            html: args.html,
            ...(args.aiPrompt ? { aiPrompt: args.aiPrompt } : {})
        };


        await ctx.db.patch(project._id, {
            sliders,
            updatedAt: Date.now()
        });

        return { success: true, slideIndex: args.slideIndex };
    }
});
export const getProjectsByUser = query({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("projects")
            .filter((q) => q.eq(q.field("createdBy"), args.userId))
            .collect();
    },
});