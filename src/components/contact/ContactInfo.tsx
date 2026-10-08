import { contactItems } from "@/data/contact";

export function ContactInfo() {
    return (
        <ul className="flex flex-col gap-5">
            {contactItems.map(
                ({ icon: Icon, label, value, href, iconClassName }) => {
                    const content = (
                        <>
                            <span
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 ${iconClassName}`}
                            >
                                <Icon className="h-[22px] w-[22px]" />
                            </span>

                            <span className="flex flex-col">
                                <span className="text-sm text-muted-foreground">
                                    {label}
                                </span>

                                <span className="font-medium text-foreground">
                                    {value}
                                </span>
                            </span>
                        </>
                    );

                    return (
                        <li key={label}>
                            {href ? (
                                <a
                                    href={href}
                                    className="glass flex items-center gap-4 rounded-2xl p-4 transition-colors hover:border-primary"
                                >
                                    {content}
                                </a>
                            ) : (
                                <div className="glass flex items-center gap-4 rounded-2xl p-4">
                                    {content}
                                </div>
                            )}
                        </li>
                    );
                }
            )}
        </ul>
    );
}