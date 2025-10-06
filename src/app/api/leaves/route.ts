import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { STAFFING_API_URL } from "@/lib/constants";
import { LeaveType } from "@/lib/types";

// Force dynamic rendering to prevent caching issues with authentication
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get the authenticated user
    const { error, email } = await getAuthenticatedUser();
    if (error) {
      return error;
    }

    // Make the request to the staffing service
    const response = await fetch(
      `${STAFFING_API_URL}/notion-webhooks/leaves?email=${email}`,
      {
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

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching leaves:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const { error, email: authEmail } = await getAuthenticatedUser();
    if (error) {
      return error;
    }

    const formData = await request.formData();

    const email = (formData.get("userEmail") as string) || authEmail;
    const fromDate = formData.get("fromDate") as string;
    const toDate = formData.get("toDate") as string;
    const type = formData.get("type") as string;
    const comments = formData.get("comments") as string;
    const certificateFile = formData.get("certificate") as File;

    // Validation
    if (!fromDate || !toDate || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate dates
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);

    if (fromDateObj >= toDateObj) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Validate leave type
    const validLeaveTypes = Object.values(LeaveType);
    if (!validLeaveTypes.includes(type as LeaveType)) {
      return NextResponse.json(
        { error: "Invalid leave type" },
        { status: 400 }
      );
    }

    // Handle file upload if certificate is provided
    if (certificateFile && certificateFile.size > 0) {
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
    }

    // Prepare form data for the staffing service
    const leaveFormData = new FormData();
    leaveFormData.append("teamMemberEmail", email);
    leaveFormData.append("fromDate", fromDate);
    leaveFormData.append("toDate", toDate);
    leaveFormData.append("type", type);
    leaveFormData.append("comments", comments || "Created by TM portal");

    // Add certificate file if provided
    if (certificateFile && certificateFile.size > 0) {
      leaveFormData.append("cerfiticate_file", certificateFile);
    }

    console.log(leaveFormData);

    // Make the request to the staffing service
    const response = await fetch(`${STAFFING_API_URL}/notion-webhooks/leaves`, {
      method: "POST",
      body: leaveFormData,
      headers: {
        "x-api-key": process.env.STAFFING_TOOL_API_KEY || "",
      },
    });

    if (!response.ok) {
      console.log(response);
      throw new Error(
        `Staffing service responded with status: ${response.status}`
      );
    }

    const dataResponse = await response.json();

    return NextResponse.json(dataResponse, { status: 201 });
  } catch (error) {
    console.error("Error creating leave:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
