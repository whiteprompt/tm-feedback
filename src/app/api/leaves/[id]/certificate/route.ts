import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { STAFFING_API_URL } from "@/lib/constants";

// Force dynamic rendering to prevent caching issues with authentication
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
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

    const formData = await request.formData();
    const certificateFile = formData.get("certificate") as File;

    if (!certificateFile || certificateFile.size === 0) {
      return NextResponse.json(
        { error: "Certificate file is required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!allowedTypes.includes(certificateFile.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and PDF are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (certificateFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Prepare form data for the staffing service
    const uploadFormData = new FormData();
    uploadFormData.append("cerfiticate_file", certificateFile);

    // Make the request to the staffing service to update the certificate
    const response = await fetch(
      `${STAFFING_API_URL}/notion-webhooks/leaves/${id}/certificate`,
      {
        method: "PATCH",
        body: uploadFormData,
        headers: {
          "x-api-key": process.env.STAFFING_TOOL_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Staffing service responded with status: ${response.status}`
      );
    }

    const dataResponse = await response.json();

    return NextResponse.json(dataResponse);
  } catch (error) {
    console.error("Error uploading certificate:", error);
    return NextResponse.json(
      { error: "Failed to upload certificate" },
      { status: 500 }
    );
  }
}
