import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@mehmetkucuk.nl';
  const newPassword = 'admin123'; // Değiştirmek için bu şifreyi kullanın
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
  
  console.log('✅ Admin password updated successfully!');
  console.log('Email:', email);
  console.log('New Password:', newPassword);
  console.log('\n⚠️  Please change this password after logging in!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
