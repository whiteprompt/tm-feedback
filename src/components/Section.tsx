import React from 'react';
import { twMerge } from 'tailwind-merge'

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  background?: 'primary' | 'secondary' | 'gradient';
}

export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  size = 'md',
  background = 'primary',
}) => {
  const sizeClasses = {
    sm: 'py-0 md:py-16',
    md: 'py-16 md:py-24',
    lg: 'py-20 md:py-32',
  };

  const backgroundClasses = {
    primary: 'bg-[#1A1A1A]',
    secondary: 'bg-gray-800/50',
    gradient: 'bg-gradient-to-b from-[#1A1A1A] to-gray-800',
  };

  const classes = twMerge(`w-full`,sizeClasses[size],backgroundClasses[background],className);

  return (
    <section className={classes}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">{children}</div>
    </section>
  );
};
