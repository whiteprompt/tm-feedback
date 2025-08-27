import { NextResponse } from "next/server";
import { formatDate } from "@/utils/date";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { STAFFING_API_URL } from "@/lib/constants";

// Force dynamic rendering to prevent caching issues with authentication
export const dynamic = "force-dynamic";

interface Allocation {
  project: string;
  start: string;
  end?: string;
}

interface Contract {
  concept: string;
  dailyHours: number;
  amountType: string;
  amount: number;
  start: string;
  end?: string;
  active?: boolean;
}

interface AccessTool {
  toolName: string;
}

interface NotionResponse {
  id: string;
  firstName: string;
  lastName: string;
  startDate: string;
  personalEmail: string;
  mobile: string;
  identificationType: string;
  identificationNumber: string;
  allocations?: Allocation[];
  contracts?: Contract[];
  accessTools?: AccessTool[];
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  startDate: string;
  personalEmail: string;
  mobile: string;
  identificationType: string;
  identificationNumber: string;
  contracts?: Contract[];
  allocations?: Allocation[];
  accesses?: string[];
}

export async function GET() {
  try {
    const { error, email } = await getAuthenticatedUser();

    // Debug logging for session isolation
    console.log(`[DEBUG] API request for email: ${email}`);

    if (error) {
      return error;
    }

    const notionUrl = new URL(
      `${STAFFING_API_URL}/notion-webhooks/team-member?q=${email}&includeAllocations=true&includeContracts=true`
    );

    const response = await fetch(notionUrl.toString(), {
      method: "GET",
      headers: {
        "x-api-key": process.env.STAFFING_TOOL_API_KEY || "",
      },
    });

    if (!response.ok) {
      throw new Error(`Notion API responded with status: ${response.status}`);
    }

    const data: NotionResponse = await response.json();

    const teamMember: TeamMember = {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: email,
      startDate: data.startDate,
      personalEmail: data.personalEmail,
      mobile: data.mobile,
      identificationType: data.identificationType,
      identificationNumber: data.identificationNumber,
      allocations: data.allocations
        ?.sort(
          (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
        )
        ?.map((allocation) => ({
          project: allocation.project,
          start: formatDate(allocation.start),
          end: allocation.end ? formatDate(allocation.end) : "",
          active: !allocation.end || new Date(allocation.end) > new Date(),
        })),
      contracts: data.contracts
        ?.filter((contract) => contract.concept === "Service Fee")
        ?.sort(
          (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
        )
        .map((contract) => ({
          concept: contract.concept,
          dailyHours: contract.dailyHours,
          amountType: contract.amountType,
          amount: contract.amount,
          start: formatDate(contract.start),
          end: contract.end ? formatDate(contract.end) : "",
          active: !contract.end || new Date(contract.end) > new Date(),
        })),
      accesses: (data?.accessTools || [])
        .filter(
          (access) => !["Zoho Recruit", "Freshbooks"].includes(access.toolName)
        )
        .map((access) => access.toolName),
    };

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error(`Error in team member API:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
