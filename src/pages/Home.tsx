import ScrollFrameSequence from '../components/home/ScrollFrameSequence';
import HeroOverlay from '../components/home/HeroOverlay';
import { Navbar } from '../components/layout/Navbar';
import { ExquisiteCuisine } from "../components/home/ExquisiteCuisine";
import { AtmosphereSection } from "../components/home/AtmosphereSection";
import { ReserveTable } from "../components/home/ReserveTable";
import { SectionDivider } from "../components/common/SectionDivider";
import { Footer } from "../components/layout/Footer";
import atmosphereImg from "../assets/atmosphere.jpg";

// ─── Frame filename generators (match actual files on disk) ──────────
// Start rendering from frame 70 instead of 1
const heroFrameName = (i: number) =>
  `frame_${String(i + 69).padStart(4, '0')}.jpg`;

export function Home() {
  return (
    <main className="bg-background text-text-primary">
      <Navbar />
      {/* ════════════════ HERO SECTION ════════════════ */}
      <ScrollFrameSequence
        assetFolder="/newheroassets"
        frameCount={231}
        getFrameName={heroFrameName}
        scrollHeightVh={1000}
      >
        {/* GSAP-animated hero content */}
        <HeroOverlay />
      </ScrollFrameSequence>

      {/* ════════════════ MAIN CONTENT ════════════════ */}
      <ExquisiteCuisine />

      {/* ════════════════ ATMOSPHERE + BOOKING (Shared Image) ════════════════ */}
      <div 
        className="relative w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${atmosphereImg})` }}
      >
        <AtmosphereSection />
        
        {/* Separator between Atmosphere and Reservation */}
        <div className="relative z-20 -my-8 px-6 max-w-7xl mx-auto">
          <SectionDivider />
        </div>

        <ReserveTable />
      </div>

      {/* ════════════════ FOOTER ════════════════ */}
      <Footer />
    </main>
  );
}
