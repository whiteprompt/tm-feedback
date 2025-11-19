'use client';

import React from 'react';
import { Section } from './Section';
import Divider from './Divider';
import { Button } from './home/Button';

interface FullWidthContainerSectionProps {
  headline?: string;
  description?: string;
  children: React.ReactNode;
  id?: string;
  primaryCta?: {
    text: string;
    onClick: () => void;
  };
  secondaryCta?: {
    text: string;
    onClick: () => void;
  };
}

export const FullWidthContainerSection: React.FC<FullWidthContainerSectionProps> = ({
  headline,
  description,
  children,
  id,
  primaryCta,
  secondaryCta,
}) => {
  return (
    <div id={id}>
      <Divider />
      <Section size="sm">
        <div className="space-y-16">
          {(headline || description || primaryCta || secondaryCta) && (
            <div className="text-center">
              {headline && (
                <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
                  {headline}
                </h2>
              )}
              {description && (
                <p className="text-base md:text-lg text-gray-400 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              )}
              {(primaryCta || secondaryCta) && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
                  {primaryCta && (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={primaryCta.onClick}
                      icon={<span>→</span>}
                      iconPosition="right"
                      className="cursor-pointer"
                    >
                      {primaryCta.text}
                    </Button>
                  )}
                  {secondaryCta && (
                    <Button
                      variant="outlined"
                      size="lg"
                      onClick={secondaryCta.onClick}
                      className="cursor-pointer"
                    >
                      {secondaryCta.text}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Content - Centered with spacing */}
          <div className="w-full flex justify-center px-4">
            <div className="w-full max-w-7xl">
              <div className="flex justify-center">
                <div className="w-full">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};
