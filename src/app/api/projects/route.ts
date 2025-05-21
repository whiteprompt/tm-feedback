import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const notionUrl =
      "https://api.notion.com/v1/databases/69b53c12-3398-497b-ba9d-af0a494064ed/query";

    const response = await fetch(notionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        filter: {
          property: "*TeamMembersDB (email)",
          rollup: {
            any: {
              property: "email",
              rich_text: {
                contains: email,
              },
            },
          },
        },
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from Notion:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
