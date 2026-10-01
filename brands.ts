// Valores de las clases agoin-* de Tailwind (ver index.html)
export interface BrandTheme {
  green: string;
  teal: string;
  dark: string;
  darker: string;
  light: string;
  accent: string;
  'accent-hover': string;
}

export interface Brand {
  name: string;
  cif: string;
  pageTitle: string;
  // Sin theme ni font se usan los de AGOIN definidos en index.html
  theme?: BrandTheme;
  font?: string;
}

export const BRANDS = {
  agoin: {
    name: 'AGOIN',
    cif: 'B45871340',
    pageTitle: 'Registro Jornada Laboral - AGOIN',
  },
  possibility: {
    name: 'POSSIBILITY SOLUTIONS SL',
    cif: 'B45879632',
    pageTitle: 'Registro Jornada Laboral - POSSIBILITY SOLUTIONS SL',
  },
  // Bios es una marca de POSSIBILITY SOLUTIONS SL (aviso legal de somosbios.es); se usa su CIF
  bios: {
    name: 'BIOS',
    cif: 'B45879632',
    pageTitle: 'Registro Jornada Laboral - BIOS',
    theme: {
      green: '#1A1A1A',
      teal: '#8C8C8C',
      dark: '#2E2E2E',
      darker: '#121212',
      light: '#FFFFFF',
      accent: '#4A4A4A',
      'accent-hover': '#5C5C5C',
    },
    font: 'Montserrat',
  },
} satisfies Record<string, Brand>;

export type BrandId = keyof typeof BRANDS;

// Cada modo de Vite con nombre de marca genera la app de esa empresa; el resto, AGOIN
export const brandIdForMode = (mode: string): BrandId =>
  mode in BRANDS ? (mode as BrandId) : 'agoin';
