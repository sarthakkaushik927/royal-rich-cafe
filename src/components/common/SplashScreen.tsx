"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Show splash screen for exactly 1 second
    const timer = setTimeout(() => {
      setShow(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[99999] bg-black flex items-center justify-center flex-col"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <span className="font-[Marcellus] text-[#FFB846] text-4xl md:text-5xl tracking-[0.15em] uppercase text-center px-4">
              Royal Cafe
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
