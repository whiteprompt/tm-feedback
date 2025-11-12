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
      title: "Company Update",
      notionUrl: "https://notion.so/example",
      description: "Stay updated with the latest company news and announcements.",
      date: "2024-01-15"
    },
    {
      title: "New Policies",
      notionUrl: "https://notion.so/example",
      description: "Review our updated company policies and procedures.",
      date: "2024-01-10"
    },
    {
      title: "Team Announcements",
      notionUrl: "https://notion.so/example",
      description: "Important updates from the leadership team.",
      date: "2024-01-05"
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

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + newsItems.length) % newsItems.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    setIsAutoPlaying(false);
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
          <h2 className="wp-heading-2">Company News</h2>
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

        <div className="relative overflow-hidden rounded-lg">
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

          {newsItems.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-wp-dark-card/80 backdrop-blur-sm border border-wp-border hover:bg-wp-primary/20 hover:border-wp-primary transition-all duration-300"
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
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-wp-dark-card/80 backdrop-blur-sm border border-wp-border hover:bg-wp-primary/20 hover:border-wp-primary transition-all duration-300"
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
            </>
          )}
        </div>
      </div>
    </section>
  );
}

