import { cn } from "@/utils/cn";

interface SectionDividerProps {
  className?: string;
}

export function SectionDivider({ className }: SectionDividerProps) {
  return (
    <div className={cn("flex items-center justify-center w-full relative z-20 py-8", className)}>
      <div className="h-[3px] bg-linear-to-r from-transparent via-[#D4A24C] to-[#D4A24C] flex-1 max-w-[35%]" />
      <div className="mx-6 text-[#D4A24C] flex items-center justify-center scale-125 drop-shadow-[0_0_8px_rgba(212,162,76,0.5)]">
        {/* Diamond / Jewelry shape SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15 12L12 22L9 12L12 2Z" fill="currentColor" />
          <path d="M12 5L13.5 12L12 19L10.5 12L12 5Z" fill="#F7F3EC" />
        </svg>
      </div>
      <div className="h-[3px] bg-linear-to-l from-transparent via-[#D4A24C] to-[#D4A24C] flex-1 max-w-[35%]" />
    </div>
  );
}
