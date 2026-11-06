import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

// Texturas pintadas en canvas: nada que descargar. Cada función regresa
// { map, bump } listas para MeshStandardMaterial.

function rand(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function canvas(size) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  return [c, c.getContext('2d')]
}

function tex(c, { srgb = true, repeat = 1 } = {}) {
  const t = new CanvasTexture(c)
  if (srgb) t.colorSpace = SRGBColorSpace
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(repeat, repeat)
  t.anisotropy = 4
  return t
}

// Mancha irregular: varios círculos suaves encimados.
function blotch(ctx, x, y, r, color, alpha, r2) {
  const n = 3 + Math.floor(r2() * 4)
  for (let i = 0; i < n; i++) {
    const dx = (r2() - 0.5) * r * 1.2
    const dy = (r2() - 0.5) * r * 0.8
    const rr = r * (0.45 + r2() * 0.6)
    const g = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, rr)
    g.addColorStop(0, color.replace('A', alpha))
    g.addColorStop(0.55, color.replace('A', alpha * 0.55))
    g.addColorStop(1, color.replace('A', 0))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x + dx, y + dy, rr, 0, Math.PI * 2)
    ctx.fill()
  }
}

// Masa de harina. toasted = false: cruda (pálida, mate). true: recién salida
// del comal, con las manchas doradas y tostadas típicas de la tortilla de harina.
export function dough(toasted) {
  const S = 1024
  const [c, ctx] = canvas(S)
  const [b, bctx] = canvas(S)
  const r = rand(toasted ? 7 : 3)

  ctx.fillStyle = toasted ? '#EEDDB4' : '#F3E9D2'
  ctx.fillRect(0, 0, S, S)
  bctx.fillStyle = '#808080'
  bctx.fillRect(0, 0, S, S)

  // Variación suave de tono en toda la superficie.
  for (let i = 0; i < 220; i++) {
    blotch(ctx, r() * S, r() * S, 40 + r() * 90, 'rgba(214,186,132,A)', toasted ? 0.18 : 0.08, r)
  }

  if (toasted) {
    // Manchas del comal: dorado claro, café, y centros casi quemados.
    for (let i = 0; i < 150; i++) {
      const x = r() * S
      const y = r() * S
      const big = 14 + r() * 40
      blotch(ctx, x, y, big * 1.6, 'rgba(201,140,66,A)', 0.55, r)
      blotch(ctx, x, y, big, 'rgba(150,92,38,A)', 0.6, r)
      if (r() < 0.55) blotch(ctx, x, y, big * 0.45, 'rgba(84,48,20,A)', 0.75, r)
      // Las burbujas tostadas sobresalen un poco.
      blotch(bctx, x, y, big * 0.9, 'rgba(200,200,200,A)', 0.6, r)
    }
  }

  // Harina espolvoreada y poros.
  for (let i = 0; i < 2600; i++) {
    const x = r() * S
    const y = r() * S
    ctx.fillStyle = r() < 0.6 ? 'rgba(255,250,236,0.55)' : 'rgba(120,86,50,0.18)'
    ctx.fillRect(x, y, 1 + r() * 2, 1 + r() * 2)
    bctx.fillStyle = r() < 0.5 ? 'rgba(170,170,170,0.5)' : 'rgba(90,90,90,0.4)'
    bctx.fillRect(x, y, 2, 2)
  }

  return { map: tex(c), bump: tex(b, { srgb: false }) }
}

// Interior de la tortilla: más claro, liso.
export function crumb() {
  const S = 512
  const [c, ctx] = canvas(S)
  const r = rand(11)
  ctx.fillStyle = '#E0CBA0'
  ctx.fillRect(0, 0, S, S)
  for (let i = 0; i < 120; i++) blotch(ctx, r() * S, r() * S, 20 + r() * 50, 'rgba(226,203,158,A)', 0.25, r)
  return { map: tex(c) }
}

// Guiso: deshebrada en rojo. Fibras y trozos sobre fondo rojizo.
export function guiso() {
  const S = 1024
  const [c, ctx] = canvas(S)
  const [b, bctx] = canvas(S)
  const r = rand(5)
  ctx.fillStyle = '#6A2212'
  ctx.fillRect(0, 0, S, S)
  bctx.fillStyle = '#707070'
  bctx.fillRect(0, 0, S, S)
  for (let i = 0; i < 500; i++) blotch(ctx, r() * S, r() * S, 10 + r() * 40, 'rgba(140,48,24,A)', 0.45, r)
  // Fibras de la carne deshebrada.
  for (let i = 0; i < 1400; i++) {
    const x = r() * S
    const y = r() * S
    const a = r() * Math.PI
    const len = 10 + r() * 34
    ctx.strokeStyle = r() < 0.5 ? 'rgba(92,30,16,0.8)' : 'rgba(196,84,46,0.7)'
    ctx.lineWidth = 2 + r() * 3
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
    ctx.stroke()
    bctx.strokeStyle = r() < 0.5 ? 'rgba(220,220,220,0.7)' : 'rgba(40,40,40,0.6)'
    bctx.lineWidth = 3
    bctx.beginPath()
    bctx.moveTo(x, y)
    bctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
    bctx.stroke()
  }
  // Trozos más oscuros y brillo de la salsa.
  for (let i = 0; i < 220; i++) blotch(ctx, r() * S, r() * S, 8 + r() * 20, 'rgba(60,18,10,A)', 0.45, r)
  for (let i = 0; i < 160; i++) blotch(ctx, r() * S, r() * S, 6 + r() * 14, 'rgba(232,120,80,A)', 0.35, r)
  return { map: tex(c, { repeat: 2 }), bump: tex(b, { srgb: false, repeat: 2 }) }
}

// Queso chihuahua derretido.
export function queso() {
  const S = 512
  const [c, ctx] = canvas(S)
  const r = rand(9)
  ctx.fillStyle = '#F6D57A'
  ctx.fillRect(0, 0, S, S)
  for (let i = 0; i < 90; i++) blotch(ctx, r() * S, r() * S, 20 + r() * 50, 'rgba(232,180,70,A)', 0.35, r)
  for (let i = 0; i < 70; i++) blotch(ctx, r() * S, r() * S, 10 + r() * 24, 'rgba(255,240,190,A)', 0.5, r)
  return { map: tex(c) }
}

// Hierro del comal.
export function iron() {
  const S = 512
  const [c, ctx] = canvas(S)
  const r = rand(13)
  ctx.fillStyle = '#1C1816'
  ctx.fillRect(0, 0, S, S)
  for (let i = 0; i < 300; i++) blotch(ctx, r() * S, r() * S, 8 + r() * 40, 'rgba(70,58,48,A)', 0.3, r)
  for (let i = 0; i < 2000; i++) {
    ctx.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.4)' : 'rgba(120,104,90,0.25)'
    ctx.fillRect(r() * S, r() * S, 2, 2)
  }
  return { map: tex(c) }
}

// Sombra de contacto: degradado radial suave.
export function shadow() {
  const S = 256
  const [c, ctx] = canvas(S)
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
  g.addColorStop(0, 'rgba(60,10,10,0.55)')
  g.addColorStop(0.45, 'rgba(60,10,10,0.28)')
  g.addColorStop(1, 'rgba(60,10,10,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
  const t = new CanvasTexture(c)
  return t
}
