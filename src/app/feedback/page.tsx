import { Suspense } from 'react';
import TeamMemberFeedbackClient from './TeamMemberFeedbackClient';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getInitialProjects() {
  try {
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const response = await fetch(`${protocol}://${host}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: '' // This will be handled by the client component
      })
    });

    if (!response.ok) {
      return { results: [] };
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching initial projects:', error);
    return { results: [] };
  }
}

export default async function Page() {
  const initialData = await getInitialProjects();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeamMemberFeedbackClient initialData={initialData} />
    </Suspense>
  );
} 