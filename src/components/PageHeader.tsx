import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  description: string;
  actionButton?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    external?: boolean;
  };
}

export default function PageHeader({ title, description, actionButton }: PageHeaderProps) {
  const buttonContent = actionButton && (
    <>
      {actionButton.icon && actionButton.icon}
      <span>{actionButton.label}</span>
    </>
  );

  return (
    <div className={`
      wp-fade-in mb-16 flex flex-col gap-6
      sm:flex-row sm:items-center sm:justify-between
    `}>
      <div>
        <h1 className="wp-heading-1 mb-4">{title}</h1>
        <p className="wp-body-large">{description}</p>
      </div>
      {actionButton && (
        actionButton.external ? (
          <a
            href={actionButton.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              wp-button-primary inline-flex items-center space-x-2
              whitespace-nowrap
            `}
          >
            {buttonContent}
          </a>
        ) : (
          <Link
            href={actionButton.href}
            className={`
              wp-button-primary inline-flex items-center space-x-2
              whitespace-nowrap
            `}
          >
            {buttonContent}
          </Link>
        )
      )}
    </div>
  );
}
