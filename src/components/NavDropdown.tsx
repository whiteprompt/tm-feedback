'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export interface NavDropdownItem {
  href: string;
  label: string;
}

interface NavDropdownProps {
  label: string;
  items: NavDropdownItem[];
  buttonClassName?: string;
  isActive?: (pathname: string) => boolean;
}

export default function NavDropdown({
  label,
  items,
  buttonClassName,
}: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't close if clicking on a button or inside a button
      const isButton = target.tagName === 'BUTTON' || target.closest('button') !== null;
      if (isButton) {
        return; // Let the button handle its own click
      }
      
      // Check if click is inside the dropdown container
      const clickedInside = dropdownRef.current?.contains(target);
      
      // Only close if clicking outside
      if (dropdownRef.current && !clickedInside) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Helper to check if a specific route is active
  const isItemActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClassName}
      >
        <span className="text-center leading-tight">
          {label}
        </span>
        <svg
          className={`
            ml-2 h-4 w-4 transition-transform duration-200
            ${
            isOpen ? 'rotate-180' : ''
          }
          `}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className={`
          border-wp-border/30 absolute top-full left-0 z-50 mt-1 w-56 rounded-lg
          border bg-gray-800 shadow-lg
        `}>
          {items.map((item, index) => {
            const active = isItemActive(item.href);
            const isFirst = index === 0;
            const isLast = index === items.length - 1;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block px-6 py-4 text-base transition-all duration-300
                  ${
                  isFirst ? 'rounded-t-lg' : ''
                }
                  ${
                  isLast ? 'rounded-b-lg' : ''
                }
                  ${
                  active 
                    ? 'bg-[#00D9FF] text-black' 
                    : `
                      text-white
                      hover:bg-[#00D9FF]/20
                    `
                }
                `}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

