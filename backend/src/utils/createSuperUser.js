import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const email = 'admin@juristnet.ro';
const password = 'Admin1234!';

const hash = await bcrypt.hash(password, 12);

const jurist = await prisma.jurist.upsert({
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
    lastName: 'JuristNet',
    country: 'România',
    postalCode: '010101',
    streetAddress: 'Str. Victoriei nr. 1',
    phoneNumber: '+40 712 345 678',
    city: 'București',
    region: 'Ilfov',
    bio: 'Cont de test cu acces complet.',
    areasOfExpertise: ['Drept civil', 'Drept penal', 'Dreptul familiei'],
    spokenLanguages: ['Română', 'Engleză'],
    isVerified: true,
    subStatus: 'ACTIVE',
    subCurrentEnd: new Date('2099-01-01'),
  },
});

console.log('✅ Super user creat/actualizat:');
console.log('   Email:   ', email);
console.log('   Parolă:  ', password);
console.log('   ID:      ', jurist.id);

await prisma.$disconnect();
