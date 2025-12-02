export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: 'Clinker' | 'Gres' | 'Multicolor' | 'Esmaltado' | 'Plaqueta Lisa' | 'Plaqueta Texturada' | 'Plaqueta Larga' | 'Plaqueta Esmaltada';
  precio: number;
  stock: number;
  rating: number;
  dimensiones: string;
  imagenes: string[];
  datosTecnicos: {
    absorcionAgua: string;
    succionInicial: string;
    resistenciaCompresion: string;
    eflorescencias: string;
    heladicidad: string;
  };
}

export const PRODUCTS: Product[] = [
  // ============= LADRILLOS CLINKER (11 modelos) =============
  {
    id: 'clinker-blanco',
    nombre: 'CLINKER BLANCO',
    descripcion: 'Ladrillo clinker de color blanco puro. Alta resistencia a la intemperie y excelente durabilidad. Perfecto para fachadas modernas y elegantes con acabado limpio.',
    categoria: 'Clinker',
    precio: 1.15,
    stock: 8000,
    rating: 4.9,
    dimensiones: '237x113x48mm',
    imagenes: [
      'https://placehold.co/800x600/FFFFFF/333333?text=CLINKER+BLANCO',
      'https://placehold.co/800x600/F5F5F5/333333?text=CLINKER+BLANCO',
      'https://placehold.co/800x600/FAFAFA/333333?text=CLINKER+BLANCO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 20 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'clinker-diana',
    nombre: 'CLINKER DIANA',
    descripcion: 'Ladrillo clinker en tonalidad beige claro. Estética limpia y moderna que aporta luminosidad. Fabricado en España y América del Norte para proyectos de alta calidad.',
    categoria: 'Clinker',
    precio: 1.20,
    stock: 7500,
    rating: 4.7,
    dimensiones: '237x113x47-52-72mm',
    imagenes: [
      'https://placehold.co/800x600/EAE3D6/333333?text=CLINKER+DIANA',
      'https://placehold.co/800x600/E8DFD2/333333?text=CLINKER+DIANA',
      'https://placehold.co/800x600/EDE6DA/333333?text=CLINKER+DIANA'
    ],
    datosTecnicos: {
      absorcionAgua: '5 – 6 %',
      succionInicial: '0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'clinker-cibeles',
    nombre: 'CLINKER CIBELES',
    descripcion: 'Ladrillo clinker en tono gris claro / blanco roto. Acabado elegante y uniforme, versátil para cualquier estilo. Proyecto emblemático en Filadelfia, USA.',
    categoria: 'Clinker',
    precio: 1.18,
    stock: 7800,
    rating: 4.8,
    dimensiones: '237x113x47mm',
    imagenes: [
      'https://placehold.co/800x600/E8E8E0/333333?text=CLINKER+CIBELES',
      'https://placehold.co/800x600/EBEBDF/333333?text=CLINKER+CIBELES',
      'https://placehold.co/800x600/E5E5DC/333333?text=CLINKER+CIBELES'
    ],
    datosTecnicos: {
      absorcionAgua: '≤ 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'clinker-hera',
    nombre: 'CLINKER HERA',
    descripcion: 'Ladrillo clinker de color gris oscuro / antracita. Elegancia y sobriedad para proyectos de alta gama. Excelente uniformidad cromática.',
    categoria: 'Clinker',
    precio: 1.30,
    stock: 6000,
    rating: 4.6,
    dimensiones: '236x112x48mm',
    imagenes: [
      'https://placehold.co/800x600/6A6A6A/FFFFFF?text=CLINKER+HERA',
      'https://placehold.co/800x600/707070/FFFFFF?text=CLINKER+HERA',
      'https://placehold.co/800x600/656565/FFFFFF?text=CLINKER+HERA'
    ],
    datosTecnicos: {
      absorcionAgua: '≤ 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'clinker-ares',
    nombre: 'CLINKER ARES',
    descripcion: 'Ladrillo clinker en tono beige / tan. Aporta calidez y un toque natural a las construcciones. Baja absorción de agua para mayor durabilidad.',
    categoria: 'Clinker',
    precio: 1.22,
    stock: 7000,
    rating: 4.5,
    dimensiones: '236x112x48-52-72mm',
    imagenes: [
      'https://placehold.co/800x600/D4B79E/333333?text=CLINKER+ARES',
      'https://placehold.co/800x600/D8BBA2/333333?text=CLINKER+ARES',
      'https://placehold.co/800x600/D0B39A/333333?text=CLINKER+ARES'
    ],
    datosTecnicos: {
      absorcionAgua: '4 – 5 %',
      succionInicial: '0,8 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'clinker-hermes',
    nombre: 'CLINKER HERMES',
    descripcion: 'Ladrillo clinker de tonalidad rojiza / terracota. Un clásico atemporal que nunca pasa de moda. Excelente resistencia a la succión.',
    categoria: 'Clinker',
    precio: 1.10,
    stock: 9000,
    rating: 4.7,
    dimensiones: '236x112x48-52-72mm',
    imagenes: [
      'https://placehold.co/800x600/B87A6B/FFFFFF?text=CLINKER+HERMES',
      'https://placehold.co/800x600/BD7F70/FFFFFF?text=CLINKER+HERMES',
      'https://placehold.co/800x600/B37566/FFFFFF?text=CLINKER+HERMES'
    ],
    datosTecnicos: {
      absorcionAgua: '4 – 5 %',
      succionInicial: '≤ 0,5 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'clinker-ceniza',
    nombre: 'CLINKER CENIZA',
    descripcion: 'Ladrillo clinker en tono ceniza claro. Perfecto para crear ambientes sofisticados y contemporáneos con acabados grises profesionales.',
    categoria: 'Clinker',
    precio: 1.25,
    stock: 5500,
    rating: 4.6,
    dimensiones: '236x112x48mm',
    imagenes: [
      'https://placehold.co/800x600/CFCFC4/333333?text=CLINKER+CENIZA',
      'https://placehold.co/800x600/D3D3C8/333333?text=CLINKER+CENIZA',
      'https://placehold.co/800x600/CBCBC0/333333?text=CLINKER+CENIZA'
    ],
    datosTecnicos: {
      absorcionAgua: '5 – 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'clinker-atlas',
    nombre: 'CLINKER ATLAS',
    descripcion: 'Ladrillo clinker en tono beige verdoso. Estilo único para proyectos diferenciadores. Obra destacada: 292 Fifth Avenue, Nueva York.',
    categoria: 'Clinker',
    precio: 1.28,
    stock: 5300,
    rating: 4.5,
    dimensiones: '236x112x48mm',
    imagenes: [
      'https://placehold.co/800x600/D9D9C7/333333?text=CLINKER+ATLAS',
      'https://placehold.co/800x600/DDDDCB/333333?text=CLINKER+ATLAS',
      'https://placehold.co/800x600/D5D5C3/333333?text=CLINKER+ATLAS'
    ],
    datosTecnicos: {
      absorcionAgua: '5 – 6 %',
      succionInicial: '0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'clinker-apolo-manhattan',
    nombre: 'CLINKER APOLO MANHATTAN',
    descripcion: 'Ladrillo clinker en tono gris medio. Moderno y versátil para aplicaciones contemporáneas. Acabado profesional de alta calidad.',
    categoria: 'Clinker',
    precio: 1.32,
    stock: 5100,
    rating: 4.7,
    dimensiones: '236x112x48mm',
    imagenes: [
      'https://placehold.co/800x600/8A8A85/FFFFFF?text=APOLO+MANHATTAN',
      'https://placehold.co/800x600/8F8F8A/FFFFFF?text=APOLO+MANHATTAN',
      'https://placehold.co/800x600/858580/FFFFFF?text=APOLO+MANHATTAN'
    ],
    datosTecnicos: {
      absorcionAgua: '≤ 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'clinker-gris',
    nombre: 'CLINKER GRIS',
    descripcion: 'Ladrillo clinker en tono gris profesional. Usado en el primer proyecto de McDonald\'s USA con Cerámicas Mora. Resistencia excepcional.',
    categoria: 'Clinker',
    precio: 1.35,
    stock: 5000,
    rating: 4.8,
    dimensiones: '236x112x48-52-72mm',
    imagenes: [
      'https://placehold.co/800x600/8B8B8B/FFFFFF?text=CLINKER+GRIS',
      'https://placehold.co/800x600/909090/FFFFFF?text=CLINKER+GRIS',
      'https://placehold.co/800x600/868686/FFFFFF?text=CLINKER+GRIS'
    ],
    datosTecnicos: {
      absorcionAgua: '4 – 5 %',
      succionInicial: '≤ 0,8 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'clinker-negro',
    nombre: 'CLINKER NEGRO',
    descripcion: 'Ladrillo clinker en tono negro antracita. Incluye versión metalizada con reflejos negros para proyectos contemporáneos y de vanguardia.',
    categoria: 'Clinker',
    precio: 1.40,
    stock: 4800,
    rating: 4.9,
    dimensiones: '236x112x48mm',
    imagenes: [
      'https://placehold.co/800x600/2A2A2A/FFFFFF?text=CLINKER+NEGRO',
      'https://placehold.co/800x600/333333/FFFFFF?text=CLINKER+NEGRO',
      'https://placehold.co/800x600/252525/FFFFFF?text=CLINKER+NEGRO'
    ],
    datosTecnicos: {
      absorcionAgua: '5 – 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },

  // ============= LADRILLOS GRES / STONEWARE (6 modelos) =============
  {
    id: 'gres-baco',
    nombre: 'GRES BACO',
    descripcion: 'Ladrillo de gres en múltiples espesores. Excelente para proyectos que requieren versatilidad dimensional y alta calidad estética.',
    categoria: 'Gres',
    precio: 1.05,
    stock: 6500,
    rating: 4.5,
    dimensiones: '233x110x48-52-72mm',
    imagenes: [
      'https://placehold.co/800x600/A08070/FFFFFF?text=GRES+BACO',
      'https://placehold.co/800x600/A58575/FFFFFF?text=GRES+BACO',
      'https://placehold.co/800x600/9B7B6B/FFFFFF?text=GRES+BACO'
    ],
    datosTecnicos: {
      absorcionAgua: '5 – 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 18 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'gres-blanco-nieve',
    nombre: 'GRES BLANCO NIEVE',
    descripcion: 'Gres blanco de máxima pureza y brillantez. Ideal para proyectos que buscan luminosidad y limpieza visual absoluta.',
    categoria: 'Gres',
    precio: 1.12,
    stock: 6000,
    rating: 4.7,
    dimensiones: '233x110x48mm',
    imagenes: [
      'https://placehold.co/800x600/FAFAFA/333333?text=GRES+BLANCO+NIEVE',
      'https://placehold.co/800x600/FFFFFF/333333?text=GRES+BLANCO+NIEVE',
      'https://placehold.co/800x600/F5F5F5/333333?text=GRES+BLANCO+NIEVE'
    ],
    datosTecnicos: {
      absorcionAgua: '5 – 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 18 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'gres-rojo-liso',
    nombre: 'GRES ROJO LISO',
    descripcion: 'Gres rojo con acabado liso y uniforme. Perfecto para obras clásicas y contemporáneas que requieren tonalidades cálidas.',
    categoria: 'Gres',
    precio: 1.08,
    stock: 6200,
    rating: 4.6,
    dimensiones: '233x110x48mm',
    imagenes: [
      'https://placehold.co/800x600/B85C4A/FFFFFF?text=GRES+ROJO+LISO',
      'https://placehold.co/800x600/BD614F/FFFFFF?text=GRES+ROJO+LISO',
      'https://placehold.co/800x600/B35745/FFFFFF?text=GRES+ROJO+LISO'
    ],
    datosTecnicos: {
      absorcionAgua: '5 – 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 18 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'gres-venus',
    nombre: 'GRES VENUS',
    descripcion: 'Gres con textura y variaciones cromáticas. Acabado único que aporta profundidad visual y carácter a las fachadas.',
    categoria: 'Gres',
    precio: 1.15,
    stock: 5800,
    rating: 4.7,
    dimensiones: '233x110x48mm',
    imagenes: [
      'https://placehold.co/800x600/C9B5A0/333333?text=GRES+VENUS',
      'https://placehold.co/800x600/CDBAA5/333333?text=GRES+VENUS',
      'https://placehold.co/800x600/C5B09B/333333?text=GRES+VENUS'
    ],
    datosTecnicos: {
      absorcionAgua: '5 – 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 18 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'gres-vulcano',
    nombre: 'GRES VULCANO',
    descripcion: 'Gres en tonalidades oscuras con efecto volcánico. Ideal para proyectos que buscan impacto visual y dramatismo.',
    categoria: 'Gres',
    precio: 1.18,
    stock: 5500,
    rating: 4.8,
    dimensiones: '233x110x48mm',
    imagenes: [
      'https://placehold.co/800x600/4A4A4A/FFFFFF?text=GRES+VULCANO',
      'https://placehold.co/800x600/505050/FFFFFF?text=GRES+VULCANO',
      'https://placehold.co/800x600/454545/FFFFFF?text=GRES+VULCANO'
    ],
    datosTecnicos: {
      absorcionAgua: '5 – 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 18 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'gres-blanco-m8',
    nombre: 'BLANCO M-8',
    descripcion: 'Gres blanco especial con formato único. Diseño exclusivo para proyectos arquitectónicos de autor que buscan diferenciación.',
    categoria: 'Gres',
    precio: 1.20,
    stock: 5200,
    rating: 4.6,
    dimensiones: '233x110x48mm',
    imagenes: [
      'https://placehold.co/800x600/F8F8F8/333333?text=BLANCO+M-8',
      'https://placehold.co/800x600/FFFFFF/333333?text=BLANCO+M-8',
      'https://placehold.co/800x600/F3F3F3/333333?text=BLANCO+M-8'
    ],
    datosTecnicos: {
      absorcionAgua: '5 – 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 18 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },

  // ============= LADRILLOS MULTICOLOR Y TEXTURADOS (9 modelos) =============
  {
    id: 'multicolor-aura',
    nombre: 'AURA',
    descripcion: 'Ladrillo multicolor con tonalidades elegantes destonificadas. Nueva línea que combina diversos colores naturales para un acabado único.',
    categoria: 'Multicolor',
    precio: 1.35,
    stock: 4800,
    rating: 4.8,
    dimensiones: '237x113x47-52-72mm',
    imagenes: [
      'https://placehold.co/800x600/C8B5A0/333333?text=AURA',
      'https://placehold.co/800x600/CCBAA5/333333?text=AURA',
      'https://placehold.co/800x600/C4B09B/333333?text=AURA'
    ],
    datosTecnicos: {
      absorcionAgua: '≤ 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'multicolor-aura-texturado',
    nombre: 'AURA TEXTURADO',
    descripcion: 'Ladrillo multicolor con acabado texturado. Combina la paleta cromática de Aura con relieve y profundidad visual excepcional.',
    categoria: 'Multicolor',
    precio: 1.40,
    stock: 4600,
    rating: 4.9,
    dimensiones: '237x113x47-52-72mm',
    imagenes: [
      'https://placehold.co/800x600/C8B5A0/333333?text=AURA+TEXTURADO',
      'https://placehold.co/800x600/CCBAA5/333333?text=AURA+TEXTURADO',
      'https://placehold.co/800x600/C4B09B/333333?text=AURA+TEXTURADO'
    ],
    datosTecnicos: {
      absorcionAgua: '≤ 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'multicolor-ceres',
    nombre: 'CERES',
    descripcion: 'Ladrillo multicolor con acabado beige claro destonificado. Calidez mediterránea para ambientes acogedores con variaciones naturales.',
    categoria: 'Multicolor',
    precio: 1.28,
    stock: 5100,
    rating: 4.6,
    dimensiones: '236x112x48mm',
    imagenes: [
      'https://placehold.co/800x600/DBCDBB/333333?text=CERES',
      'https://placehold.co/800x600/DFD1C0/333333?text=CERES',
      'https://placehold.co/800x600/D7C9B6/333333?text=CERES'
    ],
    datosTecnicos: {
      absorcionAgua: '≤ 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'multicolor-ceres-texturado',
    nombre: 'CERES TEXTURADO',
    descripcion: 'Ladrillo multicolor Ceres con acabado texturado. Combina calidez y textura para un acabado único con profundidad táctil.',
    categoria: 'Multicolor',
    precio: 1.32,
    stock: 4900,
    rating: 4.7,
    dimensiones: '236x112x48mm',
    imagenes: [
      'https://placehold.co/800x600/DBCDBB/333333?text=CERES+TEXTURADO',
      'https://placehold.co/800x600/DFD1C0/333333?text=CERES+TEXTURADO',
      'https://placehold.co/800x600/D7C9B6/333333?text=CERES+TEXTURADO'
    ],
    datosTecnicos: {
      absorcionAgua: '≤ 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'multicolor-urano',
    nombre: 'URANO',
    descripcion: 'Ladrillo con efecto destonificado especial. Usado en proyectos emblemáticos en Bélgica. Variaciones cromáticas sofisticadas.',
    categoria: 'Multicolor',
    precio: 1.38,
    stock: 4500,
    rating: 4.8,
    dimensiones: '236x112x48-52-72mm',
    imagenes: [
      'https://placehold.co/800x600/9A8575/FFFFFF?text=URANO',
      'https://placehold.co/800x600/9F8A7A/FFFFFF?text=URANO',
      'https://placehold.co/800x600/958070/FFFFFF?text=URANO'
    ],
    datosTecnicos: {
      absorcionAgua: '≤ 6 %',
      succionInicial: '≤ 0,8 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'multicolor-urano-texturado',
    nombre: 'URANO TEXTURADO',
    descripcion: 'Ladrillo Urano con acabado texturado. Combina el efecto destonificado con textura para máxima profundidad visual.',
    categoria: 'Multicolor',
    precio: 1.42,
    stock: 4300,
    rating: 4.9,
    dimensiones: '236x112x48-52-72mm',
    imagenes: [
      'https://placehold.co/800x600/9A8575/FFFFFF?text=URANO+TEXTURADO',
      'https://placehold.co/800x600/9F8A7A/FFFFFF?text=URANO+TEXTURADO',
      'https://placehold.co/800x600/958070/FFFFFF?text=URANO+TEXTURADO'
    ],
    datosTecnicos: {
      absorcionAgua: '≤ 6 %',
      succionInicial: '≤ 0,8 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'multicolor-neptuno',
    nombre: 'NEPTUNO',
    descripcion: 'Ladrillo multicolor de acabado fino. Ideal para proyectos que requieren delicadeza cromática y transiciones suaves de color.',
    categoria: 'Multicolor',
    precio: 1.25,
    stock: 5300,
    rating: 4.5,
    dimensiones: '233x110x48-52-72mm',
    imagenes: [
      'https://placehold.co/800x600/A89080/333333?text=NEPTUNO',
      'https://placehold.co/800x600/AC9585/333333?text=NEPTUNO',
      'https://placehold.co/800x600/A48B7B/333333?text=NEPTUNO'
    ],
    datosTecnicos: {
      absorcionAgua: '≤ 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 18 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'multicolor-neptuno-texturado',
    nombre: 'NEPTUNO TEXTURADO',
    descripcion: 'Ladrillo Neptuno con acabado texturado. Combina suavidad cromática con textura táctil para proyectos de acabado fino.',
    categoria: 'Multicolor',
    precio: 1.30,
    stock: 5100,
    rating: 4.6,
    dimensiones: '233x110x48-52-72mm',
    imagenes: [
      'https://placehold.co/800x600/A89080/333333?text=NEPTUNO+TEXT',
      'https://placehold.co/800x600/AC9585/333333?text=NEPTUNO+TEXT',
      'https://placehold.co/800x600/A48B7B/333333?text=NEPTUNO+TEXT'
    ],
    datosTecnicos: {
      absorcionAgua: '≤ 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 18 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'multicolor-vesta',
    nombre: 'VESTA',
    descripcion: 'Ladrillo multicolor con paleta cromática variada. Perfecto para proyectos que buscan riqueza visual y carácter único.',
    categoria: 'Multicolor',
    precio: 1.33,
    stock: 4700,
    rating: 4.7,
    dimensiones: '236x112x48mm',
    imagenes: [
      'https://placehold.co/800x600/B59585/333333?text=VESTA',
      'https://placehold.co/800x600/B99A8A/333333?text=VESTA',
      'https://placehold.co/800x600/B19080/333333?text=VESTA'
    ],
    datosTecnicos: {
      absorcionAgua: '≤ 6 %',
      succionInicial: '≤ 0,8 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },

  // ============= LADRILLOS ESMALTADOS =============
  {
    id: 'esmaltado-ral',
    nombre: 'LADRILLO ESMALTADO RAL',
    descripcion: 'Ladrillo personalizable en cualquier color RAL bajo demanda. Incluye colores metalizados. Perfecto para proyectos singulares y de autor que requieren colores específicos.',
    categoria: 'Esmaltado',
    precio: 2.50,
    stock: 1000,
    rating: 5.0,
    dimensiones: '237x113x47-52-72mm',
    imagenes: [
      'https://placehold.co/800x600/FF6B6B/FFFFFF?text=ESMALTADO+RAL',
      'https://placehold.co/800x600/4ECDC4/FFFFFF?text=ESMALTADO+RAL',
      'https://placehold.co/800x600/FFE66D/333333?text=ESMALTADO+RAL'
    ],
    datosTecnicos: {
      absorcionAgua: '5 – 6 %',
      succionInicial: '≤ 0,6 kgs / (m² x min)',
      resistenciaCompresion: '≥ 40 N/mm²',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },

  // ============= PLAQUETAS LISAS (5 modelos) =============
  {
    id: 'plaqueta-blanco',
    nombre: 'PLAQUETA BLANCO',
    descripcion: 'Plaqueta Thin Brick lisa en color blanco puro. Espesor 20mm. Perfecta para espacios luminosos y modernos. Fácil instalación.',
    categoria: 'Plaqueta Lisa',
    precio: 0.95,
    stock: 6000,
    rating: 4.7,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/FFFFFF/333333?text=PLAQUETA+BLANCO',
      'https://placehold.co/800x600/FAFAFA/333333?text=PLAQUETA+BLANCO',
      'https://placehold.co/800x600/F5F5F5/333333?text=PLAQUETA+BLANCO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2400 N rotura',
      resistenciaCompresion: '12 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-ceniza',
    nombre: 'PLAQUETA CENIZA',
    descripcion: 'Plaqueta Thin Brick en color ceniza/gris. Tonalidad neutra y contemporánea para diseños minimalistas. Alta resistencia.',
    categoria: 'Plaqueta Lisa',
    precio: 0.88,
    stock: 5500,
    rating: 4.4,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/C8C3BC/333333?text=PLAQUETA+CENIZA',
      'https://placehold.co/800x600/CCC7C0/333333?text=PLAQUETA+CENIZA',
      'https://placehold.co/800x600/C4BFB8/333333?text=PLAQUETA+CENIZA'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2800 N rotura',
      resistenciaCompresion: '14 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-nero',
    nombre: 'PLAQUETA NERO',
    descripcion: 'Plaqueta Thin Brick en color negro intenso. Máxima sofisticación para diseños vanguardistas. Resistencia excepcional.',
    categoria: 'Plaqueta Lisa',
    precio: 1.02,
    stock: 4600,
    rating: 4.7,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/2A2A2A/FFFFFF?text=PLAQUETA+NERO',
      'https://placehold.co/800x600/333333/FFFFFF?text=PLAQUETA+NERO',
      'https://placehold.co/800x600/252525/FFFFFF?text=PLAQUETA+NERO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2700 N rotura',
      resistenciaCompresion: '20 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-aura',
    nombre: 'PLAQUETA AURA',
    descripcion: 'Plaqueta Thin Brick lisa en tonos Aura multicolor. Acabado liso con variaciones cromáticas sutiles y elegantes.',
    categoria: 'Plaqueta Lisa',
    precio: 0.90,
    stock: 5000,
    rating: 4.5,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/C8B5A0/333333?text=PLAQUETA+AURA',
      'https://placehold.co/800x600/CCBAA5/333333?text=PLAQUETA+AURA',
      'https://placehold.co/800x600/C4B09B/333333?text=PLAQUETA+AURA'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2400 N rotura',
      resistenciaCompresion: '12 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-black-sapphire',
    nombre: 'PLAQUETA BLACK SAPPHIRE',
    descripcion: 'Plaqueta Thin Brick en color negro zafiro. Acabado sofisticado y elegante con tonalidad profunda y rica.',
    categoria: 'Plaqueta Lisa',
    precio: 1.05,
    stock: 4500,
    rating: 4.8,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/1A1A2E/FFFFFF?text=BLACK+SAPPHIRE',
      'https://placehold.co/800x600/16213E/FFFFFF?text=BLACK+SAPPHIRE',
      'https://placehold.co/800x600/0F3460/FFFFFF?text=BLACK+SAPPHIRE'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2700 N rotura',
      resistenciaCompresion: '20 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },

  // ============= PLAQUETAS TEXTURADAS (10 modelos) =============
  {
    id: 'plaqueta-blanco-texturado',
    nombre: 'PLAQUETA BLANCO TEXTURADO',
    descripcion: 'Plaqueta Thin Brick texturada en color blanco. Combina luminosidad con relieve distintivo para espacios con carácter.',
    categoria: 'Plaqueta Texturada',
    precio: 0.95,
    stock: 6000,
    rating: 4.7,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/EFEFEF/333333?text=BLANCO+TEXTURADO',
      'https://placehold.co/800x600/F5F5F5/333333?text=BLANCO+TEXTURADO',
      'https://placehold.co/800x600/FAFAFA/333333?text=BLANCO+TEXTURADO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2400 N rotura',
      resistenciaCompresion: '12 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-ceniza-texturado',
    nombre: 'PLAQUETA CENIZA TEXTURADO',
    descripcion: 'Plaqueta Thin Brick texturada en gris ceniza. Profundidad táctil y visual para diseños contemporáneos sofisticados.',
    categoria: 'Plaqueta Texturada',
    precio: 0.92,
    stock: 5500,
    rating: 4.6,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/C8C3BC/333333?text=CENIZA+TEXTURADO',
      'https://placehold.co/800x600/CCC7C0/333333?text=CENIZA+TEXTURADO',
      'https://placehold.co/800x600/C4BFB8/333333?text=CENIZA+TEXTURADO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2800 N rotura',
      resistenciaCompresion: '14 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-ceres-texturado',
    nombre: 'PLAQUETA CERES TEXTURADO',
    descripcion: 'Plaqueta Thin Brick texturada Ceres. Beige claro con textura que añade calidez mediterránea y dimensión táctil.',
    categoria: 'Plaqueta Texturada',
    precio: 0.89,
    stock: 5200,
    rating: 4.3,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/DBCDBB/333333?text=CERES+TEXTURADO',
      'https://placehold.co/800x600/DFD1C0/333333?text=CERES+TEXTURADO',
      'https://placehold.co/800x600/D7C9B6/333333?text=CERES+TEXTURADO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2400 N rotura',
      resistenciaCompresion: '12 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-hera-texturado',
    nombre: 'PLAQUETA HERA TEXTURADO',
    descripcion: 'Plaqueta Thin Brick texturada en tono Hera marrón. Versatilidad y elegancia con acabado de relieve en formato ligero.',
    categoria: 'Plaqueta Texturada',
    precio: 0.93,
    stock: 4700,
    rating: 4.6,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/A0948B/FFFFFF?text=HERA+TEXTURADO',
      'https://placehold.co/800x600/A59990/FFFFFF?text=HERA+TEXTURADO',
      'https://placehold.co/800x600/9B8F86/FFFFFF?text=HERA+TEXTURADO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2800 N rotura',
      resistenciaCompresion: '14 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-neptuno-texturado',
    nombre: 'PLAQUETA NEPTUNO TEXTURADO',
    descripcion: 'Plaqueta Thin Brick texturada Neptuno. Acabado fino con textura sutil para proyectos de alta calidad estética.',
    categoria: 'Plaqueta Texturada',
    precio: 0.91,
    stock: 4900,
    rating: 4.5,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/A89080/333333?text=NEPTUNO+TEXT',
      'https://placehold.co/800x600/AC9585/333333?text=NEPTUNO+TEXT',
      'https://placehold.co/800x600/A48B7B/333333?text=NEPTUNO+TEXT'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2400 N rotura',
      resistenciaCompresion: '12 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-nero-texturado',
    nombre: 'PLAQUETA NERO TEXTURADO',
    descripcion: 'Plaqueta Thin Brick texturada en negro. Máxima sofisticación con profundidad táctil para diseños vanguardistas.',
    categoria: 'Plaqueta Texturada',
    precio: 1.08,
    stock: 4400,
    rating: 4.8,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/2A2A2A/FFFFFF?text=NERO+TEXTURADO',
      'https://placehold.co/800x600/333333/FFFFFF?text=NERO+TEXTURADO',
      'https://placehold.co/800x600/252525/FFFFFF?text=NERO+TEXTURADO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2700 N rotura',
      resistenciaCompresion: '20 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-rojo-texturado',
    nombre: 'PLAQUETA ROJO TEXTURADO',
    descripcion: 'Plaqueta Thin Brick texturada en color rojo. Estética tradicional con instalación moderna, ligera y con relieve distintivo.',
    categoria: 'Plaqueta Texturada',
    precio: 0.92,
    stock: 7000,
    rating: 4.6,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/A85B4A/FFFFFF?text=ROJO+TEXTURADO',
      'https://placehold.co/800x600/AD604F/FFFFFF?text=ROJO+TEXTURADO',
      'https://placehold.co/800x600/A35645/FFFFFF?text=ROJO+TEXTURADO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '1700 N rotura',
      resistenciaCompresion: '12 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-aura-texturado',
    nombre: 'PLAQUETA AURA TEXTURADO',
    descripcion: 'Plaqueta Thin Brick texturada en tonos Aura. Combina variaciones cromáticas con textura para máxima riqueza visual.',
    categoria: 'Plaqueta Texturada',
    precio: 0.94,
    stock: 4800,
    rating: 4.7,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/C8B5A0/333333?text=AURA+TEXTURADO',
      'https://placehold.co/800x600/CCBAA5/333333?text=AURA+TEXTURADO',
      'https://placehold.co/800x600/C4B09B/333333?text=AURA+TEXTURADO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2400 N rotura',
      resistenciaCompresion: '12 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-apolo-manhattan-texturado',
    nombre: 'PLAQUETA APOLO MANHATTAN TEXTURADO',
    descripcion: 'Plaqueta Thin Brick texturada Apolo Manhattan. Gris medio con textura para acabados urbanos contemporáneos.',
    categoria: 'Plaqueta Texturada',
    precio: 0.98,
    stock: 4600,
    rating: 4.7,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/8A8A85/FFFFFF?text=APOLO+M.+TEXT',
      'https://placehold.co/800x600/8F8F8A/FFFFFF?text=APOLO+M.+TEXT',
      'https://placehold.co/800x600/858580/FFFFFF?text=APOLO+M.+TEXT'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2800 N rotura',
      resistenciaCompresion: '14 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-black-sapphire-texturado',
    nombre: 'PLAQUETA BLACK SAPPHIRE TEXTURADO',
    descripcion: 'Plaqueta Thin Brick texturada Black Sapphire. Negro zafiro con relieve para máximo impacto visual y sofisticación.',
    categoria: 'Plaqueta Texturada',
    precio: 1.10,
    stock: 4300,
    rating: 4.9,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/1A1A2E/FFFFFF?text=B.SAPPHIRE+TEXT',
      'https://placehold.co/800x600/16213E/FFFFFF?text=B.SAPPHIRE+TEXT',
      'https://placehold.co/800x600/0F3460/FFFFFF?text=B.SAPPHIRE+TEXT'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2700 N rotura',
      resistenciaCompresion: '20 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },

  // ============= PLAQUETAS LARGAS (4 modelos) =============
  {
    id: 'plaqueta-blanco-largo',
    nombre: 'PLAQUETA BLANCO LARGO',
    descripcion: 'Plaqueta Thin Brick en formato alargado, color blanco. Ideal para crear líneas horizontales elegantes y espacios más amplios visualmente.',
    categoria: 'Plaqueta Larga',
    precio: 1.10,
    stock: 3500,
    rating: 4.6,
    dimensiones: '290x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/FFFFFF/333333?text=BLANCO+LARGO',
      'https://placehold.co/800x600/FAFAFA/333333?text=BLANCO+LARGO',
      'https://placehold.co/800x600/F5F5F5/333333?text=BLANCO+LARGO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2400 N rotura',
      resistenciaCompresion: '12 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-ceniza-largo',
    nombre: 'PLAQUETA CENIZA LARGO',
    descripcion: 'Plaqueta Thin Brick en formato alargado, color ceniza. Líneas horizontales contemporáneas con tonalidad neutra y moderna.',
    categoria: 'Plaqueta Larga',
    precio: 1.05,
    stock: 3300,
    rating: 4.5,
    dimensiones: '290x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/C8C3BC/333333?text=CENIZA+LARGO',
      'https://placehold.co/800x600/CCC7C0/333333?text=CENIZA+LARGO',
      'https://placehold.co/800x600/C4BFB8/333333?text=CENIZA+LARGO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2800 N rotura',
      resistenciaCompresion: '14 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-nero-largo',
    nombre: 'PLAQUETA NERO LARGO',
    descripcion: 'Plaqueta Thin Brick en formato alargado, color negro. Líneas horizontales dramáticas para proyectos de máximo impacto visual.',
    categoria: 'Plaqueta Larga',
    precio: 1.15,
    stock: 3100,
    rating: 4.7,
    dimensiones: '290x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/2A2A2A/FFFFFF?text=NERO+LARGO',
      'https://placehold.co/800x600/333333/FFFFFF?text=NERO+LARGO',
      'https://placehold.co/800x600/252525/FFFFFF?text=NERO+LARGO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2700 N rotura',
      resistenciaCompresion: '20 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-apolo-manhattan-largo',
    nombre: 'PLAQUETA APOLO MANHATTAN LARGO',
    descripcion: 'Plaqueta Thin Brick en formato alargado, tono Apolo Manhattan. Gris medio en líneas horizontales para estética urbana moderna.',
    categoria: 'Plaqueta Larga',
    precio: 1.12,
    stock: 3200,
    rating: 4.6,
    dimensiones: '290x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/8A8A85/FFFFFF?text=APOLO+M.+LARGO',
      'https://placehold.co/800x600/8F8F8A/FFFFFF?text=APOLO+M.+LARGO',
      'https://placehold.co/800x600/858580/FFFFFF?text=APOLO+M.+LARGO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '2800 N rotura',
      resistenciaCompresion: '14 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },

  // ============= PLAQUETAS ESMALTADAS (7 colores) =============
  {
    id: 'plaqueta-esmaltada-blanco',
    nombre: 'PLAQUETA ESMALTADA BLANCO',
    descripcion: 'Plaqueta Thin Brick con acabado esmaltado en blanco brillante. Superficie vitrificada de fácil limpieza y máximo brillo.',
    categoria: 'Plaqueta Esmaltada',
    precio: 1.25,
    stock: 2800,
    rating: 4.7,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/FFFFFF/333333?text=ESM.+BLANCO',
      'https://placehold.co/800x600/F8F8F8/333333?text=ESM.+BLANCO',
      'https://placehold.co/800x600/FAFAFA/333333?text=ESM.+BLANCO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '1500 N rotura',
      resistenciaCompresion: '12 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-esmaltada-negro',
    nombre: 'PLAQUETA ESMALTADA NEGRO',
    descripcion: 'Plaqueta Thin Brick con acabado esmaltado en negro brillante. Superficie vitrificada con reflejo especular para máximo impacto.',
    categoria: 'Plaqueta Esmaltada',
    precio: 1.30,
    stock: 2600,
    rating: 4.8,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/000000/FFFFFF?text=ESM.+NEGRO',
      'https://placehold.co/800x600/0A0A0A/FFFFFF?text=ESM.+NEGRO',
      'https://placehold.co/800x600/050505/FFFFFF?text=ESM.+NEGRO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '1500 N rotura',
      resistenciaCompresion: '12 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-esmaltada-rojo',
    nombre: 'PLAQUETA ESMALTADA ROJO',
    descripcion: 'Plaqueta Thin Brick con acabado esmaltado en rojo brillante. Color intenso y vibrante con superficie fácil de mantener.',
    categoria: 'Plaqueta Esmaltada',
    precio: 1.28,
    stock: 2500,
    rating: 4.6,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/DC143C/FFFFFF?text=ESM.+ROJO',
      'https://placehold.co/800x600/E11941/FFFFFF?text=ESM.+ROJO',
      'https://placehold.co/800x600/D70F37/FFFFFF?text=ESM.+ROJO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '1500 N rotura',
      resistenciaCompresion: '12 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-esmaltada-azul',
    nombre: 'PLAQUETA ESMALTADA AZUL',
    descripcion: 'Plaqueta Thin Brick con acabado esmaltado en azul brillante. Tonalidad vibrante para proyectos creativos y distintivos.',
    categoria: 'Plaqueta Esmaltada',
    precio: 1.28,
    stock: 2400,
    rating: 4.7,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/1E90FF/FFFFFF?text=ESM.+AZUL',
      'https://placehold.co/800x600/2395FF/FFFFFF?text=ESM.+AZUL',
      'https://placehold.co/800x600/198BFF/FFFFFF?text=ESM.+AZUL'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '1500 N rotura',
      resistenciaCompresion: '12 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-esmaltada-verde',
    nombre: 'PLAQUETA ESMALTADA VERDE',
    descripcion: 'Plaqueta Thin Brick con acabado esmaltado en verde brillante. Color fresco y natural con acabado vitrificado duradero.',
    categoria: 'Plaqueta Esmaltada',
    precio: 1.28,
    stock: 2300,
    rating: 4.5,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/32CD32/FFFFFF?text=ESM.+VERDE',
      'https://placehold.co/800x600/37D237/FFFFFF?text=ESM.+VERDE',
      'https://placehold.co/800x600/2DC82D/FFFFFF?text=ESM.+VERDE'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '1500 N rotura',
      resistenciaCompresion: '12 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-esmaltada-amarillo',
    nombre: 'PLAQUETA ESMALTADA AMARILLO',
    descripcion: 'Plaqueta Thin Brick con acabado esmaltado en amarillo brillante. Luminosidad y energía con superficie de fácil mantenimiento.',
    categoria: 'Plaqueta Esmaltada',
    precio: 1.28,
    stock: 2200,
    rating: 4.6,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/FFD700/333333?text=ESM.+AMARILLO',
      'https://placehold.co/800x600/FFDB05/333333?text=ESM.+AMARILLO',
      'https://placehold.co/800x600/FFD300/333333?text=ESM.+AMARILLO'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '1500 N rotura',
      resistenciaCompresion: '12 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
  {
    id: 'plaqueta-esmaltada-gris',
    nombre: 'PLAQUETA ESMALTADA GRIS',
    descripcion: 'Plaqueta Thin Brick con acabado esmaltado en gris brillante. Neutralidad sofisticada con superficie vitrificada de alta calidad.',
    categoria: 'Plaqueta Esmaltada',
    precio: 1.28,
    stock: 2700,
    rating: 4.7,
    dimensiones: '210x65x20mm',
    imagenes: [
      'https://placehold.co/800x600/808080/FFFFFF?text=ESM.+GRIS',
      'https://placehold.co/800x600/858585/FFFFFF?text=ESM.+GRIS',
      'https://placehold.co/800x600/7B7B7B/FFFFFF?text=ESM.+GRIS'
    ],
    datosTecnicos: {
      absorcionAgua: '6%',
      succionInicial: '1500 N rotura',
      resistenciaCompresion: '12 N/mm² flexión',
      eflorescencias: 'No Eflorescido',
      heladicidad: 'No Heladizo'
    }
  },
];

export interface Note {
  id: string;
  texto: string;
  fecha: string;
}

export interface Client {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  cif: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  notas: Note[];
}

export const INITIAL_CLIENTS: Client[] = [
  { 
    id: 'c1', 
    nombre: 'Juan García López', 
    email: 'compras@constructoradelsol.es', 
    telefono: '950 123 456',
    empresa: 'Constructora del Sol S.L.',
    cif: 'B12345678',
    direccion: 'Calle Principal 123',
    ciudad: 'Almería',
    codigoPostal: '04001',
    notas: [
      { id: 'n1', texto: 'Cliente preferente con descuento del 10%', fecha: new Date('2024-01-15').toISOString() }
    ]
  },
  { 
    id: 'c2', 
    nombre: 'Juan Pérez', 
    email: 'juan.perez@reformasjp.com', 
    telefono: '600 789 012',
    empresa: 'Reformas Integrales J.P.',
    cif: 'B87654321',
    direccion: 'Avenida Reforma 45',
    ciudad: 'Madrid',
    codigoPostal: '28001',
    notas: []
  },
  { 
    id: 'c3', 
    nombre: 'María Rodríguez', 
    email: 'info@arq-estudio.com', 
    telefono: '91 555 8899',
    empresa: 'Estudio de Arquitectura ARQ',
    cif: 'B11223344',
    direccion: 'Plaza del Arquitecto 8',
    ciudad: 'Barcelona',
    codigoPostal: '08001',
    notas: [
      { id: 'n2', texto: 'Interesado en ladrillos clinker para proyecto en Las Ramblas', fecha: new Date('2024-02-20').toISOString() }
    ]
  },
];
