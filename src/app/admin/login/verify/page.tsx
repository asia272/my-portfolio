import {
    redirect,
} from "next/navigation";

import AdminOtpForm from "@/components/auth/AdminOtpForm";

interface PageProps {
    searchParams: Promise<{
        email?: string;
    }>;
}

export default async function VerifyPage({
    searchParams,
}: PageProps) {
    const params =
        await searchParams;

    const email =
        params.email;

    if (!email) {
        redirect(
            "/admin/login"
        );
    }

    return (
        <main className="min-h-screen bg-background">
            <AdminOtpForm
                email={email}
            />
        </main>
    );
}