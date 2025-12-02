'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmationModal from './ConfirmationModal';

interface FormActionButtonsProps {
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
  /** Whether there are unsaved changes in the form */
  hasUnsavedChanges: boolean;
  /** The route to navigate to when canceling */
  cancelRoute: string;
  /** Text to display on the submit button when not submitting */
  submitText?: string;
  /** Text to display on the submit button when submitting */
  submittingText?: string;
}

export default function FormActionButtons({
  isSubmitting,
  hasUnsavedChanges,
  cancelRoute,
  submitText = 'Submit',
  submittingText = 'Submitting...',
}: FormActionButtonsProps) {
  const router = useRouter();
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => () => router.push(cancelRoute));
      setShowLeaveWarning(true);
    } else {
      router.push(cancelRoute);
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
    setShowLeaveWarning(false);
  };

  const cancelNavigation = () => {
    setPendingNavigation(null);
    setShowLeaveWarning(false);
  };

  return (
    <>
      <div className="flex gap-6 pt-4">
        <button
          type="button"
          onClick={handleCancel}
          className={`
            bg-wp-dark-card/60 border-wp-border wp-body text-wp-text-secondary
            flex-1 rounded-lg border px-6 py-4 font-medium transition-all
            duration-300
            hover:text-wp-text-primary hover:bg-wp-dark-card/80
            focus:ring-wp-primary focus:border-wp-primary focus:ring-2
            focus:outline-none
          `}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            wp-button-primary flex flex-1 items-center justify-center space-x-2
            px-6 py-4 transition-all duration-300
            hover:scale-105
            disabled:cursor-not-allowed
          `}
        >
          {isSubmitting ? (
            <>
              <div className={`
                h-5 w-5 animate-spin rounded-full border-2 border-white
                border-t-transparent
              `}></div>
              <span>{submittingText}</span>
            </>
          ) : (
            <>
              <span>{submitText}</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation Warning Modal */}
      <ConfirmationModal
        isOpen={showLeaveWarning}
        onClose={cancelNavigation}
        onConfirm={confirmNavigation}
        title="You have unsaved changes"
        message="Are you sure you want to leave? Your progress will be lost."
        confirmLabel="Leave"
        cancelLabel="Cancel"
        variant="warning"
      />
    </>
  );
}
