import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ── 3 sets of text that cycle during the food scroll ── */
const FOOD_TEXTS = [
  {
    tag: 'The Menu',
    headline: ['A Feast for', 'The Senses'],
    sub: 'Explore our signature dishes — a symphony of flavor, color, and texture.',
  },
  {
    tag: 'Farm to Table',
    headline: ['Locally', 'Sourced'],
    sub: 'Fresh ingredients from the finest local farms, prepared with love.',
  },
  {
    tag: 'Culinary Mastery',
    headline: ['Every Bite', 'Perfected'],
    sub: 'Our chefs bring decades of passion to every plate we serve.',
  },
];

export default function FoodOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const scrollParent = containerRef.current.closest('.scroll-sequence-container');
    if (!scrollParent) return;

    const slides = containerRef.current.querySelectorAll<HTMLElement>('[data-food-slide]');
    const badge = containerRef.current.querySelector('[data-food-badge]');
    const circleText = containerRef.current.querySelector('[data-food-circle-text]');
    const line = containerRef.current.querySelector('[data-food-line]');
    const dots = containerRef.current.querySelector('[data-food-dots]');

    const ctx = gsap.context(() => {
      // ── Container: fade IN when entering the section ──
      gsap.fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1,
          scrollTrigger: { trigger: scrollParent, start: 'top 80%', end: 'top 40%', scrub: true },
        }
      );

      // ── Decorative: badge spins in ──
      gsap.fromTo(badge,
        { opacity: 0, rotate: -90, scale: 0.5 },
        { opacity: 1, rotate: 0, scale: 1, ease: 'back.out(1.6)',
          scrollTrigger: { trigger: scrollParent, start: 'top 70%', end: 'top 30%', scrub: true },
        }
      );

      // ── Continuous rotation of circular text ──
      gsap.to(circleText, { rotate: 360, duration: 20, ease: 'none', repeat: -1 });

      // ── Decorative line draws in ──
      gsap.fromTo(line,
        { scaleX: 0 },
        { scaleX: 1, ease: 'power4.inOut',
          scrollTrigger: { trigger: scrollParent, start: 'top 60%', end: 'top 25%', scrub: true },
        }
      );

      // ── Decorative dots fade in ──
      gsap.fromTo(dots,
        { opacity: 0 },
        { opacity: 1,
          scrollTrigger: { trigger: scrollParent, start: 'top 50%', end: 'top 20%', scrub: true },
        }
      );

      // ── Slide 0: fade in with scroll, out at 25-33% ──
      gsap.fromTo(slides[0],
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0,
          scrollTrigger: { trigger: scrollParent, start: 'top 60%', end: 'top 25%', scrub: true },
        }
      );
      gsap.to(slides[0], {
        opacity: 0, y: -20,
        scrollTrigger: { trigger: scrollParent, start: '25% top', end: '33% top', scrub: true },
      });

      // ── Slide 1: in at 30-38%, out at 55-63% ──
      gsap.fromTo(slides[1],
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0,
          scrollTrigger: { trigger: scrollParent, start: '30% top', end: '38% top', scrub: true },
        }
      );
      gsap.to(slides[1], {
        opacity: 0, y: -20,
        scrollTrigger: { trigger: scrollParent, start: '55% top', end: '63% top', scrub: true },
      });

      // ── Slide 2: in at 60-68%, out at 82-90% ──
      gsap.fromTo(slides[2],
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0,
          scrollTrigger: { trigger: scrollParent, start: '60% top', end: '68% top', scrub: true },
        }
      );
      gsap.to(slides[2], {
        opacity: 0, y: -20,
        scrollTrigger: { trigger: scrollParent, start: '82% top', end: '90% top', scrub: true },
      });

      // ── Final: fade out entire overlay ──
      gsap.to(containerRef.current, {
        opacity: 0,
        scrollTrigger: { trigger: scrollParent, start: '85% top', end: '95% top', scrub: true },
      });
    });

    return () => ctx.revert();
  }, []);

  const circleTextStr = '  ✦ ROYAL RICH · SIGNATURE DISHES · THE MENU ·';

  return (
    <div
      ref={containerRef}
      className="absolute top-8 right-6 md:top-14 md:right-14 z-[5] pointer-events-none"
      style={{ opacity: 0 }}
    >
      <div className="relative flex flex-col items-end">

        {/* ── Rotating circular text badge ── */}
        <div data-food-badge className="relative w-[90px] h-[90px] md:w-[130px] md:h-[130px] mb-6" style={{ opacity: 0 }}>
          <svg data-food-circle-text viewBox="0 0 130 130" className="w-full h-full">
            <defs>
              <path id="foodCirclePath" d="M65,65 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0"/>
            </defs>
            <text fill="#D4AF37" fontSize="10" fontFamily="'Inter', sans-serif" fontWeight="600" letterSpacing="3">
              <textPath href="#foodCirclePath">{circleTextStr}</textPath>
            </text>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gold/40 flex items-center justify-center"
                 style={{ boxShadow: '0 0 20px rgba(212,175,55,0.15)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* ── Horizontal accent line ── */}
        <div data-food-line className="w-16 md:w-24 h-[1px] mb-5 origin-right"
             style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.05) 0%, #D4AF37 100%)', transform: 'scaleX(0)' }} />

        {/* ── Cycling text slides (stacked) ── */}
        <div className="relative min-w-[220px] md:min-w-[320px] text-right">
          {FOOD_TEXTS.map((t, i) => (
            <div
              key={i}
              data-food-slide
              className="flex flex-col items-end"
              style={{
                position: i === 0 ? 'relative' : 'absolute',
                top: i === 0 ? undefined : 0,
                right: i === 0 ? undefined : 0,
                opacity: 0,
              }}
            >
              <span className="font-body text-[0.55rem] md:text-[0.6rem] font-semibold tracking-[0.4em] uppercase text-gold mb-3">
                {t.tag}
              </span>
              <h2 className="font-display text-[clamp(1.6rem,4vw,3rem)] font-[900] leading-[1.08] text-text-primary mb-2">
                <span className="block">{t.headline[0]}</span>
                <em className="block text-gradient italic">{t.headline[1]}</em>
              </h2>
              <p className="font-body text-[clamp(0.75rem,1.1vw,0.95rem)] text-text-muted max-w-[260px] md:max-w-[300px] leading-relaxed mt-2">
                {t.sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── Decorative vertical dots ── */}
        <div data-food-dots className="absolute -right-4 md:-right-6 top-[140px] flex flex-col gap-3" style={{ opacity: 0 }}>
          {[0.15, 0.25, 0.4, 0.25, 0.15].map((op, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-gold" style={{ opacity: op }} />
          ))}
        </div>
      </div>
    </div>
  );
}
