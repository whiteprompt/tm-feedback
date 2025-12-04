import { getAuthenticatedUser } from "@/lib/auth-utils";
import { NextResponse } from "next/server";
import { STAFFING_API_URL } from "@/lib/constants";

// Force dynamic rendering to prevent caching issues with authentication
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get the authenticated user
    const { error, email } = await getAuthenticatedUser();
    if (error) {
      return error;
    }

    // Make the request to the staffing service
    const response = await fetch(
      `${STAFFING_API_URL}/shared-data/presentations?email=${email}`,
      {
        headers: {
          Accept: "application/json",
          "x-api-key": process.env.STAFFING_TOOL_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Staffing service responded with status: ${response.status}`
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching bench allocation:", error);
    return NextResponse.json(
      { error: "Failed to fetch bench allocation data" },
      { status: 500 }
    );
  }
}
