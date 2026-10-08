import { BackgroundSection } from "@/components/common/AnimatedBackground";
import HeroContent from "./HeroContent";

export function Hero() {
  return (
    <BackgroundSection id="top" className="min-h-svh">
      <div className="flex min-h-svh items-center px-6">
        <HeroContent />
      </div>
    </BackgroundSection>
  );
}