export const profile = {
  name: "Asia Ashraf",
  role: "Full-Stack Next.js Developer",
  email: "hello@example.com", // TODO: replace with your email
  github: "https://github.com/your-username", // TODO
  linkedin: "https://linkedin.com/in/your-username", // TODO
  roles: ["Next.js Developer", "React & TypeScript Engineer", "Full-Stack Builder", "UI Detail Obsessive"],
};

export const stats = [
  { value: 3, suffix: "+", label: "Years of self-driven practice" },
  { value: 4, suffix: "", label: "Major full-stack projects" },
  { value: 15, suffix: "+", label: "Technologies in daily use" },
];

export const skillGroups = [
  { title: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui", "Motion"] },
  { title: "Backend & Data", items: ["Prisma", "PostgreSQL", "Neon", "Convex", "REST APIs", "Zod validation"] },
  { title: "Auth & Services", items: ["Better Auth", "Clerk", "Stripe", "Cloudinary", "OTP & sessions", "File uploads"] },
  { title: "Delivery", items: ["Vercel", "Git & GitHub", "Responsive design", "Accessibility", "SEO basics"] },
];

export const projects = [
  {
    title: "Full-Stack E-Commerce Store",
    description: "A complete shop with product management, secure checkout, image uploads and account system.",
    tags: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Stripe", "Better Auth", "Cloudinary"],
    live: "#", repo: "#",
  },
  {
    title: "WhatsApp-Style Chat App",
    description: "Real-time messaging with live updates, authenticated users and a familiar chat interface.",
    tags: ["Next.js", "Clerk", "Convex", "shadcn"],
    live: "#", repo: "#",
  },
  {
    title: "Custom Authentication System",
    description: "Hand-built auth with scrypt password hashing, HttpOnly sessions and email OTP verification.",
    tags: ["Prisma", "Neon", "scrypt", "HttpOnly sessions", "OTP"],
    live: "#", repo: "#",
  },
  {
    title: "Portfolio with Admin Dashboard",
    description: "This site's bigger sibling: manage projects, services, testimonials and client requests from a dashboard.",
    tags: ["Next.js", "Tailwind CSS", "Motion", "Database"],
    live: "#", repo: "#",
  },
];

export const services = [
  { icon: "layers", title: "Full-stack web apps", text: "From idea and database design to a deployed, working product." },
  { icon: "palette", title: "Polished UI development", text: "Responsive, accessible interfaces with careful typography, spacing and motion." },
  { icon: "shield", title: "Auth & payments", text: "Secure sign-in, sessions, roles and Stripe checkout flows." },
  { icon: "rocket", title: "Deployment & handoff", text: "Production setup on Vercel with clean, maintainable code you can build on." },
] as const;

export const timeline = [
  { when: "2022", title: "Computer Diploma", text: "VTI Fort Abbas. The start of my formal computer education." },
  { when: "3 years", title: "Self-taught development", text: "Learning by building real projects with Next.js, React and TypeScript." },
  { when: "Done", title: "ADP in Computer Science", text: "Completed after four semesters." },
  { when: "Next", title: "BSCS program", text: "Continuing my degree while working with clients and teams." },
];

export const process = [
  { title: "Understand", text: "We talk through goals, users and limits so the scope is clear before any code." },
  { title: "Design", text: "Layout, typography, color and motion planned around your brand and audience." },
  { title: "Build", text: "Frontend, backend, database and integrations in clean, typed, tested code." },
  { title: "Ship", text: "Deployed on Vercel, checked on real devices, handed off with clear notes." },
];
