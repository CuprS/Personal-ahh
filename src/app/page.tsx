import { About } from "@/components/sections/About";
import { ContactSection } from "@/components/sections/ContactSection";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { Hero } from "@/components/sections/Hero";
import { Ideas } from "@/components/sections/Ideas";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <FeaturedWork />
      <Ideas />
      <ContactSection />
    </>
  );
}
