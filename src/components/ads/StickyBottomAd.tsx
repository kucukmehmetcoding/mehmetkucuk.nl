'use client';

import { useEffect, useState } from 'react';

interface StickyBottomAdProps {
  lang?: string;
}

interface AdData {
  slot: {
    id: string;
    width: number | null;
    height: number | null;
  } | null;
  ad: {
    id: string;
    provider: string;
    imageUrl: string | null;
    linkUrl: string | null;
    altText: string | null;
    adCode: string | null;
  } | null;
}

export default function StickyBottomAd({ lang = 'tr' }: StickyBottomAdProps) {
  const [adData, setAdData] = useState<AdData | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    fetchAd();
  }, [lang]);

  const fetchAd = async () => {
    try {
      const response = await fetch(`/api/ads?placement=sticky_bottom&lang=${lang}`);
      if (response.ok) {
        const data = await response.json();
        setAdData(data);
      }
    } catch (error) {
      console.error('Error fetching sticky ad:', error);
    }
  };

  const handleClick = async () => {
    if (adData?.ad) {
      try {
        await fetch(`/api/ads/click?id=${adData.ad.id}`, { method: 'POST' });
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (isDismissed || !adData?.ad || !adData?.slot) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 p-2">
        <div className="container mx-auto flex items-center justify-center gap-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-4 text-slate-400 hover:text-white text-sm"
            aria-label="Reklamı kapat"
          >
            ✕
          </button>

          {adData.ad.provider === 'custom' && adData.ad.imageUrl ? (
            <a
              href={adData.ad.linkUrl || '#'}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={handleClick}
              className="flex items-center"
            >
              <img
                src={adData.ad.imageUrl}
                alt={adData.ad.altText || 'Advertisement'}
                style={{
                  maxHeight: adData.slot.height ? `${adData.slot.height}px` : '60px',
                  width: 'auto',
                }}
                className="rounded"
              />
            </a>
          ) : adData.ad.adCode ? (
            <div dangerouslySetInnerHTML={{ __html: adData.ad.adCode }} />
          ) : null}

          <span className="text-[10px] text-slate-500">Reklam</span>
        </div>
      </div>
    </div>
  );
}
