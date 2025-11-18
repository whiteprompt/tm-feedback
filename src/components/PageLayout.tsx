import Navigation from './Navigation';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="wp-section-sm grow">
        <div className="wp-container">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
