'use client';

import React from 'react';

export interface EmptyStateConfig {
  icon?: React.ReactNode;
  title?: string;
  message: string;
}

export interface DataCardProps<T> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  iconBgClassName?: string;
  data: T[] | null | undefined;
  isLoading?: boolean;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyState?: EmptyStateConfig;
  noDataState?: EmptyStateConfig;
  wrapperClassName?: string;
  cardClassName?: string;
}

export function DataCard<T>({
  title,
  description,
  icon,
  iconBgClassName = 'bg-linear-to-r from-wp-purple to-wp-purple-dark',
  data,
  isLoading = false,
  renderItem,
  emptyState,
  noDataState,
  wrapperClassName,
  cardClassName = 'wp-card p-8',
}: DataCardProps<T>) {
  const defaultEmptyState: EmptyStateConfig = {
    icon: (
      <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    message: 'No items found.',
  };

  const defaultNoDataState: EmptyStateConfig = {
    icon: (
      <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    title: 'No Information',
    message: 'No information available.',
  };

  const renderEmptyState = (config: EmptyStateConfig) => (
    <div className="py-8 text-center">
      <div className="text-wp-text-muted mb-4">
        {config.icon}
      </div>
      {config.title && (
        <h3 className="wp-heading-3 text-wp-text-muted mb-2">{config.title}</h3>
      )}
      <p className="wp-body text-wp-text-muted">{config.message}</p>
    </div>
  );

  const content = (
    <div className={cardClassName}>
      {title && (
        <div className="mb-6 flex items-center">
          <div className={`
            h-12 w-12
            ${iconBgClassName}
            mr-4 flex items-center justify-center rounded-full
          `}>
            {icon}
          </div>
          <div className="flex-1">
            <h2 className="wp-heading-3">{title}</h2>
            {description && (
              <p className="wp-body-small text-wp-text-secondary mt-2">
                {description}
              </p>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center">
          <p className="wp-body text-wp-text-muted">Loading...</p>
        </div>
      ) : data === null || data === undefined ? (
        renderEmptyState(noDataState || defaultNoDataState)
      ) : data.length === 0 ? (
        renderEmptyState(emptyState || defaultEmptyState)
      ) : (
        <div className="grid gap-4">
          {data.map((item, index) => (
            <React.Fragment key={(item as any)?.id ?? index}>
              {renderItem(item, index)}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );

  if (wrapperClassName) {
    return <div className={wrapperClassName}>{content}</div>;
  }

  return content;
}

