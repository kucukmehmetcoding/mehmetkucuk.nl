import {NextRequest, NextResponse} from 'next/server';
import {validateAdminToken} from '@/lib/auth';
import {prisma} from '@/lib/prisma';

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

  try {
    // TODO: Generate S3/R2 presigned URL
    // For now, return mock response
    const presignedUrl = `https://s3.example.com/presigned-url-for-${fileName}`;

    return NextResponse.json({
      presignedUrl,
      uploadUrl: presignedUrl,
      fileName,
      fileType,
    });
  } catch (error) {
    console.error('GET /api/admin/media/presigned:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
