import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'primary';
  details?: Array<{ label: string; value: string | React.ReactNode }>;
}

const variantStyles = {
  danger: {
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500',
    buttonBg: 'bg-red-500 hover:bg-red-600',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  warning: {
    iconBg: 'bg-yellow-500/10',
    iconColor: 'text-yellow-500',
    buttonBg: 'bg-yellow-500 hover:bg-yellow-600',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  primary: {
    iconBg: 'bg-wp-primary/10',
    iconColor: 'text-wp-primary',
    buttonBg: 'bg-wp-primary hover:bg-wp-primary/90',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  variant = 'danger',
  details,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const styles = variantStyles[variant];

  return (
    <div className={`
      wp-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50
      backdrop-blur-sm
    `}>
      <div className="wp-card wp-slide-up mx-4 w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <div className={`
            mx-auto flex h-12 w-12 items-center justify-center rounded-full
            ${styles.iconBg}
            mb-4
          `}>
            <div className={styles.iconColor}>
              {styles.icon}
            </div>
          </div>
          <h3 className="wp-heading-3 text-wp-text-primary mb-2">
            {title}
          </h3>
          <p className="wp-body text-wp-text-muted">
            {message}
          </p>
        </div>

        {details && details.length > 0 && (
          <div className="bg-wp-dark-secondary mb-6 space-y-2 rounded-lg p-4">
            {details.map((detail, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="wp-body-small text-wp-text-muted">{detail.label}:</span>
                <span className="wp-body-small text-wp-text-primary font-medium">{detail.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`
              bg-wp-dark-secondary text-wp-text-primary border-wp-border flex-1
              rounded-lg border px-6 py-3 font-medium transition-all
              duration-200
              hover:bg-wp-dark-card hover:border-wp-primary/50
              disabled:cursor-not-allowed disabled:opacity-50
            `}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              flex-1 px-6 py-3
              ${styles.buttonBg}
              flex items-center justify-center space-x-2 rounded-lg font-medium
              text-white transition-all duration-200
              disabled:cursor-not-allowed disabled:opacity-50
            `}
          >
            {isLoading ? (
              <>
                <div className={`
                  h-4 w-4 animate-spin rounded-full border-b-2 border-white
                `}></div>
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

