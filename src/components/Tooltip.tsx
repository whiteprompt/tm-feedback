'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export default function Tooltip({ content, children, className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      // Position tooltip above the trigger element
      let top = triggerRect.top - tooltipRect.height - 8;
      let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
      
      // Adjust if tooltip goes off screen
      if (left < 8) left = 8;
      if (left + tooltipRect.width > window.innerWidth - 8) {
        left = window.innerWidth - tooltipRect.width - 8;
      }
      
      // If tooltip goes above viewport, show it below instead
      if (top < 8) {
        top = triggerRect.bottom + 8;
      }
      
      setPosition({ top, left });
    }
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      className={`
        relative inline-block
        ${className}
      `}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div
          ref={tooltipRef}
          className="pointer-events-none fixed z-[9999]"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className={`
            bg-wp-dark-card border-wp-border text-wp-text-primary max-w-xs
            rounded-lg border px-3 py-2 shadow-lg
          `}>
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
