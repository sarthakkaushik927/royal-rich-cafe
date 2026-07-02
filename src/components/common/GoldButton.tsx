import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };

export function GoldButton({ children, className = "", ...props }: Props) {
  return (
    <button
      className={
        "inline-flex items-center justify-center bg-[#D4A24C] text-[#1A1410] font-medium tracking-wide px-8 py-3 rounded-[4px] hover:bg-[#c8963f] hover:scale-[1.02] transition-all duration-200 " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}
