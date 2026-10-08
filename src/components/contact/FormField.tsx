import type { ReactNode } from "react";

type FormFieldProps = {
    id: string;
    label: string;
    error?: string;
    children: ReactNode;
};

export function FormField({ id, label, error, children }: FormFieldProps) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-sm font-medium text-foreground">
                {label}
            </label>

            {children}

            {error && (
                <p id={`${id}-error`} role="alert" className="text-sm text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}