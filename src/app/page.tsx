
import { Hero } from "@/components/section/hero";
import Navbar from "@/components/layout/Navbar";

// import { Contact, Footer, Process, Projects, ScrollBand, Services } from "@/components/sections";
import About from "@/components/section/About";
import { Skills } from "@/components/section/Skills";
import { Services } from "@/components/section/Services";
import Projects from "@/components/section/Projects";
import { ContactSection } from "@/components/section/Contact";




export default function Home() {
  return (
    <>

      <main className="relative z-10">
        <Hero />
        <About />
        <Skills />
        {/* <Projects /> */}
        <Projects />
        <Services />
        <ContactSection />
      </main>
      {/* <Footer /> */}

    </>
  );
}
