'use client';

import { Leave } from '@/lib/types';
import { useMemo } from 'react';
import { LEAVES_MIN_YEAR } from './constants';

interface LeavesSummaryTableProps {
  leaves: Leave[];
}

const LEAVE_TYPE_COLORS = {
  'Vacation': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
  'Sick': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
  'Personal': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
  'Maternity': 'bg-gradient-to-r from-pink-500 to-pink-600 text-white',
  'Paternity': 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
  'Emergency': 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  'Unknown': 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
} as const;

export default function LeavesSummaryTable({ leaves }: LeavesSummaryTableProps) {
  // Process leaves to get sum of days per year per category
  const leavesSummary = useMemo(() => {
    const summary: { [category: string]: { [year: string]: number } } = {};
    const years = new Set<string>();

    leaves?.forEach(leave => {
      const numberYear = new Date(leave.fromDate).getFullYear();
      const year = numberYear.toString();
      if (numberYear < LEAVES_MIN_YEAR) {
        return;
      }

      years.add(year);
      
      const category = leave.type || 'Unknown';
      
      if (!summary[category]) {
        summary[category] = {};
      }
      
      if (!summary[category][year]) {
        summary[category][year] = 0;
      }
      
      summary[category][year] += leave.totalDays || 0;
    });

    // Always include current year + 1 (next year)
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    years.add(nextYear.toString());

    // Find min and max years to fill in gaps
    const yearNumbers = Array.from(years).map(y => parseInt(y));
    const minYear = yearNumbers.length > 0 ? Math.min(...yearNumbers, LEAVES_MIN_YEAR) : LEAVES_MIN_YEAR;
    const maxYear = yearNumbers.length > 0 ? Math.max(...yearNumbers, nextYear) : nextYear;

    // Fill in all years between min and max
    const allYears: string[] = [];
    for (let year = maxYear; year >= minYear; year--) {
      allYears.push(year.toString());
    }

    const categories = Object.keys(summary).sort();

    return { summary, years: allYears, categories };
  }, [leaves]);


  if (!leaves?.length) {
    return null;
  }

  return (
    <div className="wp-card wp-fade-in mb-8 p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-wp-border border-b">
              <th className={`
                wp-body-small text-wp-text-muted px-6 py-4 text-left
                font-semibold tracking-wider uppercase
              `}>
                Category
              </th>
              {leavesSummary.years.map(year => (
                <th key={year} className={`
                  wp-body-small text-wp-text-muted px-6 py-4 text-center
                  font-semibold tracking-wider uppercase
                `}>
                  {year}
                </th>
              ))}
              <th className={`
                wp-body-small text-wp-text-muted px-6 py-4 text-center
                font-semibold tracking-wider uppercase
              `}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {leavesSummary.categories.map(category => {
              const categoryData = leavesSummary.summary[category];
              const total = leavesSummary.years.reduce((sum, year) => sum + (categoryData[year] || 0), 0);
              
              return (
                <tr key={category} className={`
                  border-wp-border/50 border-b transition-colors
                  hover:bg-wp-dark-card/30
                `}>
                  <td className="px-6 py-4">
                    <span className={`
                      rounded-full px-4 py-2 text-sm font-semibold
                      ${LEAVE_TYPE_COLORS[category as keyof typeof LEAVE_TYPE_COLORS] || LEAVE_TYPE_COLORS.Unknown}
                    `}>
                      {category}
                    </span>
                  </td>
                  {leavesSummary.years.map(year => (
                    <td key={year} className={`
                      wp-body text-wp-text-primary px-6 py-4 text-center
                      font-medium
                    `}>
                      {categoryData[year] || 0}
                    </td>
                  ))}
                  <td className={`
                    wp-body text-wp-text-primary px-6 py-4 text-center font-bold
                  `}>
                    {total}
                  </td>
                </tr>
              );
            })}
            {/* Total row */}
            <tr className="border-wp-primary/50 bg-wp-dark-card/50 border-t-2">
              <td className={`
                wp-body text-wp-text-primary px-6 py-4 font-semibold
              `}>
                Total
              </td>
              {leavesSummary.years.map(year => {
                const yearTotal = leavesSummary.categories.reduce(
                  (sum, category) => sum + (leavesSummary.summary[category][year] || 0),
                  0
                );
                return (
                  <td key={year} className={`
                    wp-body text-wp-text-primary px-6 py-4 text-center font-bold
                  `}>
                    {yearTotal}
                  </td>
                );
              })}
              <td className={`
                wp-body text-wp-text-primary px-6 py-4 text-center font-bold
              `}>
                {leaves.reduce((sum, leave) => sum + (leave.days || 0), 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

