"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { navigation } from "@/data/navigation";
import ThemeToggle from "@/components/common/ThemeToggle";


export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        handleScroll();

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMobileOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileOpen]);

    const closeMobileMenu = () => {
        setIsMobileOpen(false);
    };

    return (
        <header
            className={`
        fixed
        inset-x-0
        top-0
        z-50
        border-b
        transition-[background-color,border-color,box-shadow,backdrop-filter]
        duration-300
        ${isScrolled
                    ? "border-border/60 bg-background/80 shadow-lg shadow-black/5 backdrop-blur-2xl"
                    : "border-transparent bg-transparent shadow-none backdrop-blur-0"
                }
    `}
        >
            <div className="container">
                <nav
                    className="
                        flex
                        h-[76px]
                        items-center
                        justify-between
                    "
                    aria-label="Main navigation"
                >
                    {/* Logo */}
                    <Link
                        href="/"
                        onClick={closeMobileMenu}
                        className="
                            group
                            relative
                            flex
                            items-center
                            gap-2
                            text-xl
                            font-bold
                            tracking-tight
                        "
                    >
                        <span
                            className="
                                transition-colors
                                duration-300
                                group-hover:text-primary
                            "
                        >
                            Asia
                        </span>

                        <span className="text-primary">
                            .
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden items-center gap-1 md:flex">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="nav-link"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden items-center gap-2 md:flex">
                        <ThemeToggle />

                        <Link
                            href="/contact"
                            className="custom-btn min-h-[44px] px-5 text-sm"
                        >
                            Let's Talk
                        </Link>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex items-center gap-1 md:hidden">
                        <ThemeToggle />

                        <button
                            type="button"
                            onClick={() =>
                                setIsMobileOpen((value) => !value)
                            }
                            className="
                                inline-flex
                                size-10
                                items-center
                                justify-center
                                rounded-full
                                text-foreground
                                transition-all
                                duration-300
                                hover:text-primary
                                hover:ring-1
                                hover:ring-primary/30
                            "
                            aria-label={
                                isMobileOpen
                                    ? "Close navigation"
                                    : "Open navigation"
                            }
                            aria-expanded={isMobileOpen}
                        >
                            {isMobileOpen ? (
                                <X className="size-5" />
                            ) : (
                                <Menu className="size-5" />
                            )}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Navigation */}
            <div
                className={`
                    overflow-hidden
                    border-t
                    border-border/60
                    bg-background/95
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    md:hidden
                    ${isMobileOpen
                        ? "max-h-[500px] opacity-100"
                        : "max-h-0 border-transparent opacity-0"
                    }
                `}
            >
                <div className="container py-5">
                    <div className="flex flex-col">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileMenu}
                                className="mobile-nav-link"
                            >
                                {item.label}
                            </Link>
                        ))}

                        <Link
                            href="/contact"
                            onClick={closeMobileMenu}
                            className="
                                custom-btn
                                mt-4
                                w-full
                                min-h-[48px]
                                px-4
                                py-3
                                text-center
                                text-sm
                            "
                        >
                            Let's Talk
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}