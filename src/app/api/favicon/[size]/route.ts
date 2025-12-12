import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

// Cache favicon for 1 hour
export const revalidate = 3600;

type SizeParam = '16' | '32' | '48' | '180' | '192' | '512' | 'ico';

const SIZE_MAP: Record<SizeParam, { width: number; height: number; type: string }> = {
  '16': { width: 16, height: 16, type: 'image/png' },
  '32': { width: 32, height: 32, type: 'image/png' },
  '48': { width: 48, height: 48, type: 'image/png' },
  '180': { width: 180, height: 180, type: 'image/png' }, // Apple touch icon
  '192': { width: 192, height: 192, type: 'image/png' }, // Android
  '512': { width: 512, height: 512, type: 'image/png' }, // PWA
  'ico': { width: 32, height: 32, type: 'image/x-icon' },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { size: string } }
) {
  const sizeParam = params.size as SizeParam;
  const sizeConfig = SIZE_MAP[sizeParam];
  
  if (!sizeConfig) {
    return NextResponse.json({ error: 'Invalid size' }, { status: 400 });
  }

  try {
    // Get favicon settings from database
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'siteFavicon' },
    });

    if (setting?.value) {
      // Parse the JSON containing all favicon URLs
      const faviconUrls = JSON.parse(setting.value) as Record<string, string>;
      const iconKey = sizeParam === 'ico' ? 'favicon' : `icon-${sizeParam}`;
      const iconPath = faviconUrls[iconKey];

      if (iconPath) {
        // Construct full file path
        const fullPath = path.join(process.cwd(), 'public', iconPath);
        
        if (existsSync(fullPath)) {
          const buffer = await readFile(fullPath);
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': sizeConfig.type,
              'Cache-Control': 'public, max-age=3600, immutable',
            },
          });
        }
      }
    }

    // Fallback to default icons
    const defaultPath = path.join(process.cwd(), 'public', `icon-${sizeParam === 'ico' ? '32' : sizeParam}.png`);
    
    if (existsSync(defaultPath)) {
      const buffer = await readFile(defaultPath);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': sizeConfig.type,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // If no favicon exists, return 404
    return NextResponse.json({ error: 'Favicon not found' }, { status: 404 });

  } catch (error) {
    console.error('[Favicon] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
