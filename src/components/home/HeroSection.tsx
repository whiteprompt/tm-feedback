'use client';

import React from 'react';
import { Button } from './Button';
import { Badge } from './Badge';

interface HeroSectionProps {
  badge?: string;
  headline: string;
  subheadline: string;
  primaryCta?: {
    text: string;
    onClick?: () => void;
    href?: string;
    newTab?: boolean;
  };
  secondaryCta?: {
    text: string;
    onClick?: () => void;
    href?: string;
    newTab?: boolean;
  };
  showScrollIndicator?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  badge,
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  showScrollIndicator = false,
}) => {
  return (
    <div className='relative mb-12 text-center'>
        {badge && (
          <Badge className={`
            justify-center px-6 text-base
            md:text-4xl
          `}>
            {badge}
          </Badge>
        )}
        <h1 className={`text-5xl leading-tight font-bold text-white`}>
          {headline}
        </h1>

        <p className={`
          mx-auto text-lg leading-relaxed text-gray-400
          md:text-xl
        `}>
          {subheadline}
        </p>
        
        <div className={`
          mt-4 flex flex-col items-center justify-center gap-4
          sm:flex-row
        `}>
        {primaryCta && (
          
            <Button
              variant="secondary"
              size="lg"
              onClick={primaryCta.onClick}
              href={primaryCta.href}
              target={primaryCta.newTab ? '_blank' : undefined}
              rel={primaryCta.newTab ? 'noopener noreferrer' : undefined}
              icon={<span>→</span>}
              iconPosition="right"
              className='cursor-pointer'
            >
              {primaryCta.text}
            </Button>
        )}
        {secondaryCta && (
            <Button
              variant="outlined"
              size="lg"
              onClick={secondaryCta.onClick}
              href={secondaryCta.href}
              target={secondaryCta.newTab ? '_blank' : undefined}
              rel={secondaryCta.newTab ? 'noopener noreferrer' : undefined}
              className='cursor-pointer'
            >
              {secondaryCta.text}
            </Button>
        )}
        </div>

        {/* Animated Scroll Indicator */}
        {showScrollIndicator && (
          <div className="mt-12 flex flex-col items-center gap-2">
            <p className="text-sm text-gray-500">Scroll to explore</p>
            <div className="animate-bounce">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </div>
        )}
    </div>
  );
};
