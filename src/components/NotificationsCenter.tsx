'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Notification } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { getModuleIcon, getModuleColor, getNotificationRoute } from '@/lib/notifications/notification-helpers';

export default function NotificationsCenter() {
  const router = useRouter();
  const { notifications, markAsRead, loading, error, filter, setFilter, unreadCount } = useNotifications();

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.read_date) {
      await markAsRead(notification.id);
    }

    router.push(getNotificationRoute(notification.module));
  };

  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(n => !n.read_date);
    await Promise.all(unreadNotifications.map(n => markAsRead(n.id)));
  }, [notifications, markAsRead]);

  return (
    <div className="wp-card p-6">
      {/* Header with Filters */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="wp-heading-3 mb-1">All Notifications</h2>
            <p className="text-wp-text-secondary text-sm">
              {notifications.length} {filter === 'all' ? 'total' : filter} notification{notifications.length !== 1 ? 's' : ''}
              {unreadCount > 0 && filter !== 'unread' && (
                <span className="ml-2">• {unreadCount} unread</span>
              )}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className={`
                rounded-lg bg-[#00D9FF] px-4 py-2 text-sm font-medium text-black
                transition-all duration-300
                hover:bg-[#00D9FF]/90
              `}
            >
              Mark all as read
            </button>
          )}
        </div>
        
        {/* Filter Options */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('unread')}
            className={`
              rounded-lg px-4 py-2 text-sm font-medium transition-colors
              duration-200
              ${
              filter === 'unread'
                ? 'bg-[#00D9FF] text-black'
                : `
                  text-wp-text-secondary bg-wp-dark-lighter/50
                  hover:bg-[#00D9FF]/20 hover:text-white
                `
            }
            `}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`
              rounded-lg px-4 py-2 text-sm font-medium transition-colors
              duration-200
              ${
              filter === 'read'
                ? 'bg-[#00D9FF] text-black'
                : `
                  text-wp-text-secondary bg-wp-dark-lighter/50
                  hover:bg-[#00D9FF]/20 hover:text-white
                `
            }
            `}
          >
            Read
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`
              rounded-lg px-4 py-2 text-sm font-medium transition-colors
              duration-200
              ${
              filter === 'all'
                ? 'bg-[#00D9FF] text-black'
                : `
                  text-wp-text-secondary bg-wp-dark-lighter/50
                  hover:bg-[#00D9FF]/20 hover:text-white
                `
            }
            `}
          >
            All
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {loading ? (
          <div className="p-8 text-center">
            <div className={`
              inline-block h-8 w-8 animate-spin rounded-full border-2
              border-[#00D9FF] border-t-transparent
            `} />
            <p className="text-wp-text-secondary mt-4 text-sm">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="text-wp-text-secondary/50 mx-auto mb-4 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-wp-text-primary mb-2 text-lg font-medium">No notifications</p>
            <p className="text-wp-text-secondary text-sm">
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
              className={`
                w-full rounded-lg border px-6 py-4 text-left transition-all
                duration-200
                hover:bg-[#00D9FF]/10
                ${
                !notification.read_date 
                  ? `
                    border-[#00D9FF]/30 bg-[#00D9FF]/5
                    hover:border-[#00D9FF]/50
                  ` 
                  : `
                    bg-wp-dark-lighter/30 border-wp-border/30
                    hover:border-wp-border/50
                  `
              }
              `}
            >
              <div className="flex items-start gap-4">
                {/* Module Icon */}
                <div className={`
                  mt-0.5 shrink-0
                  ${getModuleColor(notification.module)}
                `}>
                  {getModuleIcon(notification.module)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className={`
                        text-wp-text-secondary text-xs font-semibold
                        tracking-wide uppercase
                      `}>
                        {notification.module}
                      </p>
                      {!notification.read_date && (
                        <span className="h-2 w-2 rounded-full bg-[#00D9FF]"></span>
                      )}
                    </div>
                    <p className="text-wp-text-secondary ml-4 shrink-0 text-xs">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-wp-text-primary text-base leading-relaxed">
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

