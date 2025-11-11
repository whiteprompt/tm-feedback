'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export interface Feedback {
  id: string;
  role: string;
  responsibilities: string;
  technologies: string[];
  overall_satisfaction: string;
  project_issue?: string;
  created_at: string;
  project_id: string;
}

interface FeedbacksContextType {
  feedbacks: Feedback[];
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
  getLastFeedbackForProject: (projectId: string) => Feedback | null;
}

const FeedbacksContext = createContext<FeedbacksContextType | undefined>(undefined);

export function FeedbacksProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeedbacks = async () => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/feedbacks");

      if (!response.ok) {
        throw new Error("Failed to fetch feedbacks");
      }

      const data = await response.json();
      setFeedbacks(data);
      setError('');
    } catch (err) {
      setError("Failed to fetch feedbacks");
      console.error("Error fetching feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchFeedbacks();
    }
  }, [session?.user?.email]);

  const getLastFeedbackForProject = (projectId: string): Feedback | null => {
    const projectFeedbacks = feedbacks
      .filter(f => f.project_id === projectId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return projectFeedbacks[0] || null;
  };

  return (
    <FeedbacksContext.Provider 
      value={{ 
        feedbacks, 
        loading, 
        error,
        refetch: fetchFeedbacks,
        getLastFeedbackForProject
      }}
    >
      {children}
    </FeedbacksContext.Provider>
  );
}

export function useFeedbacks() {
  const context = useContext(FeedbacksContext);
  if (context === undefined) {
    throw new Error('useFeedbacks must be used within a FeedbacksProvider');
  }
  return context;
}

