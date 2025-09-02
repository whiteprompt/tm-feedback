'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin } = useAdmin();
  const [showPresentations, setShowPresentations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Helper function to determine if a route is active
  const isActive = useCallback((route: string) => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  }, [pathname]);

  // Helper function to get navigation link classes - memoized to prevent flicker
  const getNavLinkClass = useCallback((route: string, isMobile = false) => {
    const baseClasses = isMobile
      ? "block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
      : "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
    
    const activeClasses = isMobile
      ? "border-[#00A3B4] text-[#00A3B4] bg-teal-50"
      : "border-[#00A3B4] text-[#00A3B4]";
    
    const inactiveClasses = isMobile
      ? "border-transparent text-gray-500 hover:bg-gray-50 hover:border-[#00A3B4] hover:text-[#00A3B4]"
      : "border-transparent text-gray-500 hover:border-[#00A3B4] hover:text-[#00A3B4]";

    return `${baseClasses} ${isActive(route) ? activeClasses : inactiveClasses}`;
  }, [isActive]);

  useEffect(() => {
    const fetchFeatureStatus = async () => {
      try {
        const response = await fetch('/api/settings?key=show_presentations');
        if (response.ok) {
          const data = await response.json();
          setShowPresentations(data.value.enabled);
        }
      } catch (error) {
        console.error('Error fetching feature status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.email) {
      fetchFeatureStatus();
    } else {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  // Pre-calculate navigation classes to prevent flickering
  const navClasses = useMemo(() => ({
    home: getNavLinkClass('/'),
    submittedFeedbacks: getNavLinkClass('/submitted-feedbacks'),
    presentations: getNavLinkClass('/presentations'),
    admin: getNavLinkClass('/admin'),
    homeMobile: getNavLinkClass('/', true),
    submittedFeedbacksMobile: getNavLinkClass('/submitted-feedbacks', true),
    presentationsMobile: getNavLinkClass('/presentations', true),
    adminMobile: getNavLinkClass('/admin', true),
  }), [getNavLinkClass]);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="White Prompt Logo"
                width={140}
                height={35}
                priority
                className="h-8 w-auto"
              />
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link
              href="/"
              className={navClasses.home}
            >
              Home
            </Link>
            <Link
              href="/submitted-feedbacks"
              className={navClasses.submittedFeedbacks}
            >
              Submitted Feedbacks
            </Link>
            {!isLoading && showPresentations && (
              <Link
                href="/presentations"
                className={navClasses.presentations}
              >
                Presentations
              </Link>
            )}
            {!isLoading && isAdmin && (
              <Link
                href="/admin"
                className={navClasses.admin}
              >
                Admin
              </Link>
            )}
            {session ? (
              <button
                onClick={() => signOut()}
                className="bg-[#00A3B4] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#008C9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A3B4]"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-[#00A3B4] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#008C9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A3B4]"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile menu hanburguer button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#00A3B4]"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={navClasses.homeMobile}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/submitted-feedbacks"
            className={navClasses.submittedFeedbacksMobile}
            onClick={() => setIsMenuOpen(false)}
          >
            Submitted Feedbacks
          </Link>
          {!isLoading && showPresentations && (
            <Link
              href="/presentations"
              className={navClasses.presentationsMobile}
              onClick={() => setIsMenuOpen(false)}
            >
              Presentations
            </Link>
          )}
          {!isLoading && isAdmin && (
            <Link
              href="/admin"
              className={navClasses.adminMobile}
              onClick={() => setIsMenuOpen(false)}
            >
              Admin
            </Link>
          )}
          {session ? (
            <button
              onClick={() => {
                setIsMenuOpen(false);
                signOut();
              }}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-[#00A3B4] hover:text-[#00A3B4]"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/auth/signin"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-[#00A3B4] hover:text-[#00A3B4]"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 
