"use client";

/**
 * Place at:  src/app/projects/[slug]/page.tsx
 *
 * The card links to /projects/${project.slug}, so the dynamic
 * segment is [slug]. Data comes from the same Convex query the
 * rest of the site uses (api.projects.getActive), so no backend
 * change is needed.
 *
 * Layout: two columns on desktop.
 *   - left : type + description + tech stack + links
 *   - right: compact media card (image OR video), sticky
 * On mobile the media comes first, then the content.
 */

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useQuery } from "convex/react";
import {
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    ExternalLink,
    Star,
} from "lucide-react";

import { api } from "../../../../../convex/_generated/api";

import Container from "../../../../components/common/Container";
import SectionHeading from "../../../../components/common/SectionHeading";
import { BackgroundSection } from "../../../../components/common/AnimatedBackground";
import { Reveal } from "../../../../components/animations/animations";
import { Badge } from "../../../../components/ui/badge";
import { GithubIcon } from "../../../../components/icons";
import { projectTypeLabel } from "@/lib/Projecttypes";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ProjectDetailPage() {
    const params = useParams<{ slug: string | string[] }>();
    const reduced = !!useReducedMotion();

    const rawSlug = Array.isArray(params?.slug)
        ? params.slug[0]
        : params?.slug;

    const slug = rawSlug ? decodeURIComponent(rawSlug) : "";

    const projects = useQuery(api.projects.getActive);

    const index = useMemo(
        () => (projects ? projects.findIndex((p) => p.slug === slug) : -1),
        [projects, slug]
    );

    const project = projects && index >= 0 ? projects[index] : undefined;

    const prev =
        projects && projects.length > 1 && index >= 0
            ? projects[(index - 1 + projects.length) % projects.length]
            : undefined;

    const next =
        projects && projects.length > 1 && index >= 0
            ? projects[(index + 1) % projects.length]
            : undefined;

    /* ---------- Loading ---------- */

    if (projects === undefined) {
        return (
            <main>
                <BackgroundSection className="min-h-screen pb-24 pt-32 sm:pt-36">
                    <Container>
                        <div className="flex min-h-[400px] items-center justify-center">
                            <div className="size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                        </div>
                    </Container>
                </BackgroundSection>
            </main>
        );
    }

    /* ---------- Not found ---------- */

    if (!project) {
        return (
            <main>
                <BackgroundSection className="min-h-screen pb-24 pt-32 sm:pt-36">
                    <Container>
                        <Reveal>
                            <SectionHeading
                                label="404"
                                title="Project"
                                highlightedText="not found"
                                description="That project doesn't exist or is no longer published."
                            />
                        </Reveal>

                        <Reveal delay={0.1} className="mt-12 flex justify-center">
                            <Link
                                href="/projects"
                                className="custom-btn group inline-flex items-center gap-2"
                            >
                                <ArrowLeft
                                    className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                                    aria-hidden
                                />
                                Back to all projects
                            </Link>
                        </Reveal>
                    </Container>
                </BackgroundSection>
            </main>
        );
    }

    const tags: string[] = project.techStack ?? [];
    const hasLive = !!project.liveDemo;
    const hasRepo = !!project.github;
    const isVideo = project.mediaType === "VIDEO";
    const description: string = project.description ?? "";

    /* ---------- Detail ---------- */

    return (
        <main>
            <BackgroundSection className="min-h-screen pb-24 pt-32 sm:pb-28 sm:pt-36 lg:pb-32">
                <Container>
                    {/* Back link */}

                    <Reveal>
                        <Link
                            href="/projects"
                            className="custom-btn-outline"
                        >
                            <ArrowLeft
                                className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                                aria-hidden
                            />
                            All projects
                        </Link>
                    </Reveal>

                    {/* Same section heading as the rest of the site */}

                    <Reveal delay={0.05}>
                        <SectionHeading
                            label="Project Details"
                            title="Inside"
                            highlightedText={project.title}
                            description={`A closer look at what ${project.title} is, how it's built, and where you can try it.`}
                        />
                    </Reveal>

                    {/* ---------- Two-column body ---------- */}

                    <div className="mt-14 grid items-start gap-10 sm:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
                        {/* ===== Media (first on mobile, right on desktop) ===== */}

                        <motion.div
                            initial={reduced ? false : { opacity: 0, y: 32 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
                            className="mx-auto w-full max-w-md lg:sticky lg:top-28 lg:order-2 lg:max-w-none"
                        >
                            <div className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/95 p-2 shadow-[0_24px_60px_-24px_color-mix(in_srgb,var(--primary)_45%,transparent)] backdrop-blur-xl">
                                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.3rem] bg-secondary">
                                    {project.image ? (
                                        isVideo ? (
                                            <video
                                                src={project.image}
                                                controls
                                                playsInline
                                                muted
                                                loop
                                                preload="metadata"
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <img
                                                src={project.image}
                                                alt={`${project.title} project preview`}
                                                decoding="async"
                                                className="size-full object-cover object-top"
                                            />
                                        )
                                    ) : (
                                        <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                                            No preview available
                                        </div>
                                    )}

                                    {!isVideo && (
                                        <div
                                            aria-hidden
                                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Link buttons under the media */}

                            {(hasLive || hasRepo) && (
                                <div className="mt-5 flex flex-wrap items-center gap-3">
                                    {hasLive && (
                                        <a
                                            href={project.liveDemo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="custom-btn group inline-flex items-center gap-2"
                                        >
                                            Live demo
                                            <ArrowUpRight
                                                className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                                aria-hidden
                                            />
                                        </a>
                                    )}

                                    {hasRepo && (
                                        <a
                                            href={project.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex h-11 items-center gap-2 rounded-full border border-border/80 bg-background/70 px-5 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                        >
                                            <GithubIcon
                                                className="size-4"
                                                aria-hidden
                                            />
                                            Source code
                                            <ExternalLink
                                                className="size-3.5"
                                                aria-hidden
                                            />
                                        </a>
                                    )}
                                </div>
                            )}
                        </motion.div>

                        {/* ===== Content ===== */}

                        <Reveal delay={0.1} className="lg:order-1">
                            <div className="space-y-8">
                                {/* Meta */}

                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className="border-primary/30 bg-primary/10 text-[11px] font-medium text-foreground">
                                        {projectTypeLabel(project.type)}
                                    </Badge>

                                    {project.isFeatured && (
                                        <Badge className="gap-1 border-[#ffd36a]/40 bg-[#ffd36a]/10 text-[11px] font-medium text-foreground">
                                            <Star
                                                className="size-3 fill-[#ffd36a] text-[#ffd36a]"
                                                aria-hidden
                                            />
                                            Featured
                                        </Badge>
                                    )}
                                </div>

                                {/* About */}

                                <article className="rounded-[1.75rem] border border-border/70 bg-card/95 p-6 backdrop-blur-xl sm:p-8">
                                    <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                                        About this project
                                    </h2>

                                    <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8">
                                        {description}
                                    </p>
                                </article>

                                {/* Tech stack */}

                                {tags.length > 0 && (
                                    <div className="rounded-[1.75rem] border border-border/70 bg-card/95 p-6 backdrop-blur-xl sm:p-8">
                                        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                                            Tech stack
                                        </h2>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {tags.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    className="border-primary/30 bg-primary/10 text-xs font-medium text-foreground"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Reveal>
                    </div>

                    {/* ---------- Prev / next ---------- */}

                    {prev && next && (
                        <Reveal delay={0.1}>
                            <nav
                                aria-label="More projects"
                                className="mt-16 grid gap-4 border-t border-border/60 pt-10 sm:grid-cols-2"
                            >
                                <Link
                                    href={`/projects/${prev.slug}`}
                                    className="group rounded-2xl border border-border/70 bg-card/70 p-5 backdrop-blur-xl transition-colors duration-300 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                >
                                    <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                        <ArrowLeft
                                            className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
                                            aria-hidden
                                        />
                                        Previous
                                    </span>

                                    <span className="mt-2 block text-lg font-semibold tracking-tight transition-colors duration-300 group-hover:text-primary">
                                        {prev.title}
                                    </span>
                                </Link>

                                <Link
                                    href={`/projects/${next.slug}`}
                                    className="group rounded-2xl border border-border/70 bg-card/70 p-5 text-right backdrop-blur-xl transition-colors duration-300 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                >
                                    <span className="flex items-center justify-end gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                        Next
                                        <ArrowRight
                                            className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                                            aria-hidden
                                        />
                                    </span>

                                    <span className="mt-2 block text-lg font-semibold tracking-tight transition-colors duration-300 group-hover:text-primary">
                                        {next.title}
                                    </span>
                                </Link>
                            </nav>
                        </Reveal>
                    )}
                </Container>
            </BackgroundSection>
        </main>
    );
}