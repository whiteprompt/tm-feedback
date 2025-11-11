'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { usePathname } from 'next/navigation';
import { NotificationBell } from './NotificationBell';

export default function Navigation() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRequestsDropdownOpen, setIsRequestsDropdownOpen] = useState(false);
  const { isAdmin } = useAdmin();
  const pathname = usePathname();
  const requestsDropdownRef = useRef<HTMLDivElement>(null);

  // Helper function to determine if a route is active
  const isActive = useCallback((route: string) => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  }, [pathname]);

  // Helper function to check if requests dropdown should be active
  const isRequestsActive = useCallback(() => {
    return pathname.startsWith('/leaves') || pathname.startsWith('/expense-refunds');
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (requestsDropdownRef.current && !requestsDropdownRef.current.contains(event.target as Node)) {
        setIsRequestsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper function to get navigation link classes with White Prompt styling
  const getNavLinkClass = useCallback((route: string, isMobile = false) => {
    const baseClasses = isMobile
      ? "block px-6 py-3 text-base font-medium transition-all duration-300 rounded-lg mx-2 my-1 min-h-[48px] flex items-center justify-center"
      : "relative px-8 py-3 text-sm font-medium transition-all duration-300 rounded-lg min-h-[40px] min-w-[120px] flex items-center justify-center";
    
    const activeClasses = isMobile
      ? "bg-gradient-to-r from-wp-primary to-wp-accent text-white shadow-lg"
      : "bg-gradient-to-r from-wp-primary/20 to-wp-accent/20 text-wp-primary border border-wp-primary/30 shadow-glow";
    
    const inactiveClasses = isMobile
      ? "text-wp-text-secondary hover:text-wp-primary hover:bg-wp-primary/10"
      : "text-wp-text-secondary hover:text-wp-primary hover:bg-wp-primary/10";

    return `${baseClasses} ${isActive(route) ? activeClasses : inactiveClasses}`;
  }, [isActive]);

  // Helper function to get dropdown button classes
  const getDropdownButtonClass = useCallback((isMobile = false) => {
    const baseClasses = isMobile
      ? "block px-6 py-3 text-base font-medium transition-all duration-300 rounded-lg mx-2 my-1 min-h-[48px] flex items-center justify-center w-full"
      : "relative px-8 py-3 text-sm font-medium transition-all duration-300 rounded-lg min-h-[40px] min-w-[120px] flex items-center justify-center";
    
    const activeClasses = isMobile
      ? "bg-gradient-to-r from-wp-primary to-wp-accent text-white shadow-lg"
      : "bg-gradient-to-r from-wp-primary/20 to-wp-accent/20 text-wp-primary border border-wp-primary/30 shadow-glow";
    
    const inactiveClasses = isMobile
      ? "text-wp-text-secondary hover:text-wp-primary hover:bg-wp-primary/10"
      : "text-wp-text-secondary hover:text-wp-primary hover:bg-wp-primary/10";

    return `${baseClasses} ${isRequestsActive() ? activeClasses : inactiveClasses}`;
  }, [isRequestsActive]);


  // Pre-calculate navigation classes to prevent flickering
  const navClasses = useMemo(() => ({
    home: getNavLinkClass('/'),
    submittedFeedbacks: getNavLinkClass('/feedbacks'),
    leaves: getNavLinkClass('/leaves'),
    expenseRefunds: getNavLinkClass('/expense-refunds'),
    presentations: getNavLinkClass('/presentations'),
    company: getNavLinkClass('/company'),
    admin: getNavLinkClass('/admin'),
    requestsDropdown: getDropdownButtonClass(),
    requestsDropdownMobile: getDropdownButtonClass(true),
    homeMobile: getNavLinkClass('/', true),
    submittedFeedbacksMobile: getNavLinkClass('/feedbacks', true),
    leavesMobile: getNavLinkClass('/leaves', true),
    expenseRefundsMobile: getNavLinkClass('/expense-refunds', true),
    presentationsMobile: getNavLinkClass('/presentations', true),
    companyMobile: getNavLinkClass('/company', true),
    adminMobile: getNavLinkClass('/admin', true),
  }), [getNavLinkClass, getDropdownButtonClass]);

  return (
    <nav className="backdrop-filter backdrop-blur-lg from-wp-dark/95 to-wp-dark-lighter/90 border-b border-wp-border/30 sticky top-0 z-50">
      <div className="wp-container">
        <div className="flex justify-between items-center h-20">
          <div className="shrink-0 flex items-center">
            <Link href="/" className="flex items-center group">
              <Image
                src="/logo.svg"
                alt="White Prompt Logo"
                width={140}
                height={35}
                priority
                className="h-8 w-auto filter brightness-0 invert transition-all duration-300 group-hover:brightness-110 group-hover:scale-105"
              />             
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden lg:flex lg:items-center gap-1">
            <Link href="/" className={navClasses.home}>
              Home
            </Link>
            <Link href="/feedbacks" className={navClasses.submittedFeedbacks}>
              <span className="text-center leading-tight">
                Feedbacks
              </span>
            </Link>
            
            {/* Requests dropdown */}
            <div className="relative" ref={requestsDropdownRef}>
              <button
                onClick={() => setIsRequestsDropdownOpen(!isRequestsDropdownOpen)}
                className={navClasses.requestsDropdown}
              >
                <span className="text-center leading-tight">
                  Requests
                </span>
                <svg
                  className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                    isRequestsDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isRequestsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-wp-dark border border-wp-border/30 rounded-lg shadow-lg z-50">
                  <Link
                    href="/leaves"
                    className={`block px-6 py-4 text-base transition-all duration-300 rounded-t-lg ${
                      isActive('/leaves') 
                        ? 'from-wp-primary/20 to-wp-accent/20 text-wp-primary border-l-2 border-wp-primary' 
                        : 'text-wp-text-secondary hover:text-wp-primary hover:bg-wp-primary/10'
                    }`}
                    onClick={() => setIsRequestsDropdownOpen(false)}
                  >
                    Leaves
                  </Link>
                  <Link
                    href="/expense-refunds"
                    className={`block px-6 py-4 text-base transition-all duration-300 rounded-b-lg ${
                      isActive('/expense-refunds') 
                        ? 'from-wp-primary/20 to-wp-accent/20 text-wp-primary border-l-2 border-wp-primary' 
                        : 'text-wp-text-secondary hover:text-wp-primary hover:bg-wp-primary/10'
                    }`}
                    onClick={() => setIsRequestsDropdownOpen(false)}
                  >
                    Expense Refunds
                  </Link>
                </div>
              )}
            </div>

            <Link href="/presentations" className={navClasses.presentations}>
              Presentations
            </Link>
            <Link href="/company" className={navClasses.company}>
              Company
            </Link>
            {isAdmin && (
              <Link href="/admin" className={navClasses.admin}>
                Admin
              </Link>
            )}
            <div className="flex items-center space-x-3 ml-8 pl-8 border-l border-wp-border/50">
              {session && <NotificationBell />}
              {session ? (
                <button
                  onClick={() => signOut()}
                  className="wp-button-primary"
                >
                  Sign out
                </button>
              ) : (
                <Link href="/auth/signin" className="wp-button-primary">
                  Sign in
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 rounded-lg text-wp-text-secondary hover:text-wp-primary hover:bg-wp-primary/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-wp-primary/50"
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative w-6 h-6">
                <span
                  className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                    isMenuOpen ? 'rotate-45 translate-y-2' : 'translate-y-0'
                  }`}
                />
                <span
                  className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out translate-y-2 ${
                    isMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                    isMenuOpen ? '-rotate-45 translate-y-2' : 'translate-y-4'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${
        isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-4 pt-2 pb-6 space-y-2 bg-wp-dark-lighter/95 backdrop-blur-lg border-t border-wp-border/30">
          <Link
            href="/"
            className={navClasses.homeMobile}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/feedbacks"
            className={navClasses.submittedFeedbacksMobile}
            onClick={() => setIsMenuOpen(false)}
          >
            Feedbacks
          </Link>
          
          <Link
            href="/leaves"
            className={navClasses.leavesMobile}
            onClick={() => setIsMenuOpen(false)}
          >
            Leaves
          </Link>
          <Link
            href="/expense-refunds"
            className={navClasses.expenseRefundsMobile}
            onClick={() => setIsMenuOpen(false)}
          >
            Expense Refunds
          </Link>

          <Link
            href="/presentations"
            className={navClasses.presentationsMobile}
            onClick={() => setIsMenuOpen(false)}
          >
            Presentations
          </Link>
          <Link
            href="/company"
            className={navClasses.companyMobile}
            onClick={() => setIsMenuOpen(false)}
          >
            Company
          </Link>
          <Link
            href="/admin"
            className={navClasses.adminMobile}
            onClick={() => setIsMenuOpen(false)}
          >
            Admin
          </Link>
          <div className="pt-4 mt-4 border-t border-wp-border/30">
            {session && (
              <div className="mb-4 flex justify-center">
                <NotificationBell />
              </div>
            )}
            {session ? (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  signOut();
                }}
                className="w-full wp-button-primary"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/auth/signin"
                className="block w-full wp-button-primary text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}