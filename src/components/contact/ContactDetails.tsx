import {
    MessageSquare,
    ShieldCheck,
    Zap,
    Handshake,
    type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/animations/animations";

type TrustPoint = {
    icon: LucideIcon;
    title: string;
    text: string;
};

const trustPoints: TrustPoint[] = [
    {
        icon: Zap,
        title: "Quick Response",
        text: "I usually reply within 24 hours.",
    },
    {
        icon: MessageSquare,
        title: "Clear Communication",
        text: "Regular updates, no confusion.",
    },
    {
        icon: ShieldCheck,
        title: "Quality Work",
        text: "Clean, fast and maintainable code.",
    },
    {
        icon: Handshake,
        title: "Your Idea Stays Safe",
        text: "Your project details stay private.",
    },
];

export function ContactDetails() {
    return (
        <div className="flex flex-col gap-8">
            <Reveal>
                <div>
                    <h3 className="text-2xl font-semibold text-foreground sm:text-3xl">
                        Let&apos;s build something great together
                    </h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                        Whether it&apos;s a new project, a collaboration or just a
                        question, I&apos;d love to hear from you.
                    </p>
                </div>
            </Reveal>

            <ul className="flex flex-col gap-4">
                {trustPoints.map(({ icon: Icon, title, text }, i) => (
                    <Reveal key={title} delay={0.05 * (i + 1)}>
                        <li className="glass flex items-start gap-4 rounded-2xl p-4">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Icon size={20} />
                            </span>

                            <div>
                                <p className="font-medium text-foreground">{title}</p>
                                <p className="text-sm text-muted-foreground">{text}</p>
                            </div>
                        </li>
                    </Reveal>
                ))}
            </ul>
        </div>
    );
}