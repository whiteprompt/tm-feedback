import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ALLOWED_ADMIN_EMAILS = ["mariano.selvaggi@whiteprompt.com"];

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!ALLOWED_ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("mariano");
  console.log(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/sync-notion`);

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
