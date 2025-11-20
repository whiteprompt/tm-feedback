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
  autoPlayInterval = 5000
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
      <section className="wp-slide-up mb-16">
        <div className="wp-card p-8 text-center">
          <p className="wp-body text-wp-text-secondary">No news available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="wp-slide-up">
      <div className="wp-card p-8">
        <div className="mb-6 flex items-center justify-between">
          {newsItems.length > 1 && (
            <div className="flex gap-2">
              {newsItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`
                    h-2 rounded-full transition-all duration-300
                    ${
                    index === currentIndex
                      ? 'bg-wp-primary w-8'
                      : `
                        bg-wp-border w-2
                        hover:bg-wp-border-light
                      `
                  }
                  `}
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
              className={`
                bg-wp-dark-card/80 border-wp-border shrink-0 rounded-full border
                p-2 backdrop-blur-sm transition-all duration-300
                hover:bg-wp-primary/20 hover:border-wp-primary
              `}
              aria-label="Previous slide"
            >
              <svg
                className="text-wp-text-primary h-6 w-6"
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
                    className="group block"
                  >
                    <div className={`
                      hover:bg-wp-primary/5
                      rounded-lg p-6 transition-all duration-300
                    `}>
                      <div className="mb-4 flex items-start justify-between">
                        <h3 className={`
                          wp-heading-3 text-wp-text-primary flex-1
                          transition-colors duration-300
                          group-hover:text-wp-primary
                        `}>
                          {item.title}
                        </h3>
                        <svg
                          className={`
                            text-wp-text-muted ml-4 h-5 w-5 shrink-0
                            transition-colors duration-300
                            group-hover:text-wp-primary
                          `}
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
              className={`
                bg-wp-dark-card/80 border-wp-border shrink-0 rounded-full border
                p-2 backdrop-blur-sm transition-all duration-300
                hover:bg-wp-primary/20 hover:border-wp-primary
              `}
              aria-label="Next slide"
            >
              <svg
                className="text-wp-text-primary h-6 w-6"
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

