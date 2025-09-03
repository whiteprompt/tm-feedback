'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useCallback, useMemo } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useSettings } from '@/contexts/SettingsContext';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin } = useAdmin();
  const { settings, loading: settingsLoading } = useSettings();
  const pathname = usePathname();

  // Helper function to determine if a route is active
  const isActive = useCallback((route: string) => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  }, [pathname]);

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


  // Pre-calculate navigation classes to prevent flickering
  const navClasses = useMemo(() => ({
    home: getNavLinkClass('/'),
    submittedFeedbacks: getNavLinkClass('/submitted-feedbacks'),
    leaves: getNavLinkClass('/leaves'),
    company: getNavLinkClass('/company'),
    presentations: getNavLinkClass('/presentations'),
    admin: getNavLinkClass('/admin'),
    homeMobile: getNavLinkClass('/', true),
    submittedFeedbacksMobile: getNavLinkClass('/submitted-feedbacks', true),
    leavesMobile: getNavLinkClass('/leaves', true),
    companyMobile: getNavLinkClass('/company', true),
    presentationsMobile: getNavLinkClass('/presentations', true),
    adminMobile: getNavLinkClass('/admin', true),
  }), [getNavLinkClass]);

  return (
    <nav className="backdrop-filter backdrop-blur-lg bg-gradient-to-r from-wp-dark/95 to-wp-dark-lighter/90 border-b border-wp-border/30 sticky top-0 z-50">
      <div className="wp-container">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
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
          <div className="hidden lg:flex lg:items-center gap-8">
            <Link href="/" className={navClasses.home}>
              Home
            </Link>
            <Link href="/submitted-feedbacks" className={navClasses.submittedFeedbacks}>
              <span className="text-center leading-tight">
                Submitted<br />Feedbacks
              </span>
            </Link>
            <Link href="/leaves" className={navClasses.leaves}>
              Leaves
            </Link>
            <Link href="/company" className={navClasses.company}>
              Company
            </Link>
            {!settingsLoading && settings.showPresentations && (
              <Link href="/presentations" className={navClasses.presentations}>
                Presentations
              </Link>
            )}
            {!settingsLoading && isAdmin && (
              <Link href="/admin" className={navClasses.admin}>
                Admin
              </Link>
            )}
            <div className="flex items-center space-x-3 ml-8 pl-8 border-l border-wp-border/50">
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
            href="/submitted-feedbacks"
            className={navClasses.submittedFeedbacksMobile}
            onClick={() => setIsMenuOpen(false)}
          >
            Submitted Feedbacks
          </Link>
          <Link
            href="/leaves"
            className={navClasses.leavesMobile}
            onClick={() => setIsMenuOpen(false)}
          >
            Leaves
          </Link>
          <Link
            href="/company"
            className={navClasses.companyMobile}
            onClick={() => setIsMenuOpen(false)}
          >
            Company
          </Link>
          {!settingsLoading && settings.showPresentations && (
            <Link
              href="/presentations"
              className={navClasses.presentationsMobile}
              onClick={() => setIsMenuOpen(false)}
            >
              Presentations
            </Link>
          )}
          {!settingsLoading && isAdmin && (
            <Link
              href="/admin"
              className={navClasses.adminMobile}
              onClick={() => setIsMenuOpen(false)}
            >
              Admin
            </Link>
          )}
          <div className="pt-4 mt-4 border-t border-wp-border/30">
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