"use client";

import {
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    Mail,
    ShieldCheck,
    Loader2,
} from "lucide-react";

import {
    sendAdminOtp,
} from "@/actions/admin-auth.actions";

export default function AdminLoginForm() {
    const router =
        useRouter();

    const [email, setEmail] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setLoading(true);
        setError("");
        setMessage("");

        const formData =
            new FormData();

        formData.set(
            "email",
            email
        );

        const result =
            await sendAdminOtp(
                formData
            );

        setLoading(false);

        if (!result.success) {
            setError(
                result.message
            );
            return;
        }

        setMessage(
            result.message
        );

        router.push(
            `/admin/login/verify?email=${encodeURIComponent(
                email
            )}`
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">
                    <div className="mb-8">
                        <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <ShieldCheck className="size-6" />
                        </div>

                        <h1 className="text-2xl font-semibold">
                            Admin Access
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Enter your admin email to receive a secure verification code.
                        </p>
                    </div>

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="space-y-5"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Admin email
                            </label>

                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="admin@example.com"
                                    className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 outline-none transition focus:border-primary"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">
                                {error}
                            </p>
                        )}

                        {message && (
                            <p className="text-sm text-primary">
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="custom-btn w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    Send verification code
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}