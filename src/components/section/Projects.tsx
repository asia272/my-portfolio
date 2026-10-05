// import Link from "next/link";
// import { ArrowUpRight } from "lucide-react";

// import Container from "@/components/common/Container";
// import SectionHeading from "@/components/common/SectionHeading";
// import ProjectCard from "@/components/projects/ProjectCard";
// import { projects } from "@/data/projects";

// export default function Projects() {
//     const featuredProjects = projects.filter((project) => project.featured);

//     return (
//         <section id="projects" className="section">
//             <Container>
//                 <SectionHeading
//                     eyebrow="Featured Projects"
//                     title="A selection of things I've built."
//                     description="Explore some of my recent projects, from complete full-stack applications to modern interactive web experiences."
//                 />

//                 <div className="grid gap-6 md:grid-cols-2">
//                     {featuredProjects.map((project) => (
//                         <ProjectCard key={project.id} project={project} />
//                     ))}
//                 </div>

//                 <div
//                     className="mt-10 flex justify-center"
//                     data-aos="fade-up"
//                 >
//                     <Link
//                         href="/projects"
//                         className="group inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card/50 px-5 text-sm font-semibold backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
//                     >
//                         View all projects

//                         <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
//                     </Link>
//                 </div>
//             </Container>
//         </section>
//     );
// }