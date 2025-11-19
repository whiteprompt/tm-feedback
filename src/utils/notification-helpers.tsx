import { NotificationModule } from '@/lib/types';

export const getModuleIcon = (module: NotificationModule) => {
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
    case NotificationModule.Presentations:
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

export const getModuleColor = (module: NotificationModule) => {
  switch (module) {
    case NotificationModule.Leaves:
      return 'text-green-500';
    case NotificationModule.ExpenseRefunds:
      return 'text-blue-500';
    case NotificationModule.MyProjects:
    case NotificationModule.Presentations:
      return 'text-purple-500';
    case NotificationModule.MyProfile:
      return 'text-orange-500';
    default:
      return 'text-[#00D9FF]';
  }
};

export const getNotificationRoute = (module: NotificationModule) => {
  switch (module) {
    case NotificationModule.Leaves:
      return '/leaves';
    case NotificationModule.ExpenseRefunds:
      return '/expense-refunds';
    case NotificationModule.MyProjects:
    case NotificationModule.Presentations:
      return '/my-projects';
    case NotificationModule.MyProfile:
      return '/my-profile';
    default:
      return '/';
  }
};
