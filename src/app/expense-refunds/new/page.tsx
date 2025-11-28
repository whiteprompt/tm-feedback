import PageLayout from '@/components/PageLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { FullWidthContainerSection } from '@/components/FullWidthContainerSection';
import ExpenseRefundFormClient from '@/components/expense-refunds/ExpenseRefundFormClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;
    const type = params.type;
    
    return (
      <PageLayout>
        <HeroSection
          headline="Submit Expense Refund"
          subheadline="Submit expense refund manually with this form."
          primaryCta={{
            text: "Go back to feedbacks",
            href: '/other-requests',
          }}
        />
        <FullWidthContainerSection
          classNameContent='w-full'
        >
          <ExpenseRefundFormClient type={type} />
        </FullWidthContainerSection>
      </PageLayout>
    );
} 
