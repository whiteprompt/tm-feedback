'use client';

import { useState } from 'react';

interface ErrorBannerProps {
  error: string;
  onDismiss?: () => void;
  title?: string;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}

export default function ErrorBanner({ 
  error, 
  onDismiss, 
  title = 'Error',
  variant = 'error',
  className = ''
}: ErrorBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || !error) {
    return null;
  }

  const variantStyles = {
    error: {
      container: 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500',
      icon: 'text-red-500',
      title: 'text-red-800 dark:text-red-200',
      message: 'text-red-700 dark:text-red-300',
      dismiss: 'text-red-800 dark:text-red-200 hover:text-red-600 dark:hover:text-red-400'
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500',
      icon: 'text-yellow-500',
      title: 'text-yellow-800 dark:text-yellow-200',
      message: 'text-yellow-700 dark:text-yellow-300',
      dismiss: 'text-yellow-800 dark:text-yellow-200 hover:text-yellow-600 dark:hover:text-yellow-400'
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500',
      icon: 'text-blue-500',
      title: 'text-blue-800 dark:text-blue-200',
      message: 'text-blue-700 dark:text-blue-300',
      dismiss: 'text-blue-800 dark:text-blue-200 hover:text-blue-600 dark:hover:text-blue-400'
    }
  };

  const styles = variantStyles[variant];

  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        );
      case 'info':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        );
      default:
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        );
    }
  };

  return (
    <div className={`mb-6 p-4 ${styles.container} rounded-r-lg ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className={`w-5 h-5 ${styles.icon} mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {getIcon()}
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {title}
          </h3>
          <div className={`mt-2 text-sm ${styles.message}`}>
            <p>{error}</p>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={handleDismiss}
              className={`text-sm font-medium ${styles.dismiss} transition-colors`}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
