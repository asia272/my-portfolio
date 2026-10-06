import {
    Globe,
    Palette,
    Rocket,
    Server,
    Shield,
    Sparkles,
    Wrench,
    type LucideIcon,
} from "lucide-react";

const ICONS = {
    globe: Globe,
    palette: Palette,
    rocket: Rocket,
    server: Server,
    shield: Shield,
    sparkles: Sparkles,
    wrench: Wrench,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

interface IconProps {
    name: IconName;
    className?: string;
}

export function Icon({ name, className }: IconProps) {
    const IconComponent = ICONS[name];

    return <IconComponent className={className} />;
}