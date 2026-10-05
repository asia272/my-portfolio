import Link from "next/link";
import {

    Mail,
    ArrowUp,
} from "lucide-react";

import Container from "@/components/common/Container";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative border-t border-border/60">
            {/* Decorative glow */}
            <div
                className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-40
          w-72
          -translate-x-1/2
          rounded-full
          bg-primary/10
          blur-3xl
        "
            />

            <Container>
                <div className="relative py-12">
                    {/* Top */}
                    <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-md">
                            <Link
                                href="/"
                                className="
                  inline-flex
                  items-center
                  text-xl
                  font-bold
                "
                            >
                                Asia
                                <span className="text-primary">.</span>
                            </Link>

                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                Building modern, responsive and user-focused
                                web experiences with Next.js and modern web
                                technologies.
                            </p>
                        </div>

                        {/* Social links */}
                        <div className="flex items-center gap-2">
                            <a
                                href="https://github.com/asia272"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GitHub"
                                className="
                  flex
                  size-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-border
                  text-muted-foreground
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-primary/40
                  hover:bg-primary/10
                  hover:text-primary
                "
                            >
                                {/* <Github className="size-4" /> */}
                                Github
                            </a>

                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className="
                  flex
                  size-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-border
                  text-muted-foreground
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-primary/40
                  hover:bg-primary/10
                  hover:text-primary
                "
                            >
                                {/* <Linkedin className="size-4" /> */}
                                Linkdin
                            </a>

                            <a
                                href="mailto:your-email@example.com"
                                aria-label="Email"
                                className="
                  flex
                  size-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-border
                  text-muted-foreground
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-primary/40
                  hover:bg-primary/10
                  hover:text-primary
                "
                            >
                                <Mail className="size-4" />
                            </a>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="my-8 h-px bg-border/60" />

                    {/* Bottom */}
                    <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                        <p>
                            © {currentYear} Asia Ashraf. All rights
                            reserved.
                        </p>

                        <Link
                            href="#"
                            className="
                inline-flex
                items-center
                gap-2
                transition-colors
                hover:text-primary
              "
                        >
                            Back to top
                            <ArrowUp className="size-4" />
                        </Link>
                    </div>
                </div>
            </Container>
        </footer>
    );
}