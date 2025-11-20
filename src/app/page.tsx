import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import HomePageClient from './HomePageClient';
import { getCompanyNews } from '@/lib/api/news';

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  const newsItems = await getCompanyNews();

  return <HomePageClient newsItems={newsItems} />;
}
