import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/ContactForm";
import { ContactDetails } from "@/components/contact/ContactDetails";
import SectionHeading from "@/components/common/SectionHeading";
import { Reveal } from "@/components/animations/animations";
import Container from "@/components/common/Container";
import { BackgroundSection } from "@/components/common/AnimatedBackground";

export const metadata: Metadata = {
    title: "Contact",
    description: "Get in touch for projects, collaborations or any questions.",
};

export default function ContactPage() {
    return (
        <main>
            <BackgroundSection
                id="contact"
                className="section pt-[calc(var(--nav-height)+3rem)]"
            >
                <Container>
                    <Reveal>
                        <SectionHeading
                            title="Let's Work"
                            highlightedText="Together"
                            description="Have a project in mind, need a developer, or simply want to connect? Send me a message and I'll get back to you soon."
                        />
                    </Reveal>

                    <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1fr_1.4fr]">
                        {/* Left: contact content */}
                        <ContactDetails />

                        {/* Right: form */}
                        <Reveal delay={0.1}>
                            <ContactForm />
                        </Reveal>
                    </div>
                </Container>
            </BackgroundSection>
        </main>
    );
}