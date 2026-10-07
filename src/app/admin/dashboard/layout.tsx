import {
    redirect,
} from "next/navigation";

import {
    requireAdmin,
} from "@/lib/admin-auth";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAdmin();

    return (
        <div className="min-h-screen bg-background">
            <div className="flex min-h-screen">
                <AdminSidebar />

                <div className="min-w-0 flex-1">
                    <AdminHeader />

                    <main className="p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}