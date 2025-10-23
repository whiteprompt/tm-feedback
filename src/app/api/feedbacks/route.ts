import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/auth-utils";

// Force dynamic rendering to prevent caching issues with authentication
export const dynamic = "force-dynamic";

export async function GET() {
  const { error, email } = await getAuthenticatedUser();

  if (error) {
    return error;
  }

  const { data: feedbacks, error: dbError } = await supabase
    .from("team_member_feedback")
    .select("*")
    .eq("user_email", email)
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json(
      { error: "Error fetching feedbacks" },
      { status: 500 }
    );
  }

  return NextResponse.json(feedbacks);
}

export async function POST(request: Request) {
  const { error, email } = await getAuthenticatedUser();

  if (error) {
    return error;
  }

  try {
    const body = await request.json();
    const {
      projectId,
      role,
      responsibilities,
      technologies,
      overallSatisfaction,
      projectIssue,
    } = body;

    // Validate required fields
    if (
      !projectId ||
      !role ||
      !responsibilities ||
      !technologies ||
      !overallSatisfaction
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error: dbError } = await supabase
      .from("team_member_feedback")
      .insert([
        {
          user_email: email,
          project_id: projectId,
          role: role,
          responsibilities: responsibilities,
          technologies: technologies,
          overall_satisfaction: overallSatisfaction,
          project_issue: projectIssue || "",
        },
      ])
      .select();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Error creating feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
