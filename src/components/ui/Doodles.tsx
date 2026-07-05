import React from 'react';

export const LeafBranch: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M50 200 C 50 150, 20 120, 20 80 C 20 50, 40 20, 50 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
    {/* Leaves */}
    <path d="M50 150 Q 70 140, 80 160 Q 60 170, 50 150" fill="currentColor" fillOpacity="0.8"/>
    <path d="M42 120 Q 20 110, 10 130 Q 30 140, 42 120" fill="currentColor" fillOpacity="0.8"/>
    <path d="M35 80 Q 60 70, 70 90 Q 50 100, 35 80" fill="currentColor" fillOpacity="0.8"/>
    <path d="M28 50 Q 10 40, 5 60 Q 15 70, 28 50" fill="currentColor" fillOpacity="0.8"/>
    <path d="M45 20 Q 65 10, 75 30 Q 55 40, 45 20" fill="currentColor" fillOpacity="0.8"/>
  </svg>
);

export const TomatoesSketch: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Stems */}
    <path d="M100 20 C 100 50, 80 80, 60 100" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M100 20 C 120 40, 140 60, 140 90" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M100 20 C 130 10, 160 30, 150 50" stroke="currentColor" strokeWidth="2" fill="none"/>
    
    {/* Tomato 1 */}
    <circle cx="50" cy="120" r="40" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M30 100 Q 50 140, 70 100" stroke="currentColor" strokeWidth="1" fill="none"/>
    <path d="M45 80 L 55 90 L 65 80 L 50 100 Z" stroke="currentColor" strokeWidth="1" fill="currentColor"/>
    
    {/* Tomato 2 */}
    <circle cx="130" cy="110" r="35" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M110 95 Q 130 130, 150 95" stroke="currentColor" strokeWidth="1" fill="none"/>
    <path d="M125 75 L 135 85 L 145 75 L 130 95 Z" stroke="currentColor" strokeWidth="1" fill="currentColor"/>
    
    {/* Tomato 3 (small) */}
    <circle cx="160" cy="60" r="20" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M150 50 L 155 58 L 165 52 L 158 62 Z" stroke="currentColor" strokeWidth="1" fill="currentColor"/>
    
    {/* Leaves */}
    <path d="M100 20 Q 70 10, 60 30 Q 80 40, 100 20" stroke="currentColor" strokeWidth="1" fill="none"/>
    <path d="M100 20 Q 120 5, 140 15 Q 120 30, 100 20" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
);
