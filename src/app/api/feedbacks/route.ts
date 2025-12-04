import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { STAFFING_API_URL } from "@/lib/constants";

// Force dynamic rendering to prevent caching issues with authentication
export const dynamic = "force-dynamic";

// Helper function to parse context string into structured feedback
function parseContext(
  contextString: string,
  projectId: string,
  createdAt: string
) {
  const lines = contextString.split("\n").filter((line) => line.trim());

  let role = "";
  let responsibilities = "";
  let technologies: string[] = [];
  let overallSatisfaction = "neutral";

  lines.forEach((line) => {
    if (line.startsWith("Role:")) {
      role = line.replace("Role:", "").trim();
    } else if (line.startsWith("Responsibilities:")) {
      responsibilities = line.replace("Responsibilities:", "").trim();
    } else if (line.startsWith("Technologies:")) {
      const techString = line.replace("Technologies:", "").trim();
      technologies = techString.split(",").map((t) => t.trim());
    } else if (line.startsWith("Overall Satisfaction:")) {
      overallSatisfaction = line
        .replace("Overall Satisfaction:", "")
        .trim()
        .toLowerCase();
    }
  });

  return {
    role,
    responsibilities,
    technologies,
    overall_satisfaction: overallSatisfaction,
    project_id: projectId,
    created_at: createdAt,
  };
}

export async function GET() {
  const { error, email } = await getAuthenticatedUser();

  if (error) {
    return error;
  }

  try {
    const response = await fetch(
      `https://staffing.whiteprompt.com/shared-data/project-context?email=${encodeURIComponent(email)}`,
      {
        headers: {
          "x-api-key": process.env.STAFFING_TOOL_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      console.error(
        "Staffing API error:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: "Error fetching feedbacks from staffing API" },
        { status: response.status }
      );
    }

    const rawData = await response.json();

    // Transform the API response to match the expected frontend format
    const feedbacks = Array.isArray(rawData)
      ? rawData.map((item: any) => {
          const parsedData = parseContext(
            item.context || "",
            item.projectName || "Unknown Project",
            new Date(item.meetingDate).toISOString() || new Date().toISOString()
          );

          return {
            id: item.id,
            ...parsedData,
          };
        })
      : [];

    return NextResponse.json(feedbacks);
  } catch (fetchError) {
    console.error("Fetch error:", fetchError);
    return NextResponse.json(
      { error: "Error fetching feedbacks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { error, email } = await getAuthenticatedUser();

  if (error) {
    return error;
  }

  try {
    const body = await request.json();
    const {
      projectId,
      role,
      responsibilities,
      technologies,
      overallSatisfaction,
      comments,
    } = body;

    // Validate required fields
    if (
      !projectId ||
      !role ||
      !responsibilities ||
      !technologies ||
      !overallSatisfaction
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const context = `Role:${role}\nResponsibilities:${responsibilities}\nTechnologies:${technologies}\nOverall Satisfaction:${overallSatisfaction}\n${comments ? `Comments:${comments}` : ""}`;

    const response = await fetch(
      `${STAFFING_API_URL}/shared-data/project-context`,
      {
        method: "POST",
        body: JSON.stringify({
          context: context,
          projectName: projectId,
          trigger: "TM feedback",
          teamMemberEmail: email,
          createdAt: new Date().toISOString(),
        }),
        headers: {
          "x-api-key": process.env.STAFFING_TOOL_API_KEY || "",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Staffing API error: ${response.status}`);
    }
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid request body",
      },
      { status: 400 }
    );
  }
}
