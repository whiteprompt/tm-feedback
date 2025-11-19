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
    return pathname.startsWith('/leaves') || pathname.startsWith('/expense-refunds') || pathname.startsWith('/other-requests');
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
    <nav className={`
      from-wp-dark/95 to-wp-dark-lighter/90 border-wp-border/30 sticky top-0
      z-50 border-b backdrop-blur-lg backdrop-filter
    `} style={{ borderBottomWidth: '1px', borderBottomColor: '#00C7D0' }}>
      <div className="wp-container">
        <div className="flex h-20 items-center justify-between">
          <div className="flex shrink-0 items-center">
            <Link href="/" className={`
              group flex items-center transition-all duration-300
              hover:scale-105
            `}>
              <span className={`
                text-2xl font-bold
                md:text-3xl
              `}>
                <span className="text-white">white</span>
                <span className="text-[#00D9FF]">prompt</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className={`
            hidden gap-1
            lg:flex lg:items-center
          `}>
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
                { href: '/other-requests', label: 'Other Requests' },
              ]}
              buttonClassName={navClasses.requestsDropdown}
              isActive={(pathname) => {
                return pathname.startsWith('/leaves') || pathname.startsWith('/expense-refunds') || pathname.startsWith('/other-requests');
              }}
            />

            <div className="border-wp-border/50 flex items-center border-l pl-4">
              {session ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`
                      focus:ring-wp-primary/50 focus:ring-2 focus:outline-none
                      flex items-center gap-3 rounded-lg p-2 transition-all
                      duration-300
                      hover:bg-[#00D9FF]/20
                    `}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user?.name || 'User'}
                          className={`
                            h-10 w-10 rounded-full border-2 border-[#00D9FF]
                          `}
                        />
                      ) : (
                        <div className={`
                          flex h-10 w-10 items-center justify-center
                          rounded-full border-2 border-[#00D9FF] bg-[#00D9FF]
                        `}>
                          <span className="text-sm font-semibold text-black">
                            {getUserInitials()}
                          </span>
                        </div>
                      )}
                      {/* Unread notification badge */}
                      {unreadCount > 0 && (
                        <span className={`
                          border-wp-dark absolute -top-1 -right-1 flex h-5 w-5
                          items-center justify-center rounded-full border-2
                          bg-[#00D9FF] text-xs font-bold text-black
                        `}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    {/* Dropdown arrow */}
                    <svg
                      className={`
                        h-4 w-4 text-white transition-transform duration-200
                        ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }
                      `}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Menu Dropdown */}
                  {isUserMenuOpen && (
                    <div className={`
                      border-wp-border/30 absolute top-full right-0 z-50 mt-2
                      w-64 overflow-hidden rounded-lg border bg-gray-800
                      shadow-lg
                    `}>
                      {/* User Info Section */}
                      <div className={`
                        border-wp-border/30 border-b bg-gray-700/50 px-4 py-4
                      `}>
                        <div className="flex items-center gap-3">
                          {session.user?.image ? (
                            <img
                              src={session.user.image}
                              alt={session.user?.name || 'User'}
                              className={`
                                h-12 w-12 rounded-full border-2 border-[#00D9FF]
                              `}
                            />
                          ) : (
                            <div className={`
                              flex h-12 w-12 items-center justify-center
                              rounded-full border-2 border-[#00D9FF]
                              bg-[#00D9FF]
                            `}>
                              <span className="font-semibold text-black">
                                {getUserInitials()}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className={`
                              truncate text-sm font-semibold text-white
                            `}>
                              {session.user?.name || 'User'}
                            </p>
                            <p className={`
                              text-wp-text-secondary truncate text-xs
                            `}>
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
                          className={`
                            relative flex w-full cursor-pointer items-center
                            gap-3 px-4 py-3 text-left text-sm text-white
                            transition-all duration-200
                            hover:bg-[#00D9FF]/20
                          `}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <span className="flex-1">Notifications</span>
                          {unreadCount > 0 && (
                            <span className={`
                              rounded-full bg-[#00D9FF] px-2 py-0.5 text-xs
                              font-bold text-black
                            `}>
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Sign Out Button */}
                      <div className={`
                        border-wp-border/30 border-t bg-gray-700/50 px-4 py-3
                      `}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsUserMenuOpen(false);
                            signOut();
                          }}
                          className={`
                            w-full cursor-pointer rounded-lg bg-[#00D9FF] px-4
                            py-2 font-semibold text-black transition-all
                            duration-300
                            hover:bg-[#00D9FF]/90
                          `}
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
          <div className={`
            flex items-center gap-4
            lg:hidden
          `}>
            {session && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`
                    focus:ring-wp-primary/50 focus:ring-2 focus:outline-none
                    rounded-lg p-2 transition-all duration-300
                    hover:bg-[#00D9FF]/20
                  `}
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user?.name || 'User'}
                      className="h-8 w-8 rounded-full border-2 border-[#00D9FF]"
                    />
                  ) : (
                    <div className={`
                      flex h-8 w-8 items-center justify-center rounded-full
                      border-2 border-[#00D9FF] bg-[#00D9FF]
                    `}>
                      <span className="text-xs font-semibold text-black">
                        {getUserInitials()}
                      </span>
                    </div>
                  )}
                  {unreadCount > 0 && (
                    <span className={`
                      border-wp-dark absolute -top-1 -right-1 flex h-4 w-4
                      items-center justify-center rounded-full border-2
                      bg-[#00D9FF] text-xs text-[10px] font-bold text-black
                    `}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {/* Mobile User Menu - same as desktop but positioned differently */}
                {isUserMenuOpen && (
                  <div className={`
                    border-wp-border/30 absolute top-full right-0 z-50 mt-2 w-64
                    overflow-hidden rounded-lg border bg-gray-800 shadow-lg
                  `}>
                    {/* User Info Section */}
                    <div className={`
                      border-wp-border/30 border-b bg-gray-700/50 px-4 py-4
                    `}>
                      <div className="flex items-center gap-3">
                        {session.user?.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user?.name || 'User'}
                            className={`
                              h-12 w-12 rounded-full border-2 border-[#00D9FF]
                            `}
                          />
                        ) : (
                          <div className={`
                            flex h-12 w-12 items-center justify-center
                            rounded-full border-2 border-[#00D9FF] bg-[#00D9FF]
                          `}>
                            <span className="font-semibold text-black">
                              {getUserInitials()}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={`
                            truncate text-sm font-semibold text-white
                          `}>
                            {session.user?.name || 'User'}
                          </p>
                          <p className="text-wp-text-secondary truncate text-xs">
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
                        className={`
                          relative flex w-full cursor-pointer items-center gap-3
                          px-4 py-3 text-left text-sm text-white transition-all
                          duration-200
                          hover:bg-[#00D9FF]/20
                        `}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="flex-1">Notifications</span>
                        {unreadCount > 0 && (
                          <span className={`
                            rounded-full bg-[#00D9FF] px-2 py-0.5 text-xs
                            font-bold text-black
                          `}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Sign Out Button */}
                    <div className={`
                      border-wp-border/30 border-t bg-gray-700/50 px-4 py-3
                    `}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsUserMenuOpen(false);
                          signOut();
                        }}
                        className={`
                          w-full cursor-pointer rounded-lg bg-[#00D9FF] px-4
                          py-2 font-semibold text-black transition-all
                          duration-300
                          hover:bg-[#00D9FF]/90
                        `}
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
              className={`
                text-wp-text-secondary rounded-lg p-3 transition-all
                duration-300
                hover:text-wp-primary hover:bg-wp-primary/10
                focus:ring-wp-primary/50 focus:ring-2 focus:outline-none
              `}
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative h-6 w-6">
                <span
                  className={`
                    absolute block h-0.5 w-6 transform bg-current transition
                    duration-300 ease-in-out
                    ${
                    isMenuOpen ? 'translate-y-2 rotate-45' : 'translate-y-0'
                  }
                  `}
                />
                <span
                  className={`
                    absolute block h-0.5 w-6 translate-y-2 transform bg-current
                    transition duration-300 ease-in-out
                    ${
                    isMenuOpen ? 'opacity-0' : 'opacity-100'
                  }
                  `}
                />
                <span
                  className={`
                    absolute block h-0.5 w-6 transform bg-current transition
                    duration-300 ease-in-out
                    ${
                    isMenuOpen ? 'translate-y-2 -rotate-45' : 'translate-y-4'
                  }
                  `}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`
        transition-all duration-300 ease-in-out
        lg:hidden
        ${
        isMenuOpen ? 'max-h-screen opacity-100' : `
          max-h-0 overflow-hidden opacity-0
        `
      }
      `}>
        <div className={`
          bg-wp-dark-lighter/95 border-wp-border/30 space-y-2 border-t px-4 pt-2
          pb-6 backdrop-blur-lg
        `}>
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
          <Link
            href="/other-requests"
            className={getNavLinkClass('/other-requests', true)}
            onClick={() => setIsMenuOpen(false)}
          >
            Other Requests
          </Link>
          {!session && (
            <div className="border-wp-border/30 mt-4 border-t pt-4">
              <Link
                href="/auth/signin"
                className="wp-button-primary block w-full text-center"
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