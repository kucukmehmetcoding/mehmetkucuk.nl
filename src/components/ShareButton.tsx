'use client';

import {Share2} from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  label: string;
}

export default function ShareButton({title, text, url, label}: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(url);
      // Optional: Show a toast or alert
      alert('Link copied to clipboard!');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium"
    >
      <Share2 className="w-4 h-4" />
      {label}
    </button>
  );
}
