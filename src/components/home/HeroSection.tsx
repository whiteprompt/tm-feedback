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
    onClick: () => void;
  };
  secondaryCta?: {
    text: string;
    onClick: () => void;
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
    <Section size="sm" className="md:py-8 py-0 text-center">
        {badge && (
          <Badge className="text-base md:text-4xl px-6 justify-center">{badge}</Badge>
        )}
        <h1 className="text-4xl mt-4 md:text-5xl lg:text-2xl font-bold leading-tight text-white">
          {headline}
        </h1>

        <p className="text-lg md:text-xl text-gray-400 leading-relaxed mx-auto">
          {subheadline}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4">
        {primaryCta && (
          
            <Button
              variant="secondary"
              size="lg"
              onClick={primaryCta.onClick}
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
              className='cursor-pointer'
            >
              {secondaryCta.text}
            </Button>
        )}
        </div>
    </Section>
  );
};
