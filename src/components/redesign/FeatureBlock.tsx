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
      <h2 className={`
        text-3xl font-semibold text-white
        md:text-4xl
      `}>
        {headline}
      </h2>
      <p className={`
        text-base leading-relaxed text-gray-400
        md:text-lg
      `}>
        {description}
      </p>

      {benefits && benefits.length > 0 && (
        <ul className="mt-6 space-y-3">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="mt-1 shrink-0 text-[#00D9FF]">✓</span>
              <span className="text-gray-400">{benefit.text}</span>
            </li>
          ))}
        </ul>
      )}

      {learnMoreLink && (
        <a
          href={learnMoreLink}
          className={`
            mt-4 inline-flex items-center gap-2 font-medium text-[#00D9FF]
            transition-colors
            hover:text-[#00B8D4]
          `}
        >
          Learn More <span>→</span>
        </a>
      )}
    </div>
  );

  const visual = imageSrc ? (
    <div className={`
      overflow-hidden rounded-xl border border-[#3A3D45] shadow-2xl
    `}>
      <img src={imageSrc} alt={imageAlt} className="h-auto w-full" />
    </div>
  ) : (
    children
  );

  return (
    <Section size="md" className="border-t border-gray-800">
      <div className={`
        grid grid-cols-1 items-center gap-12
        lg:grid-cols-2 lg:gap-16
      `}>
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
