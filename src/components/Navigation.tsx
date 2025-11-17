'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationsContext';
import NavDropdown from './NavDropdown';

export default function Navigation() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useNotifications();

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't close if clicking on a button or inside a button
      const isButton = target.tagName === 'BUTTON' || target.closest('button') !== null;
      if (isButton) {
        return; // Let the button handle its own click
      }
      
      // Check if click is inside the dropdown containers
      const clickedInsideUserMenu = userMenuRef.current?.contains(target);
      
      // Only close if clicking outside
      if (userMenuRef.current && !clickedInsideUserMenu) {
        setIsUserMenuOpen(false);
      }
    };

    // Use click event - we check for buttons first to avoid closing
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Helper function to get user initials
  const getUserInitials = useCallback(() => {
    if (session?.user?.name) {
      const names = session.user.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return session.user.name.substring(0, 2).toUpperCase();
    }
    if (session?.user?.email) {
      return session.user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  }, [session]);


  // Helper function to get navigation link classes with White Prompt styling
  const getNavLinkClass = useCallback((route: string, isMobile = false) => {
    const baseClasses = isMobile
      ? "block px-6 py-3 text-base font-medium transition-all duration-300 rounded-lg mx-2 my-1 min-h-[48px] flex items-center justify-center"
      : "relative px-8 py-3 text-sm font-medium transition-all duration-300 rounded-lg min-h-[40px] min-w-[120px] flex items-center justify-center";
    
    const activeClasses = isMobile
      ? "bg-[#00D9FF] text-black shadow-lg"
      : "bg-[#00D9FF] text-black";
    
    const inactiveClasses = isMobile
      ? "text-white hover:bg-[#00D9FF]/20"
      : "text-white hover:bg-[#00D9FF]/20";

    return `${baseClasses} ${isActive(route) ? activeClasses : inactiveClasses}`;
  }, [isActive]);

  // Helper function to get dropdown button classes
  const getDropdownButtonClass = useCallback((isMobile = false) => {
    const baseClasses = isMobile
      ? "block px-6 py-3 text-base font-medium transition-all duration-300 rounded-lg mx-2 my-1 min-h-[48px] flex items-center justify-center w-full"
      : "relative px-8 py-3 text-sm font-medium transition-all duration-300 rounded-lg min-h-[40px] min-w-[120px] flex items-center justify-center";
    
    const activeClasses = isMobile
      ? "bg-[#00D9FF] text-black shadow-lg"
      : "bg-[#00D9FF] text-black";
    
    const inactiveClasses = isMobile
      ? "text-white hover:bg-[#00D9FF]/20"
      : "text-white hover:bg-[#00D9FF]/20";

    return `${baseClasses} ${isRequestsActive() ? activeClasses : inactiveClasses}`;
  }, [isRequestsActive]);


  // Pre-calculate navigation classes to prevent flickering
  const navClasses = useMemo(() => ({
    home: getNavLinkClass('/'),
    myProfile: getNavLinkClass('/my-profile'),
    myProjects: getNavLinkClass('/my-projects'),
    leaves: getNavLinkClass('/leaves'),
    expenseRefunds: getNavLinkClass('/expense-refunds'),
    admin: getNavLinkClass('/admin'),
    requestsDropdown: getDropdownButtonClass(),
    requestsDropdownMobile: getDropdownButtonClass(true),
    homeMobile: getNavLinkClass('/', true),
    myProfileMobile: getNavLinkClass('/my-profile', true),
    myProjectsMobile: getNavLinkClass('/my-projects', true),
    leavesMobile: getNavLinkClass('/leaves', true),
    expenseRefundsMobile: getNavLinkClass('/expense-refunds', true),
    adminMobile: getNavLinkClass('/admin', true),
  }), [getNavLinkClass, getDropdownButtonClass]);

  return (
    <nav className="backdrop-filter backdrop-blur-lg from-wp-dark/95 to-wp-dark-lighter/90 border-b border-wp-border/30 sticky top-0 z-50">
      <div className="wp-container">
        <div className="flex justify-between items-center h-20">
          <div className="shrink-0 flex items-center">
            <Link href="/" className="flex items-center group transition-all duration-300 hover:scale-105">
              <span className="text-2xl md:text-3xl font-bold">
                <span className="text-white">white</span>
                <span className="text-[#00D9FF]">prompt</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden lg:flex lg:items-center gap-1">
            <Link href="/" className={navClasses.home}>
              Home
            </Link>
            <Link href="/my-profile" className={navClasses.myProfile}>
              My Profile
            </Link>
            <Link href="/my-projects" className={navClasses.myProjects}>
              My Projects
            </Link>
            
            {/* Requests dropdown */}
            <NavDropdown
              label="My Requests"
              items={[
                { href: '/leaves', label: 'Leaves' },
                { href: '/expense-refunds', label: 'Expense Refunds' },
              ]}
              buttonClassName={navClasses.requestsDropdown}
              isActive={(pathname) => {
                return pathname.startsWith('/leaves') || pathname.startsWith('/expense-refunds');
              }}
            />

            <div className="flex items-center border-l border-wp-border/50 pl-4">
              {session ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#00D9FF]/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-wp-primary/50"
                  >
                    {/* Avatar */}
                    <div className="relative">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user?.name || 'User'}
                          className="h-10 w-10 rounded-full border-2 border-[#00D9FF]"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-[#00D9FF] flex items-center justify-center border-2 border-[#00D9FF]">
                          <span className="text-black font-semibold text-sm">
                            {getUserInitials()}
                          </span>
                        </div>
                      )}
                      {/* Unread notification badge */}
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#00D9FF] text-black text-xs font-bold rounded-full flex items-center justify-center border-2 border-wp-dark">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    {/* Dropdown arrow */}
                    <svg
                      className={`h-4 w-4 text-white transition-transform duration-200 ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Menu Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-wp-dark border border-wp-border/30 rounded-lg shadow-lg z-50 overflow-hidden">
                      {/* User Info Section */}
                      <div className="px-4 py-4 border-b border-wp-border/30 bg-wp-dark-lighter/50">
                        <div className="flex items-center gap-3">
                          {session.user?.image ? (
                            <img
                              src={session.user.image}
                              alt={session.user?.name || 'User'}
                              className="h-12 w-12 rounded-full border-2 border-[#00D9FF]"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-[#00D9FF] flex items-center justify-center border-2 border-[#00D9FF]">
                              <span className="text-black font-semibold">
                                {getUserInitials()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {session.user?.name || 'User'}
                            </p>
                            <p className="text-xs text-wp-text-secondary truncate">
                              {session.user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsUserMenuOpen(false);
                            router.push('/notifications');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#00D9FF]/20 transition-all duration-200 relative text-left"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <span className="flex-1">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-[#00D9FF] text-black text-xs font-bold rounded-full">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Sign Out Button */}
                      <div className="px-4 py-3 border-t border-wp-border/30 bg-wp-dark-lighter/50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsUserMenuOpen(false);
                            signOut();
                          }}
                          className="w-full px-4 py-2 bg-[#00D9FF] text-black font-semibold rounded-lg hover:bg-[#00D9FF]/90 transition-all duration-300"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/signin" className="wp-button-primary">
                  Sign in
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 lg:hidden">
            {session && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 rounded-lg hover:bg-[#00D9FF]/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-wp-primary/50"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user?.name || 'User'}
                      className="h-8 w-8 rounded-full border-2 border-[#00D9FF]"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#00D9FF] flex items-center justify-center border-2 border-[#00D9FF]">
                      <span className="text-black font-semibold text-xs">
                        {getUserInitials()}
                      </span>
                    </div>
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#00D9FF] text-black text-xs font-bold rounded-full flex items-center justify-center border-2 border-wp-dark text-[10px]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {/* Mobile User Menu - same as desktop but positioned differently */}
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-wp-dark border border-wp-border/30 rounded-lg shadow-lg z-50 overflow-hidden">
                    {/* User Info Section */}
                    <div className="px-4 py-4 border-b border-wp-border/30 bg-wp-dark-lighter/50">
                      <div className="flex items-center gap-3">
                        {session.user?.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user?.name || 'User'}
                            className="h-12 w-12 rounded-full border-2 border-[#00D9FF]"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-[#00D9FF] flex items-center justify-center border-2 border-[#00D9FF]">
                            <span className="text-black font-semibold">
                              {getUserInitials()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {session.user?.name || 'User'}
                          </p>
                          <p className="text-xs text-wp-text-secondary truncate">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsUserMenuOpen(false);
                          router.push('/notifications');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#00D9FF]/20 transition-all duration-200 relative text-left"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="flex-1">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-[#00D9FF] text-black text-xs font-bold rounded-full">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Sign Out Button */}
                    <div className="px-4 py-3 border-t border-wp-border/30 bg-wp-dark-lighter/50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsUserMenuOpen(false);
                          signOut();
                        }}
                        className="w-full px-4 py-2 bg-[#00D9FF] text-black font-semibold rounded-lg hover:bg-[#00D9FF]/90 transition-all duration-300"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
            href="/my-profile"
            className={navClasses.myProfileMobile}
            onClick={() => setIsMenuOpen(false)}
          >
            My Profile
          </Link>
          <Link
            href="/my-projects"
            className={navClasses.myProjectsMobile}
            onClick={() => setIsMenuOpen(false)}
          >
            My Projects
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
          {!session && (
            <div className="pt-4 mt-4 border-t border-wp-border/30">
              <Link
                href="/auth/signin"
                className="block w-full wp-button-primary text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}