'use client';

import { useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Notification, NotificationModule } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

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

    switch (notification.module) {
      case NotificationModule.Leaves:
        router.push(`/leaves`);
        break;
      case NotificationModule.ExpenseRefunds:
        router.push(`/expense-refunds`);
        break;
      case NotificationModule.MyProjects:
      case NotificationModule.Presentations:
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
        return 'text-wp-primary';
    }
  };

  return (
    <div className="wp-card p-6 mb-8 wp-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-wp-primary/10 rounded-lg">
            <svg className="w-6 h-6 text-wp-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h2 className="wp-heading-2 text-wp-text-primary">Latest Unread Notifications</h2>
            <p className="wp-body-small text-wp-text-muted">
              {unreadNotifications.length > 0 
                ? 'Click on a notification to view details'
                : 'You\'re all caught up! No unread notifications at the moment.'}
            </p>
          </div>
        </div>
      </div>

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

