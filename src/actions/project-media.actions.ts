"use server";

import {
    fetchMutation,
} from "@/lib/convex-server";

import {
    api,
} from "@/lib/convex-server";

import {
    requireAdmin,
} from "@/lib/admin-auth";

export async function generateProjectUploadUrl() {
    await requireAdmin();

    return await fetchMutation(
        api.projects
            .generateUploadUrl,
        {}
    );
}