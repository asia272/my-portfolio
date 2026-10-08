
import { Education, ProcessStep, Project, Service, SkillGroup, Stat } from "@/types";
/* ------------------------------------------------------------------
   SITE CONFIG — edit the values below to personalise the website.
   Empty strings are fine: the matching UI is simply hidden.
------------------------------------------------------------------- */
export const SITE = {
    name: "Asia Ashraf",
    shortName: "Asia",
    initials: "AA",
    role: "Full-Stack Next.js Developer",
    location: "Pakistan",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    title: "Asia Ashraf — Full-Stack Next.js Developer",
    description:
        "Asia Ashraf is a Next.js full-stack developer from Pakistan who builds modern, responsive and polished web applications with React, TypeScript and Tailwind CSS.",
    // TODO: add your real contact details & profiles
    email: "",
    socials: {
        github: "",
        linkedin: "",
    },
    // TODO: put your CV in /public and set e.g. "/Asia-Ashraf-CV.pdf"
    resumeUrl: "",
} as const;

export const ROLES = [
    "Full-Stack Developer",
    "Next.js & React Engineer",
    "TypeScript Enthusiast",
    "UI / UX Minded Builder",
] as const;

export const STATS: Stat[] = [
    { label: "Years of hands-on development", value: 3, suffix: "+" },
    { label: "Major projects built", value: 4, suffix: "" },
    { label: "Technologies", value: 23, suffix: "+" },
    { label: "Commitment to quality", value: 100, suffix: "%" },
];

export const SKILL_GROUPS: SkillGroup[] = [
    {
        title: "Frontend",
        description:
            "Clean, responsive, accessible interfaces with careful typography, spacing and motion.",
        icon: "layout",
        skills: [
            "Next.js",
            "React",
            "TypeScript",
            "Tailwind CSS",
            "shadcn/ui",
            "UI & Animation Libraries",
        ],
    },
    {
        title: "Backend & Data",
        description:
            "Reliable APIs, validated data and well-structured databases behind every interface.",
        icon: "database",
        skills: ["Prisma", "PostgreSQL", "Neon", "Convex", "REST APIs", "Server Actions"],
    },
    {
        title: "Auth & Security",
        description:
            "Secure sign-in flows, from managed providers to fully custom session handling.",
        icon: "lock",
        skills: ["Better Auth", "Clerk", "HttpOnly Sessions", "scrypt Hashing", "OTP Verification"],
    },
    {
        title: "Services & Deployment",
        description:
            "Payments, media handling and production deployments wired up end to end.",
        icon: "rocket",
        skills: ["Stripe", "Cloudinary", "File Uploads", "Vercel"],
    },
];

export const MARQUEE_TECH = [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Prisma",
    "PostgreSQL",
    "Neon",
    "Convex",
    "Stripe",
    "Cloudinary",
    "Better Auth",
    "Clerk",
    "shadcn/ui",
    "Vercel",
] as const;

