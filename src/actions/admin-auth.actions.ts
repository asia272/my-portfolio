"use server";

import {
    cookies,
} from "next/headers";

import {
    redirect,
} from "next/navigation";

import {
    api,
    fetchMutation,
} from "@/lib/convex-server";

import {
    generateOtp,
    generateSessionToken,
    hashValue,
} from "@/lib/otp";

import {
    sendAdminOtpEmail,
} from "@/lib/brevo";

import {
    SESSION_COOKIE,
} from "@/lib/admin-auth";

export async function sendAdminOtp(
    formData: FormData,
) {
    const email = String(
        formData.get("email") ?? "",
    )
        .trim()
        .toLowerCase();

    const adminEmail = process.env.ADMIN_EMAIL
        ?.trim()
        .toLowerCase();

    if (!email) {
        return {
            success: false,
            message:
                "Email address is required.",
        };
    }

    if (!adminEmail || email !== adminEmail) {
        return {
            success: false,
            message:
                "This email is not authorized.",
        };
    }

    const otp = generateOtp();
    const otpHash = hashValue(otp);
    const now = Date.now();

    try {
        const result = await fetchMutation(
            api.adminAuth.createOtpChallenge,
            {
                email,
                otpHash,
                now,
            },
        );

        if (!result.ok) {
            if (result.reason === "COOLDOWN") {
                return {
                    success: false,
                    message: `Please wait ${result.retryAfter} seconds before requesting another code.`,
                };
            }

            return {
                success: false,
                message:
                    "Unable to create verification request.",
            };
        }

        try {
            await sendAdminOtpEmail({
                otp,
            });
        } catch (error) {
            console.error(
                "BREVO OTP ERROR:",
                error,
            );

            // Remove the challenge if the email
            // could not actually be sent.
            await fetchMutation(
                api.adminAuth.cancelOtpChallenge,
                {
                    email,
                },
            );

            return {
                success: false,
                message:
                    "Unable to send verification email.",
            };
        }

        return {
            success: true,
            message:
                "Verification code sent.",
        };
    } catch (error) {
        console.error(
            "SEND ADMIN OTP ERROR:",
            error,
        );

        return {
            success: false,
            message:
                "Unable to send verification code.",
        };
    }
}

export async function verifyAdminOtp(
    formData: FormData,
) {
    const email = String(
        formData.get("email") ?? "",
    )
        .trim()
        .toLowerCase();

    const otp = String(
        formData.get("otp") ?? "",
    ).trim();

    const adminEmail = process.env.ADMIN_EMAIL
        ?.trim()
        .toLowerCase();

    if (!email || !otp) {
        return {
            success: false,
            message:
                "Email and verification code are required.",
        };
    }

    if (!adminEmail || email !== adminEmail) {
        return {
            success: false,
            message:
                "This email is not authorized.",
        };
    }

    if (!/^\d{6}$/.test(otp)) {
        return {
            success: false,
            message:
                "Enter a valid 6-digit code.",
        };
    }

    const otpHash = hashValue(otp);

    const sessionToken =
        generateSessionToken();

    const sessionTokenHash =
        hashValue(sessionToken);

    try {
        const result = await fetchMutation(
            api.adminAuth.verifyOtp,
            {
                email,
                otpHash,
                sessionTokenHash,
                now: Date.now(),
            },
        );

        if (!result.ok) {
            switch (result.reason) {
                case "INVALID_CODE":
                    return {
                        success: false,
                        message:
                            result.attemptsRemaining !==
                                undefined
                                ? `Incorrect verification code. ${result.attemptsRemaining} attempts remaining.`
                                : "Incorrect verification code.",
                    };

                case "TOO_MANY_ATTEMPTS":
                    return {
                        success: false,
                        message:
                            "Too many attempts. Request a new code.",
                    };

                case "INVALID_OR_EXPIRED":
                default:
                    return {
                        success: false,
                        message:
                            "Invalid or expired verification code. Request a new code.",
                    };
            }
        }

        const cookieStore =
            await cookies();

        cookieStore.set(
            SESSION_COOKIE,
            sessionToken,
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV ===
                    "production",
                sameSite: "lax",
                path: "/",
                maxAge:
                    7 * 24 * 60 * 60,
            },
        );

        redirect(
            "/admin/dashboard",
        );
    } catch (error) {
        /*
         * Next.js redirect() throws internally.
         * Re-throw it so the redirect is not swallowed.
         */
        throw error;
    }
}

export async function logoutAdmin() {
    const cookieStore =
        await cookies();

    const token =
        cookieStore.get(
            SESSION_COOKIE,
        )?.value;

    if (token) {
        try {
            await fetchMutation(
                api.adminAuth.deleteSession,
                {
                    tokenHash:
                        hashValue(token),
                },
            );
        } catch (error) {
            console.error(
                "LOGOUT SESSION ERROR:",
                error,
            );
        }
    }

    cookieStore.delete(
        SESSION_COOKIE,
    );

    redirect(
        "/admin/login",
    );
}