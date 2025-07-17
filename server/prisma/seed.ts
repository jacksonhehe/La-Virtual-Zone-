import { PrismaClient } from '@prisma/client';
import seed from '../../src/data/seed.json' assert { type: 'json' };

const prisma = new PrismaClient();

async function main() {
  for (const user of seed.users ?? []) {
    await prisma.user.create({
      data: {
        email: user.email,
        username: user.username,
        password: user.password,
        role: user.role ?? 'USER',
      },
    });
  }
  for (const club of seed.clubs ?? []) {
    await prisma.club.create({
      data: {
        name: club.name,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
