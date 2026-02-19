'use client';

import { useEffect } from 'react';
import { useOnboarding, OnboardingStep } from '@/contexts/OnboardingContext';
import { useSession } from 'next-auth/react';

interface StepConfig {
  key: OnboardingStep;
  number: number;
  title: string;
  hint: string;
  link: string;
  icon: React.ReactNode;
}

const CheckIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const RedmineSlackIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CreditCardIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const SlackIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const STEPS: StepConfig[] = [
  {
    key: 'step_redmine',
    number: 1,
    title: 'Redmine Access',
    hint: 'Confirm you have access to Redmine',
    link: 'https://redmine.whiteprompt.com/',
    icon: <RedmineSlackIcon />,
  },
  {
    key: 'step_slack',
    number: 2,
    title: 'Slack Access',
    hint: 'Confirm you have access to Slack',
    link: 'https://slack.com/',
    icon: <SlackIcon />,
  },
  {
    key: 'step_gmail_2fa',
    number: 3,
    title: 'Gmail 2FA',
    hint: 'Enable 2FA on your Google account',
    link: 'https://accounts.google.com/',
    icon: <ShieldIcon />,
  },
  {
    key: 'step_metodos_cobro',
    number: 4,
    title: 'Payment method',
    hint: 'Submit your payment method details',
    link: 'https://sites.google.com/whiteprompt.com/intranet/administration/get-your-compensation/choose-your-payment-method',
    icon: <CreditCardIcon />,
  },
];

