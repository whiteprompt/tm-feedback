'use client';

import { useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Notification } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { getModuleIcon, getModuleColor, getNotificationRoute } from '@/lib/notifications/notification-helpers';

export default function UnreadNotificationsTable() {
  const { notifications, markAsRead, loading } = useNotifications();
  const router = useRouter();

  // Filter unread notifications and limit to latest 5
  const unreadNotifications = notifications
    .filter(notification => !notification.read_date)
    .slice(0, 5);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.read_date) {
      await markAsRead(notification.id);
    }

    router.push(getNotificationRoute(notification.module));
  };

  return (
    <div className="wp-card wp-fade-in p-6">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className={`
            border-wp-primary inline-block h-6 w-6 animate-spin rounded-full
            border-2 border-t-transparent
          `} />
          <p className="text-wp-text-secondary ml-3 text-sm">Loading notifications...</p>
        </div>
      ) : unreadNotifications.length === 0 ? (
        <div className="py-12 text-center">
          <svg 
            className="text-wp-text-muted/50 mx-auto mb-4 h-16 w-16" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <p className="wp-body text-wp-text-secondary">
            All caught up! You have no unread notifications.
          </p>
          <p className="wp-body-small text-wp-text-muted mt-2">
            New notifications will appear here when available.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-wp-border border-b">
                <th className={`
                  wp-body-small text-wp-text-muted px-6 py-4 text-left
                  font-semibold tracking-wider uppercase
                `}>
                  Module
                </th>
                <th className={`
                  wp-body-small text-wp-text-muted px-6 py-4 text-left
                  font-semibold tracking-wider uppercase
                `}>
                  Message
                </th>
                <th className={`
                  wp-body-small text-wp-text-muted px-6 py-4 text-right
                  font-semibold tracking-wider uppercase
                `}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {unreadNotifications.map((notification) => (
                <tr
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    border-wp-border/50 cursor-pointer border-b
                    transition-colors
                    hover:bg-wp-primary/10
                  `}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className={getModuleColor(notification.module)}>
                        {getModuleIcon(notification.module)}
                      </div>
                      <span className="wp-body text-wp-text-primary font-medium">
                        {notification.module}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="wp-body text-wp-text-primary">
                      {notification.text}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="wp-body-small text-wp-text-muted">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

