import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Only admin can check maintenance status
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ maintenanceMode: false });
    }
    
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const maintenanceModeSetting = await prisma.siteSetting.findUnique({
      where: { key: 'maintenanceMode' }
    });
    
    await prisma.$disconnect();
    
    return NextResponse.json({ 
      maintenanceMode: maintenanceModeSetting?.value === 'true' 
    });
  } catch (error) {
    return NextResponse.json({ maintenanceMode: false }, { status: 500 });
  }
}