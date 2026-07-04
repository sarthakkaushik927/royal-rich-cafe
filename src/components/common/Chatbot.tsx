"use client";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-4 pointer-events-none z-0" />
      <motion.div 
        drag
        dragConstraints={constraintsRef}
      dragElastic={0.2}
      className="fixed bottom-[90px] md:bottom-6 right-6 z-[200] flex flex-col items-end cursor-grab active:cursor-grabbing"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-80 bg-[#0D0B09]/50 backdrop-blur-2xl border border-[#D4A24C]/20 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden cursor-auto"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#D4A24C]/20 backdrop-blur-md border-b border-[#D4A24C]/30 p-4 flex items-center justify-between">
              <h3 className="font-serif text-[#F7F3EC] font-semibold text-lg tracking-wider">Concierge</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[#C7BFB2] hover:text-[#D4A24C] hover:bg-black/30 p-1 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="h-64 p-4 overflow-y-auto flex flex-col gap-3">
              <div className="self-start bg-[#D4A24C]/10 backdrop-blur-md border border-[#D4A24C]/20 text-[#F7F3EC] p-3 rounded-xl rounded-tl-sm max-w-[85%] text-[13px] shadow-lg">
                Welcome to Royal Rich Café. How may I assist you with your reservation today?
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-[#D4A24C]/20 bg-black/20">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full bg-[#0D0B09]/50 backdrop-blur-sm text-[#F7F3EC] border border-[#D4A24C]/30 rounded-full py-2.5 pl-4 pr-10 text-[13px] focus:outline-none focus:border-[#D4A24C] placeholder:text-[#C7BFB2]/50 transition-colors"
                  disabled
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#D4A24C] hover:text-[#c8963f] p-1">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-linear-to-tr from-[#D4A24C] to-[#c8963f] rounded-full flex items-center justify-center text-[#1A1410] shadow-[0_0_20px_rgba(212,162,76,0.3)] hover:scale-110 hover:shadow-[0_0_30px_rgba(212,162,76,0.5)] transition-all duration-300"
      >
        <MessageCircle size={28} className={isOpen ? "hidden" : "block"} />
        <X size={28} className={isOpen ? "block" : "hidden"} />
      </button>
    </motion.div>
    </>
  );
}
