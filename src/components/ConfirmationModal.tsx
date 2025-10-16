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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 wp-fade-in">
      <div className="wp-card p-8 max-w-md w-full mx-4 wp-slide-up">
        <div className="text-center mb-6">
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg} mb-4`}>
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
          <div className="bg-wp-dark-secondary p-4 rounded-lg mb-6 space-y-2">
            {details.map((detail, index) => (
              <div key={index} className="flex justify-between items-center">
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
            className="flex-1 px-6 py-3 bg-wp-dark-secondary hover:bg-wp-dark-card text-wp-text-primary border border-wp-border hover:border-wp-primary/50 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-6 py-3 ${styles.buttonBg} text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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

