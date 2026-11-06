import {
  BackSide,
  BufferAttribute,
  CatmullRomCurve3,
  TubeGeometry,
  Vector3,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import * as T from './textures.js'

// Gordita de harina esculpida en código. Unidad: radio de la tortilla = 1,
// eje Y hacia arriba, la boca (el corte) mira hacia +Z.
//
// Jerarquía:
//   root ─┬─ body ─┬─ bottom (concha de abajo + su interior)
//         │        ├─ filling (guiso)
//         │        ├─ cheese (queso que se desborda por el frente)
//         │        └─ hinge ── top (concha de arriba + interior)  ← se abre
//         ├─ comal
//         └─ shadow
//
// El estado se controla con apply({ flat, toast, open, fill, cheese, comal }).

const TAU = Math.PI * 2

// Pequeño ruido determinista para deformar sin dependencias.
function wobble(a, seed = 0) {
  return (
    0.03 * Math.sin(3 * a + 1.3 + seed) +
    0.018 * Math.sin(5 * a + 0.4 + seed * 2) +
    0.01 * Math.sin(11 * a + 2.1 + seed * 3)
  )
}

// Media concha: hemisferio aplastado, orilla irregular y UV planar (para que
// las manchas del comal no se estiren hacia el centro).
function shellGeometry(top) {
  const g = new SphereGeometry(1, 128, 40, 0, TAU, top ? 0 : Math.PI / 2, Math.PI / 2)
  const p = g.attributes.position
  const uv = g.attributes.uv
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i)
    let y = p.getY(i)
    let z = p.getZ(i)
    const a = Math.atan2(z, x)
    const w = 1 + wobble(a)
    x *= w
    z *= w
    const r = Math.min(1, Math.hypot(x, z))
    // Arriba: inflada y un poco plana del centro. Abajo: más plana (apoya en el comal).
    // El ondulado de arriba se anula en la orilla para que las dos conchas cierren sin rendija.
    y = top ? y * (0.28 - 0.05 * (1 - r)) + 0.05 * Math.sin(a * 6) * r * (1 - r) : y * 0.13
    p.setXYZ(i, x, y, z)
    uv.setXY(i, x * 0.5 + 0.5, z * 0.5 + 0.5)
  }
  g.computeVertexNormals()
  return g
}

// Montón de guiso: esfera aplastada con bultos.
function fillingGeometry() {
  const g = new SphereGeometry(1, 96, 48)
  const p = g.attributes.position
  const uv = g.attributes.uv
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const z = p.getZ(i)
    // Bultos suaves (montón de carne), no ondas.
    const lump =
      1 +
      0.06 * Math.sin(x * 5 + z * 3 + 1) * Math.cos(z * 4 - x * 2) +
      0.02 * Math.sin(x * 11 + z * 9) +
      0.015 * Math.cos(z * 13 + x * 7)
    const top = y > 0
    p.setXYZ(i, x * 0.8 * lump, y * (top ? 0.22 : 0.1) * lump, z * 0.76 * lump)
    uv.setXY(i, x * 0.5 + 0.5, z * 0.5 + 0.5)
  }
  g.computeVertexNormals()
  return g
}

