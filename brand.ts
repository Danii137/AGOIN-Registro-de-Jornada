import { BRANDS, type Brand, type BrandId } from './brands';
import { AGOIN_LOGO_BASE64 } from './constants';
import biosLogo from './assets/logo-bios.png';

// Inyectado por vite.config.ts según el modo de build
declare const __BRAND_ID__: BrandId;

// Si una marca no tiene logo, en el informe se muestra su nombre como texto
const LOGOS: Partial<Record<BrandId, string>> = {
  agoin: AGOIN_LOGO_BASE64,
  bios: biosLogo,
};

export const BRAND: Brand & { logo?: string } = {
  ...BRANDS[__BRAND_ID__],
  logo: LOGOS[__BRAND_ID__],
};
