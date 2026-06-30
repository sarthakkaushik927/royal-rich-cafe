import ScrollFrameSequence from './components/ScrollFrameSequence';
import HeroOverlay from './components/HeroOverlay';
import FoodOverlay from './components/FoodOverlay';
import Navbar from './components/Navbar';

// ─── Frame filename generators (match actual files on disk) ──────────
const heroFrameName = (i: number) =>
  `ezgif-frame-${String(i).padStart(3, '0')}.png`;

const foodFrameName = (i: number) =>
  `frame_${String(i).padStart(4, '0')}.jpg`;

function App() {
  return (
    <main className="bg-background text-text-primary">
      <Navbar />
      {/* ════════════════ HERO SECTION ════════════════ */}
      <ScrollFrameSequence
        assetFolder="/heroassets"
        frameCount={51}
        getFrameName={heroFrameName}
        scrollHeightVh={400}
      >


        {/* GSAP-animated hero content */}
        <HeroOverlay />
      </ScrollFrameSequence>

      {/* ════════════════ PHILOSOPHY SECTION ════════════════ */}
      <section className="relative flex items-center justify-center min-h-screen px-8 py-24 bg-surface">
        <div className="max-w-[640px] text-center">
          {/* Decorative blush blob (low opacity) */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none -z-[1]"
            style={{ background: 'radial-gradient(circle, rgba(242,184,198,0.15) 0%, transparent 70%)' }}
          />

          <span className="inline-block font-body text-[0.6rem] font-medium tracking-[0.35em] uppercase text-gold mb-8 px-5 py-1.5 border border-gold-dim rounded-full">
            Our Philosophy
          </span>
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-[900] leading-tight text-text-primary mb-6">
            Crafted with passion,<br />served with pride.
          </h2>
          <p className="font-body text-base leading-[1.8] text-text-muted max-w-[480px] mx-auto">
            Every dish at Royal Rich Café tells a story — of locally sourced
            ingredients, meticulous preparation, and a deep respect for the
            art of fine dining. Scroll further to witness our culinary showcase.
          </p>
          <div className="w-[60px] h-px bg-gradient-to-r from-transparent via-blush-deep to-transparent mx-auto mt-12" />
        </div>
      </section>

      {/* ════════════════ FOOD SECTION ════════════════ */}
      <ScrollFrameSequence
        assetFolder="/foodassets"
        frameCount={120}
        getFrameName={foodFrameName}
        scrollHeightVh={500}
      >


        {/* Food section text — top-right with fade in/out */}
        <FoodOverlay />
      </ScrollFrameSequence>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="bg-surface-dim border-t border-text-primary/[0.06] py-16 px-8">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="font-display text-2xl font-[900] text-gradient mb-3">
            Royal Rich Café
          </div>
          <p className="text-xs text-text-muted tracking-wider">
            &copy; 2024 Royal Rich Café. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

export default App;
