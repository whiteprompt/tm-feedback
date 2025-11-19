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
                <div className="bg-wp-dark-card/50 mb-8 h-12 w-1/3 rounded"></div>
                <div className="space-y-6">
                  <div className="bg-wp-dark-card/50 h-16 rounded"></div>
                  <div className="bg-wp-dark-card/50 h-16 rounded"></div>
                  <div className="bg-wp-dark-card/50 h-32 rounded"></div>
                  <div className="bg-wp-dark-card/50 h-16 rounded"></div>
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
