export enum LeaveType {
  AnnualLeave = "Annual leave",
  UnpaidLeave = "Unpaid leave",
  IllnessLeave = "Illness leave",
  PTOLeave = "PTO leave",
  MarriageLeave = "Marriage leave",
  StudyLeave = "Study leave",
  MaternityLeave = "Maternity leave",
  FamilyDeathLeave = "Family death leave",
}

export enum NotificationModule {
  Leaves = "Leaves",
  ExpenseRefunds = "Expense Refunds",
  MyProjects = "My Projects",
  MyProfile = "My Profile",
  Presentations = "Presentations",
  Home = "Home",
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

export interface Leave {
  notionId: string;
  fromDate: string;
  toDate: string;
  type: string;
  status: string;
  days: number;
  comments?: string;
  certificate?: string;
  totalDays: number;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  country: string;
  type?: string;
  description?: string;
  wpHoliday?: boolean;
}
