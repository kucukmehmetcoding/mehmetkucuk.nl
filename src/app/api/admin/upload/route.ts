import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';

// Allowed file types
const ALLOWED_TYPES = {
  logo: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
  favicon: ['image/x-icon', 'image/png', 'image/svg+xml', 'image/vnd.microsoft.icon'],
  ogImage: ['image/png', 'image/jpeg', 'image/webp'],
};

// Max file sizes (in bytes)
const MAX_SIZES = {
  logo: 2 * 1024 * 1024, // 2MB
  favicon: 500 * 1024, // 500KB
  ogImage: 5 * 1024 * 1024, // 5MB
};

type UploadType = 'logo' | 'favicon' | 'ogImage';

interface UploadResult {
  success: boolean;
  url?: string;
  urls?: Record<string, string>;
  error?: string;
}

function resolveBrandingPublicDir(): string {
  const configured = process.env.BRANDING_PUBLIC_DIR;
  if (configured && configured.trim()) {
    return path.resolve(configured);
  }

  // In production with Next.js standalone we copy public -> .next/standalone/public
  const standalonePublic = path.join(process.cwd(), '.next', 'standalone', 'public');
  if (fs.existsSync(standalonePublic)) {
    return standalonePublic;
  }

  // Local dev / non-standalone
  return path.join(process.cwd(), 'public');
}

async function writePublicFile(buffer: Buffer, relativePath: string): Promise<string> {
  const publicDir = resolveBrandingPublicDir();
  const safeRelative = relativePath.replace(/^\/+/, '');
  const absPath = path.join(publicDir, safeRelative);

  await fs.promises.mkdir(path.dirname(absPath), { recursive: true });
  await fs.promises.writeFile(absPath, buffer);

  return `/${safeRelative}`;
}

async function processLogo(buffer: Buffer): Promise<string> {
  const filename = `uploads/branding/logo-${Date.now()}.png`;
  
  // Resize and convert to PNG
  const processedBuffer = await sharp(buffer)
    .resize(200, 60, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return writePublicFile(processedBuffer, filename);
}

async function processFavicon(buffer: Buffer): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};
  const timestamp = Date.now();
  
  // Generate multiple sizes
  for (const size of [16, 32, 48, 180, 192, 512]) {
    const filename = `uploads/branding/favicon-${size}x${size}-${timestamp}.png`;
    
    const processedBuffer = await sharp(buffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    urls[`icon-${size}`] = await writePublicFile(processedBuffer, filename);
  }

  // Provide a stable "main" favicon URL that includes "-32x32" so layout replacements work.
  urls['favicon'] = urls['icon-32'];
  
  return urls;
}

async function processOgImage(buffer: Buffer): Promise<string> {
  const filename = `uploads/branding/og-image-${Date.now()}.jpg`;
  
  const processedBuffer = await sharp(buffer)
    .resize(1200, 630, {
      fit: 'cover',
    })
    .jpeg({ quality: 85 })
    .toBuffer();

  return writePublicFile(processedBuffer, filename);
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResult>> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as UploadType | null;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }
    
    if (!type || !['logo', 'favicon', 'ogImage'].includes(type)) {
      return NextResponse.json({ success: false, error: 'Invalid upload type' }, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = ALLOWED_TYPES[type];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate file size
    const maxSize = MAX_SIZES[type];
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: `File too large. Max size: ${Math.round(maxSize / 1024)}KB` },
        { status: 400 }
      );
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    let result: UploadResult;
    
    switch (type) {
      case 'logo': {
        const url = await processLogo(buffer);
        result = { success: true, url };
        break;
      }
      case 'favicon': {
        const urls = await processFavicon(buffer);
        result = { success: true, urls };
        break;
      }
      case 'ogImage': {
        const url = await processOgImage(buffer);
        result = { success: true, url };
        break;
      }
      default:
        throw new Error('Invalid type');
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}
