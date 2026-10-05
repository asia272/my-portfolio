// import {
//     ArrowUpRight,
//     Code2,
//     Database,
//     LayoutTemplate,
//     MonitorCog,
//     Server,
//     Wrench,
// } from "lucide-react";

// import Container from "@/components/common/Container";
// import SectionHeading from "@/components/common/SectionHeading";
// import { services } from "@/data/services";

// const serviceIcons = {
//     "web-development": LayoutTemplate,
//     "full-stack-development": Code2,
//     "frontend-development": MonitorCog,
//     "backend-development": Server,
//     "ui-ux-implementation": Database,
//     "website-maintenance": Wrench,
// };

// export default function Services() {
//     return (
//         <section id="services" className="section">
//             <Container>
//                 <SectionHeading
//                     eyebrow="Services"
//                     title="Solutions built around your goals."
//                     description="From responsive interfaces to complete full-stack applications, I focus on building practical digital experiences that are reliable, scalable and easy to use."
//                 />

//                 <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
//                     {services.map((service, index) => {
//                         const Icon = serviceIcons[service.id as keyof typeof serviceIcons];

//                         return (
//                             <article
//                                 key={service.id}
//                                 className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:bg-primary/[0.025] hover:shadow-xl hover:shadow-primary/5"
//                                 data-aos="fade-up"
//                                 data-aos-delay={(index % 3) * 80}
//                             >
//                                 {/* Hover glow */}
//                                 <div className="pointer-events-none absolute -right-16 -top-16 size-32 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

//                                 <div className="relative">
//                                     {/* Icon + number */}
//                                     <div className="flex items-start justify-between">
//                                         <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover:bg-primary/15 group-hover:ring-primary/20">
//                                             <Icon className="size-5" />
//                                         </div>

//                                         <span className="text-xs font-semibold tracking-widest text-muted-foreground/50">
//                                             {String(index + 1).padStart(2, "0")}
//                                         </span>
//                                     </div>

//                                     {/* Content */}
//                                     <h3 className="mt-6 text-xl font-semibold tracking-tight">
//                                         {service.title}
//                                     </h3>

//                                     <p className="mt-3 text-sm leading-7 text-muted-foreground">
//                                         {service.description}
//                                     </p>

//                                     {/* Features */}
//                                     <ul className="mt-6 space-y-2.5">
//                                         {service.features.map((feature) => (
//                                             <li
//                                                 key={feature}
//                                                 className="flex items-center gap-2.5 text-sm text-muted-foreground"
//                                             >
//                                                 <span className="size-1.5 shrink-0 rounded-full bg-primary/70" />
//                                                 {feature}
//                                             </li>
//                                         ))}
//                                     </ul>

//                                     {/* Bottom */}
//                                     <div className="mt-7 flex items-center justify-between border-t border-border/70 pt-5">
//                                         <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
//                                             Learn more
//                                         </span>

//                                         <div className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary">
//                                             <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
//                                         </div>
//                                     </div>
//                                 </div>
//                             </article>
//                         );
//                     })}
//                 </div>
//             </Container>
//         </section>
//     );
// }