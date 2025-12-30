import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { STAFFING_API_URL } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { error } = await getAuthenticatedUser();

    if (error) {
      return error;
    }

    const { searchParams } = new URL(request.url);
    const teamMemberId = searchParams.get("teamMemberId");

    if (!teamMemberId) {
      return NextResponse.json(
        { error: "Team member ID is required" },
        { status: 400 }
      );
    }

    const resumeUrl = `${STAFFING_API_URL}/shared-data/team-member-resumes/${teamMemberId}`;

    const response = await fetch(resumeUrl, {
      method: "GET",
      headers: {
        "x-api-key": process.env.STAFFING_TOOL_API_KEY || "",
      },
    });

    if (!response.ok) {
      throw new Error(`Resume API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Extract the first resume's content
    if (Array.isArray(data) && data.length > 0 && data[0].content) {
      return NextResponse.json({ content: data[0].content });
    } else {
      return NextResponse.json(
        { error: "Resume content not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error(`Error in resume API:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