// Capa de queso derretido sobre el frente del guiso.
// Hebras y trozos de carne deshebrada: cápsulas delgadas y bolitas irregulares
// repartidas sobre el montón, más cargadas hacia el frente (la boca). Todo se
// une en una sola geometría para que cueste lo mismo que una pieza.
function shredsGeometry() {
  let seed = 21
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const parts = []
  const palette = ['#7a2512', '#8c3017', '#6a200f', '#9a3a1c', '#5c1c0c']
  for (let i = 0; i < 260; i++) {
    // Más densidad al frente (la boca de la gordita).
    const a = r() * TAU
    const rad = Math.sqrt(r()) * 0.84
    const x = Math.cos(a) * rad
    let z = Math.sin(a) * rad * 0.9
    if (r() < 0.5) z = Math.abs(z) * 0.75 + 0.15
    const h = 0.24 * Math.sqrt(Math.max(0, 1 - (x * x + z * z) / 0.8))
    // Hebra: tubo delgado sobre una curva suave, casi acostado.
    const len = 0.12 + r() * 0.2
    const dir = r() * TAU
    const bend = (r() - 0.5) * 0.12
    const lift = (r() - 0.5) * 0.05
    const pts = []
    for (let k = 0; k <= 4; k++) {
      const t = k / 4 - 0.5
      pts.push(
        new Vector3(
          x + Math.cos(dir) * len * t - Math.sin(dir) * bend * (1 - 4 * t * t),
          h + 0.03 + lift * t + r() * 0.012,
          z + Math.sin(dir) * len * t + Math.cos(dir) * bend * (1 - 4 * t * t)
        )
      )
    }
    const g = new TubeGeometry(new CatmullRomCurve3(pts), 8, 0.017 + r() * 0.014, 6, false)
    const c = new Color(palette[Math.floor(r() * palette.length)])
    const cols = new Float32Array(g.attributes.position.count * 3)
    for (let k = 0; k < cols.length; k += 3) cols.set([c.r, c.g, c.b], k)
    g.setAttribute('color', new BufferAttribute(cols, 3))
    g.deleteAttribute('uv')
    parts.push(g.index ? g.toNonIndexed() : g)
  }
  return mergeGeometries(parts)
}

function cheeseGeometry() {
  const g = new SphereGeometry(1, 72, 24, 0, TAU, 0, Math.PI / 2)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const z = p.getZ(i)
    const a = Math.atan2(z, x)
    const w = 1 + 0.12 * Math.sin(a * 5 + 0.7) + 0.06 * Math.sin(a * 9)
    const zz = z * 0.56 * w
    // Hacia el frente el queso se desborda y cae por la orilla, en lenguas.
    const front = Math.max(0, Math.min(1, (zz - 0.12) / 0.44))
    const tongue = 0.5 + 0.5 * Math.sin(x * 9 + 1.2)
    const droop = front * front * (0.07 + 0.07 * tongue)
    p.setXYZ(i, x * 0.66 * w, y * 0.06 - droop, zz + front * 0.05 * tongue)
  }
  g.computeVertexNormals()
  return g
}

export function createMaterials() {
  const raw = T.dough(false)
  const toasted = T.dough(true)
  const guiso = T.guiso()
  const queso = T.queso()
  const iron = T.iron()

  // La masa mezcla la textura cruda y la tostada según uToast (0 → 1).
  const toast = { value: 1 }
  const dough = new MeshStandardMaterial({
    map: toasted.map,
    bumpMap: toasted.bump,
    bumpScale: 1.2,
    roughness: 0.78,
  })
  dough.onBeforeCompile = (sh) => {
    sh.uniforms.uRaw = { value: raw.map }
    sh.uniforms.uToast = toast
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <map_pars_fragment>', '#include <map_pars_fragment>\nuniform sampler2D uRaw;\nuniform float uToast;')
      .replace(
        '#include <map_fragment>',
        `#ifdef USE_MAP
          diffuseColor *= mix(texture2D(uRaw, vMapUv), texture2D(map, vMapUv), uToast);
        #endif`
      )
  }

  return {
    toast,
    dough,
    // Por dentro también lleva las manchas doradas del comal (un poco más
    // apagadas), para que no se vea blanca donde va el guiso.
    crumb: new MeshStandardMaterial({
      map: toasted.map,
      bumpMap: toasted.bump,
      bumpScale: 0.8,
      color: new Color('#E9D3AE'),
      roughness: 0.88,
      side: BackSide,
    }),
    shreds: new MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.38,
      clearcoat: 0.8,
      clearcoatRoughness: 0.25,
    }),
    guiso: new MeshPhysicalMaterial({
      map: guiso.map,
      bumpMap: guiso.bump,
      bumpScale: 2,
      roughness: 0.42,
      clearcoat: 0.55,
      clearcoatRoughness: 0.3,
    }),
    queso: new MeshPhysicalMaterial({
      map: queso.map,
      color: new Color('#FFF2C4'),
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      sheen: 0.3,
      sheenColor: new Color('#FFF0B8'),
      emissive: new Color('#5C3800'),
      emissiveIntensity: 0.1,
      side: DoubleSide,
    }),
    iron: new MeshStandardMaterial({ map: iron.map, roughness: 0.48, metalness: 0.65 }),
    shadow: new MeshStandardMaterial({
      map: T.shadow(),
      transparent: true,
      depthWrite: false,
      roughness: 1,
      color: '#000000',
      opacity: 1,
    }),
  }
}

