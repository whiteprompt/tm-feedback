'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';

interface Feedback {
  id: string;
  role: string;
  responsibilities: string;
  technologies: string[];
  created_at: string;
  project_id: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchFeedbacks();
    }
  }, [session]);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feedbacks');
      }

      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      setError('Failed to fetch feedbacks');
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome to the app
            </h2>
            {session?.user?.email && (
              <p className="mt-2 text-gray-600">
                Signed in as {session.user.email}
              </p>
            )}
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your Submitted Feedbacks
              </h3>
            </div>
            {error ? (
              <div className="px-4 py-5 sm:px-6 text-red-600">{error}</div>
            ) : feedbacks.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-gray-500">
                No feedbacks submitted yet.
              </div>
            ) : (
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {feedbacks.map((feedback) => (
                    <li key={feedback.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {feedback.project_id}
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            Role: {feedback.role}
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            Technologies: {feedback.technologies.join(', ')}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Submitted on: {new Date(feedback.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
