export interface NavigationItem {
    label: string;
    href: string;
}

export const navigation: NavigationItem[] = [
    {
        label: "Home",
        href: "/",
    },
    {
        label: "About",
        href: "/#about",
    },
    {
        label: "Skills",
        href: "/#skills",
    },
    {
        label: "Services",
        href: "/#services",
    },
    {
        label: "Projects",
        href: "/projects",
    },
    {
        label: "Contact",
        href: "/contact",
    },
];