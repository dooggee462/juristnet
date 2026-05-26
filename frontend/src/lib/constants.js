export const MOLDOVA_REGIONS = [
  'Chișinău', 'Bălți', 'Bender', 'Cahul', 'Soroca', 'Orhei', 'Ungheni',
  'Anenii Noi', 'Basarabeasca', 'Briceni', 'Călărași', 'Cantemir',
  'Căușeni', 'Cimișlia', 'Criuleni', 'Dondușeni', 'Drochia', 'Dubăsari',
  'Edineț', 'Fălești', 'Florești', 'Glodeni', 'Hîncești', 'Ialoveni',
  'Leova', 'Nisporeni', 'Ocnița', 'Rezina', 'Rîșcani', 'Șoldănești',
  'Strășeni', 'Ștefan Vodă', 'Taraclia', 'Telenești', 'Comrat (UTA Găgăuzia)',
];

export const CATEGORIES = [
  { name: 'Juridic', slug: 'juridic', subProfessions: ['Avocat', 'Jurist', 'Notar', 'Executor judecătoresc'] },
  { name: 'Medical', slug: 'medical', subProfessions: ['Medic specialist', 'Stomatolog', 'Psiholog', 'Kinetoterapeut'] },
  { name: 'Construcții', slug: 'constructii', subProfessions: ['Arhitect', 'Inginer constructor', 'Electrician', 'Instalator', 'Designer interior'] },
  { name: 'IT', slug: 'it', subProfessions: ['Full-Stack Developer', 'Web Developer', 'IT Support Specialist', 'UI/UX Designer'] },
  { name: 'Contabilitate & Business', slug: 'contabilitate-business', subProfessions: ['Contabil', 'Auditor', 'Specialist HR', 'Consultant afaceri'] },
  { name: 'Educație', slug: 'educatie', subProfessions: ['Profesor/Meditator', 'Traducător', 'Logoped'] },
  { name: 'Auto', slug: 'auto', subProfessions: ['Mecanic auto', 'Electrician auto', 'Instructor auto'] },
  { name: 'Frumusețe', slug: 'frumusete', subProfessions: ['Cosmetolog', 'Hairstylist', 'Make-up artist', 'Maseur'] },
  { name: 'Evenimente', slug: 'evenimente', subProfessions: ['Fotograf/Videograf', 'Organizator evenimente', 'Specialist Marketing'] },
  { name: 'Casnice', slug: 'casnice', subProfessions: ['Specialist curățenie', 'Meșter universal', 'Bonă'] },
  { name: 'Agricultură & Animale', slug: 'agricultura-animale', subProfessions: ['Medic veterinar', 'Inginer agronom', 'Peisagist'] },
];

export const EXPERTISE_OPTIONS = CATEGORIES.flatMap((c) => c.subProfessions);

export const LANGUAGE_OPTIONS = [
  'Română', 'Rusă', 'Engleză', 'Franceză', 'Germană', 'Spaniolă',
];

export const PHONE_PREFIX = '+373';
export const DEFAULT_COUNTRY = 'Republica Moldova';
