"use client";

/**
 * Place at:  src/app/projects/page.tsx
 *
 * All projects, loaded from Convex, rendered with the same
 * ProjectCard + the same reusable animated background used on
 * the home page showcase.
 *
 * Filters (they combine):
 *   1. Project type  -> shadcn dropdown menu (NEW)
 *   2. Tech stack    -> chips (existing)
 *
 * Requires the shadcn dropdown-menu component:
 *   npx shadcn@latest add dropdown-menu
 */

import { useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useQuery } from "convex/react";
import { Check, ChevronDown, ListFilter, X } from "lucide-react";

import { api } from "../../../../convex/_generated/api";

import Container from "../../../components/common/Container";
import SectionHeading from "../../../components/common/SectionHeading";
import { BackgroundSection } from "../../../components/common/AnimatedBackground";
import { Reveal } from "../../../components/animations/animations";
import ProjectCard from "../../../components/ProjectCard";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

// import {
//     PROJECT_TYPE_ORDER,
//     projectTypeLabel,
// } from "../../lib/projectTypes";

import { projectTypeLabel, PROJECT_TYPE_ORDER } from "@/lib/Projecttypes";

const ALL = "All";
const ALL_TYPES = "ALL_TYPES";

export default function ProjectsPage() {
    const projects = useQuery(api.projects.getActive);
    const prefersReduced = !!useReducedMotion();

    const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPES);
    const [filter, setFilter] = useState<string>(ALL);
    const [hovered, setHovered] = useState<number | null>(null);

    /* ---------- project types that actually exist (+ counts) ---------- */

    const typeOptions = useMemo(() => {
        const counts = new Map<string, number>();

        (projects ?? []).forEach((p) => {
            const t = p.type ?? "OTHER";
            counts.set(t, (counts.get(t) ?? 0) + 1);
        });

        return PROJECT_TYPE_ORDER.filter((t) => counts.has(t)).map(
            (t) => ({
                value: t as string,
                label: projectTypeLabel(t),
                count: counts.get(t) ?? 0,
            })
        );
    }, [projects]);

    /* ---------- 1) filter by type ---------- */

    const byType = useMemo(() => {
        if (!projects) return [];

        if (typeFilter === ALL_TYPES) return projects;

        return projects.filter(
            (p) => (p.type ?? "OTHER") === typeFilter
        );
    }, [projects, typeFilter]);

    /* ---------- tech chips (built from the type-filtered list) ---------- */

    const tags = useMemo(() => {
        const set = new Set<string>();

        byType.forEach((p) =>
            (p.techStack ?? []).forEach((t: string) => set.add(t))
        );

        return [ALL, ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }, [byType]);

    /*
     * If the selected tech chip doesn't exist inside the newly chosen
     * type, fall back to "All" instead of showing an empty grid.
     */
    const activeTag = tags.includes(filter) ? filter : ALL;

    /* ---------- 2) filter by tech ---------- */

    const visible = useMemo(() => {
        if (activeTag === ALL) return byType;

        return byType.filter((p) =>
            (p.techStack ?? []).includes(activeTag)
        );
    }, [byType, activeTag]);

    const hasActiveFilters =
        typeFilter !== ALL_TYPES || activeTag !== ALL;



    const selectedTypeLabel =
        typeFilter === ALL_TYPES
            ? "All types"
            : projectTypeLabel(typeFilter);

    return (
        <main>
            <BackgroundSection className="min-h-screen pb-24 pt-18 sm:pb-28 sm:pt-22 lg:pb-32">
                <Container>
                    <Reveal>
                        <SectionHeading
                            label="All Projects"
                            title="Everything I've"
                            highlightedText="built so far"
                            description="Full-stack and web projects built to solve real problems, explore modern technologies, and keep sharpening my engineering skills."
                        />
                    </Reveal>

                    {/* ---------- Loading ---------- */}

                    {projects === undefined && (
                        <div className="mt-14 flex min-h-[300px] items-center justify-center">
                            <div className="size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                        </div>
                    )}

                    {/* ---------- Empty ---------- */}

                    {projects !== undefined && projects.length === 0 && (
                        <p className="mt-14 text-center text-muted-foreground">
                            No projects have been published yet.
                        </p>
                    )}

                    {/* ---------- Content ---------- */}

                    {projects !== undefined && projects.length > 0 && (
                        <>
                            {/* ---------- Filter toolbar ---------- */}

                            <Reveal delay={0.05}>
                                <div className="mt-12 flex flex-col items-center gap-5">
                                    <div className="flex flex-wrap items-center justify-center gap-3">
                                        {/* Project type dropdown */}

                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <button
                                                    type="button"
                                                    aria-label="Filter by project type"
                                                    className={`group inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${typeFilter !== ALL_TYPES
                                                        ? "border-primary/50 bg-primary/10 text-foreground"
                                                        : "border-border/80 bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                                        }`}
                                                >
                                                    <ListFilter
                                                        className="size-4"
                                                        aria-hidden
                                                    />

                                                    <span>
                                                        <span className="text-muted-foreground">
                                                            Type:{" "}
                                                        </span>
                                                        {selectedTypeLabel}
                                                    </span>

                                                    <ChevronDown
                                                        className="size-4 transition-transform duration-300 group-data-[state=open]:rotate-180"
                                                        aria-hidden
                                                    />
                                                </button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent
                                                align="center"
                                                className="w-60"
                                            >
                                                <DropdownMenuRadioGroup
                                                    value={typeFilter}
                                                    onValueChange={(v) => {
                                                        setTypeFilter(v);
                                                        setHovered(null);
                                                    }}
                                                >
                                                    <DropdownMenuLabel>
                                                        Project type
                                                    </DropdownMenuLabel>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuRadioItem
                                                        value={ALL_TYPES}
                                                        className="cursor-pointer"
                                                    >
                                                        <span className="flex w-full items-center justify-between gap-4">
                                                            All types

                                                            <span className="text-xs text-muted-foreground">
                                                                {projects.length}
                                                            </span>
                                                        </span>
                                                    </DropdownMenuRadioItem>

                                                    {typeOptions.map((opt) => (
                                                        <DropdownMenuRadioItem
                                                            key={opt.value}
                                                            value={opt.value}
                                                            className="cursor-pointer"
                                                        >
                                                            <span className="flex w-full items-center justify-between gap-4">
                                                                {opt.label}

                                                                <span className="text-xs text-muted-foreground">
                                                                    {opt.count}
                                                                </span>
                                                            </span>
                                                        </DropdownMenuRadioItem>
                                                    ))}
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>


                                    </div>

                                    {/* Tech chips (existing filter) */}

                                    {tags.length > 2 && (
                                        <div
                                            role="group"
                                            aria-label="Filter projects by technology"
                                            className="flex flex-wrap justify-center gap-2"
                                        >
                                            {tags.map((tag) => {
                                                const on = tag === activeTag;

                                                return (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        aria-pressed={on}
                                                        onClick={() => {
                                                            setFilter(tag);
                                                            setHovered(null);
                                                        }}
                                                        className={`inline-flex items-center gap-1 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${on
                                                            ? "border-primary bg-primary text-primary-foreground"
                                                            : "border-border/80 bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                                            }`}
                                                    >
                                                        {on && (
                                                            <Check
                                                                className="size-3"
                                                                aria-hidden
                                                            />
                                                        )}

                                                        {tag}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Result count */}

                                    <p
                                        className="text-xs text-muted-foreground"
                                        aria-live="polite"
                                    >
                                        Showing{" "}
                                        <span className="font-semibold text-primary">
                                            {visible.length}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-semibold text-primary">
                                            {projects.length}
                                        </span>{" "}
                                        <span className="font-medium text-primary">
                                            {projects.length === 1
                                                ? "project"
                                                : "projects"}
                                        </span>
                                    </p>
                                </div>
                            </Reveal>

                            {/* ---------- Grid ---------- */}

                            {visible.length === 0 ? (
                                <div className="mt-14 text-center">
                                    <p className="text-muted-foreground">
                                        No projects match these filters.
                                    </p>

                                </div>
                            ) : (
                                <div className="mt-12 grid gap-8 sm:mt-14 md:grid-cols-2 lg:grid-cols-3">
                                    {visible.map((project, i) => (
                                        <Reveal
                                            key={`${project.slug ?? project.title}-${i}`}
                                            delay={(i % 3) * 0.08}
                                        >
                                            <div
                                                className="h-full"
                                                onPointerEnter={() => setHovered(i)}
                                                onPointerLeave={() => setHovered(null)}
                                                onFocus={() => setHovered(i)}
                                                onBlur={() => setHovered(null)}
                                            >
                                                <ProjectCard
                                                    project={{
                                                        title: project.title,
                                                        description:
                                                            project.description ?? "",
                                                        image: project.image ?? "",
                                                        type: project.type,
                                                        live: project.liveDemo ?? "#",
                                                        repo: project.github ?? "#",
                                                        detailHref: `/projects/${project.slug}`,
                                                    }}
                                                    index={i}

                                                    isActive={prefersReduced || hovered === i}
                                                    reduced={prefersReduced}
                                                    revealed
                                                />
                                            </div>
                                        </Reveal>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </Container>
            </BackgroundSection>
        </main>
    );
}