export const PROJECTS: Project[] = [
    {
        title: "Full-Stack E-Commerce Platform",
        summary:
            "A complete online store with secure authentication, card payments, media management and a polished, responsive storefront.",
        highlights: [
            "Authentication with Better Auth",
            "Stripe payment integration",
            "Image uploads through Cloudinary",
            "Typed data layer with Prisma + Neon PostgreSQL",
        ],
        tags: [
            "Next.js",
            "TypeScript",
            "Prisma",
            "PostgreSQL",
            "Neon",
            "Better Auth",
            "Stripe",
            "Cloudinary",
            "shadcn/ui",
            "Tailwind CSS",
        ],
        icon: "card",
        accent: "purple",
        status: "Completed",
        featured: true,
        image: "/images/projects/my-project.png",
    },
    {
        title: "WhatsApp-Style Chat App",
        summary:
            "A familiar messaging experience with authentication, a conversation UI and a Convex-powered backend.",
        highlights: ["Clerk authentication", "Convex backend & data", "Component-driven UI"],
        tags: ["Next.js", "Clerk", "Convex", "shadcn/ui"],
        icon: "message",
        accent: "gold",
        status: "Completed",
        image: "/images/projects/my-project.png",
    },
    {
        title: "Custom Authentication System",
        summary:
            "An authentication flow built from the ground up to understand how secure sign-in really works.",
        highlights: [
            "scrypt password hashing",
            "HttpOnly cookie sessions",
            "OTP verification flow",
        ],
        tags: ["Prisma", "Neon", "scrypt", "HttpOnly Sessions", "OTP"],
        icon: "shield",
        accent: "mixed",
        status: "Completed",
        image: "/images/projects/my-project.png",
    },
    {
        title: "Full-Stack Portfolio & Admin Dashboard",
        summary:
            "A portfolio that is a real application: dynamic content, client requests, contact handling and an admin dashboard.",
        highlights: [
            "Projects, services, team & testimonials",
            "Client request and contact handling",
            "Admin dashboard for content management",
        ],
        tags: ["Next.js", "TypeScript", "Tailwind CSS", "Admin Dashboard"],
        icon: "sparkles",
        accent: "purple",
        status: "In progress",
        image: "/images/projects/my-project.png",
    },
];

export const SERVICES: Service[] = [
    {
        title: "Frontend Development",
        description:
            "Pixel-careful, responsive interfaces in React and Next.js with smooth animation and strong accessibility.",
        icon: "palette",
    },
    {
        title: "Full-Stack Web Apps",
        description:
            "End-to-end applications: database design, APIs, business logic and a frontend that feels great to use.",
        icon: "server",
    },
    {
        title: "Auth & Payments",
        description:
            "Secure authentication (Better Auth, Clerk or custom) and Stripe checkout integrated the right way.",
        icon: "shield",
    },
    {
        title: "Deployment & Polish",
        description:
            "Production-ready builds shipped to Vercel, with attention to performance, SEO and the last 10% of detail.",
        icon: "rocket",
    },
];

export const PROCESS: ProcessStep[] = [
    { title: "Understand", description: "Clarify the idea, goals and requirements together." },
    { title: "Design", description: "Shape a clear solution, structure and interface." },
    { title: "Build", description: "Develop the frontend and backend with clean, maintainable code." },
    { title: "Deliver", description: "Connect services, deploy and hand over a polished product." },
];

export const EDUCATION: Education[] = [
    {
        title: "BSCS — Computer Science",
        place: "Planned next step",
        period: "Upcoming",
        description: "Continuing formal education to deepen computer science fundamentals.",
    },
    {
        title: "ADP in Computer Science",
        place: "Associate Degree Program",
        period: "Completed · 4 semesters",
        description: "A solid foundation in computer science concepts and problem solving.",
    },
    {
        title: "Computer Diploma",
        place: "VTI Fort Abbas",
        period: "2022",
        description: "Where the journey into computers and web development began.",
    },
];

export const ABOUT_PARAGRAPHS = [
    "I'm Asia Ashraf, a Next.js-based full-stack developer from Pakistan. I started with a simple curiosity about how websites and applications actually work, and that curiosity turned into about three years of learning and practising development on my own, alongside my formal education in Computer Science.",
    "I believe the best way to learn programming is to build real projects, so I focus on practical work rather than theory alone. I care that an application doesn't just work — it should look professional, feel smooth and be a pleasure to use.",
    "I'm now looking for remote roles, freelance projects and junior full-stack or frontend positions where I can work with real clients and teams, keep growing, and deliver polished products from idea to deployment.",
];

export const VALUES = [
    {
        title: "Quality first",
        description: "Spacing, typography, shadows, hover states and consistency all matter to me.",
        icon: "sparkles",
    },
    {
        title: "Clean, maintainable code",
        description: "Reusable components, clear structure, validation and proper error handling.",
        icon: "wrench",
    },
    {
        title: "Persistent learner",
        description: "When something breaks I dig into why, and fix it properly.",
        icon: "globe",
    },
] as const;

