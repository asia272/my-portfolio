import {
    fetchQuery,
} from "@/lib/convex-server";

import {
    api,
} from "@/lib/convex-server";

export default async function AdminDashboardPage() {
    const projects =
        await fetchQuery(
            api.projects.getAll,
            {}
        );

    const active =
        projects.filter(
            (project) =>
                project.isActive
        ).length;

    const featured =
        projects.filter(
            (project) =>
                project.isFeatured
        ).length;

    return (
        <div className="space-y-8">
            <div>
                <p className="mb-2 text-sm font-medium text-primary">
                    Overview
                </p>

                <h1 className="text-3xl font-semibold tracking-tight">
                    Dashboard
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Manage the projects displayed on your portfolio.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-6">
                    <p className="text-sm text-muted-foreground">
                        Total projects
                    </p>

                    <p className="mt-2 text-3xl font-semibold">
                        {projects.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                    <p className="text-sm text-muted-foreground">
                        Active
                    </p>

                    <p className="mt-2 text-3xl font-semibold">
                        {active}
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                    <p className="text-sm text-muted-foreground">
                        Featured
                    </p>

                    <p className="mt-2 text-3xl font-semibold">
                        {featured}
                    </p>
                </div>
            </div>
        </div>
    );
}