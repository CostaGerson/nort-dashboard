import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const users = [
  { username: 'GERSONCOSTA', password: '356241', name: 'Gerson Costa', role: 'admin' },
  { username: 'IGOR',        password: '3020',   name: 'Igor',         role: 'user'  },
  { username: 'TAVARES',     password: '3020',   name: 'Tavares',      role: 'user'  },
  { username: 'MAYCON',      password: '3020',   name: 'Maycon',       role: 'user'  },
];

async function main() {
  console.log('🌱 Seeding users...');

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { username: u.username },
      update: { password: hash, name: u.name, role: u.role },
      create: {
        username: u.username,
        password: hash,
        name: u.name,
        role: u.role,
      },
    });
    console.log(`  ✓ ${u.username}`);
  }

  console.log('✅ Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
