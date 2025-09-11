export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-wp-dark-secondary border-t border-wp-border">
      <div className="wp-container py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-wp-primary to-wp-accent rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="wp-body text-wp-text-primary font-semibold">Whiteprompt</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-wp-text-muted">
            <p>© {currentYear} Whiteprompt. All rights reserved.</p>
            <div className="hidden sm:block w-1 h-1 bg-wp-text-muted rounded-full"></div>
            <p>Team Member Portal</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
