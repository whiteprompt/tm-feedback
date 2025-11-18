import { Suspense } from 'react';
import ExpenseRefundFormV2Client from '@/components/expense-refunds/ExpenseRefundFormV2Client';
import Navigation from '@/components/Navigation';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Navigation />
        <main className="wp-section-sm">
          <div className="wp-slide-up">
            <div className="wp-card p-8">
              <div className="animate-pulse">
                <div className="h-12 bg-wp-dark-card/50 rounded w-1/3 mb-8"></div>
                <div className="space-y-6">
                  <div className="h-16 bg-wp-dark-card/50 rounded"></div>
                  <div className="h-16 bg-wp-dark-card/50 rounded"></div>
                  <div className="h-32 bg-wp-dark-card/50 rounded"></div>
                  <div className="h-16 bg-wp-dark-card/50 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    }>
      <ExpenseRefundFormV2Client />
    </Suspense>
  );
} 
