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
    <div className={`mb-8 wp-fade-in ${className}`}>
      <a
        href={href}
        {...(isPlaceholder ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        className={`group wp-card p-6 transition-all duration-300 hover:shadow-xl hover:shadow-wp-primary/20 block h-full flex flex-col ${
          isPlaceholder 
            ? 'opacity-60 cursor-not-allowed hover:scale-100' 
            : 'hover:scale-105'
        }`}
        onClick={isPlaceholder ? (e) => e.preventDefault() : undefined}
      >
        <div className="flex items-start space-x-4 flex-1">
          <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <div className="flex-1 flex flex-col">
            <h3 className="wp-heading-3 text-wp-text-primary mb-2 group-hover:text-wp-primary transition-colors duration-300">
              {title}
            </h3>
            <p className="wp-body-small text-wp-text-secondary group-hover:text-wp-text-muted transition-colors duration-300 flex-1">
              {description}
            </p>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-5 h-5 text-wp-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>
      </a>
    </div>
  );
}

