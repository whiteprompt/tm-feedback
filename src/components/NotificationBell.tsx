'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';

export function NotificationBell() {
  const { unreadCount, loading } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`
          text-wp-text-secondary relative rounded-lg p-2 transition-all
          duration-300
          hover:text-wp-primary hover:bg-wp-primary/10
          focus:ring-wp-primary/50 focus:ring-2 focus:outline-none
        `}
        aria-label="Notifications"
      >
        {/* Bell Icon */}
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className={`
            from-wp-primary to-wp-accent absolute -top-1 -right-1 flex h-5 w-5
            animate-pulse items-center justify-center rounded-full
            bg-linear-to-r text-xs font-bold text-white shadow-lg
          `}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className={`
            border-wp-primary absolute -top-1 -right-1 h-5 w-5 animate-spin
            rounded-full border-2 border-t-transparent
          `} />
        )}
      </button>
    </div>
  );
}
