'use client';

import { CompanyDeadLineEvents } from '@/lib/api';
import { useState } from 'react';

interface CompanyEvent {
  id: string;
  title: string;
  date: Date;
  type: 'deadline' | 'meeting' | 'submission' | 'general';
  link?: string;
  description?: string;
}

const eventTypeColors = {
  deadline: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/50',
    text: 'text-red-400',
    dot: 'bg-red-500',
  },
  meeting: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    dot: 'bg-blue-500',
  },
  submission: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
    text: 'text-purple-400',
    dot: 'bg-purple-500',
  },
  general: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/50',
    text: 'text-green-400',
    dot: 'bg-green-500',
  },
};

export default function CompanyEventsCalendar({ companyDeadLineEvents }: { companyDeadLineEvents: CompanyDeadLineEvents[] }) {
  const currentDate = new Date();
  const [selectedEvent, setSelectedEvent] = useState<CompanyEvent | null>(null);
  
  const mappedEvents: CompanyEvent[] = companyDeadLineEvents.map(event => ({
    id: event.id,
    title: event.summary,
    date: new Date(event.start),
    type: 'meeting' as const,
    link: event.description ? undefined : undefined,
    description: event.description,
  }));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (date: Date) => {
    return mappedEvents.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };



  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handleEventClick = (event: CompanyEvent) => {
    if (event.link) {
      window.open(event.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
      </div>

      {/* Calendar Grid */}
      <div className={`
        rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm
      `}>
        {/* Days of Week Header */}
        <div className="mb-4 grid grid-cols-7 gap-2">
          {daysOfWeek.map(day => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            );
            const events = getEventsForDate(date);
            const hasEvents = events.length > 0;
            const isToday = 
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`
                  min-h-[120px] rounded-lg p-2 transition-all
                  ${isToday ? 'border-2 border-cyan-500/50 bg-cyan-500/20' : `
                    border border-white/10 bg-white/5
                  `}
                  ${hasEvents ? `
                    cursor-pointer
                    hover:bg-white/10
                  ` : ''}
                `}
                onClick={() => hasEvents && setSelectedEvent(events[0])}
              >
                <div className="flex h-full flex-col">
                  <span className={`
                    mb-2 text-sm font-medium
                    ${isToday ? `text-cyan-400` : `text-white`}
                  `}>
                    {day}
                  </span>
                  {hasEvents && (
                    <div className="flex flex-col gap-1 overflow-y-auto">
                      {events.map(event => (
                        <div
                          key={event.id}
                          className={`
                            rounded px-1.5 py-1 text-[10px] leading-tight
                            ${eventTypeColors[event.type].bg}
                            ${eventTypeColors[event.type].border}
                            ${eventTypeColors[event.type].text}
                            border
                          `}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (event.link) {
                              handleEventClick(event);
                            } else {
                              setSelectedEvent(event);
                            }
                          }}
                        >
                          <div className="truncate font-semibold">{event.title}</div>
                          {event.description && (
                            <div className={`
                              mt-0.5 line-clamp-2 text-[9px] opacity-80
                            `}>
                              {event.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div 
          className={`
            fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4
            backdrop-blur-sm
          `}
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className={`
              relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl
              border border-white/20 bg-gradient-to-br from-gray-900 to-gray-800
              p-8 shadow-2xl
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedEvent(null)}
              className={`
                absolute top-6 right-6 text-2xl leading-none text-gray-400
                transition-colors
                hover:text-white
              `}
            >
              ✕
            </button>

            {/* Event content */}
            <div className="pr-10">
              <div className="mb-6 flex items-start gap-3">
                <div className={`
                  mt-2 h-3 w-3 flex-shrink-0 rounded-full
                  ${eventTypeColors[selectedEvent.type].dot}
                `} />
                <h4 className="text-3xl leading-tight font-bold text-white">
                  {selectedEvent.title}
                </h4>
              </div>
              
              {selectedEvent.description && (
                <div 
                  className={`
                    prose prose-invert prose-sm max-w-none leading-relaxed
                    text-gray-300
                    [&_a]:cursor-pointer [&_a]:text-cyan-400 [&_a]:underline
                    [&_a]:hover:text-cyan-300
                    [&_li]:mb-1
                    [&_ol]:mb-3
                    [&_p]:mb-3
                    [&_ul]:mb-3
                  `}
                  dangerouslySetInnerHTML={{ __html: selectedEvent.description }}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'A') {
                      e.preventDefault();
                      const href = target.getAttribute('href');
                      if (href) {
                        window.open(href, '_blank', 'noopener,noreferrer');
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      {/* <div className="mt-6 flex flex-wrap gap-4 justify-center">
        {Object.entries(eventTypeColors).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${colors.dot}`} />
            <span className="text-sm text-gray-400 capitalize">{type}</span>
          </div>
        ))}
      </div> */}
    </div>
  );
}
