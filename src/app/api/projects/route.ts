import { NextResponse } from "next/server";

export async function POST() {
  try {
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
          property: "*TeamMember",
          relation: {
            contains: "192424dd-83e1-81fd-b852-df29f7d71ad9",
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
