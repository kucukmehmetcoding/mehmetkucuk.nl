'use client';

import {useState} from 'react';
import {
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Mail,
  MessageCircle,
  Send,
  Check,
  Share2,
} from 'lucide-react';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  summary?: string;
  lang?: string;
  variant?: 'horizontal' | 'vertical' | 'floating';
}

export default function SocialShareButtons({
  url,
  title,
  summary = '',
  lang = 'en',
  variant = 'horizontal',
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary);

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:bg-sky-500 hover:text-white',
      bgColor: 'bg-sky-500',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-blue-600 hover:text-white',
      bgColor: 'bg-blue-600',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-blue-700 hover:text-white',
      bgColor: 'bg-blue-700',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:bg-green-500 hover:text-white',
      bgColor: 'bg-green-500',
    },
    {
      name: 'Telegram',
      icon: Send,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:bg-sky-600 hover:text-white',
      bgColor: 'bg-sky-600',
    },
    {
      name: 'Email',
      icon: Mail,
      href: `mailto:?subject=${encodedTitle}&body=${encodedSummary}%0A%0A${encodedUrl}`,
      color: 'hover:bg-slate-600 hover:text-white',
      bgColor: 'bg-slate-600',
    },
  ];

  const labels = {
    tr: {share: 'Paylaş', copied: 'Kopyalandı!', copyLink: 'Linki Kopyala'},
    en: {share: 'Share', copied: 'Copied!', copyLink: 'Copy Link'},
    nl: {share: 'Delen', copied: 'Gekopieerd!', copyLink: 'Kopieer Link'},
  };

  const l = labels[lang as keyof typeof labels] || labels.en;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (href: string) => {
    window.open(href, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  // Floating variant (fixed position on scroll)
  if (variant === 'floating') {
    return (
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-2 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
        {shareLinks.slice(0, 4).map((link) => (
          <button
            key={link.name}
            onClick={() => handleShare(link.href)}
            className={`p-3 rounded-full text-slate-600 dark:text-slate-400 transition-all duration-200 ${link.color}`}
            title={link.name}
            aria-label={`${l.share} ${link.name}`}
          >
            <link.icon className="w-5 h-5" />
          </button>
        ))}
        <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
        <button
          onClick={handleCopy}
          className={`p-3 rounded-full transition-all duration-200 ${
            copied
              ? 'bg-green-500 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title={copied ? l.copied : l.copyLink}
          aria-label={l.copyLink}
        >
          {copied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
        </button>
      </div>
    );
  }

  // Vertical variant
  if (variant === 'vertical') {
    return (
      <div className="flex flex-col gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          {l.share}
        </p>
        {shareLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => handleShare(link.href)}
            className={`flex items-center gap-3 p-2 rounded-lg text-slate-600 dark:text-slate-400 transition-all duration-200 ${link.color}`}
            aria-label={`${l.share} ${link.name}`}
          >
            <link.icon className="w-5 h-5" />
            <span className="text-sm">{link.name}</span>
          </button>
        ))}
        <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
        <button
          onClick={handleCopy}
          className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
            copied
              ? 'bg-green-500 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          aria-label={l.copyLink}
        >
          {copied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
          <span className="text-sm">{copied ? l.copied : l.copyLink}</span>
        </button>
      </div>
    );
  }

  // Horizontal variant (default)
  const visibleLinks = showAll ? shareLinks : shareLinks.slice(0, 4);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        {l.share}:
      </span>
      
      {visibleLinks.map((link) => (
        <button
          key={link.name}
          onClick={() => handleShare(link.href)}
          className={`p-2 rounded-lg text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-all duration-200 ${link.color}`}
          title={link.name}
          aria-label={`${l.share} ${link.name}`}
        >
          <link.icon className="w-5 h-5" />
        </button>
      ))}

      {!showAll && shareLinks.length > 4 && (
        <button
          onClick={() => setShowAll(true)}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium"
        >
          +{shareLinks.length - 4}
        </button>
      )}

      <button
        onClick={handleCopy}
        className={`p-2 rounded-lg border transition-all duration-200 ${
          copied
            ? 'bg-green-500 text-white border-green-500'
            : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title={copied ? l.copied : l.copyLink}
        aria-label={l.copyLink}
      >
        {copied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
      </button>
    </div>
  );
}
