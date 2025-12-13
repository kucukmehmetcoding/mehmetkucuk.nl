import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

export const runtime = 'nodejs';

const bucket = process.env.ASSET_BUCKET ?? '';
const region = process.env.ASSET_REGION ?? 'auto';
const endpoint = process.env.ASSET_ENDPOINT;
const publicUrl = process.env.ASSET_PUBLIC_URL;

const s3 = new S3Client({
  region,
  endpoint,
  forcePathStyle: true,
  credentials: process.env.ASSET_ACCESS_KEY
    ? {
        accessKeyId: process.env.ASSET_ACCESS_KEY,
        secretAccessKey: process.env.ASSET_SECRET_KEY ?? ''
      }
    : undefined
});

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

async function uploadToS3(buffer: Buffer, key: string, contentType: string): Promise<string> {
  if (!bucket) {
    throw new Error('Storage not configured (ASSET_BUCKET missing)');
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  });

  await s3.send(command);

  if (publicUrl) {
    return `${publicUrl}/${key}`;
  } else if (endpoint) {
     return `${endpoint}/${bucket}/${key}`;
  } else {
     return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}

async function processLogo(buffer: Buffer): Promise<string> {
  const filename = `branding/logo-${Date.now()}.png`;
  
  // Resize and convert to PNG
  const processedBuffer = await sharp(buffer)
    .resize(200, 60, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return uploadToS3(processedBuffer, filename, 'image/png');
}

async function processFavicon(buffer: Buffer): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};
  const timestamp = Date.now();
  
  // Generate multiple sizes
  for (const size of [16, 32, 48, 180, 192, 512]) {
    const filename = `branding/favicon-${size}x${size}-${timestamp}.png`;
    
    const processedBuffer = await sharp(buffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    
    urls[`icon-${size}`] = await uploadToS3(processedBuffer, filename, 'image/png');
  }
  
  // Generate ICO for main favicon (32x32)
  const icoFilename = `branding/favicon-${timestamp}.ico`;
  const icoBuffer = await sharp(buffer)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
    
  urls['favicon'] = await uploadToS3(icoBuffer, icoFilename, 'image/x-icon');
  
  return urls;
}

async function processOgImage(buffer: Buffer): Promise<string> {
  const filename = `branding/og-image-${Date.now()}.jpg`;
  
  const processedBuffer = await sharp(buffer)
    .resize(1200, 630, {
      fit: 'cover',
    })
    .jpeg({ quality: 85 })
    .toBuffer();
  
  return uploadToS3(processedBuffer, filename, 'image/jpeg');
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
