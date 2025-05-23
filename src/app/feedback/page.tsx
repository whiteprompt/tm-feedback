import { Suspense } from 'react';
import TeamMemberFeedbackClient from './TeamMemberFeedbackClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeamMemberFeedbackClient />
    </Suspense>
  );
} 