let shared = null
function geometries() {
  if (shared) return shared
  shared = {
    top: shellGeometry(true),
    bottom: shellGeometry(false),
    filling: fillingGeometry(),
    shreds: shredsGeometry(),
    cheese: cheeseGeometry(),
    comal: new CylinderGeometry(1.45, 1.4, 0.08, 96),
    rim: new TorusGeometry(1.44, 0.045, 12, 96),
    shadow: new PlaneGeometry(1, 1),
  }
  return shared
}

export function createGordita(materials) {
  const g = geometries()
  const m = materials

  const root = new Group()
  const body = new Group()
  root.add(body)

  const bottom = new Group()
  const crumbs = [new Mesh(g.bottom, m.crumb), new Mesh(g.top, m.crumb)]
  bottom.add(new Mesh(g.bottom, m.dough), crumbs[0])
  body.add(bottom)

  // Guiso: un poco hacia el frente, donde abre la gordita.
  const filling = new Group()
  filling.add(new Mesh(g.filling, m.guiso), new Mesh(g.shreds, m.shreds))
  filling.position.set(0, 0.04, 0.08)
  body.add(filling)

  // Queso: capa sobre el frente que cae por la orilla.
  const cheese = new Group()
  const blanket = new Mesh(g.cheese, m.queso)
  // Queso más chico que antes: que se vea el guiso alrededor.
  blanket.position.set(0.1, 0.2, 0.5)
  blanket.scale.set(0.72, 1, 0.72)
  cheese.add(blanket)
  body.add(cheese)

  // Concha de arriba en una bisagra pegada a la orilla de atrás.
  const hinge = new Group()
  hinge.position.set(0, 0, -0.96)
  const top = new Group()
  top.position.set(0, 0, 0.96)
  top.add(new Mesh(g.top, m.dough), crumbs[1])
  hinge.add(top)
  body.add(hinge)

  const comal = new Group()
  comal.add(new Mesh(g.comal, m.iron))
  const rim = new Mesh(g.rim, m.iron)
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.04
  comal.add(rim)
  comal.position.y = -0.27
  root.add(comal)

  const shadow = new Mesh(g.shadow, m.shadow)
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = -0.24
  shadow.scale.setScalar(3.2)
  shadow.renderOrder = -1
  root.add(shadow)

  root.traverse((o) => {
    if (o.isMesh && o !== shadow) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })

  const state = { flat: 1, toast: 1, open: 0.26, fill: 1, cheese: 1, comal: 0 }

  function apply(s = state) {
    Object.assign(state, s)
    const f = state.flat
    // De bolita de masa (0) a tortilla (1).
    // De bolita de masa (0) a tortilla (1): en bolita es pequeña y alta.
    const sxz = 0.46 + 0.54 * f
    const sy = 1.75 - 0.75 * f
    body.scale.set(sxz, sy, sxz)
    body.position.y = (1 - f) * 0.12
    m.toast.value = state.toast
    hinge.rotation.x = -state.open
    // Cerrada no se ve el interior; así la bolita no muestra la unión.
    crumbs.forEach((c) => (c.visible = state.open > 0.02))
    filling.visible = state.fill > 0.001
    filling.position.y = 0.04 + (1 - state.fill) * 2.6
    filling.scale.setScalar(0.6 + 0.4 * Math.min(1, state.fill * 1.4))
    cheese.visible = state.cheese > 0.001
    blanket.scale.set(state.cheese * 0.72, 1, state.cheese * 0.72)
    comal.visible = state.comal > 0.001
    comal.position.y = -0.27 - (1 - state.comal) * 1.6
    comal.scale.setScalar(0.85 + 0.15 * state.comal)
    shadow.material.opacity = 1 - state.comal * 0.6
  }
  apply()

  return { root, body, comal, shadow, state, apply }
}
