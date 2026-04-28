export type Severity = 'info' | 'warning' | 'danger';

export type Issue = {
  name: string;
  symptoms: string;
  treatment: string;
  severity: Severity;
};

export type Plant = {
  id: string;
  commonName: string;
  scientificName: string;
  image: string;
  light: string;
  water: string;
  temp: string;
  toxic: boolean;
  origin: string;
  inStore: boolean;
  price?: string;
  description: string;
  pests: Issue[];
  diseases: Issue[];
  tips: string[];
};

export const plants: Plant[] = [
  {
    id: 'monstera',
    commonName: 'Monstera Deliciosa',
    scientificName: 'Monstera deliciosa',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80',
    light: 'Media-alta indirecta',
    water: '2x semana',
    temp: '18-27°C',
    toxic: true,
    origin: 'Selvas tropicales de México y Centroamérica',
    inStore: true,
    price: '₡8 500',
    description:
      'Conocida como "Costilla de Adán", es una de las plantas de interior más populares por sus hojas grandes y perforadas. Crece rápido en climas cálidos como el costarricense.',
    pests: [
      {
        name: 'Cochinillas',
        symptoms: 'Manchas blancas algodonosas en el envés de las hojas y tallos.',
        treatment:
          'Limpiar con alcohol isopropílico al 70% con un hisopo. Repetir cada 3 días por 2 semanas.',
        severity: 'warning',
      },
      {
        name: 'Araña roja',
        symptoms: 'Hojas con puntitos amarillos y telarañas finas en el envés.',
        treatment:
          'Aumentar la humedad ambiental, ducha con agua tibia y jabón potásico semanal.',
        severity: 'danger',
      },
    ],
    diseases: [
      {
        name: 'Pudrición de raíz',
        symptoms:
          'Hojas amarillas, tallo blando en la base, olor a tierra húmeda fermentada.',
        treatment:
          'Sacar de la maceta, cortar raíces podridas, replantar en sustrato nuevo con buen drenaje.',
        severity: 'danger',
      },
    ],
    tips: [
      'Limpia las hojas con un paño húmedo cada 2 semanas para que respiren mejor.',
      'Pon un tutor de musgo si querés que crezca hacia arriba con hojas más grandes.',
      'En Costa Rica florece poco como planta de interior — no te preocupes si no ves flores.',
    ],
  },
  {
    id: 'helecho',
    commonName: 'Helecho Boston',
    scientificName: 'Nephrolepis exaltata',
    image: 'https://images.unsplash.com/photo-1597055181449-b3979fc88dc4?w=800&q=80',
    light: 'Sombra parcial',
    water: '3x semana',
    temp: '18-24°C',
    toxic: false,
    origin: 'Regiones tropicales del mundo',
    inStore: true,
    price: '₡5 200',
    description:
      'Helecho colgante perfecto para corredores, baños y áreas con humedad. Aporta frescura y purifica el aire.',
    pests: [
      {
        name: 'Mosca blanca',
        symptoms: 'Pequeños insectos blancos voladores al sacudir la planta.',
        treatment: 'Trampas amarillas adhesivas + spray de neem cada semana.',
        severity: 'warning',
      },
    ],
    diseases: [
      {
        name: 'Hojas marrones por aire seco',
        symptoms: 'Puntas de las frondas se vuelven cafés y crujientes.',
        treatment:
          'Aumentar humedad: bandeja con piedras y agua bajo la maceta, o nebulizar diario.',
        severity: 'info',
      },
    ],
    tips: [
      'Le encantan los baños con luz natural — la humedad es perfecta.',
      'Nunca dejes la tierra completamente seca, pierde frondas rápido.',
    ],
  },
  {
    id: 'suculenta',
    commonName: 'Echeveria',
    scientificName: 'Echeveria elegans',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&q=80',
    light: 'Sol directo o muy brillante',
    water: '1x semana',
    temp: '15-28°C',
    toxic: false,
    origin: 'México y Centroamérica',
    inStore: true,
    price: '₡2 800',
    description:
      'Suculenta en forma de roseta, ideal para principiantes. Resiste sequía y ama el sol.',
    pests: [
      {
        name: 'Cochinilla algodonosa',
        symptoms: 'Manchas blancas entre las hojas en la base de la roseta.',
        treatment: 'Hisopo con alcohol, aislar de otras suculentas.',
        severity: 'warning',
      },
    ],
    diseases: [
      {
        name: 'Etiolación',
        symptoms: 'La planta se estira y pierde forma compacta buscando luz.',
        treatment: 'Mover a ventana con sol directo de mañana.',
        severity: 'info',
      },
    ],
    tips: [
      'Riega solo cuando la tierra esté completamente seca, mejor de menos que de más.',
      'Si una hoja cae, podés plantarla y nace una nueva planta.',
    ],
  },
  {
    id: 'hortensia',
    commonName: 'Hortensia',
    scientificName: 'Hydrangea macrophylla',
    image: 'https://images.unsplash.com/photo-1572395072824-23a0bcc60c00?w=800&q=80',
    light: 'Sol de mañana, sombra de tarde',
    water: 'Diario en verano',
    temp: '15-25°C',
    toxic: true,
    origin: 'Asia',
    inStore: true,
    price: '₡6 800',
    description:
      'Arbusto con flores en pompones que cambian de color según el pH del suelo: azul en suelos ácidos, rosa en alcalinos.',
    pests: [
      {
        name: 'Pulgones',
        symptoms: 'Brotes nuevos pegajosos con insectos verdes pequeños.',
        treatment: 'Spray de jabón potásico cada 5 días hasta eliminar.',
        severity: 'warning',
      },
    ],
    diseases: [
      {
        name: 'Oídio',
        symptoms: 'Polvo blanco sobre las hojas, especialmente en época húmeda.',
        treatment: 'Mejorar ventilación, fungicida a base de azufre.',
        severity: 'warning',
      },
    ],
    tips: [
      'En Cartago crecen espectaculares por el clima fresco.',
      'Para azul intenso: añadir sulfato de aluminio al suelo cada 2 meses.',
    ],
  },
  {
    id: 'rosa',
    commonName: 'Rosa amarilla',
    scientificName: 'Rosa hybrida',
    image: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=800&q=80',
    light: 'Sol pleno (mín 6 horas)',
    water: '2-3x semana',
    temp: '15-26°C',
    toxic: false,
    origin: 'Cultivar híbrido',
    inStore: true,
    price: '₡4 500',
    description:
      'Variedad clásica de rosa de jardín. Floración recurrente con cuidados básicos.',
    pests: [
      {
        name: 'Áfidos',
        symptoms: 'Pulgones verdes en brotes nuevos y botones florales.',
        treatment: 'Jabón potásico o catarinas como control biológico.',
        severity: 'warning',
      },
    ],
    diseases: [
      {
        name: 'Mancha negra',
        symptoms: 'Manchas negras circulares en hojas, amarillamiento.',
        treatment: 'Retirar hojas afectadas, fungicida cobre, mejorar ventilación.',
        severity: 'warning',
      },
    ],
    tips: [
      'Podá las flores marchitas para estimular nueva floración.',
      'Abono balanceado cada 6 semanas durante floración.',
    ],
  },
];

export function getPlantById(id: string): Plant | undefined {
  return plants.find((p) => p.id === id);
}

export const reminders = [
  {
    id: 1,
    plantId: 'monstera',
    icon: '💧',
    task: 'Regar tu Monstera',
    subtitle: 'Hace 5 días sin agua',
    urgent: true,
  },
  {
    id: 2,
    plantId: 'helecho',
    icon: '🌿',
    task: 'Nebulizar el Helecho',
    subtitle: 'Aire seco esta semana',
    urgent: false,
  },
  {
    id: 3,
    plantId: 'suculenta',
    icon: '☀️',
    task: 'Mover Echeveria al sol',
    subtitle: 'Está estirándose',
    urgent: false,
  },
];

export const articles = [
  {
    id: 1,
    title: 'Cómo cuidar orquídeas en clima de Cartago',
    excerpt:
      'Las temperaturas frescas son ideales, pero hay 3 errores que matan más orquídeas que las plagas.',
    image: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=600&q=80',
  },
  {
    id: 2,
    title: 'Taller: trasplante de cactus y suculentas',
    excerpt:
      'Sábado 3 de mayo · 9am · Vivero El Zamorano · Cupo limitado',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&q=80',
  },
];
