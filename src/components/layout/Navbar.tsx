import { useEffect, useState } from "react";
import { Menu, X, Diamond } from "lucide-react";

const links = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#menu" },
  { label: "About", href: "#about" },
  { label: "Reservations", href: "#reserve" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 " +
        (scrolled ? "bg-[#0D0B09]/70 backdrop-blur-xl border-b border-[#D4A24C]/20 shadow-[0_4px_30px_rgba(0,0,0,0.3)] py-2" : "bg-transparent py-4")
      }
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between transition-all duration-500">
        <a href="#home" className="flex items-center gap-2 group">
          <Diamond size={20} className="text-[#D4A24C] group-hover:rotate-180 transition-transform duration-700" />
          <span className="font-[Marcellus] text-[#D4A24C] text-2xl tracking-[0.15em] uppercase">
            Fine Dining
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-[#F7F3EC] text-[13px] font-[500] tracking-[0.2em] uppercase hover:text-[#D4A24C] transition-colors relative py-2 after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#D4A24C] hover:after:w-full after:transition-all after:duration-300"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          className="md:hidden text-[#F7F3EC]"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#0D0B09] border-t border-[#D4A24C]/20">
          <ul className="flex flex-col px-6 py-4 gap-4">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="block text-[#F7F3EC] text-sm uppercase tracking-wider hover:text-[#D4A24C]"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
