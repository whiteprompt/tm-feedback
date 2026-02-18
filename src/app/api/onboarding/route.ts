import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const VALID_STEPS = ["step_redmine", "step_slack", "step_gmail_2fa", "step_metodos_cobro"] as const;
type OnboardingStep = typeof VALID_STEPS[number];

// GET /api/onboarding
// Returns the onboarding progress for the authenticated user.
// Creates a new row if one doesn't exist yet.
export async function GET() {
  try {
    const { error, email } = await getAuthenticatedUser();
    if (error) return error;

    // Try to fetch existing row
    const { data: existing, error: fetchError } = await supabase
      .from("onboarding_progress")
      .select("*")
      .eq("user_email", email!)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching onboarding progress:", fetchError);
      return NextResponse.json({ error: "Failed to fetch onboarding progress" }, { status: 500 });
    }

    // No record — this user doesn't need onboarding
    if (!existing) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(existing);
  } catch (err) {
    console.error("Unexpected error in GET /api/onboarding:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/onboarding
// Updates a single step for the authenticated user.
// Body: { step: OnboardingStep, value: boolean }
export async function PATCH(request: NextRequest) {
  try {
    const { error, email } = await getAuthenticatedUser();
    if (error) return error;

    const body = await request.json();
    const { step, value } = body as { step: OnboardingStep; value: boolean };

    if (!VALID_STEPS.includes(step)) {
      return NextResponse.json({ error: "Invalid step name" }, { status: 400 });
    }

    if (typeof value !== "boolean") {
      return NextResponse.json({ error: "Value must be a boolean" }, { status: 400 });
    }

    // Update the specific step column
    const { data: updated, error: updateError } = await supabase
      .from("onboarding_progress")
      .update({ [step]: value, updated_at: new Date().toISOString() })
      .eq("user_email", email!)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating onboarding step:", updateError);
      return NextResponse.json({ error: "Failed to update onboarding step" }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Unexpected error in PATCH /api/onboarding:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
