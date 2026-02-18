import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST /api/onboarding/complete
// Verifies all 3 steps are true, then sets completed_at = now().
export async function POST() {
  try {
    const { error, email } = await getAuthenticatedUser();
    if (error) return error;

    // Fetch current state to verify all steps are done
    const { data: current, error: fetchError } = await supabase
      .from("onboarding_progress")
      .select("step_redmine, step_slack, step_gmail_2fa, step_metodos_cobro, completed_at")
      .eq("user_email", email!)
      .maybeSingle();

    if (fetchError || !current) {
      console.error("Error fetching onboarding progress for completion:", fetchError);
      return NextResponse.json({ error: "Onboarding record not found" }, { status: 404 });
    }

    if (current.completed_at) {
      // Already completed — idempotent response
      return NextResponse.json({ success: true, alreadyCompleted: true });
    }

    const allStepsDone =
      current.step_redmine &&
      current.step_slack &&
      current.step_gmail_2fa &&
      current.step_metodos_cobro;

    if (!allStepsDone) {
      return NextResponse.json(
        { error: "Not all onboarding steps are completed" },
        { status: 400 }
      );
    }

    // Mark as complete
    const { data: completed, error: updateError } = await supabase
      .from("onboarding_progress")
      .update({
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_email", email!)
      .select()
      .single();

    if (updateError) {
      console.error("Error completing onboarding:", updateError);
      return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: completed });
  } catch (err) {
    console.error("Unexpected error in POST /api/onboarding/complete:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
