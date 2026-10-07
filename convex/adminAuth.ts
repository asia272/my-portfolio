import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const OTP_EXPIRY_MS =
    10 * 60 * 1000;

const SESSION_EXPIRY_MS =
    7 * 24 * 60 * 60 * 1000;

const MAX_ATTEMPTS = 5;

const RESEND_COOLDOWN_MS =
    30 * 1000;

function assertAdminEmail(
    email: string,
) {
    const adminEmail =
        process.env.ADMIN_EMAIL
            ?.trim()
            .toLowerCase();

    if (
        !adminEmail ||
        email.trim().toLowerCase() !==
        adminEmail
    ) {
        throw new Error(
            "Unauthorized.",
        );
    }
}

export const createOtpChallenge =
    mutation({
        args: {
            email: v.string(),
            otpHash: v.string(),
            now: v.number(),
        },

        handler: async (
            ctx,
            args,
        ) => {
            assertAdminEmail(
                args.email,
            );

            const existing =
                await ctx.db
                    .query(
                        "adminOtpChallenges",
                    )
                    .withIndex(
                        "by_email",
                        (q) =>
                            q.eq(
                                "email",
                                args.email,
                            ),
                    )
                    .unique();

            if (
                existing &&
                args.now -
                existing.lastSentAt <
                RESEND_COOLDOWN_MS
            ) {
                const retryAfter =
                    Math.ceil(
                        (
                            RESEND_COOLDOWN_MS -
                            (
                                args.now -
                                existing.lastSentAt
                            )
                        ) / 1000,
                    );

                return {
                    ok: false,
                    reason:
                        "COOLDOWN",
                    retryAfter,
                };
            }

            if (existing) {
                await ctx.db.delete(
                    existing._id,
                );
            }

            await ctx.db.insert(
                "adminOtpChallenges",
                {
                    email: args.email,
                    otpHash:
                        args.otpHash,
                    expiresAt:
                        args.now +
                        OTP_EXPIRY_MS,
                    attempts: 0,
                    createdAt:
                        args.now,
                    lastSentAt:
                        args.now,
                },
            );

            return {
                ok: true,
            };
        },
    });

export const cancelOtpChallenge =
    mutation({
        args: {
            email: v.string(),
        },

        handler: async (
            ctx,
            args,
        ) => {
            assertAdminEmail(
                args.email,
            );

            const challenge =
                await ctx.db
                    .query(
                        "adminOtpChallenges",
                    )
                    .withIndex(
                        "by_email",
                        (q) =>
                            q.eq(
                                "email",
                                args.email,
                            ),
                    )
                    .unique();

            if (challenge) {
                await ctx.db.delete(
                    challenge._id,
                );
            }

            return {
                ok: true,
            };
        },
    });

export const verifyOtp =
    mutation({
        args: {
            email: v.string(),
            otpHash: v.string(),
            sessionTokenHash:
                v.string(),
            now: v.number(),
        },

        handler: async (
            ctx,
            args,
        ) => {
            assertAdminEmail(
                args.email,
            );

            const challenge =
                await ctx.db
                    .query(
                        "adminOtpChallenges",
                    )
                    .withIndex(
                        "by_email",
                        (q) =>
                            q.eq(
                                "email",
                                args.email,
                            ),
                    )
                    .unique();

            if (!challenge) {
                return {
                    ok: false,
                    reason:
                        "INVALID_OR_EXPIRED",
                };
            }

            if (
                challenge.expiresAt <=
                args.now
            ) {
                await ctx.db.delete(
                    challenge._id,
                );

                return {
                    ok: false,
                    reason:
                        "INVALID_OR_EXPIRED",
                };
            }

            if (
                challenge.attempts >=
                MAX_ATTEMPTS
            ) {
                await ctx.db.delete(
                    challenge._id,
                );

                return {
                    ok: false,
                    reason:
                        "TOO_MANY_ATTEMPTS",
                };
            }

            if (
                challenge.otpHash !==
                args.otpHash
            ) {
                const nextAttempts =
                    challenge.attempts +
                    1;

                if (
                    nextAttempts >=
                    MAX_ATTEMPTS
                ) {
                    await ctx.db.delete(
                        challenge._id,
                    );

                    return {
                        ok: false,
                        reason:
                            "TOO_MANY_ATTEMPTS",
                    };
                }

                await ctx.db.patch(
                    challenge._id,
                    {
                        attempts:
                            nextAttempts,
                    },
                );

                return {
                    ok: false,
                    reason:
                        "INVALID_CODE",
                    attemptsRemaining:
                        MAX_ATTEMPTS -
                        nextAttempts,
                };
            }

            await ctx.db.delete(
                challenge._id,
            );

            const existingSessions =
                await ctx.db
                    .query(
                        "adminSessions",
                    )
                    .withIndex(
                        "by_tokenHash",
                    )
                    .collect();

            for (
                const session of
                existingSessions
            ) {
                if (
                    session.email ===
                    args.email
                ) {
                    await ctx.db.delete(
                        session._id,
                    );
                }
            }

            await ctx.db.insert(
                "adminSessions",
                {
                    email: args.email,
                    tokenHash:
                        args.sessionTokenHash,
                    expiresAt:
                        args.now +
                        SESSION_EXPIRY_MS,
                    createdAt:
                        args.now,
                },
            );

            return {
                ok: true,
            };
        },
    });

export const validateSession =
    query({
        args: {
            tokenHash: v.string(),
        },

        handler: async (
            ctx,
            args,
        ) => {
            const session =
                await ctx.db
                    .query(
                        "adminSessions",
                    )
                    .withIndex(
                        "by_tokenHash",
                        (q) =>
                            q.eq(
                                "tokenHash",
                                args.tokenHash,
                            ),
                    )
                    .unique();

            if (!session) {
                return null;
            }

            if (
                session.expiresAt <=
                Date.now()
            ) {
                return null;
            }

            return {
                valid: true,
                email:
                    session.email,
                expiresAt:
                    session.expiresAt,
            };
        },
    });

export const deleteSession =
    mutation({
        args: {
            tokenHash: v.string(),
        },

        handler: async (
            ctx,
            args,
        ) => {
            const session =
                await ctx.db
                    .query(
                        "adminSessions",
                    )
                    .withIndex(
                        "by_tokenHash",
                        (q) =>
                            q.eq(
                                "tokenHash",
                                args.tokenHash,
                            ),
                    )
                    .unique();

            if (session) {
                await ctx.db.delete(
                    session._id,
                );
            }

            return {
                ok: true,
            };
        },
    });