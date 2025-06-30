import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/auth-utils";

// Force dynamic rendering to prevent caching issues with authentication
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { error, email } = await getAuthenticatedUser();

    if (error) {
      return error;
    }

    const { projectId } = await request.json();

    if (!email || !projectId) {
      return NextResponse.json(
        { error: "Email and project ID are required" },
        { status: 400 }
      );
    }

    const { data, error: dbError } = await supabase
      .from("team_member_feedback")
      .select("role, technologies")
      .eq("user_email", email)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (dbError?.code === "PGRST116") {
      return NextResponse.json({ role: "", technologies: [] });
    }

    if (dbError) {
      console.error("Error fetching last feedback:", dbError);
      return NextResponse.json(
        { error: "Failed to fetch last feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || { role: "", technologies: [] });
  } catch (error) {
    console.error("Error in last-feedback route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
