"use server";

import { revalidatePath } from "next/cache";

import { api, fetchMutation } from "@/lib/convex-server";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";

const ProjectSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2, "Title must be at least 2 characters")
        .max(100, "Title cannot exceed 100 characters"),

    slug: z
        .string()
        .trim()
        .min(2, "Slug must be at least 2 characters")
        .max(120, "Slug cannot exceed 120 characters"),

    description: z
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters")
        .max(2000, "Description cannot exceed 2000 characters"),

    techStack: z
        .string()
        .trim()
        .min(1, "At least one technology is required"),

    github: z
        .string()
        .trim()
        .url("Invalid GitHub URL")
        .optional()
        .or(z.literal("")),

    liveDemo: z
        .string()
        .trim()
        .url("Invalid live demo URL")
        .optional()
        .or(z.literal("")),

    mediaType: z.enum([
        "IMAGE",
        "VIDEO",
    ]),

    mediaStorageId: z
        .string()
        .min(1, "Project media is required"),

    type: z.enum([
        "GEN_AI",
        "WEB_DEVELOPMENT",
        "MOBILE_APP",
        "FULL_STACK",
        "E_COMMERCE",
        "SAAS",
        "OTHER",
    ]),

    isFeatured: z.coerce.boolean(),

    isActive: z.coerce.boolean(),
});

function createSlug(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function parseProject(formData: FormData) {
    const title = String(
        formData.get("title") ?? "",
    );

    return ProjectSchema.parse({
        title,

        // Automatically generated from the project title.
        slug: createSlug(title),

        description: String(
            formData.get("description") ?? "",
        ),

        // Keep this as a string.
        // We convert it to an array only before sending
        // it to Convex.
        techStack: String(
            formData.get("techStack") ?? "",
        ).trim(),

        github:
            String(
                formData.get("github") ?? "",
            ).trim(),

        liveDemo:
            String(
                formData.get("liveDemo") ?? "",
            ).trim(),

        mediaType:
            formData.get("mediaType"),

        mediaStorageId:
            String(
                formData.get("mediaStorageId") ?? "",
            ).trim(),

        type:
            formData.get("type"),

        isFeatured:
            formData.get("isFeatured") === "true",

        isActive:
            formData.get("isActive") === "true",
    });
}

function parseTechStack(
    value: string,
) {
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

export async function createProject(
    formData: FormData,
) {
    await requireAdmin();

    const data =
        parseProject(formData);

    const techStack =
        parseTechStack(data.techStack);

    await fetchMutation(
        api.projects.create,
        {
            title: data.title,

            slug: data.slug,

            description:
                data.description,

            techStack,

            github:
                data.github || undefined,

            liveDemo:
                data.liveDemo || undefined,

            mediaType:
                data.mediaType,

            mediaStorageId:
                data.mediaStorageId as any,

            type:
                data.type,

            isFeatured:
                data.isFeatured,

            isActive:
                data.isActive,
        },
    );

    revalidatePath(
        "/admin/dashboard/projects",
    );

    revalidatePath("/");

    return {
        success: true,
    };
}

export async function updateProject(
    id: string,
    formData: FormData,
) {
    await requireAdmin();

    const data =
        parseProject(formData);

    const techStack =
        parseTechStack(data.techStack);

    await fetchMutation(
        api.projects.update,
        {
            id: id as any,

            title: data.title,

            slug: data.slug,

            description:
                data.description,

            techStack,

            github:
                data.github || undefined,

            liveDemo:
                data.liveDemo || undefined,

            mediaType:
                data.mediaType,

            mediaStorageId:
                data.mediaStorageId as any,

            type:
                data.type,

            isFeatured:
                data.isFeatured,

            isActive:
                data.isActive,
        },
    );

    revalidatePath(
        "/admin/dashboard/projects",
    );

    revalidatePath("/");

    revalidatePath(
        `/projects/${data.slug}`,
    );

    return {
        success: true,
    };
}

export async function deleteProject(
    id: string,
) {
    await requireAdmin();

    await fetchMutation(
        api.projects.remove,
        {
            id: id as any,
        },
    );

    revalidatePath(
        "/admin/dashboard/projects",
    );

    revalidatePath("/");

    return {
        success: true,
    };
}