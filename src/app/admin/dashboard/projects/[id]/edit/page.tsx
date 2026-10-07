import { notFound } from "next/navigation";
import { Id } from "../../../../../../../convex/_generated/dataModel";

import {
    api,
    fetchQuery,
} from "@/lib/convex-server";

import ProjectForm from "@/components/admin/ProjectForm";

interface EditProjectPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditProjectPage({
    params,
}: EditProjectPageProps) {
    const { id } = await params;

    const project = await fetchQuery(
        api.projects.getById,
        {
            id: id as Id<"projects">,
        },
    );

    if (!project) {
        notFound();
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <p className="mb-2 text-sm font-medium text-primary">
                    Portfolio
                </p>

                <h1 className="text-3xl font-semibold tracking-tight">
                    Edit Project
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Update your project information, links,
                    media and visibility settings.
                </p>
            </div>

            {/* Form */}
            <ProjectForm
                project={project}
            />
        </div>
    );
}