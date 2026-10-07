/**
 * Place at:  src/lib/projectTypes.ts
 *
 * Single source of truth for the project `type` values that exist in
 * convex/projects.ts, plus their human-readable labels.
 */

export const PROJECT_TYPE_LABELS: Record<string, string> = {
    GEN_AI: "Generative AI",
    WEB_DEVELOPMENT: "Web Development",
    MOBILE_APP: "Mobile App",
    FULL_STACK: "Full Stack",
    E_COMMERCE: "E-Commerce",
    SAAS: "SaaS",
    OTHER: "Other",
};

/** Order the types appear in the dropdown. */
export const PROJECT_TYPE_ORDER = [
    "FULL_STACK",
    "WEB_DEVELOPMENT",
    "GEN_AI",
    "SAAS",
    "E_COMMERCE",
    "MOBILE_APP",
    "OTHER",
] as const;

export const projectTypeLabel = (type?: string | null) =>
    PROJECT_TYPE_LABELS[type ?? "OTHER"] ?? "Other";