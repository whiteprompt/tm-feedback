import { Suspense } from 'react';
import TeamMemberFeedbackClient from './TeamMemberFeedbackClient';

export const dynamic = 'force-dynamic';

// Create a default empty response
const emptyResponse = { results: [] };

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeamMemberFeedbackClient initialData={emptyResponse} />
    </Suspense>
  );
} 