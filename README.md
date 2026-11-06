# Gorditas Mamá Tita: landing

Landing con la información de gorditasmamatita.com y el menú de gorditasmamatita.pulsoia.mx, inspirada en las
transiciones de bar-topas.ch. La gordita 3D está esculpida con código (Three.js), sin modelos descargados.

## Correrla en local

```bash
npm install
npm run dev        # http://localhost:5173
```

`prueba-3d.html` sirve solo para afinar la gordita, con parámetros en la URL
(`?flat=1&toast=1&open=0.36&fill=1&cheese=1&comal=0`). No entra al build.

## Publicarla

```bash
npm run build      # crea dist/ (≈2 MB), estática y sin servicios externos salvo el mapa de Google
```

Se copia el contenido de `dist/` al servidor. Funciona desde cualquier carpeta (`base: './'`).

## Dónde se cambia cada cosa

| Qué | Archivo |
|---|---|
| Precios, platillos, bebidas, WhatsApp, horario, dirección | `src/data/menu.js` |
| Textos de cada sección | `index.html` |
| Colores y tipografías | `src/style.css` (`:root`) |
| Íconos de sello (filtro del menú, comunidad) | `src/icons.js` y el filtro `#sello` en `index.html` |
| La gordita 3D (forma, queso, comal) | `src/three/gordita.js` y `src/three/textures.js` |
| Luces y cámara | `src/three/stage.js` |
| Dónde aparece la gordita y cómo se arma con el scroll | `src/choreo.js` |
| Animaciones de letras, cintas, galería, encabezado | `src/motion.js` |
| Fotos | `public/img/` (salieron de los SVG del sitio actual con `npm run fotos`) |

## Secciones

1. **Hero:** "MAMÁ TITA" gigante con la gordita 3D al centro, sola.
2. **Cinta:** dos bandas cruzadas que se aceleran con el scroll.
3. **Definición:** "Gordita [gor·di·ta]", con el texto que se va leyendo al bajar.
4. **Se arma (fija):** masa → comal → se abre → guiso → queso, ligado al scroll.
5. **Galería horizontal (fija)** con las fotos reales.
6. **Menú** con filtro de íconos estilo sello y precios en gordita y en burrito.
7. **Nuestra receta:** la del muro del local.
8. **Comunidad:** programa de puntos, torneo de futbolito y posadas.
9. **Horario** con "¡HOY!" marcado y estado abierto/cerrado con la hora de Chihuahua.
10. **Visítanos:** dirección, mapa, WhatsApp, llamada y facturación.
11. **Final:** "¡A COMER!" con lluvia de gorditas que se pueden tocar.
