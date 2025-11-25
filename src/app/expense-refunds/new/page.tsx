'use client';

import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { FullWidthContainerSection } from '@/components/FullWidthContainerSection';
import ExpenseRefundFormClient from '@/components/expense-refunds/ExpenseRefundFormClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  const router = useRouter();
    return (
      <PageLayout>
        <HeroSection
          headline="Submit Expense Refund"
          subheadline="Submit expense refund manually with this form."
          primaryCta={{
            text: "Go back to list",
            onClick: () => router.push("/expense-refunds"),
          }}
        />
        <FullWidthContainerSection
          classNameContent='w-full'
        >
          <ExpenseRefundFormClient />
        </FullWidthContainerSection>
      </PageLayout>
    );
} 
