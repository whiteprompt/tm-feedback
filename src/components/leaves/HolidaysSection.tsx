'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Holiday } from '@/lib/types';
import { beginOfMonth } from '@/utils/date';
import { addYears, format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export default function HolidaysSection({ countryAcronym }: { countryAcronym: string }) {
  const { data: session } = useSession();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidaysLoading, setHolidaysLoading] = useState(true);
  const [holidaysError, setHolidaysError] = useState('');

  // Fetch holidays
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setHolidaysLoading(true);
        setHolidaysError('');

        // Get current month and add the next 6 months
        const fromDate = format(beginOfMonth(new Date()), 'yyyy-MM-dd');
        const endDate = format(addYears(fromDate, 1), 'yyyy-MM-dd');

        const response = await fetch(`/api/holidays?fromDate=${fromDate}&endDate=${endDate}&country=${countryAcronym}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch holidays');
        }

        const data = await response.json();
        setHolidays(data || []);
      } catch (error) {
        console.error('Error fetching holidays:', error);
        setHolidaysError('Failed to load holidays');
      } finally {
        setHolidaysLoading(false);
      }
    };

    if (countryAcronym) {
      fetchHolidays();
    }
  }, [session]);

  return (
    <div className="wp-card wp-fade-in p-6">
      {holidaysLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className={`
            border-wp-primary h-8 w-8 animate-spin rounded-full border-b-2
          `}></div>
          <span className="text-wp-text-muted ml-3">Loading holidays...</span>
        </div>
      ) : holidaysError ? (
        <div className="py-8 text-center">
          <div className="text-wp-error mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="wp-body text-wp-error">{holidaysError}</p>
        </div>
      ) : !holidays?.length ? (
        <div className="py-8 text-center">
          <div className="text-wp-text-muted mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-8 4h8m-4-4v8m-4-4h8" />
            </svg>
          </div>
          <p className="wp-body text-wp-text-muted">No holidays found for this period.</p>
        </div>
      ) : (
        <div className={`
          grid grid-cols-1 gap-4
          md:grid-cols-2
          lg:grid-cols-3
        `}>
          {holidays.map((holiday, index) => {
            const holidayDate = new Date(holiday.date.split('T')[0] + 'T10:00:00Z');
            const isUpcoming = holidayDate > new Date();
            const isToday = holidayDate.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={holiday.id || index}
                className={`
                  rounded-lg border p-4 transition-all duration-200
                  hover:shadow-md
                  ${
                  isToday
                    ? 'bg-wp-primary/10 border-wp-primary/50 shadow-lg'
                    : isUpcoming
                    ? `
                      bg-wp-dark-card border-wp-border
                      hover:border-wp-primary/30
                    `
                    : 'bg-wp-dark-secondary border-wp-border/50 opacity-75'
                }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={twMerge(`
                      wp-body wp-text-muted mb-1 font-semibold
                    `)}>
                      {holiday.description}
                    </h3>
                    <p className="text-white-500 mb-2 text-sm leading-5">
                      {holidayDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className={`
                    rounded-full p-2
                    ${
                    isToday
                      ? 'bg-wp-primary/20 text-wp-primary'
                      : isUpcoming
                      ? 'bg-wp-success/20 text-wp-success'
                      : 'bg-wp-text-muted/20 text-wp-text-muted'
                  }
                  `}>
                    {isToday ? (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    ) : isUpcoming ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

