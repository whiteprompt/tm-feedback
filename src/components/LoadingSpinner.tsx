interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Loading your information..." }: LoadingSpinnerProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="wp-fade-in">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className={`
              border-wp-primary/30 border-t-wp-primary h-16 w-16 animate-spin
              rounded-full border-4
            `}></div>
          </div>
          <p className="wp-body text-wp-text-secondary">{message}</p>
        </div>
      </div>
    </div>
  );
}
