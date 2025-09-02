'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-wp-dark-primary via-wp-dark-secondary to-wp-dark-tertiary">
      {/* <div className="wp-slide-up"> */}
        <div className="wp-card p-16 max-w-xl w-full space-y-12">
          <div className="text-center">
            <Image
              src="/logo.svg"
              alt="Whiteprompt Logo"
              width={240}
              height={60}
              priority
              className="mb-12 mx-auto"
            />
            <h2 className="wp-heading-2 text-wp-text-primary mb-2">
              Welcome Back
            </h2>
            <p className="wp-body text-wp-text-secondary">
              Sign in to access your account
            </p>
          </div>
          <div className="space-y-8">
            <button
              onClick={() => signIn('google', { callbackUrl })}
              className="wp-button-primary w-full py-6 px-8 text-lg font-semibold rounded-lg flex items-center justify-center space-x-4 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      {/* </div> */}
    </div>
  );
}

// Dynamic import with ssr: false to prevent hydration issues with useSearchParams
const DynamicSignInContent = dynamic(() => Promise.resolve(SignInContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-wp-dark-primary via-wp-dark-secondary to-wp-dark-tertiary">
      <div className="wp-card p-16 max-w-xl w-full space-y-12">
        <div className="animate-pulse">
          <div className="h-16 bg-wp-dark-card/50 rounded w-3/4 mx-auto mb-12"></div>
          <div className="h-20 bg-wp-dark-card/50 rounded"></div>
        </div>
      </div>
    </div>
  )
});

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-wp-dark-primary via-wp-dark-secondary to-wp-dark-tertiary">
        <div className="wp-card p-16 max-w-xl w-full space-y-12">
          <div className="animate-pulse">
            <div className="h-12 bg-wp-dark-card/50 rounded w-3/4 mx-auto mb-8"></div>
            <div className="h-16 bg-wp-dark-card/50 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <DynamicSignInContent />
    </Suspense>
  );
} 