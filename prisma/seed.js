const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('islockeddxd1A911', 10);
  
  const user = await prisma.user.upsert({
    where: { username: 'islockeddxd' },
    update: {},
    create: {
      username: 'islockeddxd',
      password: hashedPassword,
      role: 'ADMIN',
      isApproved: true,
      permissions: JSON.stringify(['start', 'stop', 'console', 'files', 'settings', 'admin']),
    },
  });
  
  console.log({ user });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
