import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Hero overlay with GSAP-powered staggered entrance animation.
 * Renders on top of the hero scroll-frame canvas.
 */
export default function HeroOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Grab all stagger-target children
    const targets = containerRef.current.querySelectorAll('[data-hero-anim]');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.18,
          delay: 0.15,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[5] flex flex-col items-center justify-center text-center p-8 pointer-events-none"
    >
      {/* Tagline */}
      <span
        data-hero-anim
        className="font-body text-[0.65rem] font-medium tracking-[0.35em] uppercase text-gold mb-6 opacity-0"
      >
        Est. 2024 · Premium Dining
      </span>

      {/* Headline with gradient text */}
      <h1
        data-hero-anim
        className="font-display text-[clamp(3rem,8vw,7rem)] font-[900] leading-[1.05] tracking-tight mb-5 opacity-0"
      >
        <span className="text-gradient">Royal Rich</span>
        <br />
        <em className="text-gradient italic">Café</em>
      </h1>

      {/* Subtitle */}
      <p
        data-hero-anim
        className="font-body text-[clamp(0.9rem,1.5vw,1.15rem)] text-text-muted max-w-[420px] leading-relaxed opacity-0"
      >
        Where culinary artistry meets timeless elegance.
      </p>

      {/* Scroll cue */}
      <div
        data-hero-anim
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-0"
      >
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-gold animate-scroll-pulse" />
        <span className="font-body text-[0.6rem] tracking-[0.25em] uppercase text-gold">
          Scroll to explore
        </span>
      </div>
    </div>
  );
}
