import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin-auth";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getAdminSession();

    // Not logged in: send to login instead of throwing a server error.
    if (!session) {
        redirect("/admin/login");
    }

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