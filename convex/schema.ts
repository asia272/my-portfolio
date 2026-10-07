import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const projectType = v.union(
    v.literal("GEN_AI"),
    v.literal("WEB_DEVELOPMENT"),
    v.literal("MOBILE_APP"),
    v.literal("FULL_STACK"),
    v.literal("E_COMMERCE"),
    v.literal("SAAS"),
    v.literal("OTHER"),
);

const mediaType = v.union(
    v.literal("IMAGE"),
    v.literal("VIDEO"),
);

export default defineSchema({
    // ============================================================
    // ADMIN OTP CHALLENGES
    // ============================================================

    adminOtpChallenges: defineTable({
        email: v.string(),

        // SHA-256 hash of the 6-digit OTP.
        // Never store the actual OTP.
        otpHash: v.string(),

        // OTP expiration timestamp.
        expiresAt: v.number(),

        // Number of failed verification attempts.
        attempts: v.number(),

        // Used for resend cooldown / rate limiting.
        createdAt: v.number(),

        // Last time an OTP was sent.
        lastSentAt: v.number(),
    }).index("by_email", ["email"]),


    adminSessions: defineTable({
        email: v.string(),

        tokenHash: v.string(),

        // Session expiration timestamp.
        expiresAt: v.number(),

        createdAt: v.number(),
    }).index("by_tokenHash", ["tokenHash"]),


    projectUploadIntents: defineTable({
        sessionTokenHash: v.string(),

        mediaType,

        // Storage ID is added after the browser successfully uploads.
        storageId: v.optional(v.id("_storage")),
        slug: v.string(),
        used: v.boolean(),

        createdAt: v.number(),
    })
        .index("by_session", ["sessionTokenHash"])
        .index("by_storage", ["storageId"]),

    // ============================================================
    // PROJECTS
    // ============================================================
    projects: defineTable({
        title: v.string(),

        slug: v.string(),

        description: v.string(),

        techStack: v.array(
            v.string(),
        ),

        github: v.optional(
            v.string(),
        ),

        liveDemo: v.optional(
            v.string(),
        ),

        mediaType: v.union(
            v.literal("IMAGE"),
            v.literal("VIDEO"),
        ),

        mediaStorageId: v.optional(
            v.id("_storage"),
        ),

        type: v.union(
            v.literal("GEN_AI"),
            v.literal("WEB_DEVELOPMENT"),
            v.literal("MOBILE_APP"),
            v.literal("FULL_STACK"),
            v.literal("E_COMMERCE"),
            v.literal("SAAS"),
            v.literal("OTHER"),
        ),

        isFeatured: v.boolean(),

        isActive: v.boolean(),

        createdAt: v.float64(),

        updatedAt: v.float64(),
    }),
});