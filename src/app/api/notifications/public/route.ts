import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { CreateNotificationRequest, NotificationModule } from "@/lib/types";

// POST /api/notifications/public - Create a notification from external applications
export async function POST(request: NextRequest) {
  try {
    // Verify API key for external access
    const apiKey = process.env.CRON_SECRET;

    if (!apiKey) {
      console.error("CRON_SECRET environment variable not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const body: CreateNotificationRequest = await request.json();
    const { email, text, entity_id, module } = body;

    // Validate required fields
    if (!email || !text || !module) {
      return NextResponse.json(
        { error: "Missing required fields: email, text, module" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate module
    const validModules = Object.values(NotificationModule);
    if (!validModules.includes(module)) {
      return NextResponse.json(
        {
          error: "Invalid module",
          validModules: validModules,
        },
        { status: 400 }
      );
    }

    // Create the notification
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        email,
        text,
        entity_id: entity_id || null,
        module,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        notification,
        message: "Notification created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error in POST /api/notifications/public:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/notifications/public - Get API documentation
export async function GET() {
  return NextResponse.json({
    message: "Notifications Public API",
    version: "1.0.0",
    endpoints: {
      "POST /api/notifications/public": {
        description: "Create a new notification",
        authentication: "Bearer token (API key)",
        headers: {
          Authorization: "Bearer YOUR_API_KEY",
          "Content-Type": "application/json",
        },
        body: {
          email: "string (required) - User email address",
          text: "string (required) - Notification message",
          entity_id: "string (optional) - ID for redirection",
          module: "string (required) - Module name",
        },
        example: {
          email: "user@example.com",
          text: "Your leave request has been approved",
          entity_id: "leave-123",
          module: "Leaves",
        },
        validModules: Object.values(NotificationModule),
      },
    },
  });
}
