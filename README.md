<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1GkyrtEhA3C5e1Tx7uQTsjsxf4Pam6eNo

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Empresas

El mismo código genera una app por empresa. Los datos de cada una (nombre, CIF, colores, fuente) están en `brands.ts` y los logos en `brand.ts`.

| Empresa | Build | Carpeta | URL |
| --- | --- | --- | --- |
| AGOIN | `npm run build` | `dist` | https://agoin-registro-de-jornada.web.app |
| POSSIBILITY SOLUTIONS SL | `npm run build:possibility` | `dist-possibility` | https://possibility-registro-jornada.web.app |
| BIOS | `npm run build:bios` | `dist-bios` | https://bios-registro-jornada.web.app |

Para desarrollo local de una empresa concreta: `npm run dev:possibility`, `npm run dev:bios`.

Despliegue de una sola empresa (las tres están en el proyecto de Firebase `agoin-registro-de-jornada`):

```
firebase deploy --only hosting:agoin
firebase deploy --only hosting:possibility
firebase deploy --only hosting:bios
```
