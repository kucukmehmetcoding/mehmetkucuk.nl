import {NextRequest, NextResponse} from 'next/server';
import {S3Client, PutObjectCommand} from '@aws-sdk/client-s3';
import {callFalImage} from '@/lib/fal';

export const runtime = 'nodejs';

const bucket = process.env.ASSET_BUCKET ?? '';
const region = process.env.ASSET_REGION ?? 'auto';
const endpoint = process.env.ASSET_ENDPOINT;

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.prompt) {
      return NextResponse.json({error: 'prompt required'}, {status: 400});
    }

    const imageUrl = await callFalImage({
      title: body.prompt,
      category: body.category ?? 'technology',
      tags: body.tags ?? []
    });

    if (!imageUrl) {
      return NextResponse.json({error: 'Image generation failed'}, {status: 500});
    }

    // If no bucket configured, return the Fal-generated URL directly
    if (!bucket) {
      return NextResponse.json({url: imageUrl, alt: body.prompt});
    }

    // Download the image from Fal and upload to our bucket
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({error: 'Failed to fetch generated image'}, {status: 500});
    }
    
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const key = `news/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: imageBuffer,
        ContentType: 'image/png'
      })
    );

    const url = `${process.env.ASSET_PUBLIC_BASE ?? ''}/${key}`;

    return NextResponse.json({url, alt: body.prompt});
  } catch (err) {
    console.error(err);
    return NextResponse.json({error: 'Image generation failed'}, {status: 500});
  }
}
