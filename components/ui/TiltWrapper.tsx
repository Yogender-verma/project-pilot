'use client';

import React, { useRef, useState, useEffect } from 'react';

interface TiltWrapperProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const TiltWrapper: React.FC<TiltWrapperProps> = ({ children, className, disabled = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile and touch devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0)
      );
    };
    checkMobile();
  }, []);

  if (disabled || isMobile) {
    return <div className={className}>{children}</div>;
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = containerRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Position coordinates relative to the card's center (ranging from -0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    // Calculate rotation angles (max tilt angle of 7 degrees is very premium and clean)
    const maxTilt = 7;
    const rotateX = -mouseY * maxTilt;
    const rotateY = mouseX * maxTilt;

    // Glare position relative coordinates (0% to 100%)
    const glareX = ((e.clientX - rect.left) / width) * 100;
    const glareY = ((e.clientY - rect.top) / height) * 100;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`,
      transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)',
    });

    setGlareStyle({
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(139, 92, 246, 0.16) 0%, rgba(236, 72, 153, 0.08) 25%, rgba(255, 255, 255, 0) 70%)`,
      opacity: 1,
      transition: 'opacity 0.15s ease',
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
    });
    setGlareStyle({
      opacity: 0,
      transition: 'opacity 0.4s ease',
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transformStyle: 'preserve-3d',
        position: 'relative',
        ...tiltStyle,
      }}
    >
      {children}
      {/* Glare Effect Layer */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl z-30"
        style={{
          mixBlendMode: 'overlay',
          ...glareStyle,
        }}
      />
    </div>
  );
};
