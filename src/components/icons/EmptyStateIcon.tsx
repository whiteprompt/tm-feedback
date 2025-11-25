import React from 'react';

interface EmptyStateIconProps {
  className?: string;
}

/**
 * A reusable empty state icon component
 * Displays a clean, neutral "empty box" icon suitable for any empty state scenario
 */
export const EmptyStateIcon: React.FC<EmptyStateIconProps> = ({ 
  className = "mx-auto h-12 w-12" 
}) => {
  return (
    <svg 
      className={className}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Empty box/inbox icon */}
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
      />
    </svg>
  );
};
