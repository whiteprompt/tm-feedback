interface ErrorDisplayProps {
  title?: string;
  message: string;
  icon?: 'error' | 'noData';
}

export default function ErrorDisplay({ title = "Error", message, icon = 'error' }: ErrorDisplayProps) {
  const errorIcon = (
    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );

  const noDataIcon = (
    <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );

  const iconColor = icon === 'error' ? 'text-red-400' : 'text-wp-text-muted';
  const titleColor = icon === 'error' ? 'text-red-400' : 'text-wp-text-muted';
  const messageColor = icon === 'error' ? 'text-red-300' : 'text-wp-text-muted';

  return (
    <div className="wp-card wp-fade-in p-8 text-center">
      <div className={`
        ${iconColor}
        mb-4
      `}>
        {icon === 'error' ? errorIcon : noDataIcon}
      </div>
      <h3 className={`
        wp-heading-3
        ${titleColor}
        mb-2
      `}>{title}</h3>
      <p className={`
        wp-body
        ${messageColor}
      `}>{message}</p>
    </div>
  );
}
