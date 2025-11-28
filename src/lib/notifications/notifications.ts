// Utility function to create test notifications
// This can be used in your existing modules to create notifications

import { NotificationModule } from "@/lib/types";

export interface CreateNotificationParams {
  email: string;
  text: string;
  module: NotificationModule;
  entity_id?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error("Failed to create notification");
    }

    const data = await response.json();
    return data.notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

// Example usage in your existing modules:
//
// For Leaves module:
// await createNotification({
//   email: 'user@example.com',
//   text: 'Your leave request has been approved',
//   module: NotificationModule.Leaves,
//   entity_id: 'leave-123'
// });
//
// For Expense Refunds module:
// await createNotification({
//   email: 'user@example.com',
//   text: 'Your expense refund has been processed',
//   module: NotificationModule.ExpenseRefunds,
//   entity_id: 'expense-456'
// });
//
// For general notifications without redirection:
// await createNotification({
//   email: 'user@example.com',
//   text: 'Welcome to the team!',
//   module: NotificationModule.Company
// });
