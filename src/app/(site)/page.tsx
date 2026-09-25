import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Research from "@/components/sections/Research";
import Leadership from "@/components/sections/Leadership";
import TerminalSection from "@/components/sections/TerminalSection";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Research />
      <Leadership />
      <TerminalSection />
      <Contact />
    </>
  );
}
