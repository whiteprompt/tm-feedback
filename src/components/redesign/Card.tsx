import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  padding = 'lg',
}) => {
  const baseClasses = 'bg-gray-800 border border-[#3A3D45] rounded-xl shadow-lg transition-all duration-300';

  const hoverClasses = hover
    ? 'hover:border-[#00D9FF] hover:shadow-xl hover:shadow-[#00D9FF]/10'
    : '';

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const classes = `
    ${baseClasses}
    ${hoverClasses}
    ${paddingClasses[padding]}
    ${className}
  `;

  return <div className={classes}>{children}</div>;
};
