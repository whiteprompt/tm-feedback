'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

interface Feedback {
  id: string;
  role: string;
  responsibilities: string;
  technologies: string[];
  overall_satisfaction: string;
  project_issue: string;
  created_at: string;
  project_id: string;
}

const SATISFACTION_MAP = {
  'happy': '😊',
  'neutral': '😐',
  'sad': '😞'
} as const;

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeedbacks = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch("/api/feedbacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: session.user.email }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch feedbacks");
      }

      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      setError("Failed to fetch feedbacks");
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchFeedbacks();
    }
  }, [session, fetchFeedbacks]);

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
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Your Submitted Feedbacks
            </h2>
            <Link
              href="/feedback"
              className="bg-[#00A3B4] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#008C9A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A3B4]"
            >
              Submit New Feedback
            </Link>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
                          <p className="text-sm font-medium text-[#00A3B4] truncate">
                            {feedback.project_id}
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            Role: {feedback.role}
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            Responsibilities: {feedback.responsibilities}
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            Technologies: {feedback.technologies.join(', ')}
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            Overall Satisfaction: {SATISFACTION_MAP[feedback.overall_satisfaction as keyof typeof SATISFACTION_MAP]}
                          </p>
                          {feedback.project_issue && (
                            <p className="mt-1 text-sm text-gray-600">
                              Comments: {feedback.project_issue}
                            </p>
                          )}
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
