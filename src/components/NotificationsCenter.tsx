'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Notification, NotificationModule } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsCenter() {
  const router = useRouter();
  const { notifications, markAsRead, loading, error, filter, setFilter, unreadCount } = useNotifications();

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
      case NotificationModule.MyProjects:
        router.push('/my-projects');
        break;
      case NotificationModule.MyProfile:
        router.push('/my-profile');
        break;
      default:
        router.push('/');
    }
  };

  const getModuleIcon = (module: NotificationModule) => {
    switch (module) {
      case NotificationModule.Leaves:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case NotificationModule.ExpenseRefunds:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case NotificationModule.MyProjects:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
      case NotificationModule.MyProfile:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v16a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1h8z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      case NotificationModule.MyProjects:
        return 'text-purple-500';
      case NotificationModule.MyProfile:
        return 'text-orange-500';
      default:
        return 'text-[#00D9FF]';
    }
  };

  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(n => !n.read_date);
    await Promise.all(unreadNotifications.map(n => markAsRead(n.id)));
  }, [notifications, markAsRead]);

  return (
    <div className="wp-card p-6">
      {/* Header with Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="wp-heading-3 mb-1">All Notifications</h2>
            <p className="text-sm text-wp-text-secondary">
              {notifications.length} {filter === 'all' ? 'total' : filter} notification{notifications.length !== 1 ? 's' : ''}
              {unreadCount > 0 && filter !== 'unread' && (
                <span className="ml-2">• {unreadCount} unread</span>
              )}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm font-medium bg-[#00D9FF] text-black rounded-lg hover:bg-[#00D9FF]/90 transition-all duration-300"
            >
              Mark all as read
            </button>
          )}
        </div>
        
        {/* Filter Options */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              filter === 'unread'
                ? 'bg-[#00D9FF] text-black'
                : 'text-wp-text-secondary hover:text-white hover:bg-[#00D9FF]/20 bg-wp-dark-lighter/50'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              filter === 'read'
                ? 'bg-[#00D9FF] text-black'
                : 'text-wp-text-secondary hover:text-white hover:bg-[#00D9FF]/20 bg-wp-dark-lighter/50'
            }`}
          >
            Read
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              filter === 'all'
                ? 'bg-[#00D9FF] text-black'
                : 'text-wp-text-secondary hover:text-white hover:bg-[#00D9FF]/20 bg-wp-dark-lighter/50'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm text-wp-text-secondary">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-wp-text-secondary/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-lg font-medium text-wp-text-primary mb-2">No notifications</p>
            <p className="text-sm text-wp-text-secondary">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications." 
                : filter === 'read'
                ? "No read notifications yet."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`w-full px-6 py-4 text-left rounded-lg transition-all duration-200 hover:bg-[#00D9FF]/10 border ${
                !notification.read_date 
                  ? 'bg-[#00D9FF]/5 border-[#00D9FF]/30 hover:border-[#00D9FF]/50' 
                  : 'bg-wp-dark-lighter/30 border-wp-border/30 hover:border-wp-border/50'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Module Icon */}
                <div className={`shrink-0 mt-0.5 ${getModuleColor(notification.module)}`}>
                  {getModuleIcon(notification.module)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-wp-text-secondary uppercase tracking-wide">
                        {notification.module}
                      </p>
                      {!notification.read_date && (
                        <span className="h-2 w-2 bg-[#00D9FF] rounded-full"></span>
                      )}
                    </div>
                    <p className="text-xs text-wp-text-secondary shrink-0 ml-4">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-base text-wp-text-primary leading-relaxed">
                    {notification.text}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

