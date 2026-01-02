import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { STAFFING_API_URL } from "@/lib/constants";

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
      `${STAFFING_API_URL}/shared-data/expense-refunds?email=${email}`,
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
    console.error("Error fetching expense refunds:", error);
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

    const exchangeRate = formData.get("exchangeRate") || "1";
    const email = (formData.get("userEmail") as string) || authEmail;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const currency = formData.get("currency") as string;
    const concept = formData.get("concept") as string;
    const submittedDate = formData.get("submittedDate") as string;
    const receiptFile = formData.get("receipt") as File;
    const creatorEmail = authEmail; 

    // Validation
    if (
      !title ||
      !description ||
      !amount ||
      !currency ||
      !concept ||
      !submittedDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Handle file upload if receipt is provided
    if (receiptFile && receiptFile.size > 0) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!allowedTypes.includes(receiptFile.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Only JPG, PNG, and PDF are allowed." },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB)
      if (receiptFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size must be less than 5MB" },
          { status: 400 }
        );
      }
    }

    // Prepare form data for the staffing service
    const expenseRefundFormData = new FormData();
    expenseRefundFormData.append("teamMemberEmail", email);
    expenseRefundFormData.append("title", title);
    expenseRefundFormData.append("description", description);
    expenseRefundFormData.append("amount", amount.toString());
    expenseRefundFormData.append("currency", currency);
    expenseRefundFormData.append("concept", concept);
    expenseRefundFormData.append("exchangeRate", exchangeRate);

    // Add receipt file if provided
    if (receiptFile && receiptFile.size > 0) {
      expenseRefundFormData.append("receipt_file", receiptFile);
    }

    expenseRefundFormData.append("creatorEmail", creatorEmail);

    // Make the request to the staffing service
    const response = await fetch(
      `${STAFFING_API_URL}/shared-data/expense-refunds`,
      {
        method: "POST",
        body: expenseRefundFormData,
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

    return NextResponse.json(dataResponse, { status: 201 });
  } catch (error) {
    console.error("Error creating expense refund:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
