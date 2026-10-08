import { z } from "zod";

export const contactSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email address.")
        .max(120),
    subject: z
        .string()
        .trim()
        .min(3, "Subject must be at least 3 characters.")
        .max(120),
    message: z
        .string()
        .trim()
        .min(10, "Message must be at least 10 characters.")
        .max(2000, "Message is too long (max 2000 characters)."),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactField = keyof ContactInput;

export type ContactFormState = {
    status: "idle" | "success" | "error";
    message: string;
    fieldErrors: Partial<Record<ContactField, string>>;
    values: Partial<ContactInput>;
};

export const initialContactState: ContactFormState = {
    status: "idle",
    message: "",
    fieldErrors: {},
    values: {},
};