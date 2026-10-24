import React, { useState } from 'react';

interface UserAvatarProps {
  imageSource?: string | null;
  authorName: string;
  className?: string;
}

export function UserAvatar({ imageSource, authorName, className = "w-10 h-10 text-sm" }: UserAvatarProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const fallbackInitial = authorName ? authorName.charAt(0).toUpperCase() : '?';
  const isValidUrl = imageSource && (imageSource.startsWith('http://') || imageSource.startsWith('https://'));

  if (!isValidUrl || hasImageError) {
    return (
      <div className={`${className} rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 shrink-0 flex items-center justify-center font-bold`}>
        {fallbackInitial}
      </div>
    );
  }

  return (
    <img
      src={imageSource}
      alt={authorName}
      className={`${className} rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700`}
      onError={() => setHasImageError(true)}
      referrerPolicy="no-referrer"
    />
  );
}