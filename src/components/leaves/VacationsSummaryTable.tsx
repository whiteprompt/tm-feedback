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
    for (let year = minYear; year <= maxYear; year++) {
      allYears.push(year.toString());
    }

    return { summary, years: allYears };
  }, [leaves]);

  // Determine if the last active contract is hourly
  const isLastActiveContractHourly = useMemo(() => {
    if (!teamMember?.contracts || teamMember.contracts.length === 0) {
      return false;
    }

    const currentDate = new Date();

    // Filter contracts that are currently active (started and not ended, or open)
    const activeContracts = (teamMember.contracts || []).filter(contract => {
      if (!contract.start) return false;

      const contractStart = new Date(contract.start);
      if (contractStart > currentDate) return false; // Not started yet

      // If contract has no end date, it's still active (open contract)
      if (!contract.end) {
        return true;
      }

      const contractEnd = new Date(contract.end);
      return contractEnd >= currentDate; // Still active
    });

    if (activeContracts.length === 0) {
      return false;
    }

    // Find the last active contract (most recent start date, or open contract)
    const lastActiveContract = activeContracts.reduce((latest, contract) => {
      if (!latest) return contract;
      
      const contractStart = new Date(contract.start);
      const latestStart = new Date(latest.start);
      
      // Prefer open contracts (no end date)
      if (!contract.end && latest.end) return contract;
      if (contract.end && !latest.end) return latest;
      
      // If both have end dates or both are open, pick the one with latest start date
      return contractStart > latestStart ? contract : latest;
    });

    return lastActiveContract?.amountType === 'Hourly';
  }, [teamMember]);

  // Calculate average of paidAnnualLeave per year based on active contracts
  const averagePaidAnnualLeaveByYear = useMemo(() => {
    const averages: { [year: string]: number | null } = {};

    if (!teamMember?.contracts || teamMember.contracts.length === 0) {
      return averages;
    }

    // For each year in the summary, calculate the average
    leavesSummary.years.forEach(yearStr => {
      const year = parseInt(yearStr);

      // Calculate proration factor
      const currentYear = new Date().getFullYear();

      // Future years: 0 ONLY if not Hourly
      if (year > currentYear && !isLastActiveContractHourly) {
        averages[yearStr] = 0;
        return;
      }

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
        let prorationFactor = 1;
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31);

        // Determine calculation end date (Today for current year, Dec 31 for past years)
        let calcEnd = yearEnd;
        if (year === currentYear) {
          calcEnd = new Date();
          calcEnd.setHours(0, 0, 0, 0);
        }

        // Determine calculation start date (StartDate or Jan 1)
        let calcStart = yearStart;
        if (teamMember?.startDate) {
          const startDate = new Date(teamMember.startDate);
          startDate.setHours(0, 0, 0, 0);
          if (startDate > yearStart) {
            calcStart = startDate;
          }
        }

        if (calcStart > calcEnd) {
          prorationFactor = 0;
        } else {
          const daysActive = (calcEnd.getTime() - calcStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
          const totalDaysInYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;
          prorationFactor = daysActive / totalDaysInYear;
          if (prorationFactor > 1) prorationFactor = 1;
        }

        // Override proration for Hourly contracts in current year (Always use the number)
        if (year === currentYear && isLastActiveContractHourly) {
          prorationFactor = 1;
        }

        const sum = validLeaves.reduce((acc, value) => acc + value, 0);
        const average = (sum / validLeaves.length) * prorationFactor;
        averages[yearStr] = Math.ceil(average); // Round to upper number
      }
    });

    return averages;
  }, [teamMember, leavesSummary.years, isLastActiveContractHourly]);

  // Calculate "Vacations taken" per year based on active contract amountType
  const vacationsTakenByYear = useMemo(() => {
    const vacationsTaken: { [year: string]: number } = {};

    if (!teamMember?.contracts?.length) {
      // If no contracts, default to just Annual leave
      leavesSummary.years.forEach(yearStr => {
        const annualLeave = leavesSummary.summary['Annual leave']?.[yearStr] || 0;
        vacationsTaken[yearStr] = annualLeave;
      });
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
        // No active contracts, default to just Annual leave
        const annualLeave = leavesSummary.summary['Annual leave']?.[yearStr] || 0;
        vacationsTaken[yearStr] = annualLeave;
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

  // Calculate total balance - sum of all Vacations Balance values
  const totalBalance = useMemo(() => {
    let sum = 0;

    // Sum all year columns
    leavesSummary.years.forEach(yearStr => {
      const vacations = averagePaidAnnualLeaveByYear[yearStr];
      const taken = vacationsTakenByYear[yearStr] || 0;
      
      if (vacations !== null && vacations !== undefined) {
        sum += vacations - taken;
      }
    });

    // Add the "< 2024" column value (initialBalance)
    if (initialBalance !== undefined) {
      sum += initialBalance;
    }

    return sum;
  }, [leavesSummary.years, averagePaidAnnualLeaveByYear, vacationsTakenByYear, initialBalance]);

  if (!leaves?.length) {
    return null;
  }

  return (
    <>
      <div className="wp-card wp-fade-in p-6">
        {!isLastActiveContractHourly && (
          <div className="mb-6">
            <div className={`
              border-wp-border inline-flex items-center space-x-2 rounded-lg
              border px-4 py-2
            `}>
              <span className="wp-body-small font-bold">Balance as of today:</span>
              <span className="wp-body text-wp-text-primary font-bold">{totalBalance} days</span>
            </div>
          </div>
        )}
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
                <th className={`
                  wp-body-small text-wp-text-muted px-6 py-4 text-center
                  font-semibold tracking-wider uppercase
                `}>
                  &lt; 2024
                </th>
                {leavesSummary.years.map(year => (
                  <th key={year} className={`
                    wp-body-small text-wp-text-muted px-6 py-4 text-center
                    font-semibold tracking-wider uppercase
                  `}>
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Vacations row */}
              <tr className={`
                border-wp-border/50 border-b transition-colors
                hover:bg-wp-dark-card/30
              `}>
                <td className="px-6 py-4">
                  <span className={`
                    rounded-full px-4 py-2 text-sm font-semibold
                    ${LEAVE_TYPE_COLORS.Vacations}
                  `}>
                    Annual vacations
                  </span>
                </td>
                <td className={`
                  wp-body text-wp-text-primary px-6 py-4 text-center font-medium
                `}>
                  -
                </td>
                {leavesSummary.years.map(year => (
                  <td key={year} className={`
                    wp-body text-wp-text-primary px-6 py-4 text-center
                    font-medium
                  `}>
                    {averagePaidAnnualLeaveByYear[year] !== null && averagePaidAnnualLeaveByYear[year] !== undefined
                      ? averagePaidAnnualLeaveByYear[year]
                      : 'TBD'}
                  </td>
                ))}
              </tr>
              {/* Vacations taken row */}
              <tr className={`
                border-wp-border/50 border-b transition-colors
                hover:bg-wp-dark-card/30
              `}>
                <td className="px-6 py-4">
                  <span className={`
                    rounded-full px-4 py-2 text-sm font-semibold
                    ${LEAVE_TYPE_COLORS['Vacations taken']}
                  `}>
                    Vacations taken
                  </span>
                </td>
                <td className={`
                  wp-body text-wp-text-primary px-6 py-4 text-center font-medium
                `}>
                  -
                </td>
                {leavesSummary.years.map(year => (
                  <td key={year} className={`
                    wp-body text-wp-text-primary px-6 py-4 text-center
                    font-medium
                  `}>
                    {vacationsTakenByYear[year] || 0}
                  </td>
                ))}
              </tr>
              {/* Vacations Balance row */}
              <tr className={`
                border-wp-border/50 border-b transition-colors
                hover:bg-wp-dark-card/30
              `}>
                <td className="px-6 py-4">
                  <span className={`
                    rounded-full px-4 py-2 text-sm font-semibold
                    ${LEAVE_TYPE_COLORS['Vacations Balance']}
                  `}>
                    Vacations balance
                  </span>
                </td>
                <td className={`
                  wp-body text-wp-text-primary px-6 py-4 text-center font-medium
                `}>
                  {initialBalance !== undefined ? initialBalance : '-'}
                </td>
                {leavesSummary.years.map(year => {
                  const vacations = averagePaidAnnualLeaveByYear[year];
                  const taken = vacationsTakenByYear[year] || 0;
                  
                  if (vacations === null || vacations === undefined) {
                    return (
                      <td key={year} className={`
                        wp-body text-wp-text-primary px-6 py-4 text-center
                        font-medium
                      `}>
                        TBD
                      </td>
                    );
                  }
                  
                  // Balance = Vacations - Vacations taken
                  const balance = vacations - taken;
                  return (
                    <td key={year} className={`
                      wp-body text-wp-text-primary px-6 py-4 text-center
                      font-medium
                    `}>
                      {balance}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* {teamMember?.contracts && teamMember.contracts.length > 0 && (
        <div className="mb-6 ml-2 mr-2 rounded-lg border border-wp-border">
          <p className="text-base md:text-lg text-gray-400 leading-relaxed whitespace-pre-line">
            {isLastActiveContractHourly
              ? 'This balance is for informational purposes only and does not represent a financial payment obligation.'
              : 'Annual Vacation: Total annual vacaction days are earned upon the completion of the full calendar year (Jan 1 to Dec 31).\nIf the period of service is incomplete, the days will be calculated on a strictly prorated basis according to the time worked.'}
          </p>
        </div>
      )} */}
    </>
  );
}

