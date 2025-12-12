'use client';

import { useEffect, useState } from 'react';

interface AdSlot {
  id: string;
  name: string;
  placement: string;
  width: number | null;
  height: number | null;
  isActive: boolean;
  advertisements: Advertisement[];
}

interface Advertisement {
  id: string;
  provider: 'custom' | 'google_adsense' | 'google_admanager';
  imageUrl: string | null;
  linkUrl: string | null;
  altText: string | null;
  adCode: string | null;
  adUnitId: string | null;
  targetLangs: string[];
  isActive: boolean;
}

interface AdSlotRendererProps {
  placement: 'header' | 'sidebar' | 'footer' | 'in_article' | 'between_posts' | 'popup' | 'sticky_bottom';
  lang?: string;
  className?: string;
}

export default function AdSlotRenderer({ placement, lang = 'tr', className = '' }: AdSlotRendererProps) {
  const [slot, setSlot] = useState<AdSlot | null>(null);
  const [activeAd, setActiveAd] = useState<Advertisement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAd();
  }, [placement, lang]);

  const fetchAd = async () => {
    try {
      const response = await fetch(`/api/ads?placement=${placement}&lang=${lang}`);
      if (response.ok) {
        const data = await response.json();
        setSlot(data.slot);
        setActiveAd(data.ad);
      }
    } catch (error) {
      console.error('Error fetching ad:', error);
    }
    setIsLoading(false);
  };

  const handleAdClick = async () => {
    if (activeAd) {
      try {
        await fetch(`/api/ads/click?id=${activeAd.id}`, { method: 'POST' });
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    }
  };

  if (isLoading || !slot || !activeAd) {
    return null;
  }

  // Custom banner ad
  if (activeAd.provider === 'custom' && activeAd.imageUrl) {
    return (
      <div
        className={`ad-slot ad-${placement} ${className}`}
        style={{
          width: slot.width ? `${slot.width}px` : '100%',
          maxWidth: '100%',
        }}
      >
        <a
          href={activeAd.linkUrl || '#'}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleAdClick}
        >
          <img
            src={activeAd.imageUrl}
            alt={activeAd.altText || 'Advertisement'}
            style={{
              width: '100%',
              height: slot.height ? `${slot.height}px` : 'auto',
              objectFit: 'cover',
            }}
            className="rounded-lg"
          />
        </a>
        <span className="text-xs text-slate-500 mt-1 block text-center">Reklam</span>
      </div>
    );
  }

  // Google AdSense / Ad Manager
  if ((activeAd.provider === 'google_adsense' || activeAd.provider === 'google_admanager') && activeAd.adCode) {
    return (
      <div
        className={`ad-slot ad-${placement} ${className}`}
        style={{
          width: slot.width ? `${slot.width}px` : '100%',
          height: slot.height ? `${slot.height}px` : 'auto',
          maxWidth: '100%',
        }}
        dangerouslySetInnerHTML={{ __html: activeAd.adCode }}
      />
    );
  }

  return null;
}
