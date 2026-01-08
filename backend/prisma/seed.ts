import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

async function main() {
  if (process.env.NODE_ENV !== 'production') {
    // NOTE: 개발/테스트 환경용 시스템 관리자 계정
    await prisma.user.upsert({
      where: { id: 'system-admin' },
      update: {},
      create: {
        id: 'system-admin',
        githubId: 'system-admin',
        githubLogin: 'system',
        name: '시스템 관리자',
        role: 'ADMIN',
      },
    });
  }
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
