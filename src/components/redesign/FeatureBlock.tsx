'use client';

import React from 'react';
import { Section } from '../Section';

interface FeatureBenefit {
  text: string;
}

interface FeatureBlockProps {
  headline: string;
  description: string;
  benefits?: FeatureBenefit[];
  imageSrc?: string;
  imageAlt?: string;
  imagePosition?: 'left' | 'right';
  learnMoreLink?: string;
  children?: React.ReactNode;
}

export const FeatureBlock: React.FC<FeatureBlockProps> = ({
  headline,
  description,
  benefits,
  imageSrc,
  imageAlt = 'Feature',
  imagePosition = 'right',
  learnMoreLink,
  children,
}) => {
  const content = (
    <div className="space-y-4">
      <h2 className="text-3xl md:text-4xl font-semibold text-white">
        {headline}
      </h2>
      <p className="text-base md:text-lg text-gray-400 leading-relaxed">
        {description}
      </p>

      {benefits && benefits.length > 0 && (
        <ul className="space-y-3 mt-6">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-[#00D9FF] mt-1 shrink-0">✓</span>
              <span className="text-gray-400">{benefit.text}</span>
            </li>
          ))}
        </ul>
      )}

      {learnMoreLink && (
        <a
          href={learnMoreLink}
          className="text-[#00D9FF] hover:text-[#00B8D4] font-medium inline-flex items-center gap-2 mt-4 transition-colors"
        >
          Learn More <span>→</span>
        </a>
      )}
    </div>
  );

  const visual = imageSrc ? (
    <div className="rounded-xl border border-[#3A3D45] shadow-2xl overflow-hidden">
      <img src={imageSrc} alt={imageAlt} className="w-full h-auto" />
    </div>
  ) : (
    children
  );

  return (
    <Section size="md" className="border-t border-gray-800">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {imagePosition === 'left' ? (
          <>
            {visual}
            {content}
          </>
        ) : (
          <>
            {content}
            {visual}
          </>
        )}
      </div>
    </Section>
  );
};
