'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';

export default function Navigation() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin } = useAdmin();

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
              className="border-transparent text-gray-500 hover:border-[#00A3B4] hover:text-[#00A3B4] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="/submitted-feedbacks"
              className="border-transparent text-gray-500 hover:border-[#00A3B4] hover:text-[#00A3B4] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              Submitted Feedbacks
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="border-transparent text-gray-500 hover:border-[#00A3B4] hover:text-[#00A3B4] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
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

          {/* Mobile menu button */}
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
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-[#00A3B4] hover:text-[#00A3B4]"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/submitted-feedbacks"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-[#00A3B4] hover:text-[#00A3B4]"
            onClick={() => setIsMenuOpen(false)}
          >
            Submitted Feedbacks
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-[#00A3B4] hover:text-[#00A3B4]"
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