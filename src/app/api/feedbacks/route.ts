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
