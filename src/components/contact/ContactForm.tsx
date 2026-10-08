"use client";

import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { submitContact } from "@/actions/contact";
import { initialContactState } from "@/lib/contact-schema";
import { FormField } from "./FormField";
import { Button } from "../ui/button";

export function ContactForm() {
    const [state, formAction, isPending] = useActionState(
        submitContact,
        initialContactState
    );

    const { fieldErrors, values } = state;

    // Show a toast every time the server action returns a new result.
    useEffect(() => {
        if (state.status === "idle" || !state.message) return;

        if (state.status === "success") {
            toast.success(state.message);
        } else {
            toast.error(state.message);
        }
    }, [state]);

    const invalid = (field: keyof typeof fieldErrors) =>
        fieldErrors[field] ? true : undefined;

    return (
        <form
            action={formAction}
            noValidate
            className="glass flex flex-col gap-5 rounded-2xl p-6 sm:p-8"
        >
            <div className="grid gap-5 sm:grid-cols-2">
                <FormField id="name" label="Your Name" error={fieldErrors.name}>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="You'r name..."
                        defaultValue={values.name}
                        aria-invalid={invalid("name")}
                        aria-describedby={fieldErrors.name ? "name-error" : undefined}
                        className="admin-input"
                    />
                </FormField>

                <FormField id="email" label="Your Email" error={fieldErrors.email}>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="john@example.com"
                        defaultValue={values.email}
                        aria-invalid={invalid("email")}
                        aria-describedby={fieldErrors.email ? "email-error" : undefined}
                        className="admin-input"
                    />
                </FormField>
            </div>

            <FormField id="subject" label="Subject" error={fieldErrors.subject}>
                <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="Let's work together"
                    defaultValue={values.subject}
                    aria-invalid={invalid("subject")}
                    aria-describedby={fieldErrors.subject ? "subject-error" : undefined}
                    className="admin-input"
                />
            </FormField>

            <FormField id="message" label="Message" error={fieldErrors.message}>
                <textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder="Tell me about your project..."
                    defaultValue={values.message}
                    aria-invalid={invalid("message")}
                    aria-describedby={fieldErrors.message ? "message-error" : undefined}
                    className="admin-input min-h-40 resize-y"
                />
            </FormField>

            {/* Honeypot: hidden from humans, bots fill it. for avoid spam msg */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <Button type="submit" disabled={isPending} className="custom-btn">
                {isPending ? "Sending..." : "Send Message"}
            </Button>
        </form>
    );
}