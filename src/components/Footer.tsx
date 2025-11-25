import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-wp-dark-secondary border-wp-border mt-auto border-t">
      <div className="wp-container py-8">
        <div className={`
          flex flex-col gap-4
          md:flex-row md:items-center md:justify-between
        `}>
          <div className="flex items-center space-x-2">
            <div className={`
              b-linear-to-r from-wp-primary to-wp-accent flex h-8 w-8
              items-center justify-center rounded-full
            `}>
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="wp-body text-wp-text-primary font-semibold">
              <Link href="https://www.whiteprompt.com" target="_blank" className={`
                hover:text-wp-primary
                transition-colors
              `}>
                White Prompt
              </Link>
            </span>
          </div>
          
          <div className={`
            text-wp-text-muted flex flex-col gap-4 text-sm
            sm:flex-row sm:items-center
          `}>
            <p>© {currentYear} White Prompt. All rights reserved.</p>
            <div className={`
              bg-wp-text-muted hidden h-1 w-1 rounded-full
              sm:block
            `}></div>
            <div className="flex items-center gap-3">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/whiteprompt"
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex h-8 w-8 items-center justify-center transition-opacity
                  hover:opacity-80
                `}
                aria-label="LinkedIn"
              >
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/channel/UCvhl0GYmups5hZ4WgfuRAYQ/videos"
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex h-8 w-8 items-center justify-center transition-opacity
                  hover:opacity-80
                `}
                aria-label="YouTube"
              >
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/whiteprompt/#"
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex h-8 w-8 items-center justify-center transition-opacity
                  hover:opacity-80
                `}
                aria-label="Instagram"
              >
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              {/* Medium */}
              <a
                href="https://blog.whiteprompt.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex h-8 w-8 items-center justify-center transition-opacity
                  hover:opacity-80
                `}
                aria-label="Medium"
              >
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
