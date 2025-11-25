'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useTeamMember } from '@/contexts/TeamMemberContext';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import ExpenseRefundsList, { ExpenseRefund } from '@/components/expense-refunds/ExpenseRefundsList';
import { HeroSection } from '@/components/home/HeroSection';
import { FullWidthContainerSection } from '@/components/FullWidthContainerSection';

export default function ExpenseRefundsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { teamMember, loading: teamMemberLoading } = useTeamMember();
  const [expenseRefunds, setExpenseRefunds] = useState<ExpenseRefund[]>([]);
  const [filteredExpenseRefunds, setFilteredExpenseRefunds] = useState<ExpenseRefund[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchExpenseRefunds = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch("/api/expense-refunds");

      if (!response.ok) {
        throw new Error("Failed to fetch expense refunds");
      }

      const data = await response.json();
      setExpenseRefunds(data);
    } catch (error) {
      setError("Failed to fetch expense refunds");
      console.error("Error fetching expense refunds:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  // Filter expense refunds based on status
  useEffect(() => {
    if (!expenseRefunds.length) {
      setFilteredExpenseRefunds([]);
      return;
    }

    if (statusFilter === 'All') {
      setFilteredExpenseRefunds(expenseRefunds);
    } else {
      const filtered = expenseRefunds.filter(refund => {
        const overallStatusKey = refund.finalStatus;
        return overallStatusKey === statusFilter;
      });
      setFilteredExpenseRefunds(filtered);
    }
  }, [expenseRefunds, statusFilter]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchExpenseRefunds();
    }
  }, [session, fetchExpenseRefunds]);

  if (loading || teamMemberLoading) {
    return <LoadingSpinner />;
  }

  if (!teamMember) {
    return (
      <PageLayout>
        <ErrorDisplay 
          title="No Information" 
          message="No team member information available." 
          icon="noData"
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <HeroSection
        headline='My Expense Refunds'
        subheadline="Manage your reimbursement requests in one place."
        primaryCta={{
          text: "Submit New Expense Refund",
          onClick: () => router.push("/expense-refunds/bulk"),
        }}
        secondaryCta={{
          text: "Obtain your refund process",
          href: "https://sites.google.com/whiteprompt.com/intranet/administration/get-your-refund",
          newTab: true,
        }}
      />
      
      <div>
      <FullWidthContainerSection
        headline='Reimbursement History'
        description='View details of past and pending requests.'
      >
        {error ? (
          <ErrorDisplay message={error} />
        ) : (
          <ExpenseRefundsList
            data={filteredExpenseRefunds}
            isLoading={loading}
            description={`${statusFilter === 'All' ? 'All' : statusFilter} expense refund requests`}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            totalCount={expenseRefunds.length}
          />
        )}
      </FullWidthContainerSection>
      </div>

    </PageLayout>
  );
}
