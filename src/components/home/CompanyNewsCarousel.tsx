'use client';

import { useState, useEffect } from 'react';

interface NewsItem {
  title: string;
  notionUrl: string;
  description?: string;
  date?: string;
}

interface CompanyNewsCarouselProps {
  newsItems?: NewsItem[];
  autoPlayInterval?: number; // in milliseconds
}

export default function CompanyNewsCarousel({
  newsItems = [
    {
      title: "Company News Q3",
      notionUrl: "https://docs.google.com/document/d/e/2PACX-1vSPSfczxzg8L163tvUOtvGohZqF0NoGLaDhaZ55k1S617-FMegX3hTq-WgB_RApGAatKRN75jtw8n0r/pub",
      description: "Find here a small newsletter with some Company News for 2025 Q3.",
      date: "2025-09-30"
    },
    {
      title: "Exciting Leadership transition",
      notionUrl: "https://docs.google.com/document/d/e/2PACX-1vRaTuedd3rL9wh1e-5oDQvPEDE8lpfhwqoNU3dvsBSw5QHvQGt_CLX6eG6GkuDRQ3yowplDJaL4BWMka/pub",
      description: "Read about the exciting leadership transition at Whiteprompt.",
      date: "2025-02-03"
    },
    {
      title: "EOY celebration",
      notionUrl: "https://docs.google.com/document/d/e/2PACX-1vSdjHYGzbsNlg864LOgRbfE0azqXcROZ-gXIYCbL8lWP_ayuA_IjFTGOBKb-CldVrdHJ8ipyxy7b63d/pub",
      description: "Important updates from the leadership team.",
      date: "2024-12-19"
    }
  ],
  autoPlayInterval = 2500
}: CompanyNewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || newsItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, newsItems.length, autoPlayInterval]);

  const pauseAndResume = () => {
    setIsAutoPlaying(false);
    // Resume auto-play after a brief pause (same as interval)
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, autoPlayInterval);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    pauseAndResume();
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + newsItems.length) % newsItems.length);
    pauseAndResume();
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    pauseAndResume();
  };

  if (!newsItems || newsItems.length === 0) {
    return (
      <section className="mb-16 wp-slide-up">
        <div className="wp-card p-8 text-center">
          <p className="wp-body text-wp-text-secondary">No news available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16 wp-slide-up">
      <div className="wp-card p-8">
        <div className="flex items-center justify-between mb-6">
          {newsItems.length > 1 && (
            <div className="flex gap-2">
              {newsItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 bg-wp-primary'
                      : 'w-2 bg-wp-border hover:bg-wp-border-light'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative flex items-center gap-4">
          {newsItems.length > 1 && (
            <button
              onClick={goToPrevious}
              className="shrink-0 p-2 rounded-full bg-wp-dark-card/80 backdrop-blur-sm border border-wp-border hover:bg-wp-primary/20 hover:border-wp-primary transition-all duration-300"
              aria-label="Previous slide"
            >
              <svg
                className="w-6 h-6 text-wp-text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          
          <div className="flex-1 overflow-hidden rounded-lg">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {newsItems.map((item, index) => (
                <div
                  key={index}
                  className="min-w-full shrink-0"
                >
                  <a
                    href={item.notionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="p-6 hover:bg-wp-primary/5 transition-all duration-300 rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="wp-heading-3 text-wp-text-primary group-hover:text-wp-primary transition-colors duration-300 flex-1">
                          {item.title}
                        </h3>
                        <svg
                          className="w-5 h-5 text-wp-text-muted group-hover:text-wp-primary transition-colors duration-300 shrink-0 ml-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </div>
                      {item.description && (
                        <p className="wp-body text-wp-text-secondary mb-3">
                          {item.description}
                        </p>
                      )}
                      {item.date && (
                        <p className="wp-body-small text-wp-text-muted">
                          {new Date(item.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {newsItems.length > 1 && (
            <button
              onClick={goToNext}
              className="shrink-0 p-2 rounded-full bg-wp-dark-card/80 backdrop-blur-sm border border-wp-border hover:bg-wp-primary/20 hover:border-wp-primary transition-all duration-300"
              aria-label="Next slide"
            >
              <svg
                className="w-6 h-6 text-wp-text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

