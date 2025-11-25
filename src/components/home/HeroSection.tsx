'use client';

import React from 'react';
import { Section } from '../Section';
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
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  badge,
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
}) => {
  return (
    <Section size="sm" className={`
      py-0 text-center
      md:py-8
    `}>
        {badge && (
          <Badge className={`
            justify-center px-6 text-base
            md:text-4xl
          `}>{badge}</Badge>
        )}
        <h1 className={`
          mt-4 text-4xl leading-tight font-bold text-white
          md:text-5xl
          lg:text-2xl
        `}>
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
    </Section>
  );
};