function StepRow({
  step,
  isDone,
  onToggle,
  isDisabled,
}: {
  step: StepConfig;
  isDone: boolean;
  onToggle: () => void;
  isDisabled: boolean;
}) {
  return (
    <div
      className={`
        group flex flex-col gap-3 rounded-xl border px-4 py-3 transition-all
        duration-200
        sm:flex-row sm:items-center sm:gap-4
        ${isDone
          ? 'border-[var(--wp-primary)]/30 bg-[var(--wp-primary)]/5'
          : `
            border-[var(--wp-border)] bg-white/[0.03]
            hover:border-[var(--wp-border-light)] hover:bg-white/[0.05]
          `
        }
      `}
    >
      <div className={`
        flex flex-1 items-center gap-3
        sm:gap-4
      `}>
        {/* Number badge / check */}
        <div
          className={`
            flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm
            font-bold transition-all duration-200
            ${isDone
              ? 'bg-[var(--wp-primary)] text-black'
              : 'bg-white/[0.07] text-[var(--wp-text-muted)]'
            }
          `}
        >
          {isDone ? <CheckIcon /> : step.number}
        </div>

        {/* Icon */}
        <div className={`
          shrink-0 transition-colors duration-200
          ${isDone ? `text-[var(--wp-primary)]` : `
            text-[var(--wp-text-muted)]
            group-hover:text-[var(--wp-text-secondary)]
          `}
        `}>
          {step.icon}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className={`
              text-sm font-semibold transition-colors duration-200
              ${isDone ? `text-[var(--wp-primary)]` : `
                text-[var(--wp-text-primary)]
              `}
            `}>
              {step.title}
            </span>
            <span className={`
              text-xs whitespace-nowrap text-[var(--wp-text-muted)]
            `}>— {step.hint}</span>
            <a
              href={step.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                inline-flex items-center gap-0.5 text-xs
                text-[var(--wp-primary)] opacity-70 transition-opacity
                hover:opacity-100
              `}
              onClick={(e) => e.stopPropagation()}
            >
              Open
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={onToggle}
        disabled={isDisabled}
        aria-pressed={isDone}
        className={`
          flex h-8 w-full items-center justify-center gap-1.5 rounded-lg px-3
          text-xs font-semibold transition-all duration-200
          focus-visible:ring-2 focus-visible:ring-[var(--wp-primary)]
          focus-visible:outline-none
          disabled:cursor-not-allowed disabled:opacity-50
          sm:w-auto
          ${isDone
            ? `
              bg-[var(--wp-primary)]/15 text-[var(--wp-primary)]
              hover:bg-[var(--wp-primary)]/25
            `
            : `
              bg-white/[0.08] text-[var(--wp-text-secondary)]
              hover:bg-white/[0.14] hover:text-[var(--wp-text-primary)]
            `
          }
        `}
      >
        {isDone ? (
          <>
            <CheckIcon className="h-3.5 w-3.5" />
            Done
          </>
        ) : (
          'Mark as done'
        )}
      </button>
    </div>
  );
}

export default function OnboardingModal() {
  const { status: sessionStatus } = useSession();
  const {
    onboardingStatus,
    isOnboardingComplete,
    loading,
    markStep,
    completeOnboarding,
    isCompleting,
    stepError,
    completeError,
  } = useOnboarding();

  // Prevent Escape key from closing anything
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault();
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Lock body scroll while modal is visible
  useEffect(() => {
    const shouldLock = sessionStatus === 'authenticated' && !loading && !isOnboardingComplete && !!onboardingStatus;
    document.body.style.overflow = shouldLock ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sessionStatus, loading, isOnboardingComplete, onboardingStatus]);

  if (sessionStatus !== 'authenticated') return null;
  if (loading) return null;
  if (isOnboardingComplete) return null;
  if (!onboardingStatus) return null;

  const allStepsDone =
    onboardingStatus.step_redmine &&
    onboardingStatus.step_slack &&
    onboardingStatus.step_gmail_2fa &&
    onboardingStatus.step_metodos_cobro;

  const completedCount = [
    onboardingStatus.step_redmine,
    onboardingStatus.step_slack,
    onboardingStatus.step_gmail_2fa,
    onboardingStatus.step_metodos_cobro,
  ].filter(Boolean).length;

  const progressPercent = Math.round((completedCount / 4) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center bg-black/70
        backdrop-blur-sm
      `}
    >
      {/* Modal card — responsive height and scrollable */}
      <div className={`
        wp-slide-up relative mx-4 flex max-h-[90vh] w-full max-w-3xl flex-col
        overflow-hidden rounded-2xl border border-[var(--wp-border)]
        bg-[var(--wp-bg-card)] shadow-[0_32px_64px_rgba(0,0,0,0.6)]
      `}>

        {/* Top accent bar */}
        <div className={`
          h-0.5 w-full bg-gradient-to-r from-[var(--wp-primary)] to-[#00B8D4]
        `} />

        {/* Header — responsive layout */}
        <div className={`
          flex flex-col gap-4 border-b border-[var(--wp-border)] px-6 py-4
          sm:flex-row sm:items-center
        `}>
          <div className="flex flex-1 items-center gap-4">
            {/* Icon */}
            <div className={`
              flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
              bg-[var(--wp-primary)]/10
            `}>
              <svg className="h-5 w-5 text-[var(--wp-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>

            {/* Title + subtitle */}
            <div className="min-w-0 flex-1">
              <h2 id="onboarding-title" className={`
                text-base leading-tight font-bold text-[var(--wp-text-primary)]
              `}>
                Welcome to White Prompt! Please, complete your onboarding
              </h2>
              <p className="text-xs text-[var(--wp-text-muted)]">
                Please complete all steps before accessing the portal.
              </p>
            </div>
          </div>

          {/* Progress pill + bar */}
          <div className={`
            flex items-center gap-3
            sm:shrink-0
          `}>
            <span className="text-xs font-semibold text-[var(--wp-primary)]">
              {completedCount} / 4
            </span>
            <div className={`
              h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]
              sm:w-28
            `}>
              <div
                className={`
                  h-full rounded-full bg-gradient-to-r from-[var(--wp-primary)]
                  to-[#00B8D4] transition-all duration-500 ease-out
                `}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Steps — scrollable on mobile if needed */}
        <div className={`
          custom-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto px-6 py-4
        `}>
          {STEPS.map((step) => {
            const isDone = Boolean(onboardingStatus[step.key]);
            return (
              <StepRow
                key={step.key}
                step={step}
                isDone={isDone}
                onToggle={() => markStep(step.key, !isDone)}
                isDisabled={isCompleting}
              />
            );
          })}
        </div>

        {/* Error banner */}
        {(stepError || completeError) && (
          <div className={`
            mx-6 mb-2 flex items-center gap-2 rounded-lg border
            border-red-500/30 bg-red-500/10 px-3 py-2
          `}>
            <svg className="h-4 w-4 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-red-300">{stepError || completeError}</p>
          </div>
        )}

        {/* Footer — responsive layout */}
        <div className={`
          flex-shrink-0 border-t border-[var(--wp-border)] bg-white/[0.02] px-6
          py-4
        `}>
          <div className={`
            mb-4 flex flex-col justify-between gap-4
            sm:flex-row sm:items-center
          `}>
            {!allStepsDone ? (
              <p className="text-xs text-[var(--wp-text-muted)]">
                {4 - completedCount} step{4 - completedCount !== 1 ? 's' : ''} remaining
              </p>
            ) : (
              <p className="text-xs text-[var(--wp-primary)]">All steps complete — you&apos;re good to go!</p>
            )}

            <button
              onClick={completeOnboarding}
              disabled={!allStepsDone || isCompleting}
              className={`
                flex w-full items-center justify-center gap-2 rounded-xl px-5
                py-2.5 text-sm font-bold transition-all duration-300
                focus-visible:ring-2 focus-visible:ring-[var(--wp-primary)]
                focus-visible:outline-none
                sm:w-auto
                ${allStepsDone && !isCompleting
                  ? `
                    cursor-pointer bg-gradient-to-r from-[var(--wp-primary)]
                    to-[#00B8D4] text-black
                    shadow-[0_0_20px_rgba(0,217,255,0.25)]
                    hover:-translate-y-0.5
                    hover:shadow-[0_0_28px_rgba(0,217,255,0.45)]
                  `
                  : `
                    cursor-not-allowed bg-white/[0.06]
                    text-[var(--wp-text-muted)]
                  `
                }
              `}
            >
              {isCompleting ? (
                <>
                  <span className={`
                    h-4 w-4 animate-spin rounded-full border-2 border-black/30
                    border-t-black
                  `} />
                  Completing…
                </>
              ) : (
                <>
                  {allStepsDone && <CheckIcon className="h-4 w-4" />}
                  Complete Onboarding
                </>
              )}
            </button>
          </div>
          
          <div className={`
            border-t border-[var(--wp-border)]/50 pt-2 text-center
          `}>
            <p className="text-[10px] text-[var(--wp-text-muted)]">
              If you have any questions, please contact us at{' '}
              <a 
                href="mailto:administration@whiteprompt.com" 
                className={`
                  text-[var(--wp-primary)]
                  hover:underline
                `}
              >
                administration@whiteprompt.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
