'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Notification } from '@/lib/types';

type NotificationFilter = 'all' | 'read' | 'unread';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
  markAsRead: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

interface NotificationsProviderProps {
  children: ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const { data: session } = useSession();
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<NotificationFilter>('unread');

  // Calculate unread count from all notifications
  const unreadCount = allNotifications.filter(notification => !notification.read_date).length;

  // Filter notifications based on current filter
  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case 'read':
        return allNotifications.filter(notification => notification.read_date);
      case 'unread':
        return allNotifications.filter(notification => !notification.read_date);
      case 'all':
      default:
        return allNotifications;
    }
  }, [allNotifications, filter]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.email) {
      setAllNotifications([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/notifications');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setAllNotifications(data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setAllNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read_date: new Date().toISOString() }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, []);

  // Refresh notifications manually
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Initial fetch and polling setup
  useEffect(() => {
    if (session?.user?.email) {
      // Initial fetch
      fetchNotifications();
      
      // Set up polling every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      
      return () => clearInterval(interval);
    } else {
      // Clear notifications when user is not authenticated
      setAllNotifications([]);
      setError(null);
    }
  }, [session?.user?.email, fetchNotifications]);

  const value: NotificationsContextType = {
    notifications: filteredNotifications,
    unreadCount,
    loading,
    error,
    filter,
    setFilter,
    markAsRead,
    refreshNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
