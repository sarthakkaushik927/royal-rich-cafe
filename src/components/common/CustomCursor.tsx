"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [ripples, setRipples] = useState<{ x: number, y: number, id: number }[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Detect touch device
    if (typeof window !== "undefined" && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      setIsTouchDevice(true);
    }

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handlePointerDown = (e: PointerEvent) => {
      const newRipple = { x: e.clientX, y: e.clientY, id: Date.now() };
      setRipples(prev => [...prev, newRipple]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 500);
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  if (!isMounted) return null;

  return (
    <>
      {/* Hide traditional cursor on mobile/touch screens */}
      {!isTouchDevice && (
        <motion.div
          className="fixed w-6 h-6 border-2 border-[#FFB846] rounded-full pointer-events-none z-[9999] flex items-center justify-center mix-blend-difference hidden md:flex"
          animate={{ x: mousePosition.x - 12, y: mousePosition.y - 12 }}
          transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
          style={{ top: 0, left: 0 }}
        >
          <div className="w-1.5 h-1.5 bg-[#FFB846] rounded-full" />
        </motion.div>
      )}

      {/* Global Touch Ripple Effect */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0.2, opacity: 0.6 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed w-8 h-8 rounded-full border border-[#FFB846] bg-[#FFB846]/20 pointer-events-none z-[10000] shadow-[0_0_15px_rgba(255,184,70,0.5)]"
            style={{ left: ripple.x - 16, top: ripple.y - 16 }}
          />
        ))}
      </AnimatePresence>
    </>
  );
}
