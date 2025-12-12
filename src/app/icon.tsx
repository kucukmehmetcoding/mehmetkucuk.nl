import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Force dynamic rendering - database required at runtime
export const dynamic = 'force-dynamic';

export const contentType = 'image/png';
export const size = { width: 32, height: 32 };

export default async function Icon() {
  // Try to get custom favicon from settings
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'siteFaviconMain' },
    });
    
    if (setting?.value) {
      // Return the custom favicon URL as redirect
      // For actual icon generation, we'd need to fetch and serve the image
      // This is a fallback to default if custom favicon exists but can't be served directly
    }
  } catch (error) {
    console.error('Error fetching favicon setting:', error);
  }

  // Default favicon - simple "MK" text icon
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: 4,
        }}
      >
        MK
      </div>
    ),
    {
      ...size,
    }
  );
}
