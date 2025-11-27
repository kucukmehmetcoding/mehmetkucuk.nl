import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';

export const runtime = 'edge';

export const alt = 'Mehmet Kucuk - Freelance Yazılım ve Web Tasarım';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { locale: string } }) {
  const locale = (await params).locale;
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  const title = t('title');
  const subtitle = t('subtitle');

  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 'bold',
              color: '#2563eb',
              marginBottom: '20px',
            }}
          >
            mehmetkucuk.nl
          </div>
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: '20px',
            maxWidth: '800px',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#4b5563',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: 20,
            color: '#6b7280',
          }}
        >
          <span>Web Design</span>
          <span>•</span>
          <span>Software</span>
          <span>•</span>
          <span>AI Solutions</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
