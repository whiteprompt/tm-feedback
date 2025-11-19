'use client';

import { useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Notification } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { getModuleIcon, getModuleColor, getNotificationRoute } from '@/utils/notification-helpers';

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
    <div className="wp-card p-6 mb-8 wp-fade-in">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="inline-block h-6 w-6 border-2 border-wp-primary border-t-transparent rounded-full animate-spin" />
          <p className="ml-3 text-sm text-wp-text-secondary">Loading notifications...</p>
        </div>
      ) : unreadNotifications.length === 0 ? (
        <div className="text-center py-12">
          <svg 
            className="mx-auto h-16 w-16 text-wp-text-muted/50 mb-4" 
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
              <tr className="border-b border-wp-border">
                <th className="px-6 py-4 text-left wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                  Module
                </th>
                <th className="px-6 py-4 text-left wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                  Message
                </th>
                <th className="px-6 py-4 text-right wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {unreadNotifications.map((notification) => (
                <tr
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="border-b border-wp-border/50 hover:bg-wp-primary/10 cursor-pointer transition-colors"
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

