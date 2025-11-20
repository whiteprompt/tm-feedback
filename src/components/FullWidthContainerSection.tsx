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
  classNameContent?: string;
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
  classNameContent = 'w-[90%]',
  children,
  id,
  primaryCta,
  secondaryCta,
}) => {
  return (
    <div id={id}>
      <Divider />
      <Section size="sm" classNameDetails={classNameContent}>
        <div className={`
          space-y-16
          md:space-y-16
        `}>
          {(headline || description || primaryCta || secondaryCta) && (
            <div className="text-center">
              {headline && (
                <h2 className={`
                  mb-6 text-3xl font-semibold text-white
                  md:text-4xl
                `}>
                  {headline}
                </h2>
              )}
              {description && (
                <p className={`
                  text-base leading-relaxed whitespace-pre-line text-gray-400
                  md:text-lg
                `}>
                  {description}
                </p>
              )}
              {(primaryCta || secondaryCta) && (
                <div className={`
                  mt-6 flex flex-col items-center justify-center gap-4
                  sm:flex-row
                `}>
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
          <>
            {children}
          </>
        </div>
      </Section>
    </div>
  );
};
