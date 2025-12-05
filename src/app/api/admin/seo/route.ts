import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all SEO settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const seoSettings = await prisma.seoSetting.findMany({
      orderBy: { path: 'asc' },
    });

    return NextResponse.json(seoSettings);
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SEO settings' },
      { status: 500 }
    );
  }
}

// POST - Create or update SEO setting
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { path, title, description, keywords } = data;

    // Validation
    if (!path || !title || !description) {
      return NextResponse.json(
        { error: 'Path, title, and description are required' },
        { status: 400 }
      );
    }

    // Check if setting already exists
    const existing = await prisma.seoSetting.findUnique({
      where: { path },
    });

    let seoSetting;
    if (existing) {
      // Update existing
      seoSetting = await prisma.seoSetting.update({
        where: { path },
        data: {
          title,
          description,
          keywords: keywords || null,
        },
      });
    } else {
      // Create new
      seoSetting = await prisma.seoSetting.create({
        data: {
          path,
          title,
          description,
          keywords: keywords || null,
        },
      });
    }

    return NextResponse.json(seoSetting);
  } catch (error) {
    console.error('Error saving SEO setting:', error);
    return NextResponse.json(
      { error: 'Failed to save SEO setting' },
      { status: 500 }
    );
  }
}

// DELETE - Delete SEO setting
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    await prisma.seoSetting.delete({
      where: { path },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting SEO setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete SEO setting' },
      { status: 500 }
    );
  }
}
