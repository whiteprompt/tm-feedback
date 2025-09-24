import { NextResponse } from "next/server";
import { teamMembersCache } from "@/lib/cache";
import { STAFFING_API_URL } from "@/lib/constants";
import { getAuthenticatedUser } from "@/lib/auth-utils";

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

export async function GET() {
  try {
    const { error, email } = await getAuthenticatedUser();

    // Debug logging for session isolation
    console.log(`[DEBUG] API request for email: ${email}`);

    if (error) {
      return error;
    }

    let teamMembers: TeamMember[] = [];

    const cachedData = await teamMembersCache.get<TeamMember[]>();
    if (cachedData) {
      console.log(`[Cache] Returning cached data for team members`);
      return NextResponse.json(cachedData);
    }

    const staffingUrl = new URL(
      `${STAFFING_API_URL}/notion-webhooks/team-members-main-info?status=active`
    );

    const response = await fetch(staffingUrl, {
      method: "GET",
      headers: {
        "x-api-key": process.env.STAFFING_TOOL_API_KEY || "",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Staffing API error: ${response.status} ${response.statusText}`
      );
    }

    const staffingData = (await response.json()) as TeamMember[];
    teamMembers = (staffingData || [])
      .map((member) => ({
        ...member,
        name: `${member.lastName} ${member.firstName}`,
      }))
      .filter((member) => member.status === "active");

    console.log(teamMembers[0]);

    // Sort by name for better UX
    // teamMembers.sort((a, b) => a.name.localeCompare(b.name));

    // Cache the result
    if (teamMembers.length) {
      await teamMembersCache.set(teamMembers);
    }

    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error("Team members API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        data: [],
        message: "Using current user as fallback",
      },
      { status: 500 }
    );
  }
}
