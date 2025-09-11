interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Loading your information..." }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="wp-fade-in">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-wp-primary/30 border-t-wp-primary rounded-full animate-spin"></div>
          </div>
          <p className="wp-body text-wp-text-secondary">{message}</p>
        </div>
      </div>
    </div>
  );
}
