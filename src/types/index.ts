export type Stat = {
    label: string;
    value: number;
    suffix: string;
};

export type SkillGroup = {
    title: string;
    description: string;
    icon: string;
    skills: string[];
};

export type Project = {
    title: string;
    summary: string;
    highlights: string[];
    tags: string[];
    icon: string;
    accent: "purple" | "gold" | "mixed";
    status: "Completed" | "In progress";
    featured?: boolean;
    image: string;
};

export type Service = {
    title: string;
    description: string;
    icon: string;
};

export type ProcessStep = {
    title: string;
    description: string;
};

export type Education = {
    title: string;
    place: string;
    period: string;
    description: string;
};