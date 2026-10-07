import { v } from "convex/values";
import {
    mutation,
    query,
} from "./_generated/server";

const mediaType = v.union(
    v.literal("IMAGE"),
    v.literal("VIDEO")
);

const projectType = v.union(
    v.literal("GEN_AI"),
    v.literal("WEB_DEVELOPMENT"),
    v.literal("MOBILE_APP"),
    v.literal("FULL_STACK"),
    v.literal("E_COMMERCE"),
    v.literal("SAAS"),
    v.literal("OTHER")
);

export const getAll = query({
    args: {},

    handler: async (ctx) => {
        return await ctx.db
            .query("projects")
            .order("desc")
            .collect();
    },
});

export const getActive = query({
    args: {},

    handler: async (ctx) => {
        return await ctx.db
            .query("projects")
            .filter((q) =>
                q.eq(q.field("isActive"), true)
            )
            .order("desc")
            .collect();
    },
});

export const getById = query({
    args: {
        id: v.id("projects"),
    },

    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        slug: v.string(),
        description: v.string(),
        techStack: v.array(v.string()),
        github: v.optional(v.string()),
        liveDemo: v.optional(v.string()),
        mediaType,
        mediaStorageId: v.id("_storage"),
        type: projectType,
        isFeatured: v.boolean(),
        isActive: v.boolean(),
    },

    handler: async (ctx, args) => {
        const now = Date.now();

        return await ctx.db.insert("projects", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("projects"),

        title: v.string(),
        slug: v.string(),
        description: v.string(),

        techStack: v.array(v.string()),

        github: v.optional(v.string()),
        liveDemo: v.optional(v.string()),

        mediaType,

        mediaStorageId: v.id("_storage"),

        type: projectType,

        isFeatured: v.boolean(),
        isActive: v.boolean(),
    },

    handler: async (ctx, args) => {
        const {
            id,
            ...data
        } = args;

        const existing = await ctx.db.get(id);

        if (!existing) {
            throw new Error("Project not found.");
        }

        if (
            existing.mediaStorageId !==
            data.mediaStorageId
        ) {
            if (existing.mediaStorageId) {
                await ctx.storage.delete(existing.mediaStorageId);
            }
        }

        await ctx.db.patch(id, {
            ...data,
            updatedAt: Date.now(),
        });

        return id;
    },
});

export const remove = mutation({
    args: {
        id: v.id("projects"),
    },

    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.id);

        if (!project) {
            throw new Error("Project not found.");
        }

        if (project.mediaStorageId) {
            await ctx.storage.delete(project.mediaStorageId);
        }

        await ctx.db.delete(args.id);

        return true;
    },
});

export const generateUploadUrl = mutation({
    args: {},

    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});