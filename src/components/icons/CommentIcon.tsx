import React from 'react';

interface CommentIconProps {
  className?: string;
}

/**
 * A reusable comment icon component
 * Displays a speech bubble emoji icon suitable for comments, messages, or feedback representations
 */
export const CommentIcon: React.FC<CommentIconProps> = ({ 
  className = "mx-auto h-12 w-12 flex items-center justify-center text-4xl" 
}) => {
  return (
    <div className={className}>
      💬
    </div>
  );
};

