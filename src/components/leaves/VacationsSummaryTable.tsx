'use client';

import { useTeamMember } from '@/contexts/TeamMemberContext';
import { Leave } from '@/lib/types';
import { useMemo } from 'react';
import { LEAVES_MIN_YEAR } from './constants';

interface VacationsSummaryTableProps {
  leaves: Leave[];
  initialBalance?: number;
}

const LEAVE_TYPE_COLORS = {
  'Vacations': 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white',
  'Vacations taken': 'bg-gradient-to-r from-teal-500 to-teal-600 text-white',
  'Vacations Balance': 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white',
} as const;

export default function VacationsSummaryTable({ leaves, initialBalance }: VacationsSummaryTableProps) {
  const { teamMember } = useTeamMember();

  // Process leaves to get years and summary for vacations taken calculation
  const leavesSummary = useMemo(() => {
    const summary: { [category: string]: { [year: string]: number } } = {};
    const years = new Set<string>();

    leaves?.filter(leave => !['Requires approval','Rejected'].includes(leave.status))?.forEach(leave => {
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

    return { summary, years: allYears };
  }, [leaves]);

  // Calculate average of paidAnnualLeave per year based on active contracts
  const averagePaidAnnualLeaveByYear = useMemo(() => {
    const averages: { [year: string]: number | null } = {};

    if (!teamMember?.contracts || teamMember.contracts.length === 0) {
      return averages;
    }

    // For each year in the summary, calculate the average
    leavesSummary.years.forEach(yearStr => {
      const year = parseInt(yearStr);

      // Filter contracts that are active in this year
      const activeContracts = (teamMember.contracts || []).filter(contract => {
        if (!contract.start) return false;

        const contractStartYear = new Date(contract.start).getFullYear();
        
        // Contract hasn't started yet
        if (year < contractStartYear) return false;

        // If contract has no end date, it's still active (open contract)
        if (!contract.end) {
          return true; // Open contract applies to current year and future years
        }

        const contractEndYear = new Date(contract.end).getFullYear();
        // Contract is active if year is within the contract period
        return year <= contractEndYear;
      });

      // Get valid paidAnnualLeave values from active contracts
      const validLeaves = activeContracts
        .map(contract => contract.amountType === 'Hourly' ? contract.paidAnnualLeave || 10 : contract.paidAnnualLeave || 0) // default to 10 days if contract is hourly
        .filter((value): value is number => value !== undefined && value !== null);

      if (validLeaves.length === 0) {
        averages[yearStr] = null;
      } else {
        // Calculate proration factor if team member started after Jan 1 of this year
        let prorationFactor = 1; // Default: full year
        
        if (teamMember?.startDate) {
          const startDate = new Date(teamMember.startDate);
          const yearStart = new Date(year, 0, 1); // January 1st of the year
          const yearEnd = new Date(year, 11, 31); // December 31st of the year
          
          // If start date is after January 1st of this year, calculate proration
          if (startDate > yearStart && startDate <= yearEnd) {
            // Calculate days from start date to end of year
            const daysRemaining = Math.ceil((yearEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const totalDaysInYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;
            prorationFactor = daysRemaining / totalDaysInYear;
          } else if (startDate > yearEnd) {
            // Team member started after this year, no vacation for this year
            prorationFactor = 0;
          }
        }
        
        const sum = validLeaves.reduce((acc, value) => acc + value, 0);
        const average = (sum / validLeaves.length) * prorationFactor;
        averages[yearStr] = Math.round(average); // Round to nearest integer
      }
    });

    return averages;
  }, [teamMember, leavesSummary.years]);

  // Calculate "Vacations taken" per year based on active contract amountType
  const vacationsTakenByYear = useMemo(() => {
    const vacationsTaken: { [year: string]: number } = {};

    if (!teamMember?.contracts || teamMember.contracts.length === 0) {
      return vacationsTaken;
    }

    // For each year in the summary, calculate vacations taken
    leavesSummary.years.forEach(yearStr => {
      const year = parseInt(yearStr);

      // Filter contracts that are active in this year
      const activeContracts = (teamMember.contracts || []).filter(contract => {
        if (!contract.start) return false;

        const contractStartYear = new Date(contract.start).getFullYear();
        
        // Contract hasn't started yet
        if (year < contractStartYear) return false;

        // If contract has no end date, it's still active (open contract)
        if (!contract.end) {
          return true; // Open contract applies to current year and future years
        }

        const contractEndYear = new Date(contract.end).getFullYear();
        // Contract is active if year is within the contract period
        return year <= contractEndYear;
      });

      if (activeContracts.length === 0) {
        vacationsTaken[yearStr] = 0;
        return;
      }

      // Check if any active contract is Hourly
      const hasHourlyContract = activeContracts.some(contract => contract.amountType === 'Hourly');

      // Get leave data for this year
      const annualLeave = leavesSummary.summary['Annual leave']?.[yearStr] || 0;
      const unpaidLeave = leavesSummary.summary['Unpaid leave']?.[yearStr] || 0;

      // Calculate based on amountType
      if (hasHourlyContract) {
        // Hourly: Annual leave + Unpaid leave
        vacationsTaken[yearStr] = annualLeave + unpaidLeave;
      } else {
        // Flat: Only Annual leave
        vacationsTaken[yearStr] = annualLeave;
      }
    });

    return vacationsTaken;
  }, [teamMember, leavesSummary.years, leavesSummary.summary]);

  if (!leaves?.length) {
    return null;
  }

  return (
    <div className="wp-card p-6 mb-8 wp-fade-in">
      <div className="flex justify-end">
        {initialBalance !== undefined && (
          <div className="flex items-center space-x-2 bg-wp-dark-card px-4 py-2 rounded-lg border border-wp-border">
            <span className="wp-body-small text-wp-text-muted">Initial balance:</span>&nbsp;
            <span className="wp-body font-semibold text-wp-text-primary">{initialBalance} days</span>
          </div>
        )}
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
            {/* Vacations row */}
            <tr className="border-b border-wp-border/50 hover:bg-wp-dark-card/30 transition-colors">
              <td className="px-6 py-4">
                <span className={`px-4 py-2 text-sm font-semibold rounded-full ${LEAVE_TYPE_COLORS.Vacations}`}>
                  Vacations
                </span>
              </td>
              {leavesSummary.years.map(year => (
                <td key={year} className="px-6 py-4 wp-body text-wp-text-primary text-center font-medium">
                  {averagePaidAnnualLeaveByYear[year] !== null && averagePaidAnnualLeaveByYear[year] !== undefined
                    ? averagePaidAnnualLeaveByYear[year]
                    : 'TBD'}
                </td>
              ))}
              <td className="px-6 py-4 wp-body text-wp-text-primary text-center font-bold">
                {(() => {
                  const allAverages = leavesSummary.years
                    .map(year => averagePaidAnnualLeaveByYear[year])
                    .filter((value): value is number => value !== null && value !== undefined);
                  
                  if (allAverages.length === 0) return 'TBD';
                  
                  const totalAverage = allAverages.reduce((sum, val) => sum + val, 0) / allAverages.length;
                  return Math.round(totalAverage); // Round to nearest integer
                })()}
              </td>
            </tr>
            {/* Vacations taken row */}
            <tr className="border-b border-wp-border/50 hover:bg-wp-dark-card/30 transition-colors">
              <td className="px-6 py-4">
                <span className={`px-4 py-2 text-sm font-semibold rounded-full ${LEAVE_TYPE_COLORS['Vacations taken']}`}>
                  Vacations taken
                </span>
              </td>
              {leavesSummary.years.map(year => (
                <td key={year} className="px-6 py-4 wp-body text-wp-text-primary text-center font-medium">
                  {vacationsTakenByYear[year] || 0}
                </td>
              ))}
              <td className="px-6 py-4 wp-body text-wp-text-primary text-center font-bold">
                {leavesSummary.years.reduce((sum, year) => sum + (vacationsTakenByYear[year] || 0), 0)}
              </td>
            </tr>
            {/* Vacations Balance row */}
            <tr className="border-b border-wp-border/50 hover:bg-wp-dark-card/30 transition-colors">
              <td className="px-6 py-4">
                <span className={`px-4 py-2 text-sm font-semibold rounded-full ${LEAVE_TYPE_COLORS['Vacations Balance']}`}>
                  Vacations Balance
                </span>
              </td>
              {leavesSummary.years.map(year => {
                const vacations = averagePaidAnnualLeaveByYear[year];
                const taken = vacationsTakenByYear[year] || 0;
                
                if (vacations === null || vacations === undefined) {
                  return (
                    <td key={year} className="px-6 py-4 wp-body text-wp-text-primary text-center font-medium">
                      TBD
                    </td>
                  );
                }
                
                const balance = vacations - taken;
                return (
                  <td key={year} className="px-6 py-4 wp-body text-wp-text-primary text-center font-medium">
                    {balance}
                  </td>
                );
              })}
              <td className="px-6 py-4 wp-body text-wp-text-primary text-center font-bold">
                {(() => {
                  const allBalances = leavesSummary.years.map(year => {
                    const vacations = averagePaidAnnualLeaveByYear[year];
                    const taken = vacationsTakenByYear[year] || 0;
                    if (vacations === null || vacations === undefined) return null;
                    return vacations - taken;
                  }).filter((value): value is number => value !== null);
                  
                  if (allBalances.length === 0) return 'TBD';
                  
                  return allBalances.reduce((sum, val) => sum + val, 0);
                })()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

