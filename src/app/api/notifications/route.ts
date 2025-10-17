import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import {
  CreateNotificationRequest,
  MarkNotificationReadRequest,
} from "@/lib/types";

// GET /api/notifications - Get notifications for the authenticated user with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { error: authError, email } = await getAuthenticatedUser();

    if (authError) {
      return authError;
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // 'all', 'read', 'unread'

    let query = supabase.from("notifications").select("*").eq("email", email);

    // Apply filtering based on query parameter
    if (filter === "read") {
      query = query.not("read_date", "is", null);
    } else if (filter === "unread") {
      query = query.is("read_date", null);
    }
    // If filter is 'all' or not specified, show all notifications

    const { data: notifications, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      );
    }

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Unexpected error in GET /api/notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const { error: authError } = await getAuthenticatedUser();

    if (authError) {
      return authError;
    }

    const body: CreateNotificationRequest = await request.json();
    const { email, text, entity_id, module } = body;

    if (!email || !text || !module) {
      return NextResponse.json(
        { error: "Missing required fields: email, text, module" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Mark a notification as read
export async function PUT(request: NextRequest) {
  try {
    const { error: authError, email } = await getAuthenticatedUser();

    if (authError) {
      return authError;
    }

    const body: MarkNotificationReadRequest = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing notification ID" },
        { status: 400 }
      );
    }

    // First verify the notification belongs to the authenticated user
    const { data: existingNotification, error: fetchError } = await supabase
      .from("notifications")
      .select("id, email")
      .eq("id", id)
      .eq("email", email)
      .single();

    if (fetchError || !existingNotification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    // Mark as read
    const { data: notification, error } = await supabase
      .from("notifications")
      .update({ read_date: new Date().toISOString() })
      .eq("id", id)
      .eq("email", email)
      .select()
      .single();

    if (error) {
      console.error("Error marking notification as read:", error);
      return NextResponse.json(
        { error: "Failed to mark notification as read" },
        { status: 500 }
      );
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error("Unexpected error in PUT /api/notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
