import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const email = 'admin@expert.md';
const password = 'Admin1234!';

const hash = await bcrypt.hash(password, 12);

const expert = await prisma.expert.upsert({
  where: { email },
  update: {
    subStatus: 'ACTIVE',
    isVerified: true,
    subCurrentEnd: new Date('2099-01-01'),
  },
  create: {
    email,
    passwordHash: hash,
    firstName: 'Admin',
    lastName: 'Expert',
    country: 'Republica Moldova',
    postalCode: 'MD-2001',
    streetAddress: 'Str. Ștefan cel Mare nr. 1',
    phoneNumber: '+373 69 000 000',
    city: 'Chișinău',
    region: 'Chișinău',
    category: 'Juridic',
    bio: 'Cont de test cu acces complet.',
    areasOfExpertise: ['Avocat', 'Notar', 'Jurist'],
    spokenLanguages: ['Română', 'Engleză'],
    isVerified: true,
    subStatus: 'ACTIVE',
    subCurrentEnd: new Date('2099-01-01'),
  },
});

console.log('✅ Super user creat/actualizat:');
console.log('   Email:   ', email);
console.log('   Parolă:  ', password);
console.log('   ID:      ', expert.id);

await prisma.$disconnect();
