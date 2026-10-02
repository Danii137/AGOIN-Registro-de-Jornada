import { BRANDS, type Brand, type BrandId } from './brands';
import { AGOIN_LOGO_BASE64 } from './constants';
import biosLogo from './assets/logo-bios.png';
// ?inline: embebidos en el JS, así html2canvas siempre captura el del PDF
// y los builds de otras empresas no incluyen estos ficheros
import possibilityLogo from './assets/logo-possibility.png?inline';
import possibilityLogoLight from './assets/logo-possibility-light.png?inline';

// Inyectado por vite.config.ts según el modo de build
declare const __BRAND_ID__: BrandId;

// Logo del pie del PDF (fondo blanco). Sin logo, se muestra el nombre como texto
const LOGOS: Partial<Record<BrandId, string>> = {
  agoin: AGOIN_LOGO_BASE64,
  possibility: possibilityLogo,
  bios: biosLogo,
};

// Logo de la cabecera de la app (fondo oscuro). Sin logo, la cabecera solo lleva el título
const HEADER_LOGOS: Partial<Record<BrandId, string>> = {
  possibility: possibilityLogoLight,
};

export const BRAND: Brand & { logo?: string; headerLogo?: string } = {
  ...BRANDS[__BRAND_ID__],
  logo: LOGOS[__BRAND_ID__],
  headerLogo: HEADER_LOGOS[__BRAND_ID__],
};
