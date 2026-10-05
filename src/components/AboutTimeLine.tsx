import { useScroll, useSpring } from 'motion/react';
import { useRef } from "react";
import { Reveal } from './animations/animations';
import { timeline } from '@/lib/data';
import { motion, type MotionValue } from "motion/react";

const AboutTimeLine = () => {

    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
    const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });
    return (
        <div ref={ref} className="relative mt-20 pl-8">
            <div className="absolute bottom-0 left-[7px] top-0 w-px bg-border" />
            <motion.div style={{ scaleY, backgroundImage: "var(--gold-gradient)" }} className="absolute bottom-0 left-[6px] top-0 w-0.5 origin-top" />
            {timeline.map((t, i) => (
                <Reveal key={t.title} delay={i * 0.05} className="relative pb-10 last:pb-0">
                    <span className="absolute -left-8 top-1.5 size-4 rounded-full border-2 border-gold bg-background" />
                    <p className="text-sm font-medium text-gold">{t.when}</p>
                    <h3 className="text-xl font-semibold">{t.title}</h3>
                    <p className="text-muted-foreground">{t.text}</p>
                </Reveal>
            ))}
        </div>
    );

}

export default AboutTimeLine