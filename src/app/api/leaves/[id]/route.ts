import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { STAFFING_API_URL } from "@/lib/constants";

// Force dynamic rendering to prevent caching issues with authentication
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the authenticated user
    const { error } = await getAuthenticatedUser();
    if (error) {
      return error;
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Leave ID is required" },
        { status: 400 }
      );
    }

    // Make the request to the staffing service to delete the leave
    const response = await fetch(
      `${STAFFING_API_URL}/shared-data/leaves/${id}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "x-api-key": process.env.STAFFING_TOOL_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Staffing service responded with status: ${response.status}`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Leave deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting leave:", error);
    return NextResponse.json(
      { error: "Failed to delete leave" },
      { status: 500 }
    );
  }
}
