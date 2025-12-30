'use client';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string | null;
  isLoading?: boolean;
  error?: string | null;
}

export default function ResumeModal({
  isOpen,
  onClose,
  content,
  isLoading = false,
  error = null,
}: ResumeModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className={`
        wp-fade-in fixed inset-0 z-50 flex items-center justify-center
        bg-black/80 p-4 backdrop-blur-sm
      `} 
      onClick={onClose}
    >
      <div 
        className={`
          wp-card wp-slide-up flex h-[90vh] w-full max-w-5xl flex-col
          overflow-hidden p-0
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`
          border-wp-border bg-wp-dark-secondary flex items-center
          justify-between border-b px-6 py-4
        `}>
          <h3 className="wp-heading-3 text-wp-text-primary truncate pr-4">
            My Resume
          </h3>
          <button
            onClick={onClose}
            className={`
              text-wp-text-muted rounded-lg p-1 transition-colors
              hover:text-wp-text-primary
            `}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="bg-wp-dark-primary flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className={`
                  mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4
                  border-solid border-current border-r-transparent
                  align-[-0.125em]
                  motion-reduce:animate-[spin_1.5s_linear_infinite]
                `} />
                <p className="text-wp-text-muted">Loading resume...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto mb-4 h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-wp-text-primary mb-2 font-semibold">Failed to load resume</p>
                <p className="text-wp-text-muted text-sm">{error}</p>
              </div>
            </div>
          ) : content ? (
            <div className="markdown-content p-8">
              <style jsx global>{`
                .markdown-content {
                  color: #e5e7eb;
                  line-height: 1.7;
                }
                .markdown-content h1 {
                  font-size: 2rem;
                  font-weight: 700;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  color: #ffffff;
                  border-bottom: 2px solid #374151;
                  padding-bottom: 0.5rem;
                }
                .markdown-content h2 {
                  font-size: 1.5rem;
                  font-weight: 600;
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                  color: #ffffff;
                }
                .markdown-content h3 {
                  font-size: 1.25rem;
                  font-weight: 600;
                  margin-top: 1.25rem;
                  margin-bottom: 0.5rem;
                  color: #f3f4f6;
                }
                .markdown-content h4 {
                  font-size: 1.1rem;
                  font-weight: 600;
                  margin-top: 1rem;
                  margin-bottom: 0.5rem;
                  color: #f3f4f6;
                }
                .markdown-content p {
                  margin-bottom: 1rem;
                }
                .markdown-content ul, .markdown-content ol {
                  margin-bottom: 1rem;
                  padding-left: 1.5rem;
                }
                .markdown-content li {
                  margin-bottom: 0.5rem;
                }
                .markdown-content ul li {
                  list-style-type: disc;
                }
                .markdown-content ol li {
                  list-style-type: decimal;
                }
                .markdown-content strong {
                  font-weight: 600;
                  color: #ffffff;
                }
                .markdown-content em {
                  font-style: italic;
                }
                .markdown-content code {
                  background-color: #1f2937;
                  padding: 0.2rem 0.4rem;
                  border-radius: 0.25rem;
                  font-size: 0.875rem;
                  color: #60a5fa;
                }
                .markdown-content pre {
                  background-color: #1f2937;
                  padding: 1rem;
                  border-radius: 0.5rem;
                  overflow-x: auto;
                  margin-bottom: 1rem;
                }
                .markdown-content pre code {
                  background-color: transparent;
                  padding: 0;
                  color: #e5e7eb;
                }
                .markdown-content a {
                  color: #60a5fa;
                  text-decoration: underline;
                }
                .markdown-content a:hover {
                  color: #93c5fd;
                }
                .markdown-content blockquote {
                  border-left: 4px solid #374151;
                  padding-left: 1rem;
                  margin-left: 0;
                  margin-bottom: 1rem;
                  color: #9ca3af;
                  font-style: italic;
                }
                .markdown-content hr {
                  border: 0;
                  border-top: 1px solid #374151;
                  margin: 2rem 0;
                }
                .markdown-content table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 1rem;
                }
                .markdown-content th, .markdown-content td {
                  border: 1px solid #374151;
                  padding: 0.5rem;
                  text-align: left;
                }
                .markdown-content th {
                  background-color: #1f2937;
                  font-weight: 600;
                  color: #ffffff;
                }
              `}</style>
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-wp-text-muted">No resume content available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
