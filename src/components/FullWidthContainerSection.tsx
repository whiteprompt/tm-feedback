'use client';

import React from 'react';
import { Section } from './Section';
import Divider from './Divider';
import { twMerge } from 'tailwind-merge';

interface FullWidthContainerSectionProps {
  headline?: string;
  description?: string;
  children: React.ReactNode;
  id?: string;
}

export const FullWidthContainerSection: React.FC<FullWidthContainerSectionProps> = ({
  headline,
  description,
  children,
  id,
}) => {
  return (
    <div id={id}>
      <Divider />
      {headline && description && (
        <Section size="sm">
          <div className="space-y-16">
            <div className="text-center">
              {headline && (
                <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
                  {headline}
                </h2>
              )}
              {description && (
                <p className="text-base md:text-lg text-gray-400 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

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
      )}
      {!headline && !description && (
        <Section size="sm">
          <div className="space-y-16">
            {/* Content - Centered with spacing */}
            <div className={twMerge("w-2.5 flex justify-center px-4")}>
              <div className="flex justify-center">
                  {children}
              </div>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
};
