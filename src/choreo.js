import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const clamp01 = (v) => Math.max(0, Math.min(1, v))
const seg = (p, a, b) => clamp01((p - a) / (b - a))
const ease = (t) => t * t * (3 - 2 * t)

// La gordita principal vive en tres momentos: el hero, la sección donde se
// arma (fija) y la lluvia del final. Aquí se decide dónde está y cómo se ve
// en cada uno. Las posiciones van en fracciones de pantalla (0..1).
export function setupStage(stage, { reduced, scrub }) {
  const { main, rain, view } = stage

  const pose = {
    x: 0.5, y: 0.55, size: 0.36, // size: alto de la gordita como fracción de la pantalla
    rx: 0.62, ry: 0.35, rz: 0,
    visible: true,
  }
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
  let spin = 0

  const isMobile = () => view.mobile

  // ── Hero ────────────────────────────────────────────────────────────────
  // Arranca sola, al centro, encima de MAMÁ TITA. Al bajar sube, crece un poco
  // y se va girando, dejando el paso a la cinta.
  const heroPose = () => ({ x: 0.5, y: isMobile() ? 0.56 : 0.52, size: isMobile() ? 0.17 : 0.33 })
  Object.assign(pose, heroPose())
  main.apply({ flat: 1, toast: 1, open: 0.36, fill: 1, cheese: 1, comal: 0 })

  const hero = { p: 0 }
  gsap.to(hero, {
    p: 1,
    ease: 'none',
    scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub },
  })

  // ── Se arma ─────────────────────────────────────────────────────────────
  const build = { enter: 0, p: 0, exit: 0 }
  gsap.to(build, {
    enter: 1,
    ease: 'none',
    scrollTrigger: { trigger: '#se-arma', start: 'top bottom', end: 'top top', scrub },
  })
  gsap.to(build, {
    p: 1,
    ease: 'none',
    scrollTrigger: { trigger: '#se-arma', start: 'top top', end: 'bottom bottom', scrub },
  })
  gsap.to(build, {
    exit: 1,
    ease: 'none',
    scrollTrigger: { trigger: '#se-arma', start: 'bottom bottom', end: 'bottom top', scrub },
  })

  const steps = [...document.querySelectorAll('[data-steps] li')]
  const final = document.querySelector('[data-build-final]')
  const stepsBox = document.querySelector('[data-steps]')
  const bar = document.querySelector('[data-build-bar]')
  let lastStep = -1

  // ¿Qué zona está activa? hero | build | none
  function zone() {
    if (build.enter > 0.001 && build.exit < 0.999) return 'build'
    if (hero.p < 0.999) return 'hero'
    return 'none'
  }

  function updateMain(dt, t) {
    const z = zone()
    main.root.visible = z !== 'none'
    if (z === 'hero') {
      const h = heroPose()
      const e = ease(hero.p)
      pose.x = h.x
      pose.y = h.y - e * 0.95
      pose.size = h.size * (1 + e * 0.35)
      pose.rx = 0.62 + e * 0.6
      spin += dt * (reduced ? 0 : 0.18)
      pose.ry = 0.35 + spin + e * 2.2
      pose.rz = Math.sin(t * 0.8) * 0.03
      main.apply({ flat: 1, toast: 1, open: 0.26 + Math.sin(t * 1.2) * 0.015, fill: 1, cheese: 1, comal: 0 })
    } else if (z === 'build') {
      const p = build.p
      const mobile = isMobile()
      const bx = mobile ? 0.5 : 0.66
      const by = mobile ? 0.5 : 0.6
      // Entra desde abajo mientras la sección sube; sale hacia arriba con ella.
      pose.x = bx
      pose.y = by + (1 - ease(build.enter)) * 0.9 - ease(build.exit) * 1.1
      pose.size = mobile ? 0.15 : 0.3
      pose.rx = 0.66 - seg(p, 0.85, 1) * 0.06
      pose.ry = -0.3 + p * 0.9
      pose.rz = 0
      // Cada paso ocupa una quinta parte del recorrido.
      const flat = ease(seg(p, 0.02, 0.18))
      const toast = ease(seg(p, 0.22, 0.38))
      const open = ease(seg(p, 0.42, 0.56)) * 0.5 - ease(seg(p, 0.82, 0.95)) * 0.22
      const fill = ease(seg(p, 0.6, 0.76))
      const cheese = ease(seg(p, 0.8, 0.94))
      // Brinquito al inflarse en el comal.
      const puff = Math.sin(seg(p, 0.22, 0.38) * Math.PI) * 0.04
      pose.y -= puff
      main.apply({ flat, toast, open, fill, cheese, comal: 1 })

      const step = Math.min(4, Math.floor(p * 5 - 0.0001))
      if (step !== lastStep) {
        steps.forEach((li, i) => li.classList.toggle('is-on', i === Math.max(0, step)))
        lastStep = step
      }
      // Al final la lista de pasos se va y su lugar lo toma el nombre de la gordita.
      const fin = seg(p, 0.93, 1)
      final.style.opacity = fin
      final.style.transform = `translateY(${(1 - fin) * 30}px)`
      stepsBox.style.opacity = 1 - fin
      stepsBox.style.transform = `translateY(${-fin * 20}px)`
      bar.style.transform = `scaleX(${p})`
    }

    // Seguimiento suave del mouse (un par de grados).
    mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 4)
    mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 4)

    const [wx, wy] = stage.toWorld(pose.x, pose.y)
    main.root.position.set(wx, wy, 0)
    // La geometría mide ~0.55 de alto con la inclinación: se escala al tamaño pedido.
    main.root.scale.setScalar((pose.size * view.vh) / 1.25)
    main.root.rotation.set(pose.rx + mouse.y * 0.08, mouse.x * 0.12, pose.rz)
    main.body.rotation.y = pose.ry
    stage.aim(main.root)
  }

  // ── Lluvia final: gorditas que caen y se apilan; al tocarlas brincan ─────
  const finale = document.getElementById('final')
  let raining = false
  let rainOn = false
  const drops = rain.map((g, i) => ({
    g,
    x: 0.08 + (i / (rain.length - 1)) * 0.84 + (Math.random() - 0.5) * 0.05,
    y: -0.2 - Math.random() * 0.9,
    vy: 0,
    floor: 0,
    rx: Math.random() * Math.PI,
    ry: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 3,
    size: 0.065 + Math.random() * 0.03,
  }))

  function resetRain() {
    const top = finale.getBoundingClientRect().top
    const row = finale.querySelector('.finale__giant').getBoundingClientRect()
    drops.forEach((d, i) => {
      d.y = -0.15 - Math.random() * 1.1 - i * 0.04
      d.vy = 0
      // Se apilan sobre el letrero, en dos alturas para que no queden en fila.
      // Se guarda relativo a la sección, así el piso sigue al scroll.
      d.floorRel = row.top - top + row.height * (0.5 + (i % 2) * 0.24)
    })
  }

  ScrollTrigger.create({
    trigger: finale,
    start: 'top 70%',
    end: 'bottom top',
    onEnter: () => {
      rainOn = true
      if (!raining) {
        resetRain()
        raining = true
      }
    },
    onEnterBack: () => (rainOn = true),
    onLeave: () => (rainOn = false),
    onLeaveBack: () => {
      rainOn = false
      raining = false
    },
  })

  function updateRain(dt) {
    rain.forEach((g) => (g.root.visible = rainOn))
    if (!rainOn) return
    const top = finale.getBoundingClientRect().top
    drops.forEach((d) => {
      const floor = (top + d.floorRel) / view.h
      d.vy += dt * 2.4
      d.y += d.vy * dt
      if (d.y > floor) {
        d.y = floor
        d.vy = Math.abs(d.vy) > 0.25 ? -d.vy * 0.35 : 0
        d.vr *= 0.6
      }
      d.ry += d.vr * dt
      const [wx, wy] = stage.toWorld(d.x, d.y)
      d.g.root.position.set(wx, wy, 0)
      d.g.root.scale.setScalar((d.size * view.vh) / 1.25)
      d.g.root.rotation.set(0.55 + Math.sin(d.rx) * 0.3, 0, Math.sin(d.rx * 1.7) * 0.2)
      d.g.body.rotation.y = d.ry
    })
  }

  function poke(clientX, clientY) {
    if (!rainOn) return false
    const hit = stage.pick(clientX, clientY)
    if (!hit) return false
    const d = drops.find((x) => x.g === hit)
    d.vy = -1.6 - Math.random() * 0.6
    d.vr = (Math.random() - 0.5) * 14
    return true
  }

  function onPointer(e) {
    mouse.tx = (e.clientX / view.w) * 2 - 1
    mouse.ty = (e.clientY / view.h) * 2 - 1
  }

  return {
    update(dt, t) {
      updateMain(dt, t)
      updateRain(dt)
    },
    onPointer,
    poke,
    active: () => zone() !== 'none' || rainOn,
  }
}
