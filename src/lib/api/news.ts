interface ExternalNewsItem {
  id: string;
  subject: string;
  description: string;
  date: string;
  url: string;
}

export interface NewsItem {
  title: string;
  notionUrl: string;
  description?: string;
  date?: string;
}

export async function getCompanyNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      'https://staffing.whiteprompt.com/shared-data/communications?type=public&status=Sent',
      {
        headers: {
          'x-api-key': process.env.STAFFING_TOOL_API_KEY || "",
        },
        next: {
          revalidate: 14400, // 4 hours
        },
      }
    );

    if (!res.ok) {
      console.error(`Failed to fetch company news: ${res.statusText}`);
      return [];
    }

    const data: ExternalNewsItem[] = await res.json();

    return data.map((item) => ({
      title: item.subject,
      notionUrl: item.url,
      description: item.description,
      date: item.date,
    }));
  } catch (error) {
    console.error('Error fetching company news:', error);
    return [];
  }
}
