"use client";

import {
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    ShieldCheck,
    Loader2,
} from "lucide-react";

import {
    verifyAdminOtp,
} from "@/actions/admin-auth.actions";

interface Props {
    email: string;
}

export default function AdminOtpForm({
    email,
}: Props) {
    const router =
        useRouter();

    const [otp, setOtp] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setLoading(true);
        setError("");

        const formData =
            new FormData();

        formData.set(
            "email",
            email
        );

        formData.set(
            "otp",
            otp
        );

        const result =
            await verifyAdminOtp(
                formData
            );

        setLoading(false);

        if (!result.success) {
            setError(
                result.message
            );
            return;
        }

        router.replace(
            "/admin/dashboard"
        );
        router.refresh();
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
                            Verify your identity
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Enter the 6-digit code sent to:
                        </p>

                        <p className="mt-1 break-all text-sm font-medium">
                            {email}
                        </p>
                    </div>

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="space-y-5"
                    >
                        <input
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            required
                            value={otp}
                            onChange={(event) =>
                                setOtp(
                                    event.target.value.replace(
                                        /\D/g,
                                        ""
                                    )
                                )
                            }
                            placeholder="000000"
                            className="h-16 w-full rounded-xl border border-border bg-background text-center text-2xl font-semibold tracking-[0.5em] outline-none focus:border-primary"
                        />

                        {error && (
                            <p className="text-sm text-destructive">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                otp.length !== 6
                            }
                            className="custom-btn w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify & continue"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}