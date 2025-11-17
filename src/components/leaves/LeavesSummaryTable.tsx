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
    <div className="wp-card p-6 mb-8 wp-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-wp-primary/10 rounded-lg">
            <svg className="w-6 h-6 text-wp-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="wp-heading-2 text-wp-text-primary">Leaves Summary</h2>
            <p className="wp-body-small text-wp-text-muted">
              Days of leaves per year per category
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-wp-border">
              <th className="px-6 py-4 text-left wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                Category
              </th>
              {leavesSummary.years.map(year => (
                <th key={year} className="px-6 py-4 text-center wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                  {year}
                </th>
              ))}
              <th className="px-6 py-4 text-center wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {leavesSummary.categories.map(category => {
              const categoryData = leavesSummary.summary[category];
              const total = leavesSummary.years.reduce((sum, year) => sum + (categoryData[year] || 0), 0);
              
              return (
                <tr key={category} className="border-b border-wp-border/50 hover:bg-wp-dark-card/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`px-4 py-2 text-sm font-semibold rounded-full ${LEAVE_TYPE_COLORS[category as keyof typeof LEAVE_TYPE_COLORS] || LEAVE_TYPE_COLORS.Unknown}`}>
                      {category}
                    </span>
                  </td>
                  {leavesSummary.years.map(year => (
                    <td key={year} className="px-6 py-4 wp-body text-wp-text-primary text-center font-medium">
                      {categoryData[year] || 0}
                    </td>
                  ))}
                  <td className="px-6 py-4 wp-body text-wp-text-primary text-center font-bold">
                    {total}
                  </td>
                </tr>
              );
            })}
            {/* Total row */}
            <tr className="border-t-2 border-wp-primary/50 bg-wp-dark-card/50">
              <td className="px-6 py-4 wp-body font-semibold text-wp-text-primary">
                Total
              </td>
              {leavesSummary.years.map(year => {
                const yearTotal = leavesSummary.categories.reduce(
                  (sum, category) => sum + (leavesSummary.summary[category][year] || 0),
                  0
                );
                return (
                  <td key={year} className="px-6 py-4 wp-body text-wp-text-primary text-center font-bold">
                    {yearTotal}
                  </td>
                );
              })}
              <td className="px-6 py-4 wp-body text-wp-text-primary text-center font-bold">
                {leaves.reduce((sum, leave) => sum + (leave.days || 0), 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

