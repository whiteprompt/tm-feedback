'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTeamMember } from '@/contexts/TeamMemberContext';
import { Holiday } from '@/lib/types';
import { beginOfMonth } from '@/utils/date';
import { addDays, endOfMonth, format } from 'date-fns';

export default function HolidaysSection() {
  const { data: session } = useSession();
  const { teamMember } = useTeamMember();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidaysLoading, setHolidaysLoading] = useState(true);
  const [holidaysError, setHolidaysError] = useState('');

  // Fetch holidays
  useEffect(() => {
    const fetchHolidays = async () => {
      if (!session?.user?.email || !teamMember?.country) return;

      try {
        setHolidaysLoading(true);
        setHolidaysError('');

        // Get current month and add the next 6 months
        const fromDate = format(beginOfMonth(new Date()), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(addDays(new Date(), 180)), 'yyyy-MM-dd');

        let countryAcronym = teamMember.countryAcronym;

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

    if (session?.user?.email && teamMember?.country) {
      fetchHolidays();
    }
  }, [session, teamMember]);

  return (
    <div className="wp-card p-6 mb-8 wp-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-wp-primary/10 rounded-lg">
            <svg className="w-6 h-6 text-wp-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-8 4h8m-4-4v8m-4-4h8" />
            </svg>
          </div>
          <div>
            <h2 className="wp-heading-2 text-wp-text-primary">Holidays in {teamMember?.country}</h2>
            <p className="wp-body-small text-wp-text-muted">
              Official holidays for {new Date().getFullYear()} - {new Date().getFullYear() + 1}
            </p>
          </div>
        </div>
      </div>

      {holidaysLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wp-primary"></div>
          <span className="ml-3 text-wp-text-muted">Loading holidays...</span>
        </div>
      ) : holidaysError ? (
        <div className="text-center py-8">
          <div className="text-wp-error mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="wp-body text-wp-error">{holidaysError}</p>
        </div>
      ) : !holidays?.length ? (
        <div className="text-center py-8">
          <div className="text-wp-text-muted mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-8 4h8m-4-4v8m-4-4h8" />
            </svg>
          </div>
          <p className="wp-body text-wp-text-muted">No holidays found for this period.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {holidays.map((holiday, index) => {
            const holidayDate = new Date(holiday.date.split('T')[0] + 'T10:00:00Z');
            const isUpcoming = holidayDate > new Date();
            const isToday = holidayDate.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={holiday.id || index}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  isToday
                    ? 'bg-wp-primary/10 border-wp-primary/50 shadow-lg'
                    : isUpcoming
                    ? 'bg-wp-dark-card border-wp-border hover:border-wp-primary/30'
                    : 'bg-wp-dark-secondary border-wp-border/50 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`wp-body font-semibold mb-1 ${
                      isToday ? 'text-wp-primary' : 'text-wp-text-primary'
                    }`}>
                      {holiday.name}
                    </h3>
                    <p className="wp-body-small text-wp-text-muted mb-2">
                      {holidayDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {holiday.type && (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-wp-primary/20 text-wp-primary rounded-full">
                        {holiday.type}
                      </span>
                    )}
                  </div>
                  <div className={`p-2 rounded-full ${
                    isToday
                      ? 'bg-wp-primary/20 text-wp-primary'
                      : isUpcoming
                      ? 'bg-wp-success/20 text-wp-success'
                      : 'bg-wp-text-muted/20 text-wp-text-muted'
                  }`}>
                    {isToday ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    ) : isUpcoming ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

