import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash passwords
  const workerPassword = await bcrypt.hash('123456', 10);
  const recruiterPassword = await bcrypt.hash('123456', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Create demo worker
  const worker = await prisma.user.upsert({
    where: { email: 'ahmed@demo.com' },
    update: {},
    create: {
      name: 'Ahmed Bouzid',
      email: 'ahmed@demo.com',
      phone: '0555123456',
      password: workerPassword,
      role: 'worker',
      isApproved: true,
    },
  });

  // Create worker profile
  await prisma.workerProfile.upsert({
    where: { userId: worker.id },
    update: {},
    create: {
      userId: worker.id,
      title: 'Serveur expérimenté',
      bio: '5 ans d\'expérience en restauration. Ponctuel et dynamique.',
      skills: ['Service', 'Horeca', 'Cash register'],
      rateAmount: 2500,
      rateUnit: 'day',
      wilaya: '16',
      commune: 'Alger Centre',
      available: true,
      rating: 4.7,
      completedJobs: 23,
    },
  });

  // Create demo recruiter
  const recruiter = await prisma.user.upsert({
    where: { email: 'mohamed@demo.com' },
    update: {},
    create: {
      name: 'Mohamed Benali',
      email: 'mohamed@demo.com',
      phone: '0666123456',
      password: recruiterPassword,
      role: 'recruiter',
      isApproved: true,
    },
  });

  // Create recruiter profile
  await prisma.recruiterProfile.upsert({
    where: { userId: recruiter.id },
    update: {},
    create: {
      userId: recruiter.id,
      companyName: 'Café Glacier',
      companyDescription: 'Café populaire au centre d\'Alger',
      wilaya: '16',
      commune: 'Alger Centre',
      verified: true,
    },
  });

  // Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@oservice.dz' },
    update: {},
    create: {
      name: 'Admin OSERVICE',
      email: 'admin@oservice.dz',
      phone: '0777123456',
      password: adminPassword,
      role: 'admin',
      isApproved: true,
    },
  });

  // Create demo job posts
  const jobs = [
    {
      recruiterId: recruiter.id,
      title: 'Serveur / Serveuse',
      description: 'Recherche serveur pour café populaire. Horaires flexibles, service du matin ou soir. Expérience appréciée mais non requise.',
      wilaya: '16',
      commune: 'Alger Centre',
      duration: '2 semaines',
      budgetAmount: 2500,
      budgetUnit: 'day',
      paymentType: 'cash',
      tags: ['Horeca', 'Service'],
    },
    {
      recruiterId: recruiter.id,
      title: 'Livreur à vélo',
      description: 'Livreur pour service de livraison locale. Vélo ou scooter requis. Zone: centre-ville.',
      wilaya: '16',
      commune: 'Sidi M\'Hamed',
      duration: '2 semaines',
      budgetAmount: 1500,
      budgetUnit: 'day',
      paymentType: 'cash',
      tags: ['Livraison', 'Mobilité'],
    },
  ];

  for (const job of jobs) {
    await prisma.jobPost.create({
      data: job,
    });
  }

  // Create system config
  await prisma.systemConfig.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      paymentMode: 'cash',
      digitalGatewayEnabled: false,
      platformName: 'OSERVICE',
      supportPhone: '213555000000',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
