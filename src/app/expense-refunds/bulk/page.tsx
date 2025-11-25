'use client';

import BulkExpenseRefundClient from '@/components/expense-refunds/BulkExpenseRefundClient';
import PageLayout from '@/components/PageLayout';
import { FullWidthContainerSection } from '@/components/FullWidthContainerSection';
import { HeroSection } from '@/components/home/HeroSection';
import { useRouter } from 'next/navigation';

export default function BulkExpenseRefundPage() {
  const router = useRouter();
  return (
    <PageLayout>
      <HeroSection
        headline="Submit Bulk Expense Refunds"
        subheadline="Submit multiple expense refunds efficiently with AI extraction."
        primaryCta={{
          text: "Go back to list",
          onClick: () => router.push("/expense-refunds"),
        }}
      />
      <FullWidthContainerSection
      classNameContent='w-full'
      >
        <BulkExpenseRefundClient />
      </FullWidthContainerSection>
    </PageLayout>
  )
}