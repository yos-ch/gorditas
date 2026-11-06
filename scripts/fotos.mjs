// Extrae las fotos que vienen incrustadas en los SVG del sitio actual
// (assets-originales/) y las guarda optimizadas en public/img como WebP.
// Se corrió una vez; después se renombraron a mano (ver README).
import { readFileSync, readdirSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'

const src = 'assets-originales'
const out = 'public/img'
mkdirSync(out, { recursive: true })

for (const f of readdirSync(src).filter((f) => f.endsWith('.svg') && !f.startsWith('Texto'))) {
  const svg = readFileSync(`${src}/${f}`, 'utf8')
  const imgs = [...svg.matchAll(/href="data:image\/(\w+);base64,([^"]+)"/g)]
  for (const [i, m] of imgs.entries()) {
    const buf = Buffer.from(m[2], 'base64')
    const meta = await sharp(buf).metadata()
    const name = `${f.replace('.svg', '')}-${i}`
    await sharp(buf).resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 80 }).toFile(`${out}/${name}.webp`)
    console.log(name, meta.format, `${meta.width}x${meta.height}`, meta.hasAlpha ? 'alfa' : '')
  }
}
await sharp(`${src}/logo.png`).resize({ width: 400 }).webp({ quality: 90 }).toFile(`${out}/logo.webp`)

