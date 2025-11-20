'use client';

interface VideoSectionProps {
  videoUrl?: string;
  title?: string;
  description?: string;
}

export default function VideoSection({
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder video
  title = "",
  description = ""
}: VideoSectionProps) {
  // Extract video ID from YouTube URL if full URL is provided
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // If already an embed URL, return as is
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    // Default fallback
    return url;
  };

  return (
    <section className="wp-slide-up">
      <div className="wp-card p-8">
        <div className="mb-6 text-center">
          <h2 className="wp-heading-2 mb-4">{title}</h2>
          {description && (
            <p className={`
              wp-body-large text-wp-text-secondary mx-auto max-w-2xl
            `}>
              {description}
            </p>
          )}
        </div>
        
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 h-full w-full rounded-lg"
            src={getEmbedUrl(videoUrl)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

