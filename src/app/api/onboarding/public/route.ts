import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth-utils";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST /api/onboarding/public
// Enrolls a user email into the onboarding flow by inserting a row
// into onboarding_progress. Idempotent — calling it again for an
// already-enrolled email is a no-op (returns the existing row).
//
// Request body: { email: string }
//
// Auth: admin only or CRON_SECRET API key.
export async function POST(request: NextRequest) {
  try {
    // Support two auth modes:
    // 1. Admin session cookie (browser / internal tooling)
    // 2. Secret API key header (machine-to-machine / automation scripts)
    const apiKey = request.headers.get("x-api-key");
    const expectedKey = process.env.CRON_SECRET;

    const isApiKeyAuth = expectedKey && apiKey === expectedKey;

    if (!isApiKeyAuth) {
      // Fall back to session-based admin check
      const { error } = await getAuthenticatedAdmin();
      if (error) return error;
    }

    // Parse body
    const body = await request.json().catch(() => null);
    const email: string | undefined = body?.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    // Upsert — insert if not exists, do nothing if already enrolled.
    // This makes the endpoint safe to call multiple times.
    const { data, error: upsertError } = await supabase
      .from("onboarding_progress")
      .upsert(
        { user_email: email },
        { onConflict: "user_email", ignoreDuplicates: true }
      )
      .select()
      .maybeSingle();

    if (upsertError) {
      console.error("Error enrolling user in onboarding:", upsertError);
      return NextResponse.json(
        { error: "Failed to enroll user" },
        { status: 500 }
      );
    }

    // If data is null it means the row already existed (ignoreDuplicates)
    // Fetch the existing row so we always return the current state
    const { data: existing } = await supabase
      .from("onboarding_progress")
      .select("*")
      .eq("user_email", email)
      .single();

    return NextResponse.json(
      {
        success: true,
        enrolled: !data, // false = already existed, true = newly created
        data: existing,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Unexpected error in POST /api/onboarding/public:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/onboarding/public - Get API documentation
export async function GET() {
  return NextResponse.json({
    message: "Onboarding Public API",
    version: "1.0.0",
    endpoints: {
      "POST /api/onboarding/public": {
        description: "Enroll a new user into the onboarding flow",
        authentication: "x-api-key header or Admin session",
        headers: {
          "x-api-key": "YOUR_CRON_SECRET",
          "Content-Type": "application/json",
        },
        body: {
          email: "string (required) - User email address",
        },
        example: {
          email: "newperson@whiteprompt.com",
        },
      },
    },
  });
}
