import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge"; // This is important for Vercel cron jobs

export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all feedback entries without notion_id
    const { data: feedbacks, error } = await supabase
      .from("team_member_feedback")
      .select("*")
      .is("notion_id", null)
      .limit(10); // TODO: Remove this limit

    if (error) throw error;

    // Process each feedback
    for (const feedback of feedbacks) {
      try {
        const context = `Role:${feedback.role}\nResponsibilities:${feedback.responsibilities}\nTechnologies:${feedback.technologies}\nOverall Satisfaction:${feedback.overall_satisfaction}\n${feedback.comments ? `Comments:${feedback.comments}` : ""}`;

        const response = await fetch(
          "https://staffing.whiteprompt.com/notion-webhooks/project-context",
          {
            method: "POST",
            body: JSON.stringify({
              context: context,
              projectName: feedback.project_id,
              trigger: "TM feedback",
              teamMemberEmail: feedback.user_email,
              createdAt: feedback.created_at,
            }),
            headers: {
              "x-api-key": process.env.STAFFING_TOOL_API_KEY || "",
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(`Error processing feedback ${feedback.id}:`, feedback);
          continue;
        }

        // Update the feedback with the Notion page ID
        const { error: updateError } = await supabase
          .from("team_member_feedback")
          .update({ notion_id: data.id })
          .eq("id", feedback.id);

        if (updateError) throw updateError;
      } catch (error) {
        console.error(`Error processing feedback ${feedback.id}:`, error);
        // Continue with next feedback even if one fails
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      processed: feedbacks.length,
    });
  } catch (error) {
    console.error("Error in sync-notion cron:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
