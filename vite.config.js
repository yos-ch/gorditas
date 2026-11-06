import { defineConfig } from 'vite'

// base relativa: el contenido de dist/ funciona desde cualquier carpeta del servidor.
// prueba-3d.html es solo para afinar el modelo; no entra al build.
export default defineConfig({
  base: './',
})
