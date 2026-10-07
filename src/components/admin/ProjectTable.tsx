"use client";

import Link from "next/link";

import {
    Pencil,
    Trash2,
    Star,
} from "lucide-react";

import { toast } from "react-hot-toast";

import {
    deleteProject,
} from "@/actions/project.actions";

interface Project {
    _id: string;
    title: string;
    type: string;
    mediaType: "IMAGE" | "VIDEO";
    isFeatured: boolean;
    isActive: boolean;
}

interface ProjectTableProps {
    projects: Project[];
}

export default function ProjectTable({
    projects,
}: ProjectTableProps) {
    async function handleDelete(id: string) {
        const confirmed = window.confirm(
            "Delete this project permanently?",
        );

        if (!confirmed) {
            return;
        }

        const toastId = toast.loading("Deleting project...");

        try {
            await deleteProject(id);

            toast.success("Project deleted successfully.", {
                id: toastId,
            });

            window.location.reload();
        } catch (error) {
            console.error("Delete project error:", error);

            toast.error(
                "Failed to delete project. Please try again.",
                {
                    id: toastId,
                },
            );
        }
    }

    if (!projects.length) {
        return (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <p className="font-medium">
                    No projects yet.
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                    Create your first project to get started.
                </p>

                <Link
                    href="/admin/dashboard/projects/new"
                    className="custom-btn mt-6 inline-flex"
                >
                    Create project
                </Link>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border text-left">
                            <th className="px-6 py-4 font-medium">
                                Project
                            </th>

                            <th className="px-6 py-4 font-medium">
                                Type
                            </th>

                            <th className="px-6 py-4 font-medium">
                                Media
                            </th>

                            <th className="px-6 py-4 font-medium">
                                Status
                            </th>

                            <th className="px-6 py-4 text-right font-medium">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {projects.map((project) => (
                            <tr
                                key={project._id}
                                className="border-b border-border last:border-0"
                            >
                                {/* Project */}
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        {project.isFeatured && (
                                            <Star
                                                className="size-4 shrink-0 fill-current text-primary"
                                                aria-label="Featured project"
                                            />
                                        )}

                                        <div className="min-w-0">
                                            <p className="truncate font-medium">
                                                {project.title}
                                            </p>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {project.mediaType ===
                                                    "IMAGE"
                                                    ? "Image project"
                                                    : "Video project"}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Type */}
                                <td className="px-6 py-5">
                                    <span className="text-muted-foreground">
                                        {formatProjectType(
                                            project.type,
                                        )}
                                    </span>
                                </td>

                                {/* Media */}
                                <td className="px-6 py-5">
                                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                                        {project.mediaType}
                                    </span>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-5">
                                    <span
                                        className={
                                            project.isActive
                                                ? "rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                                : "rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground"
                                        }
                                    >
                                        {project.isActive
                                            ? "Active"
                                            : "Hidden"}
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-5">
                                    <div className="flex justify-end gap-2">
                                        {/* Edit */}
                                        <Link
                                            href={`/admin/dashboard/projects/${project._id}/edit`}
                                            aria-label={`Edit ${project.title}`}
                                            className="flex size-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-secondary"
                                        >
                                            <Pencil className="size-4" />
                                        </Link>

                                        {/* Delete */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    project._id,
                                                )
                                            }
                                            aria-label={`Delete ${project.title}`}
                                            className="flex size-9 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function formatProjectType(type: string) {
    switch (type) {
        case "GEN_AI":
            return "Gen AI";

        case "WEB_DEVELOPMENT":
            return "Web Development";

        case "MOBILE_APP":
            return "Mobile App";

        case "FULL_STACK":
            return "Full Stack";

        case "E_COMMERCE":
            return "E-Commerce";

        case "SAAS":
            return "SaaS";

        case "OTHER":
            return "Other";

        default:
            return type;
    }
}