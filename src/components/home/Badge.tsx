import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => {
  const classes = `
    inline-block px-4 py-2 text-sm font-medium text-white
    ${className}
  `;

  return <span className={classes}>{children}</span>;
};
