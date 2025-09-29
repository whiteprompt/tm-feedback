import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { STAFFING_API_URL } from "@/lib/constants";

export interface Holiday {
  id: string;
  name: string;
  date: string;
  country: string;
  type?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const { error, email } = await getAuthenticatedUser();
    if (error) {
      return error;
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country"); // Default to Dominican Republic
    const fromDate = searchParams.get("fromDate") || "2025-01-01";
    const endDate = searchParams.get("endDate") || "2026-01-01";

    if (!country) {
      return NextResponse.json(
        { error: "Country is required" },
        { status: 400 }
      );
    }

    const holidaysUrl = new URL(`${STAFFING_API_URL}/shared-data/holidays`);
    holidaysUrl.searchParams.set("fromDate", fromDate);
    holidaysUrl.searchParams.set("endDate", endDate);
    holidaysUrl.searchParams.set("country", country);

    const response = await fetch(holidaysUrl.toString(), {
      method: "GET",
      headers: {
        "x-api-key": process.env.STAFFING_TOOL_API_KEY || "",
      },
    });

    if (!response.ok) {
      throw new Error(`Holidays API responded with status: ${response.status}`);
    }

    const holidays: Holiday[] = await response.json();

    return NextResponse.json(holidays);
  } catch (error) {
    console.error("Holidays API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch holidays data" },
      { status: 500 }
    );
  }
}
