import React from 'react';

interface FolderIconProps {
  className?: string;
}

/**
 * A reusable folder icon component
 * Displays a folder emoji icon suitable for folder/directory representations
 */
export const FolderIcon: React.FC<FolderIconProps> = ({ 
  className = "mx-auto h-12 w-12 flex items-center justify-center text-4xl" 
}) => {
  return (
    <div className={className}>
      📂
    </div>
  );
};

