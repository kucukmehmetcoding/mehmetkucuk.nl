import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

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

// Output dimensions
const OUTPUT_DIMENSIONS = {
  logo: { width: 200, height: 60 },
  favicon: { sizes: [16, 32, 48, 180, 192, 512] },
  ogImage: { width: 1200, height: 630 },
};

type UploadType = 'logo' | 'favicon' | 'ogImage';

interface UploadResult {
  success: boolean;
  url?: string;
  urls?: Record<string, string>;
  error?: string;
}

async function ensureUploadDir(): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'branding');
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

async function processLogo(buffer: Buffer, uploadDir: string): Promise<string> {
  const filename = `logo-${Date.now()}.png`;
  const filepath = path.join(uploadDir, filename);
  
  await sharp(buffer)
    .resize(OUTPUT_DIMENSIONS.logo.width, OUTPUT_DIMENSIONS.logo.height, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(filepath);
  
  return `/uploads/branding/${filename}`;
}

async function processFavicon(buffer: Buffer, uploadDir: string): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};
  const timestamp = Date.now();
  
  // Generate multiple sizes
  for (const size of OUTPUT_DIMENSIONS.favicon.sizes) {
    const filename = `favicon-${size}x${size}-${timestamp}.png`;
    const filepath = path.join(uploadDir, filename);
    
    await sharp(buffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(filepath);
    
    urls[`icon-${size}`] = `/uploads/branding/${filename}`;
  }
  
  // Generate ICO for main favicon (32x32)
  const icoFilename = `favicon-${timestamp}.ico`;
  const icoFilepath = path.join(uploadDir, icoFilename);
  await sharp(buffer)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(icoFilepath);
  urls['favicon'] = `/uploads/branding/${icoFilename}`;
  
  return urls;
}

async function processOgImage(buffer: Buffer, uploadDir: string): Promise<string> {
  const filename = `og-image-${Date.now()}.jpg`;
  const filepath = path.join(uploadDir, filename);
  
  await sharp(buffer)
    .resize(OUTPUT_DIMENSIONS.ogImage.width, OUTPUT_DIMENSIONS.ogImage.height, {
      fit: 'cover',
    })
    .jpeg({ quality: 85 })
    .toFile(filepath);
  
  return `/uploads/branding/${filename}`;
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
    const uploadDir = await ensureUploadDir();
    
    let result: UploadResult;
    
    switch (type) {
      case 'logo': {
        const url = await processLogo(buffer, uploadDir);
        result = { success: true, url };
        break;
      }
      case 'favicon': {
        const urls = await processFavicon(buffer, uploadDir);
        result = { success: true, urls };
        break;
      }
      case 'ogImage': {
        const url = await processOgImage(buffer, uploadDir);
        result = { success: true, url };
        break;
      }
      default:
        result = { success: false, error: 'Unknown upload type' };
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
