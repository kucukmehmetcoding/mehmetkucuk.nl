import {NextRequest, NextResponse} from 'next/server';
import {validateAdminToken} from '@/lib/auth';
import {S3Client, PutObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';

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

/**
 * Get presigned URL for S3/R2 upload
 * GET /api/admin/media/presigned?fileName=...&fileType=...
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!validateAdminToken(authHeader || '')) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {searchParams} = new URL(request.url);
  const fileName = searchParams.get('fileName');
  const fileType = searchParams.get('fileType');

  if (!fileName || !fileType) {
    return NextResponse.json({error: 'Missing parameters'}, {status: 400});
  }

  if (!bucket) {
    return NextResponse.json({error: 'Storage not configured (ASSET_BUCKET missing)'}, {status: 500});
  }

  try {
    const uniqueId = crypto.randomUUID();
    const extension = fileName.split('.').pop();
    const key = `uploads/${uniqueId}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
      ACL: 'public-read', // Optional: depends on bucket settings
    });

    const presignedUrl = await getSignedUrl(s3, command, {expiresIn: 3600});
    
    // Construct the final public URL
    // If ASSET_PUBLIC_URL is set, use it. Otherwise try to construct from endpoint.
    let finalUrl = '';
    if (publicUrl) {
      finalUrl = `${publicUrl}/${key}`;
    } else if (endpoint) {
       // Handle R2/S3 endpoint styles
       // If endpoint contains the bucket, don't append it.
       // But usually endpoint is like https://<account>.r2.cloudflarestorage.com
       // And public access is via a custom domain or a different URL.
       // Fallback to a generic construction if publicUrl is missing.
       finalUrl = `${endpoint}/${bucket}/${key}`;
    } else {
       finalUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }

    return NextResponse.json({
      presignedUrl,
      uploadUrl: finalUrl, // The URL where the file will be accessible after upload
      fileName,
      fileType,
    });
  } catch (error) {
    console.error('GET /api/admin/media/presigned:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
