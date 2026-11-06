// Íconos de línea estilo sello: doble anillo con trazo gastado y un dibujo
// sencillo al centro. El desgaste lo pone el filtro #sello (definido una vez
// en index.html), así que todo es vector y toma el color de currentColor.

const S = 'fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"'

const dibujos = {
  // Comal con tres gorditas apiladas.
  todo: `
    <path d="M28 70h64" ${S}/><path d="M32 70c2 7 9 10 28 10s26-3 28-10" ${S}/>
    <path d="M90 72l9 4" ${S}/>
    <path d="M38 62c0-5 10-8 22-8s22 3 22 8c0 3-10 5-22 5s-22-2-22-5z" ${S}/>
    <path d="M42 52c0-5 8-8 18-8s18 3 18 8c0 3-8 4-18 4s-18-1-18-4z" ${S}/>
    <path d="M46 42c0-5 6-7 14-7s14 2 14 7c0 3-6 4-14 4s-14-1-14-4z" ${S}/>
    <path d="M52 27c0-3 2-5 2-8M60 27c0-3 2-5 2-8M68 27c0-3 2-5 2-8" ${S}/>`,
  // Gordita abierta con su guiso.
  basicas: `
    <path d="M26 66c0-10 15-18 34-18s34 8 34 18c0 6-15 10-34 10s-34-4-34-10z" ${S}/>
    <path d="M30 60c4-14 16-24 30-24s26 10 30 24" ${S}/>
    <path d="M36 58c6 3 14 4 24 4s18-1 24-4" ${S}/>
    <circle cx="48" cy="44" r="2" fill="currentColor"/><circle cx="66" cy="42" r="2" fill="currentColor"/><circle cx="58" cy="50" r="2" fill="currentColor"/>`,
  // Chile con estrellita.
  preferidas: `
    <path d="M40 48c8-6 20-4 26 6 8 13 14 22 22 26-14 2-30-4-40-16-5-6-10-12-8-16z" ${S}/>
    <path d="M40 48c-4-4-4-10 0-14M40 34c4 0 8 2 10 6" ${S}/>
    <path d="M78 26l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" ${S}/>`,
  // Olla de barro con vapor.
  tradicionales: `
    <path d="M30 52h60" ${S}/><path d="M34 52c0 16 10 26 26 26s26-10 26-26" ${S}/>
    <path d="M30 52c-6 0-8-6-2-8M90 52c6 0 8-6 2-8" ${S}/>
    <path d="M40 46c2-4 10-6 20-6s18 2 20 6" ${S}/>
    <path d="M50 34c-3-4 3-6 0-10M60 34c-3-4 3-6 0-10M70 34c-3-4 3-6 0-10" ${S}/>`,
  // Plato con huevo estrellado y tortilla.
  platillo: `
    <ellipse cx="60" cy="62" rx="36" ry="16" ${S}/><ellipse cx="60" cy="60" rx="26" ry="10" ${S}/>
    <path d="M46 58c0-6 8-10 14-8s12 2 12 7-8 9-14 8-12-2-12-7z" ${S}/>
    <circle cx="60" cy="57" r="4.5" ${S}/>
    <path d="M30 40l16 8M88 34l-20 12" ${S}/><path d="M86 30l6 6" ${S}/>`,
  // Vaso de agua fresca con popote.
  bebidas: `
    <path d="M42 36h36l-5 44H47z" ${S}/><path d="M44 50h32" ${S}/>
    <path d="M64 36l10-16h8" ${S}/>
    <circle cx="54" cy="62" r="2.5" ${S}/><circle cx="64" cy="70" r="2" ${S}/><circle cx="62" cy="58" r="1.6" ${S}/>`,
  // Ticket con estrella (programa de puntos).
  puntos: `
    <path d="M30 40h60v10a6 6 0 0 0 0 12v10H30V62a6 6 0 0 0 0-12z" ${S}/>
    <path d="M60 46l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" ${S}/>
    <path d="M44 42v28" stroke-dasharray="3 5" ${S}/>`,
  // Balón de futbol.
  torneo: `
    <circle cx="60" cy="56" r="24" ${S}/>
    <path d="M60 46l9 7-3 10H54l-3-10z" ${S}/>
    <path d="M60 46v-14M69 53l13-4M66 63l8 11M54 63l-8 11M51 53l-13-4" ${S}/>`,
  // Piñata de estrella (posadas).
  posadas: `
    <path d="M60 26v8" ${S}/>
    <circle cx="60" cy="56" r="14" ${S}/>
    <path d="M60 42L60 22M73 50l17-8M73 64l15 10M47 64L32 74M47 50l-17-8M60 70v14" ${S}/>
    <path d="M58 84l-4 8M62 84l4 8M88 74l6 4M32 74l-6 4" ${S}/>`,
}

// Anillo doble del sello. El de afuera va "cortado" en dos puntos, como un
// sello que no se entintó parejo.
const anillo = `
  <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="4.5" stroke-dasharray="270 6 30 4 100"/>
  <circle cx="60" cy="60" r="47" fill="none" stroke="currentColor" stroke-width="2"/>`

export function icono(nombre, { sinAnillo = false } = {}) {
  return `<svg class="sello" viewBox="0 0 120 120" aria-hidden="true">
    <g filter="url(#sello)">${sinAnillo ? '' : anillo}<g transform="${sinAnillo ? 'translate(-24 -22) scale(1.4)' : 'translate(0 2)'}">${dibujos[nombre]}</g></g>
  </svg>`
}
