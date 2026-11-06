import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  HemisphereLight,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PMREMGenerator,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { createGordita, createMaterials } from './gordita.js'

// Un solo canvas fijo y transparente encima del fondo de cada sección: el
// color lo pone el CSS y la gordita "vive" pegada a la sección que toca.
export function createStage(canvas) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFSoftShadowMap

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.55

  const camera = new PerspectiveCamera(30, 1, 0.1, 100)
  camera.position.set(0, 0, 10)

  // Luz cálida de cocina desde arriba, contraluz suave y rebote rojizo del fondo.
  const key = new DirectionalLight(new Color('#FFE1B8'), 2.6)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.left = key.shadow.camera.bottom = -2.4
  key.shadow.camera.right = key.shadow.camera.top = 2.4
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = 20
  key.shadow.bias = -0.0008
  key.shadow.normalBias = 0.02
  scene.add(key, key.target)
  const rim = new DirectionalLight(new Color('#FFF4E2'), 1.6)
  scene.add(rim, rim.target)
  scene.add(new HemisphereLight('#FFF6E8', '#8A2A1A', 0.5))

  // La gordita principal (hero y la que se arma) y un juego aparte para la lluvia final.
  const main = createGordita(createMaterials())
  scene.add(main.root)

  const rainMaterials = createMaterials()
  const rain = []
  for (let i = 0; i < 14; i++) {
    const g = createGordita(rainMaterials)
    g.root.visible = false
    g.root.userData.index = i
    scene.add(g.root)
    rain.push(g)
  }

  const view = { w: 1, h: 1, vw: 1, vh: 1, mobile: false }
  function resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    view.w = w
    view.h = h
    view.vh = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360)
    view.vw = view.vh * camera.aspect
    view.mobile = w < 760
  }

  // Convierte una posición en pantalla (fracción 0..1) a mundo en el plano z = 0.
  function toWorld(fx, fy) {
    return [(fx - 0.5) * view.vw, (0.5 - fy) * view.vh]
  }

  function aim(target) {
    const p = target.position
    key.position.set(p.x + 3, p.y + 6.5, p.z + 5)
    key.target.position.copy(p)
    rim.position.set(p.x - 4, p.y + 2.5, p.z - 4)
    rim.target.position.copy(p)
  }

  // Toque en las gorditas de la lluvia: brincan.
  const ray = new Raycaster()
  const ndc = new Vector2()
  function pick(clientX, clientY) {
    ndc.set((clientX / view.w) * 2 - 1, -(clientY / view.h) * 2 + 1)
    ray.setFromCamera(ndc, camera)
    const visible = rain.filter((g) => g.root.visible).map((g) => g.root)
    const hit = ray.intersectObjects(visible, true)[0]
    if (!hit) return null
    let o = hit.object
    while (o.parent && !visible.includes(o)) o = o.parent
    return rain.find((g) => g.root === o) || null
  }

  function render() {
    renderer.render(scene, camera)
  }

  async function compile() {
    rain.forEach((g) => (g.root.visible = true))
    if (renderer.compileAsync) await renderer.compileAsync(scene, camera)
    render()
    rain.forEach((g) => (g.root.visible = false))
  }

  resize()
  return { renderer, scene, camera, main, rain, view, resize, toWorld, aim, pick, render, compile }
}
