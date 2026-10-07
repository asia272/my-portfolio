"use client";

import Link from "next/link";

import {
    FolderKanban,
    LayoutDashboard,
} from "lucide-react";

export default function AdminSidebar() {
    return (
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
            <div className="sticky top-0 flex h-screen flex-col">
                <div className="border-b border-border p-6">
                    <div className="text-lg font-semibold">
                        Asia<span className="text-primary">.</span>Admin
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Portfolio management
                    </p>
                </div>

                <nav className="flex-1 space-y-2 p-4">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-secondary"
                    >
                        <LayoutDashboard className="size-4" />
                        Dashboard
                    </Link>

                    <Link
                        href="/admin/dashboard/projects"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-secondary"
                    >
                        <FolderKanban className="size-4" />
                        Projects
                    </Link>
                </nav>
            </div>
        </aside>
    );
}