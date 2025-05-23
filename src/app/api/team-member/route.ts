import { NextResponse } from "next/server";
import { formatDate } from "@/utils/date";

// Cache duration in seconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60;

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check cache first
    const cachedData = cache.get(email);
    const now = Date.now();

    if (cachedData && now - cachedData.timestamp < CACHE_DURATION * 1000) {
      console.log("Serving from cache for:", email);
      return NextResponse.json(cachedData.data);
    }

    const notionUrl = new URL(
      `https://staffing.whiteprompt.com/notion-webhooks/team-member?q=${email}&includeAllocations=true`
    );

    const response = await fetch(notionUrl.toString(), {
      method: "GET",
      headers: {
        "x-api-key": `Yvw4eCTPWjUUqzy8`,
      },
      // Add cache control headers
      cache: "force-cache",
      next: {
        revalidate: CACHE_DURATION,
      },
    });

    if (!response.ok) {
      throw new Error(`Notion API responded with status: ${response.status}`);
    }

    const data = await response.json();

    const teamMember = {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: email,
      startDate: data.startDate,
      personalEmail: data.personalEmail,
      mobile: data.mobile,
      identificationType: data.identificationType,
      identificationNumber: data.identificationNumber,
      allocations: data.allocations.map((allocation: any) => ({
        project: allocation.project,
        startDate: formatDate(allocation.start),
        endDate: allocation.end ? formatDate(allocation.end) : "",
      })),
      accesses: (data?.accessTools || [])
        ?.filter(
          (access: any) =>
            !["Zoho Recruit", "Freshbooks"].includes(access.toolName)
        )
        .map((access: any) => access.toolName),
    };

    // Store in cache
    cache.set(email, {
      data: teamMember,
      timestamp: now,
    });

    // Add cache control headers to the response
    const responseHeaders = new Headers();
    responseHeaders.set(
      "Cache-Control",
      `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`
    );

    return NextResponse.json(teamMember, {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Error in team member API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
