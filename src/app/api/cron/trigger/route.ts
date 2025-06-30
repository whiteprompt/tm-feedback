import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth-utils";

// Force dynamic rendering to prevent caching issues with authentication
export const dynamic = "force-dynamic";

export async function POST() {
  const { error } = await getAuthenticatedAdmin();

  if (error) {
    return error;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/cron/sync-notion`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to trigger cron job");
    }

    return NextResponse.json({ message: "Cron job triggered successfully" });
  } catch (error) {
    console.error("Error triggering cron job:", error);
    return NextResponse.json(
      { error: "Failed to trigger cron job" },
      { status: 500 }
    );
  }
}
