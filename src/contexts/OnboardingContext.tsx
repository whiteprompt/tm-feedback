'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';

export type OnboardingStep = 'step_redmine' | 'step_slack' | 'step_gmail_2fa' | 'step_metodos_cobro';

export interface OnboardingProgress {
  id: string;
  user_email: string;
  step_redmine: boolean;
  step_slack: boolean;
  step_gmail_2fa: boolean;
  step_metodos_cobro: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface OnboardingContextType {
  onboardingStatus: OnboardingProgress | null;
  isOnboardingComplete: boolean;
  loading: boolean;
  /** Optimistically marks a step as done/undone and persists to DB. */
  markStep: (step: OnboardingStep, value: boolean) => Promise<void>;
  /** Finalises onboarding — sets completed_at in DB and closes the modal. */
  completeOnboarding: () => Promise<void>;
  isCompleting: boolean;
  stepError: string | null;
  completeError: string | null;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();

  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const fetchOnboarding = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/onboarding');

      // 404 = no record in DB → this user doesn't need onboarding
      if (res.status === 404) {
        setOnboardingStatus(null);
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch onboarding status');
      const data: OnboardingProgress = await res.json();
      setOnboardingStatus(data);
    } catch (err) {
      console.error('OnboardingContext: fetch error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user?.email) {
      fetchOnboarding();
    } else if (sessionStatus === 'unauthenticated') {
      setLoading(false);
    }
  }, [sessionStatus, session?.user?.email, fetchOnboarding]);

  // Auto-clear step errors after 4 seconds
  useEffect(() => {
    if (!stepError) return;
    const t = setTimeout(() => setStepError(null), 4000);
    return () => clearTimeout(t);
  }, [stepError]);

  const markStep = useCallback(async (step: OnboardingStep, value: boolean) => {
    if (!onboardingStatus) return;

    // Optimistic update
    const previous = { ...onboardingStatus };
    setOnboardingStatus((prev) => prev ? { ...prev, [step]: value } : prev);
    setStepError(null);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, value }),
      });

      if (!res.ok) throw new Error('Failed to update step');

      const updated: OnboardingProgress = await res.json();
      setOnboardingStatus(updated);
    } catch (err) {
      console.error('OnboardingContext: markStep error', err);
      // Revert optimistic update
      setOnboardingStatus(previous);
      setStepError('Failed to save your progress. Please try again.');
    }
  }, [onboardingStatus]);

  const completeOnboarding = useCallback(async () => {
    setIsCompleting(true);
    setCompleteError(null);

    try {
      const res = await fetch('/api/onboarding/complete', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to complete onboarding');

      const result = await res.json();
      if (result.data) {
        setOnboardingStatus(result.data);
      } else {
        // Fallback: mark locally
        setOnboardingStatus((prev) =>
          prev ? { ...prev, completed_at: new Date().toISOString() } : prev
        );
      }
    } catch (err) {
      console.error('OnboardingContext: completeOnboarding error', err);
      setCompleteError('Something went wrong. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  }, []);

  const isOnboardingComplete = Boolean(onboardingStatus?.completed_at);

  return (
    <OnboardingContext.Provider
      value={{
        onboardingStatus,
        isOnboardingComplete,
        loading,
        markStep,
        completeOnboarding,
        isCompleting,
        stepError,
        completeError,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
