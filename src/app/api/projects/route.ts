import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // If no email is provided, return an empty result
    if (!email) {
      return NextResponse.json({ results: [] });
    }

    const notionUrl = new URL(
      `https://staffing.whiteprompt.com/notion-webhooks/projects?q=${email}`
    );

    const response = await fetch(notionUrl.toString(), {
      method: "GET",
      headers: {
        "x-api-key": `Yvw4eCTPWjUUqzy8`,
      },
    });

    if (!response.ok) {
      throw new Error(`Notion API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in projects API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
