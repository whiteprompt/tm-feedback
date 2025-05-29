import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const email = session.user.email;

    const { projectId } = await request.json();

    if (!email || !projectId) {
      return NextResponse.json(
        { error: "Email and project ID are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("team_member_feedback")
      .select("role, technologies")
      .eq("user_email", email)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error?.code === "PGRST116") {
      return NextResponse.json({ role: "", technologies: [] });
    }

    if (error) {
      console.error("Error fetching last feedback:", error);
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
