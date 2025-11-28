import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  console.log('Admin user:', { 
    email: user?.email, 
    hasPassword: !!user?.password,
    role: user?.role
  });
}

main()
  .finally(() => prisma.$disconnect());
