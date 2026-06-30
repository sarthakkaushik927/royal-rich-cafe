import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const NAV_LINKS = [
  { label: 'Home', href: '#' },
  { label: 'Menu', href: '#menu' },
  { label: 'Philosophy', href: '#philosophy' },
  { label: 'Reserve', href: '#reserve' },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // ── Scroll detection: transparent → solid background ──
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Entrance animation ──
  useEffect(() => {
    if (!navRef.current) return;
    gsap.fromTo(navRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration  : 0.8, ease: 'power3.out', delay: 0.5 }
    );
  }, []);

  // ── Mobile menu animation ──
  useEffect(() => {
    if (!mobileMenuRef.current) return;
    if (mobileOpen) {
      gsap.fromTo(mobileMenuRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
      const items = mobileMenuRef.current.querySelectorAll('a');
      gsap.fromTo(items,
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out', delay: 0.1 }
      );
    }
  }, [mobileOpen]);

  // Close mobile menu on scroll
  useEffect(() => {
    if (mobileOpen) {
      const close = () => setMobileOpen(false);
      window.addEventListener('scroll', close, { passive: true, once: true });
      return () => window.removeEventListener('scroll', close);
    }
  }, [mobileOpen]);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 w-full z-50 transition-all duration-500"
      style={{
        opacity: 0,
        background: scrolled
          ? 'rgba(253, 246, 240, 0.92)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(43, 27, 23, 0.06)' : '1px solid transparent',
        boxShadow: scrolled ? '0 1px 20px rgba(43, 27, 23, 0.04)' : 'none',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-10 flex items-center justify-between h-16 md:h-[72px]">

        {/* ── Logo ── */}
        <a href="#" className="flex items-center gap-2.5 pointer-events-auto">
          <div className="relative">
            {/* Gold diamond icon */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="14" y="1" width="18" height="18" rx="3" transform="rotate(45 14 1)"
                    stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
              <text x="14" y="17" textAnchor="middle" fill="#D4AF37" fontSize="9"
                    fontFamily="'Fraunces', serif" fontWeight="900">RR</text>
            </svg>
          </div>
          <span
            className="font-display text-base md:text-lg font-[900] tracking-tight"
            style={{
              background: scrolled
                ? 'linear-gradient(135deg, #2B1B17, #6E5950)'
                : 'linear-gradient(135deg, #D4AF37, #E8C873)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              transition: 'all 0.5s ease',
            }}
          >
            Royal Rich
          </span>
        </a>

        {/* ── Desktop links ── */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative font-body text-[0.72rem] font-medium tracking-[0.2em] uppercase transition-colors duration-300 group pointer-events-auto"
              style={{
                color: scrolled ? '#2B1B17' : 'rgba(255,255,255,0.85)',
              }}
            >
              {link.label}
              {/* Animated underline on hover */}
              <span
                className="absolute -bottom-1 left-0 h-[1px] w-0 group-hover:w-full transition-all duration-300 ease-out"
                style={{
                  background: 'linear-gradient(90deg, #D4AF37, #E8C873)',
                }}
              />
            </a>
          ))}

          {/* CTA button */}
          <a
            href="#reserve"
            className="font-body text-[0.65rem] font-semibold tracking-[0.2em] uppercase px-5 py-2 rounded-full border transition-all duration-300 pointer-events-auto hover:scale-105"
            style={{
              borderColor: scrolled ? '#D4AF37' : 'rgba(212,175,55,0.5)',
              color: scrolled ? '#D4AF37' : '#E8C873',
              background: scrolled ? 'rgba(212,175,55,0.06)' : 'rgba(212,175,55,0.1)',
            }}
          >
            Book a Table
          </a>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden pointer-events-auto flex flex-col gap-[5px] p-2"
          aria-label="Toggle menu"
        >
          <span
            className="block w-5 h-[1.5px] rounded-full transition-all duration-300 origin-center"
            style={{
              background: scrolled ? '#2B1B17' : '#D4AF37',
              transform: mobileOpen ? 'rotate(45deg) translate(2px, 2px)' : 'none',
            }}
          />
          <span
            className="block w-5 h-[1.5px] rounded-full transition-all duration-300"
            style={{
              background: scrolled ? '#2B1B17' : '#D4AF37',
              opacity: mobileOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-5 h-[1.5px] rounded-full transition-all duration-300 origin-center"
            style={{
              background: scrolled ? '#2B1B17' : '#D4AF37',
              transform: mobileOpen ? 'rotate(-45deg) translate(2px, -2px)' : 'none',
            }}
          />
        </button>
      </div>

      {/* ── Mobile menu dropdown ── */}
      {mobileOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden px-5 pb-6 pt-2"
          style={{
            background: 'rgba(253, 246, 240, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(43, 27, 23, 0.06)',
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block font-body text-[0.75rem] font-medium tracking-[0.2em] uppercase text-text-primary py-3 border-b border-text-primary/[0.06] transition-colors hover:text-gold"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#reserve"
            onClick={() => setMobileOpen(false)}
            className="inline-block mt-4 font-body text-[0.65rem] font-semibold tracking-[0.2em] uppercase px-6 py-2.5 rounded-full border border-gold text-gold hover:bg-gold/10 transition-all"
          >
            Book a Table
          </a>
        </div>
      )}
    </nav>
  );
}
