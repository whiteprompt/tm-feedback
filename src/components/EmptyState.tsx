import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionButton?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  icon?: React.ReactNode;
}

export default function EmptyState({ title, description, actionButton, icon }: EmptyStateProps) {
  const defaultIcon = (
    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className="wp-card p-12 text-center wp-fade-in">
      <div className="text-wp-text-muted mb-6">
        {icon || defaultIcon}
      </div>
      <h3 className="wp-heading-3 text-wp-text-secondary mb-4">{title}</h3>
      <p className="wp-body text-wp-text-muted mb-8">{description}</p>
      {actionButton && (
        <Link href={actionButton.href} className="wp-button-primary inline-flex items-center space-x-2">
          {actionButton.icon && actionButton.icon}
          <span>{actionButton.label}</span>
        </Link>
      )}
    </div>
  );
}
