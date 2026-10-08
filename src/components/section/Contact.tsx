
import { Reveal } from "../animations/animations";
import SectionHeading from "../common/SectionHeading";
import { ContactForm } from "../contact/ContactForm";
import { ContactInfo } from "../contact/ContactInfo";

export function ContactSection() {
    return (
        <section id="contact" className="section">
            <div className="container">
                <Reveal>
                    <SectionHeading
                        align="start"
                        label="Let's Connect"
                        title="Have an Idea?"
                        highlightedText="Let's Build It."
                        description="Whether you have a project in mind, a collaboration opportunity, or simply want to connect, feel free to reach out. I'm always open to building meaningful digital experiences."
                    />
                </Reveal>

                <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.5fr]">
                    <Reveal delay={0.1}>
                        <ContactInfo />
                    </Reveal>

                    <Reveal delay={0.2}>
                        <ContactForm />
                    </Reveal>
                </div>
            </div>
        </section>
    );
}