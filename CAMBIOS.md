# Bitácora de cambios: landing Gorditas Mamá Tita

Cada decisión de diseño, con dónde vive y cómo se ajusta o revierte.

## 2026-11-05: primera versión

| # | Decisión | Dónde | Cómo ajustar o revertir |
|---|---|---|---|
| 1 | Paleta del sitio actual: rojo `#b22222` y amarillo `#fbc814`, con crema `#f6eedc` de fondo y café `#3b1d14` para el texto (en vez de negro, para que se sienta cálido) | `src/style.css` → `:root` | Cambiar las variables |
| 2 | Tipografías: Archivo ancho (títulos), Bebas Neue (números y nombres) y Rochester (la letra a mano que ya usa la marca) | `src/main.js` (imports) y `:root` | — |
| 3 | Hero limpio: solo la gordita 3D, sin ingredientes flotando (lo que no te gustó de la referencia) | `src/choreo.js` → `heroPose` | Tamaño: `size`; posición: `x`, `y` |
| 4 | Fondo del hero con cuadritos de mantel muy tenues | `src/style.css` → `.hero::before` | Borrar la regla para dejar el rojo liso |
| 5 | La gordita se esculpe en código: dos conchas de masa con bisagra, guiso, queso que se desborda y comal | `src/three/gordita.js` | Abertura en el hero: `open`; quitar comal: `comal: 0` |
| 6 | Manchas del comal, deshebrada en rojo y queso pintados en canvas | `src/three/textures.js` | Guiso: `guiso()`; tostado: `dough(true)` |
| 7 | Sección "Se arma" fija: 5 pasos repartidos en el recorrido; al final la lista se va y aparece "LA DESHEBRADA" | `src/choreo.js` → zona `build` | Duración: `height: 420vh` en `.build` |
| 8 | Íconos estilo sello (como tu imagen de referencia), dibujados en SVG, con desgaste por filtro | `src/icons.js` y `#sello` en `index.html` | Desgaste: `values="... -1.6 1.55"` (más alto el 1.55 = menos gastado) |
| 9 | Menú agrupado: cada guiso en una fila con precio de gordita y de burrito | `src/data/menu.js`, `src/sections.js` | — |
| 10 | Estado abierto/cerrado en vivo con la hora de Chihuahua | `src/sections.js` → `estado()` | Horario en `negocio.horario` |
| 11 | Lluvia de gorditas en el final; al tocarlas brincan | `src/choreo.js` → lluvia | Cantidad: el `14` en `src/three/stage.js` |
| 12 | Bordes ondulados entre secciones, como orilla de mantel | `.wave` en `src/style.css` | Quitar el `<div class="wave">` de la sección |
| 13 | En celular la gordita es más chica y se acomoda para no tapar textos | `src/choreo.js` (`mobile`) y `@media (max-width: 700px)` | — |

## 2026-11-05: ajustes después de la primera revisión

| # | Cambio | Dónde | Cómo ajustar o revertir |
|---|---|---|---|
| 14 | **Guiso 3D más claro:** se agregaron ~260 hebras de carne deshebrada (tubos curvos en tonos de salsa roja) sobre el montón, más cargadas hacia la boca; el montón liso de abajo es más chico para que dominen las hebras | `src/three/gordita.js` → `shredsGeometry()` | Cantidad: `i < 260`; grosor: `0.017 + r() * 0.014` |
| 15 | El queso es más chico y se asoma por el frente, para que se vea el guiso alrededor | `src/three/gordita.js` → `blanket` (escala 0.72) | Escala 1 = como antes |
| 16 | **Gordita un poco más cerrada:** abertura 0.36 → 0.26 en el hero; en "Se arma" abre a 0.5 y cierra a 0.28 | `src/choreo.js` (`open`) y `state` en `gordita.js` | Volver a 0.36 |
| 17 | Se quitó la sección "Gordita [gor·di·ta]" (definición y las dos fotos); la cinta ahora termina sobre el amarillo y su banda de atrás es rojo oscuro | `index.html`, `src/style.css` (`.ribbon`) | — |
| 18 | Se quitaron los números de las fotos de la galería | `index.html` | — |
| 19 | En la galería, la foto de la mesa de clientes se cambió por "Para compartir" (mesa de cuadros), porque esa foto ahora vive en Comunidad | `index.html` → `.gallery__track` | — |
| 20 | Se quitó la sección "Nuestra receta"; la polaroid de "¡Gracias por la confianza!" pasó a "Aquí hay familia", junto al título | `index.html` → `.club__head`, `src/style.css` → `.club__polaroid` | — |
| 21 | El enlace "Nosotros" del menú ahora dice "Comunidad" | `index.html` → `.header__nav` | — |
| 22 | **Corrección:** al usar el filtro del menú cambiaba la altura de la página y los títulos de abajo (por ejemplo "¡A COMER!") ya no aparecían. Ahora las animaciones se recalculan cada vez que cambia la altura y al terminar de cargar | `src/main.js` → `ResizeObserver` | — (era un error) |
| 23 | Se quitó el letrero "¡Aquí!" y la tarjeta "Abrir en Maps" del mapa; todo el recuadro del mapa es un enlace que abre Google Maps | `index.html` → `.visit__map`, `src/style.css` (iframe recortado 170px arriba) | — |

## 2026-11-05: últimos detalles

| # | Cambio | Dónde | Cómo ajustar o revertir |
|---|---|---|---|
| 24 | La píldora del header ya no dice "¡Abierto! hasta las 3 pm": ahora es **"Agenda tus posadas"** y abre WhatsApp con el mensaje "Hola, quiero agendar una posada" | `index.html` → `.status` | Mensaje en `data-wa` |
| 25 | Los enlaces bajo el header (Menú, Comunidad, Horario, Visítanos) pasaron de crema a **amarillo**, porque se perdían con las letras de MAMÁ TITA | `src/style.css` → `.header__nav > a` | `var(--crema)` para volver |
| 26 | **MAMÁ con acento:** el acento ya estaba en el texto, pero la máscara de la animación lo recortaba; ahora tiene espacio arriba | `src/style.css` → `.ch-mask` (padding superior 0.2em) | — |
| 27 | Hero: se quitó "Gorditas de harina hechas a mano en Chihuahua"; a la derecha queda solo "¡Abierto!" y abajo el horario | `index.html` → `.hero__bottom` | — |
| 28 | **Horario nuevo:** lunes a viernes 7:30 am a 3:00 pm y sábado 8:00 am a 2:00 pm; domingo cerrado. Se actualizó en el hero, la sección Horario (ahora con tarjeta para sábado y "¡HOY!" en el día que toca), el footer, la descripción para Google y el cálculo de abierto/cerrado | `src/data/menu.js` → `negocio.horario` | Un horario por día de la semana |
| 29 | "¡Abierto!" del hero cambia solo: "Abrimos a las 7:30" antes de abrir, "Cerrado" después y en domingo | `src/sections.js` → `estado()` | — |
| 30 | Ubicación: solo quedan WhatsApp y Facturación; se quitaron "Cómo llegar" y el número (el mapa ya abre Google Maps) | `index.html` → `.visit__actions` | — |
| 31 | **Interior de la gordita:** ya no es blanco; lleva la misma textura dorada con manchas del comal, un poco más apagada | `src/three/gordita.js` → material `crumb` | Color: `#E9D3AE` |
| 32 | Se quitó "Traducción: ¡a comer, mijo!" del final; "¡A COMER!" baja solo hasta el footer | `index.html`, `src/style.css` → `.finale__giant` (margin auto) | — |
