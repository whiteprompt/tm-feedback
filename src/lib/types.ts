export enum LeaveType {
  AnnualLeave = "Annual leave",
  UnpaidLeave = "Unpaid leave",
  IllnessLeave = "Illness leave",
  PTOLeave = "PTO leave",
}

export enum NotificationModule {
  Leaves = "Leaves",
  ExpenseRefunds = "Expense Refunds",
  Feedbacks = "Feedbacks",
  Presentations = "Presentations",
  Company = "Company",
}

export interface Notification {
  id: string;
  email: string;
  text: string;
  read_date: string | null;
  entity_id: string | null;
  module: NotificationModule;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationRequest {
  email: string;
  text: string;
  entity_id?: string;
  module: NotificationModule;
}

export interface MarkNotificationReadRequest {
  id: string;
}
