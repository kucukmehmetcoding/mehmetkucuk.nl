import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

// GET - Fetch all language files
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messagesDir = path.join(process.cwd(), 'messages');
    const languages = ['tr', 'en', 'nl'];
    const result: Record<string, Record<string, unknown>> = {};

    for (const lang of languages) {
      const filePath = path.join(messagesDir, `${lang}.json`);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        result[lang] = JSON.parse(content);
      } catch (error) {
        console.error(`Error reading ${lang}.json:`, error);
        result[lang] = {};
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/admin/languages:', error);
    return NextResponse.json({ error: 'Failed to fetch languages' }, { status: 500 });
  }
}

// PUT - Update a language file
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { language, data } = await request.json();
    
    if (!['tr', 'en', 'nl'].includes(language)) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
    }

    const messagesDir = path.join(process.cwd(), 'messages');
    const filePath = path.join(messagesDir, `${language}.json`);
    
    // Write the updated content to the file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ message: 'Language file updated successfully' });
  } catch (error) {
    console.error('Error updating language file:', error);
    return NextResponse.json({ error: 'Failed to update language file' }, { status: 500 });
  }
}