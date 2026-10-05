// import Image from "next/image";
// import Link from "next/link";
// import { ArrowUpRight } from "lucide-react";

// import type { Project } from "@/types/project";

// interface ProjectCardProps {
//     project: Project;
// }

// export default function ProjectCard({ project }: ProjectCardProps) {
//     return (
//         <article
//             className="group overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
//             data-aos="fade-up"
//         >
//             {/* Image */}
//             <Link
//                 href={`/projects/${project.slug}`}
//                 className="relative block aspect-[16/10] overflow-hidden bg-muted"
//             >
//                 <Image
//                     src={project.image}
//                     alt={project.title}
//                     fill
//                     className="object-cover transition-transform duration-700 group-hover:scale-105"
//                     sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px"
//                 />

//                 {/* Overlay */}
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-80" />

//                 {/* Category */}
//                 <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
//                     {project.category}
//                 </span>

//                 {/* View icon */}
//                 <div className="absolute bottom-4 right-4 flex size-10 translate-y-2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
//                     <ArrowUpRight className="size-4" />
//                 </div>
//             </Link>

//             {/* Content */}
//             <div className="p-6">
//                 <div className="flex items-start justify-between gap-4">
//                     <h3 className="text-xl font-semibold tracking-tight transition-colors duration-300 group-hover:text-primary">
//                         {project.title}
//                     </h3>

//                     {project.featured && (
//                         <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
//                             Featured
//                         </span>
//                     )}
//                 </div>

//                 <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">
//                     {project.description}
//                 </p>

//                 {/* Technologies */}
//                 <div className="mt-5 flex flex-wrap gap-2">
//                     {project.technologies.slice(0, 5).map((technology) => (
//                         <span
//                             key={technology}
//                             className="rounded-md border border-border bg-background/50 px-2.5 py-1 text-xs text-muted-foreground"
//                         >
//                             {technology}
//                         </span>
//                     ))}

//                     {project.technologies.length > 5 && (
//                         <span className="rounded-md border border-border bg-background/50 px-2.5 py-1 text-xs text-muted-foreground">
//                             +{project.technologies.length - 5}
//                         </span>
//                     )}
//                 </div>

//                 {/* Links */}
//                 <div className="mt-6 flex items-center gap-3 border-t border-border/70 pt-5">
//                     <Link
//                         href={`/projects/${project.slug}`}
//                         className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
//                     >
//                         View details
//                         <ArrowUpRight className="size-4" />
//                     </Link>

//                     {project.githubUrl && (
//                         <a
//                             href={project.githubUrl}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             aria-label={`${project.title} GitHub repository`}
//                             className="ml-auto flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all duration-300 hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
//                         >
//                             {/* <Github className="size-4" /> */}
//                             gitub
//                         </a>
//                     )}
//                 </div>
//             </div>
//         </article>
//     );
// }