'use client';

import PageLayout from '@/components/PageLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { FullWidthContainerSection } from '@/components/FullWidthContainerSection';
import ExpenseRefundFormClient from '@/components/expense-refunds/ExpenseRefundFormClient';

export const dynamic = 'force-dynamic';

export default function Page() {
    return (
      <PageLayout>
        <HeroSection
          headline="Submit Expense Refund"
          subheadline="Submit expense refund manually with this form."
          showScrollIndicator
        />
        <FullWidthContainerSection
          classNameContent='w-full'
        >
          <ExpenseRefundFormClient />
        </FullWidthContainerSection>
      </PageLayout>
    );
} 
