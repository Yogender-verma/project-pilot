'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
  const [isMobile, setIsMobile] = useState(true); // stay hidden until we confirm it's desktop
  const [isVisible, setIsVisible] = useState(false);

  // Raw mouse position — updating these does NOT trigger a React re-render
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Spring physics wrapped around the raw values, this creates the "trailing" feel
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  // Detect touch / mobile devices using the (pointer: coarse) media query
  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    setIsMobile(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Track the mouse, only on desktop
  useEffect(() => {
    if (isMobile) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [isMobile, isVisible, cursorX, cursorY]);

  if (isMobile) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[9999] hidden sm:block"
      style={{
        translateX: springX,
        translateY: springY,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Soft outer glow */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-400/40 blur-md" />
      {/* Bright core dot */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-300 shadow-[0_0_12px_4px_rgba(99,102,241,0.6)]" />
    </motion.div>
  );
}