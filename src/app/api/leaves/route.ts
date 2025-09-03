import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";

interface Leave {
  id: string;
  start_date: string;
  end_date: string;
  type: string;
  status: string;
  days: number;
  comments?: string;
}

let REDMINE_TOKEN = "";

const getToken = async () => {
  try {
    const response = await fetch(
      `https://api-redmine.whiteprompt.com/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: process.env.REDMINE_USERNAME,
          password: process.env.REDMINE_PASSWORD,
        }),
      }
    );

    if (!response.ok) {
      console.error("Error fetching token:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.results.token;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
};

export async function GET() {
  return await fetchLeaves(false);
}

async function fetchLeaves(isRetry: boolean = false) {
  try {
    const { error, email } = await getAuthenticatedUser();

    if (!REDMINE_TOKEN) {
      REDMINE_TOKEN = await getToken();
    }

    if (error) {
      return error;
    }

    // Fixed date range as requested: 2025-01-01 to 2026-01-01
    const startDate = "20250101";
    const endDate = "20260101";

    const redmineApiUrl = `https://api-redmine.whiteprompt.com/leaves?start=${startDate}&end=${endDate}&email=${encodeURIComponent(email)}`;

    const response = await fetch(redmineApiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${REDMINE_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error(
        "Redmine API response not ok:",
        response.status,
        response.statusText
      );
      if (response.status === 401 && !isRetry) {
        console.log("Refreshing token and retrying...");
        REDMINE_TOKEN = await getToken();
        return await fetchLeaves(true);
      }
      return NextResponse.json(
        { error: "Failed to fetch leaves from Redmine API" },
        { status: response.status }
      );
    }

    const leavesData = await response.json();

    // Transform the data if needed to match our interface
    const transformedLeaves: Leave[] = Array.isArray(leavesData.results)
      ? leavesData.results
          ?.filter((leave: any) => leave.email === email)
          ?.map((leave: any) => ({
            id: leave.id || String(Math.random()),
            start_date: leave.start_date || leave.startDate,
            end_date: leave.end_date || leave.endDate,
            type: leave.categoryName || "Unknown",
            status: leave.status_id === 5 ? "Done" : "Pending",
            days: leave.days || leave.duration || 1,
            comments: leave.comments || leave.description || "",
          }))
      : [];

    return NextResponse.json(transformedLeaves);
  } catch (error) {
    console.error("Error fetching leaves:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching leaves" },
      { status: 500 }
    );
  }
}
