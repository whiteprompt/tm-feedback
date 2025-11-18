import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => {
  const classes = `bg-[#3D4068] text-white px-4 py-2 rounded-full text-sm font-medium inline-block ${className}`;

  return <span className={classes}>{children}</span>;
};
