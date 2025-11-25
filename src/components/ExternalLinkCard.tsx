'use client';

interface ExternalLinkCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  className?: string;
}

export default function ExternalLinkCard({
  title,
  description,
  icon,
  href,
  className = '',
}: ExternalLinkCardProps) {
  const isPlaceholder = href === '#';
  
  return (
    <div className={`
      wp-fade-in
      ${className}
    `}>
      <a
        href={href}
        {...(isPlaceholder ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        className={`
          group wp-card flex h-full min-h-[180px] flex-col p-6 transition-all
          duration-300
          hover:shadow-wp-primary/20 hover:shadow-xl
          ${
          isPlaceholder 
            ? `
              cursor-not-allowed
              hover:scale-100
            ` 
            : 'hover:scale-105'
        }
        `}
        onClick={isPlaceholder ? (e) => e.preventDefault() : undefined}
      >
        <div className="flex flex-1 items-start space-x-4">
          <div className={`
            text-3xl transition-transform duration-300
            group-hover:scale-110
          `}>
            {icon}
          </div>
          <div className="flex flex-1 flex-col">
            <h3 className={`
              wp-heading-3 text-wp-text-primary mb-2 transition-colors
              duration-300
              group-hover:text-wp-primary
            `}>
              {title}
            </h3>
            <p className={`
              wp-body-small text-wp-text-secondary flex-1 transition-colors
              duration-300
              group-hover:text-wp-text-muted
            `}>
              {description}
            </p>
          </div>
          <div className={`
            opacity-0 transition-opacity duration-300
            group-hover:opacity-100
          `}>
            <svg className="text-wp-primary h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>
      </a>
    </div>
  );
}

