import { motion } from "framer-motion";
import { Diamond } from "lucide-react";
import { SectionDivider } from "../common/SectionDivider";

export function Footer() {
  return (
    <footer className="relative w-full min-h-[50vh] bg-[#0D0B09] overflow-hidden flex flex-col items-center justify-center pt-8 pb-12 px-6">
      
      {/* Top Separator */}
      <div className="w-full absolute top-0 left-0">
        <SectionDivider />
      </div>

      {/* Background Animated Glows */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-30">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-[#D4A24C] rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[#c8963f] rounded-full blur-[120px] translate-x-32"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-6 mb-16"
        >
          <Diamond size={40} className="text-[#D4A24C]" />
          <h2 className="font-[Marcellus] text-5xl md:text-8xl lg:text-9xl text-[#D4A24C] tracking-[0.2em] uppercase">
            Royal Rich
          </h2>
          <p className="font-serif text-[#C7BFB2] text-xl md:text-3xl tracking-widest italic mt-2">
            Fine Dining Experience
          </p>
        </motion.div>

        {/* Links & Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 text-[#F7F3EC] mb-16 w-full max-w-5xl"
        >
          <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <h4 className="font-serif text-xl text-[#D4A24C]">Location</h4>
            <p className="text-sm tracking-wider leading-relaxed text-[#C7BFB2]">
              123 Elegance Boulevard<br />
              Culinary District, NY 10001
            </p>
          </div>
          <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <h4 className="font-serif text-xl text-[#D4A24C]">Contact</h4>
            <p className="text-sm tracking-wider leading-relaxed text-[#C7BFB2]">
              reservations@royalrich.com<br />
              +1 (212) 555-0199
            </p>
          </div>
          <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <h4 className="font-serif text-xl text-[#D4A24C]">Hours</h4>
            <p className="text-sm tracking-wider leading-relaxed text-[#C7BFB2]">
              Mon-Sun: 5:00 PM - 11:00 PM<br />
              Bar: Open until 1:00 AM
            </p>
          </div>
          <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <h4 className="font-serif text-xl text-[#D4A24C]">Staff</h4>
            <div className="flex flex-col gap-2">
              <a href="/admin/login" className="text-sm tracking-wider text-[#C7BFB2] hover:text-[#D4A24C] transition-colors">
                Admin Portal
              </a>
              <a href="/chef/login" className="text-sm tracking-wider text-[#C7BFB2] hover:text-[#D4A24C] transition-colors">
                Kitchen Portal
              </a>
            </div>
          </div>
        </motion.div>

        {/* Bottom Line */}
        <div className="w-full h-px bg-linear-to-r from-transparent via-[#D4A24C]/40 to-transparent mb-8" />
        
        <p className="text-xs md:text-sm text-[#C7BFB2]/60 tracking-[0.2em] uppercase">
          &copy; {new Date().getFullYear()} Royal Rich Café. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
