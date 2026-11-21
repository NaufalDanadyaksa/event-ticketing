import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create default Admin
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@event.com' },
    update: {},
    create: {
      email: 'admin@event.com',
      passwordHash: adminPasswordHash,
      name: 'System Administrator',
      phone: '081234567890',
      role: Role.ADMIN,
    },
  });
  console.log('✅ Admin user created/verified:', admin.email);

  // 2. Create default Staff
  const staffPasswordHash = await bcrypt.hash('Staff123!', 10);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@event.com' },
    update: {},
    create: {
      email: 'staff@event.com',
      passwordHash: staffPasswordHash,
      name: 'Gate Staff Operator',
      phone: '081234567891',
      role: Role.STAFF,
    },
  });
  console.log('✅ Staff user created/verified:', staff.email);

  // 3. Create Sample Free Event
  const freeEventSecret = crypto.randomBytes(32).toString('hex');
  const freeEvent = await prisma.event.upsert({
    where: { slug: 'tech-summit-jakarta-2026' },
    update: {},
    create: {
      title: 'Tech Summit Jakarta 2026',
      slug: 'tech-summit-jakarta-2026',
      description: 'Konferensi teknologi terbesar tahun 2026 menghadirkan para pakar industri software, cloud, dan AI.',
      bannerUrl: null,
      isPaid: false,
      price: 0,
      maxParticipants: 500,
      registrationDeadline: new Date('2026-12-14T23:59:59Z'),
      eventStartDate: new Date('2026-12-15T09:00:00Z'),
      eventEndDate: new Date('2026-12-15T17:00:00Z'),
      location: 'Jakarta Convention Center (JCC) Senayan',
      attendanceEnabled: true,
      attendanceSecret: freeEventSecret,
      isPublished: true,
      createdById: admin.id,
    },
  });
  console.log('✅ Sample free event created/verified:', freeEvent.title);

  // 4. Create Sample Paid Event
  const paidEventSecret = crypto.randomBytes(32).toString('hex');
  const paidEvent = await prisma.event.upsert({
    where: { slug: 'fullstack-dev-masterclass-2026' },
    update: {},
    create: {
      title: 'Fullstack Dev Masterclass 2026',
      slug: 'fullstack-dev-masterclass-2026',
      description: 'Workshop intensif 2 hari membangun arsitektur monorepo skala enterprise dengan Clean Architecture.',
      bannerUrl: null,
      isPaid: true,
      price: 150000,
      bankName: 'BCA (Bank Central Asia)',
      bankAccountNumber: '8830123456',
      bankAccountHolder: 'PT Event Ticketing Indonesia',
      maxParticipants: 100,
      registrationDeadline: new Date('2026-12-19T23:59:59Z'),
      eventStartDate: new Date('2026-12-20T08:30:00Z'),
      eventEndDate: new Date('2026-12-21T16:30:00Z'),
      location: 'Auditorium Tower Sudirman Lt. 12, Jakarta Selatan',
      attendanceEnabled: true,
      attendanceSecret: paidEventSecret,
      isPublished: true,
      createdById: admin.id,
    },
  });
  console.log('✅ Sample paid event created/verified:', paidEvent.title);

  console.log('✨ Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
