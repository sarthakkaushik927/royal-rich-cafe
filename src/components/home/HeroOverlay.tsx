"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ── 3 sets of text that cycle during the hero scroll ── */
const HERO_TEXTS = [
  {
    tag: 'Est. 2024 · Premium Dining',
    headline: ['Royal Rich', 'Café'],
    sub: 'Where culinary artistry meets timeless elegance.',
  },
  {
    tag: 'A Legacy of Flavor',
    headline: ['Taste the', 'Extraordinary'],
    sub: 'Each plate is a canvas, each bite a masterpiece.',
  },
  {
    tag: 'Crafted for Royalty',
    headline: ['Beyond', 'Fine Dining'],
    sub: 'An experience that transcends the ordinary.',
  },
];

export default function HeroOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const scrollParent = containerRef.current.closest('.scroll-sequence-container');
    if (!scrollParent) return;

    const slides = containerRef.current.querySelectorAll<HTMLElement>('[data-hero-slide]');
    const decoLine = containerRef.current.querySelector('[data-hero-line]');
    const decoDotsEl = containerRef.current.querySelector('[data-hero-dots]');
    const decoBracket = containerRef.current.querySelector('[data-hero-bracket]');

    const ctx = gsap.context(() => {
      // ── Decorative elements: entrance animation ──
      gsap.fromTo(decoLine, { scaleY: 0 }, {
        scaleY: 1, duration: 1.2, ease: 'power4.inOut', delay: 0.3,
      });
      gsap.fromTo(decoDotsEl, { opacity: 0 }, {
        opacity: 1, duration: 1, delay: 0.8,
      });
      gsap.fromTo(decoBracket, { opacity: 0, scale: 0.6 }, {
        opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.4)', delay: 0.6,
      });

      // ── Slide 0: entrance animation (no scroll needed) ──
      const firstSlide = slides[0];
      if (firstSlide) {
        const els = firstSlide.querySelectorAll('[data-anim]');
        gsap.fromTo(els,
          { opacity: 0, y: 30, clipPath: 'inset(0 100% 0 0)' },
          { opacity: 1, y: 0, clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power3.out', stagger: 0.15, delay: 0.4 }
        );
      }

      // ── Slide transitions driven by scroll progress ──
      // Slide 0 → out at 20-28%
      gsap.to(slides[0], {
        opacity: 0, y: -20,
        scrollTrigger: { trigger: scrollParent, start: '20% top', end: '28% top', scrub: true },
      });

      // Slide 1 → in at 25-33%, out at 50-58%
      gsap.fromTo(slides[1],
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0,
          scrollTrigger: { trigger: scrollParent, start: '25% top', end: '33% top', scrub: true },
        }
      );
      gsap.to(slides[1], {
        opacity: 0, y: -20,
        scrollTrigger: { trigger: scrollParent, start: '50% top', end: '58% top', scrub: true },
      });

      // Slide 2 → in at 55-63%, out at 82-90%
      gsap.fromTo(slides[2],
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0,
          scrollTrigger: { trigger: scrollParent, start: '55% top', end: '63% top', scrub: true },
        }
      );
      gsap.to(slides[2], {
        opacity: 0, y: -20,
        scrollTrigger: { trigger: scrollParent, start: '82% top', end: '90% top', scrub: true },
      });

      // ── Final: fade out entire overlay container + decorative elements ──
      gsap.to(containerRef.current, {
        opacity: 0,
        scrollTrigger: { trigger: scrollParent, start: '85% top', end: '93% top', scrub: true },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute bottom-10 left-6 md:bottom-16 md:left-14 z-[5] pointer-events-none"
    >
      <div className="relative flex gap-5 md:gap-8 items-stretch">

        {/* ── Animated vertical golden accent line ── */}
        <div className="relative flex flex-col items-center pt-1 pb-1">
          <div
            data-hero-line
            className="w-[2px] h-full origin-top"
            style={{
              background: 'linear-gradient(180deg, #D4AF37 0%, #E8C873 50%, rgba(212,175,55,0.1) 100%)',
              transform: 'scaleY(0)',
            }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gold"
               style={{ boxShadow: '0 0 12px rgba(212,175,55,0.6)' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gold/60" />
        </div>

        {/* ── Text slides container (stacked, only one visible at a time) ── */}
        <div className="relative min-w-[240px] md:min-w-[340px]">
          {HERO_TEXTS.map((t, i) => (
            <div
              key={i}
              data-hero-slide
              className="flex flex-col justify-center py-2"
              style={{
                position: i === 0 ? 'relative' : 'absolute',
                top: i === 0 ? undefined : 0,
                left: i === 0 ? undefined : 0,
                opacity: i === 0 ? 1 : 0,
              }}
            >
              <span data-anim className="font-body text-[0.55rem] md:text-[0.65rem] font-semibold tracking-[0.35em] uppercase text-gold mb-3 md:mb-5">
                {t.tag}
              </span>
              <h1 className="font-display text-[clamp(2rem,5.5vw,4.5rem)] font-[900] leading-[1.05] tracking-tight mb-3 md:mb-5"
                  style={{ perspective: '600px' }}>
                <span data-anim className="inline-block text-gradient">{t.headline[0]}</span>
                <br />
                <em data-anim className="inline-block text-gradient italic">{t.headline[1]}</em>
              </h1>
              <p data-anim className="font-body text-[clamp(0.8rem,1.2vw,1rem)] text-text-muted max-w-[340px] leading-relaxed">
                {t.sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── Decorative dot grid ── */}
        <div data-hero-dots className="absolute -top-4 -right-10 md:-top-6 md:-right-14 opacity-0">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            {[0,1,2,3].map(r => [0,1,2,3].map(c => (
              <circle key={`${r}-${c}`} cx={6+c*12} cy={6+r*12} r="1.2" fill="#D4AF37" opacity={0.25+(r+c)*0.06}/>
            )))}
          </svg>
        </div>

        {/* ── Corner bracket ── */}
        <div data-hero-bracket className="absolute -bottom-3 -right-3 md:-bottom-5 md:-right-5 opacity-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M20 0V20H0" stroke="#D4AF37" strokeWidth="1" opacity="0.3"/>
          </svg>
        </div>
      </div>

      {/* ── Scroll cue (only visible at start) ── */}
      <div className="flex items-center gap-3 mt-6">
        <div className="w-10 h-px bg-gold animate-scroll-pulse" />
        <span className="font-body text-[0.55rem] tracking-[0.25em] uppercase text-gold/80">Scroll</span>
      </div>
    </div>
  );
}
