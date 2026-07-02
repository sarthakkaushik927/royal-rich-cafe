import { motion } from "framer-motion";
import { GoldButton } from "../common/GoldButton";

export function AtmosphereSection() {
  return (
    <section
      id="about"
      className="relative w-full min-h-[85vh] flex items-center justify-end py-24 md:py-32"
    >
      <div className="absolute inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-gradient-to-l from-[#0D0B09] via-[#0D0B09]/80 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-xl px-8 md:px-20 text-right ml-auto"
      >
        <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-semibold text-[#D4A24C] leading-tight mb-4 md:mb-6">
          Sophisticated Atmosphere
        </h2>
        <p className="text-[#C7BFB2] text-lg md:text-2xl mb-8 md:mb-10 leading-relaxed tracking-wide">
          Dine in Style &amp; Comfort
        </p>
        <GoldButton>View Gallery</GoldButton>
      </motion.div>
    </section>
  );
}
