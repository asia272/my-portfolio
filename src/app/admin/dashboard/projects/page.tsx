import Link from "next/link";

import { Plus } from "lucide-react";

import {
    api,
    fetchQuery,
} from "@/lib/convex-server";

import ProjectTable from "@/components/admin/ProjectTable";

export default async function AdminProjectsPage() {
    const projects = await fetchQuery(
        api.projects.getAll,
        {},
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 text-sm font-medium text-primary">
                        Portfolio
                    </p>

                    <h1 className="text-3xl font-semibold tracking-tight">
                        Projects
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Create, edit and manage your portfolio projects.
                    </p>
                </div>

                <Link
                    href="/admin/dashboard/projects/new"
                    className="custom-btn"
                >
                    <Plus className="size-4" />
                    New project
                </Link>
            </div>

            {/* Projects */}
            <ProjectTable projects={projects} />
        </div>
    );
}