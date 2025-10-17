'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Notification, NotificationModule } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsDropdownProps {
  onClose: () => void;
}

export function NotificationsDropdown({ onClose }: NotificationsDropdownProps) {
  const { notifications, markAsRead, loading, error, filter, setFilter, unreadCount } = useNotifications();
  const router = useRouter();

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.read_date) {
      await markAsRead(notification.id);
    }

    switch (notification.module) {
      case NotificationModule.Leaves:
        router.push(`/leaves`);
        break;
      case NotificationModule.ExpenseRefunds:
        router.push(`/expense-refunds`);
        break;
      case NotificationModule.Feedbacks:
        router.push('/feedbacks');
        break;
      case NotificationModule.Presentations:
        router.push('/presentations');
        break;
      case NotificationModule.Company:
        router.push('/company');
        break;
      default:
        router.push('/');
    }

    onClose();
  };

  const getModuleIcon = (module: NotificationModule) => {
    switch (module) {
      case NotificationModule.Leaves:
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case NotificationModule.ExpenseRefunds:
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case NotificationModule.Feedbacks:
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
      case NotificationModule.Presentations:
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v16a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1h8z" />
          </svg>
        );
      case NotificationModule.Company:
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getModuleColor = (module: NotificationModule) => {
    switch (module) {
      case NotificationModule.Leaves:
        return 'text-green-500';
      case NotificationModule.ExpenseRefunds:
        return 'text-blue-500';
      case NotificationModule.Feedbacks:
        return 'text-purple-500';
      case NotificationModule.Presentations:
        return 'text-orange-500';
      case NotificationModule.Company:
        return 'text-gray-500';
      default:
        return 'text-wp-primary';
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-wp-dark border border-wp-border/30 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-wp-border/30 bg-wp-dark-lighter/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-wp-text-primary">Notifications</h3>
          <span className="text-xs text-wp-text-secondary">
            {notifications.length} {filter === 'all' ? 'total' : filter}
          </span>
        </div>
        
        {/* Filter Options */}
        <div className="flex space-x-1 bg-wp-dark/50 rounded-lg p-1">
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
              filter === 'unread'
                ? 'bg-wp-primary text-white'
                : 'text-wp-text-secondary hover:text-wp-text-primary hover:bg-wp-primary/10'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
              filter === 'read'
                ? 'bg-wp-primary text-white'
                : 'text-wp-text-secondary hover:text-wp-text-primary hover:bg-wp-primary/10'
            }`}
          >
            Read
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
              filter === 'all'
                ? 'bg-wp-primary text-white'
                : 'text-wp-text-secondary hover:text-wp-text-primary hover:bg-wp-primary/10'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="inline-block h-6 w-6 border-2 border-wp-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-sm text-wp-text-secondary">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center">
            <svg className="mx-auto h-12 w-12 text-wp-text-secondary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="mt-2 text-sm text-wp-text-secondary">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-wp-border/20">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full px-4 py-3 text-left cursor-pointer hover:bg-wp-primary/10 hover:shadow-sm transition-all duration-200 ${
                  !notification.read_date ? 'bg-wp-primary/5 border-l-2 border-wp-primary' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Module Icon */}
                  <div className={`flex-shrink-0 ${getModuleColor(notification.module)}`}>
                    {getModuleIcon(notification.module)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-wp-text-secondary uppercase tracking-wide">
                        {notification.module}
                      </p>
                      <p className="text-xs text-wp-text-secondary">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-wp-text-primary line-clamp-2">
                      {notification.text}
                    </p>
                    {!notification.read_date && (
                      <div className="mt-1 h-1 w-1 bg-wp-primary rounded-full" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-wp-border/30 bg-wp-dark-lighter/50">
          <p className="text-xs text-wp-text-secondary text-center">
            Click on a notification to view details
          </p>
        </div>
      )}
    </div>
  );
}
