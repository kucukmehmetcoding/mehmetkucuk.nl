const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing Prisma connection...');
    
    // Test settings table
    const settings = await prisma.settings.findFirst();
    console.log('Settings:', settings);
    
    // If no settings exist, create one
    if (!settings) {
      console.log('No settings found, creating default settings...');
      const newSettings = await prisma.settings.create({
        data: {
          smtpHost: 'smtp.example.com',
          smtpPort: 587,
          smtpUser: 'user@example.com',
          smtpPass: 'password',
          logoUrl: null,
          faviconUrl: '/favicon.ico',
        },
      });
      console.log('Created settings:', newSettings);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
