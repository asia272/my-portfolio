import { Mail, MapPin } from "lucide-react";
import { GithubIcon } from "@/components/icons";
import type { ComponentType } from "react";

export type ContactItem = {
    icon: ComponentType<{
        className?: string;
        size?: number;
    }>;
    label: string;
    value: string;
    href?: string;
    iconClassName: string;
};

export const contactItems: ContactItem[] = [
    {
        icon: Mail,
        label: "Email",
        value: "asiaashraf7272@gmail.com",
        href: "mailto:asiaashraf7272@gmail.com",
        iconClassName: "bg-blue-500/10 text-blue-500",
    },
    {
        icon: GithubIcon,
        label: "GitHub",
        value: "github.com/asia272",
        href: "https://github.com/asia272",
        iconClassName:
            "bg-[#181717]/10 text-[#181717] dark:bg-white/10 dark:text-white",
    },
    {
        icon: MapPin,
        label: "Location",
        value: "Punjab, Pakistan",
        iconClassName: "bg-green-500/10 text-green-500",
    },
];
