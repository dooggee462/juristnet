import 'dotenv/config';
import prisma from './prisma.js';

const CATEGORIES_DATA = [
  {
    name: 'Juridic',
    slug: 'juridic',
    subProfessions: ['Avocat', 'Jurist', 'Notar', 'Executor judecătoresc'],
  },
  {
    name: 'Medical',
    slug: 'medical',
    subProfessions: ['Medic specialist', 'Stomatolog', 'Psiholog', 'Kinetoterapeut'],
  },
  {
    name: 'Construcții',
    slug: 'constructii',
    subProfessions: ['Arhitect', 'Inginer constructor', 'Electrician', 'Instalator', 'Designer interior'],
  },
  {
    name: 'IT',
    slug: 'it',
    subProfessions: ['Full-Stack Developer', 'Web Developer', 'IT Support Specialist', 'UI/UX Designer'],
  },
  {
    name: 'Contabilitate & Business',
    slug: 'contabilitate-business',
    subProfessions: ['Contabil', 'Auditor', 'Specialist HR', 'Consultant afaceri'],
  },
  {
    name: 'Educație',
    slug: 'educatie',
    subProfessions: ['Profesor/Meditator', 'Traducător', 'Logoped'],
  },
  {
    name: 'Auto',
    slug: 'auto',
    subProfessions: ['Mecanic auto', 'Electrician auto', 'Instructor auto'],
  },
  {
    name: 'Frumusețe',
    slug: 'frumusete',
    subProfessions: ['Cosmetolog', 'Hairstylist', 'Make-up artist', 'Maseur'],
  },
  {
    name: 'Evenimente',
    slug: 'evenimente',
    subProfessions: ['Fotograf/Videograf', 'Organizator evenimente', 'Specialist Marketing'],
  },
  {
    name: 'Casnice',
    slug: 'casnice',
    subProfessions: ['Specialist curățenie', 'Meșter universal', 'Bonă'],
  },
  {
    name: 'Agricultură & Animale',
    slug: 'agricultura-animale',
    subProfessions: ['Medic veterinar', 'Inginer agronom', 'Peisagist'],
  },
];

async function seedCategories() {
  console.log('Seeding categories...');

  for (const cat of CATEGORIES_DATA) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });

    for (const spName of cat.subProfessions) {
      const exists = await prisma.subProfession.findFirst({
        where: { name: spName, categoryId: category.id },
      });
      if (!exists) {
        await prisma.subProfession.create({
          data: { name: spName, categoryId: category.id },
        });
      }
    }

    console.log(`  ✓ ${cat.name} (${cat.subProfessions.length} sub-professions)`);
  }

  console.log('Categories seeded successfully!');
  await prisma.$disconnect();
}

seedCategories().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
