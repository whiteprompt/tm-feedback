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

interface RedmineLeave {
  id: string;
  email: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  categoryName?: string;
  type?: string;
  leave_type?: string;
  status_id?: number;
  status?: string;
  days?: number;
  duration?: number;
  comments?: string;
  description?: string;
}

let REDMINE_TOKEN = "";

// Function to calculate days between two dates (inclusive)
const calculateDaysBetween = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) {
    return 1; // Default fallback
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 1; // Default fallback for invalid dates
    }

    // Calculate difference in milliseconds and convert to days
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days

    return diffDays > 0 ? diffDays : 1; // Ensure positive result
  } catch (error) {
    console.error("Error calculating days between dates:", error);
    return 1; // Default fallback
  }
};

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
          ?.filter((leave: RedmineLeave) => leave.email === email)
          ?.map((leave: RedmineLeave) => ({
            id: leave.id,
            start_date: leave.startDate || "",
            end_date: leave.endDate || "",
            type: leave.categoryName || "Unknown",
            status: leave.status_id === 5 ? "Done" : "Pending",
            days:
              calculateDaysBetween(
                leave.startDate || "",
                leave.endDate || ""
              ) ||
              leave.days ||
              leave.duration ||
              1,
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
