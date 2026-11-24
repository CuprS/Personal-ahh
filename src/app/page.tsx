import { BackgroundVideo } from "@/components/BackgroundVideo";
import { About } from "@/components/sections/About";
import { ContactSection } from "@/components/sections/ContactSection";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { Hero } from "@/components/sections/Hero";
import { Ideas } from "@/components/sections/Ideas";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <>
      {site.backgroundVideo ? <BackgroundVideo {...site.backgroundVideo} /> : null}
      <Hero />
      <About />
      <FeaturedWork />
      <Ideas />
      <ContactSection />
    </>
  );
}
