
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
    createProject,
    updateProject,
} from "@/actions/project.actions";

import MediaUploader from "./MediaUploader";

type ProjectType =
    | "GEN_AI"
    | "WEB_DEVELOPMENT"
    | "MOBILE_APP"
    | "FULL_STACK"
    | "E_COMMERCE"
    | "SAAS"
    | "OTHER";

type MediaType = "IMAGE" | "VIDEO";

interface Project {
    _id: string;
    title: string;
    description: string;
    techStack: string[];
    github?: string;
    liveDemo?: string;
    mediaType: MediaType;
    mediaStorageId?: string;
    type: ProjectType;
    isFeatured: boolean;
    isActive: boolean;
}

interface Props {
    project?: Project;
}

export default function ProjectForm({ project }: Props) {
    const router = useRouter();

    const isEditing = Boolean(project);

    const [mediaStorageId, setMediaStorageId] = useState(
        project?.mediaStorageId ?? "",
    );

    const [mediaType, setMediaType] = useState<MediaType>(
        project?.mediaType ?? "IMAGE",
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const form = event.currentTarget;
            const formData = new FormData(form);

            /*
             * Convert checkbox values into
             * explicit true / false values.
             */
            const featured =
                form.querySelector<HTMLInputElement>(
                    '[name="isFeaturedCheckbox"]',
                );

            const active =
                form.querySelector<HTMLInputElement>(
                    '[name="isActiveCheckbox"]',
                );

            formData.set(
                "isFeatured",
                featured?.checked ? "true" : "false",
            );

            formData.set(
                "isActive",
                active?.checked ? "true" : "false",
            );

            /*
             * Add the uploaded Convex Storage ID.
             */
            formData.set(
                "mediaStorageId",
                mediaStorageId,
            );

            /*
             * Add the selected media type.
             */
            formData.set(
                "mediaType",
                mediaType,
            );

            if (isEditing && project) {
                await updateProject(
                    project._id,
                    formData,
                );
            } else {
                await createProject(formData);
            }

            /*
             * If the Server Action does not redirect
             * by itself, return to the projects page.
             */
            router.push(
                "/admin/dashboard/projects",
            );

            router.refresh();
        } catch (error) {
            console.error(
                "Project form error:",
                error,
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while saving the project.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto w-full max-w-5xl"
        >
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                {/* ============================================ */}
                {/* PROJECT DETAILS */}
                {/* ============================================ */}

                <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <h2 className="text-base font-semibold tracking-tight">
                            {isEditing
                                ? "Edit project"
                                : "New project"}
                        </h2>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Project details
                        </p>
                    </div>
                </div>

                <div className="space-y-5">
                    {/* Title + Type */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="title"
                                className="mb-1.5 block text-sm font-medium"
                            >
                                Title
                            </label>

                            <input
                                id="title"
                                name="title"
                                required
                                maxLength={100}
                                defaultValue={
                                    project?.title ?? ""
                                }
                                placeholder="My awesome project"
                                className="admin-input"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="type"
                                className="mb-1.5 block text-sm font-medium"
                            >
                                Type
                            </label>

                            <select
                                id="type"
                                name="type"
                                required
                                defaultValue={
                                    project?.type ??
                                    "WEB_DEVELOPMENT"
                                }
                                className="admin-input"
                            >
                                <option value="GEN_AI">
                                    Gen AI
                                </option>

                                <option value="WEB_DEVELOPMENT">
                                    Web Development
                                </option>

                                <option value="MOBILE_APP">
                                    Mobile App
                                </option>

                                <option value="FULL_STACK">
                                    Full Stack
                                </option>

                                <option value="E_COMMERCE">
                                    E-Commerce
                                </option>

                                <option value="SAAS">
                                    SaaS
                                </option>

                                <option value="OTHER">
                                    Other
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="description"
                            className="mb-1.5 block text-sm font-medium"
                        >
                            Description
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            required
                            rows={4}
                            maxLength={3000}
                            defaultValue={
                                project?.description ?? ""
                            }
                            placeholder="Describe the project..."
                            className="admin-input resize-y"
                        />
                    </div>

                    {/* Technologies */}
                    <div>
                        <label
                            htmlFor="techStack"
                            className="mb-1.5 block text-sm font-medium"
                        >
                            Technologies
                        </label>

                        <input
                            id="techStack"
                            name="techStack"
                            required
                            defaultValue={
                                project?.techStack.join(
                                    ", ",
                                ) ?? ""
                            }
                            placeholder="Next.js, TypeScript, Convex, Tailwind CSS"
                            className="admin-input"
                        />
                    </div>

                    {/* Links */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="github"
                                className="mb-1.5 block text-sm font-medium"
                            >
                                GitHub
                            </label>

                            <input
                                id="github"
                                name="github"
                                type="url"
                                defaultValue={
                                    project?.github ?? ""
                                }
                                placeholder="https://github.com/..."
                                className="admin-input"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="liveDemo"
                                className="mb-1.5 block text-sm font-medium"
                            >
                                Live Demo
                            </label>

                            <input
                                id="liveDemo"
                                name="liveDemo"
                                type="url"
                                defaultValue={
                                    project?.liveDemo ?? ""
                                }
                                placeholder="https://..."
                                className="admin-input"
                            />
                        </div>
                    </div>

                    {/* ======================================== */}
                    {/* MEDIA */}
                    {/* ======================================== */}

                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Media
                        </label>

                        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                            <div className="min-w-0">
                                <MediaUploader
                                    value={mediaStorageId}
                                    mediaType={mediaType}
                                    onChange={(
                                        storageId,
                                        type,
                                    ) => {
                                        setMediaStorageId(
                                            storageId,
                                        );

                                        setMediaType(type);
                                    }}
                                />
                            </div>

                            {/* Media Preview */}
                            <div className="overflow-hidden rounded-xl border border-border bg-secondary/30">
                                <div className="flex h-full min-h-[150px] items-center justify-center">
                                    {mediaStorageId ? (
                                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
                                            <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                                                {mediaType}
                                            </div>

                                            <p className="text-xs text-muted-foreground">
                                                Media uploaded
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="px-4 text-center text-xs text-muted-foreground">
                                            Preview will appear here
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ======================================== */}
                    {/* SETTINGS */}
                    {/* ======================================== */}

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-secondary/50">
                            <input
                                type="checkbox"
                                name="isFeaturedCheckbox"
                                defaultChecked={
                                    project?.isFeatured ??
                                    false
                                }
                                className="size-4 rounded border-border accent-[var(--primary)]"
                            />

                            <span className="text-sm font-medium">
                                Featured
                            </span>
                        </label>

                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-secondary/50">
                            <input
                                type="checkbox"
                                name="isActiveCheckbox"
                                defaultChecked={
                                    project?.isActive ??
                                    true
                                }
                                className="size-4 rounded border-border accent-[var(--primary)]"
                            />

                            <span className="text-sm font-medium">
                                Active
                            </span>
                        </label>
                    </div>
                </div>

                {/* ============================================ */}
                {/* ERROR */}
                {/* ============================================ */}

                {error && (
                    <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {/* ============================================ */}
                {/* ACTIONS */}
                {/* ============================================ */}

                <div className="mt-6 flex flex-col-reverse justify-end gap-3 border-t border-border pt-5 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={loading}
                        className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !mediaStorageId
                        }
                        className="custom-btn"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />

                                {isEditing
                                    ? "Updating..."
                                    : "Creating..."}
                            </>
                        ) : isEditing ? (
                            "Update project"
                        ) : (
                            "Create project"
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}