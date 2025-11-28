import { beginOfMonth, endOfMonth } from '@/lib/date';

export interface CompanyDeadLineEvents {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  description?: string;
}

export async function getCompanyDeadLineEvents(): Promise<CompanyDeadLineEvents[]> {
  try {
    const bmonth = beginOfMonth(new Date());
    const emonth = endOfMonth(new Date());
    const res = await fetch(
      `https://whiteprompt.app.n8n.cloud/webhook/2a89e56e-0c29-4a25-9853-0d3ece4f8ff6?start=${bmonth.toISOString()}&end=${emonth.toISOString()}`,
      {
        headers: {
          'x-api-key': process.env.STAFFING_TOOL_API_KEY || "",
        },
        next: {
          revalidate: 86400, // 1 day
        },
      }
    );

    if (!res.ok) {
      console.error(`Failed to fetch company news: ${res.statusText}`);
      return [];
    }

    const data: CompanyDeadLineEvents[] = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching company deadline evets.', error);
    return [];
  }
}
