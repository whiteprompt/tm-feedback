import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import HomePageClient from './HomePageClient';
import { getCompanyNews } from '@/lib/api/news';
import { getCompanyDeadLineEvents } from '@/lib/api';

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  const companyNews = await getCompanyNews();
  const companyDeadLineEvents = await getCompanyDeadLineEvents();

  return <HomePageClient companyNews={companyNews} companyDeadLineEvents={companyDeadLineEvents} />;
}
