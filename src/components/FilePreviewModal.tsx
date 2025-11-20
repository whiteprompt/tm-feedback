import React from 'react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  fileName: string;
}

export default function FilePreviewModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
}: FilePreviewModalProps) {
  if (!isOpen || !fileUrl) return null;

  return (
    <div className={`
      wp-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80
      p-4 backdrop-blur-sm
    `} onClick={onClose}>
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
            {fileName}
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
        <div className="bg-wp-dark-primary flex-1">
          <iframe
            src={fileUrl}
            className="h-full w-full border-none"
            title={`Preview of ${fileName}`}
          />
        </div>
      </div>
    </div>
  );
}
