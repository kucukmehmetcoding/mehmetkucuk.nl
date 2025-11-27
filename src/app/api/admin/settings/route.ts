import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany();
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    // Ensure maintenanceMode has a default value
    if (!settingsObj.maintenanceMode) {
      settingsObj.maintenanceMode = 'false';
    }

    return NextResponse.json(settingsObj);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Update or create settings
    for (const [key, value] of Object.entries(data)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    const response = NextResponse.json({ message: 'Settings saved successfully' });
    
    // Set maintenance mode cookie
    if (data.maintenanceMode === 'true') {
      response.cookies.set('maintenance-mode', 'true', {
        httpOnly: true,
        path: '/'
      });
    } else {
      response.cookies.delete('maintenance-mode');
    }

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}