import {
    redirect,
} from "next/navigation";

import {
    getAdminSession,
} from "@/lib/admin-auth";

import AdminLoginForm from "@/components/auth/AdminLoginForm";

export default async function AdminLoginPage() {
    const session =
        await getAdminSession();

    if (session) {
        redirect(
            "/admin/dashboard"
        );
    }

    return (
        <main className="min-h-screen bg-background">
            <AdminLoginForm />
        </main>
    );
}