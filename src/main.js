import '@fontsource-variable/archivo/wdth.css'
import '@fontsource/bebas-neue/400.css'
import '@fontsource/rochester/400.css'
import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { createStage } from './three/stage.js'
import { setupStage } from './choreo.js'
import { setupMotion } from './motion.js'
import { renderMenu, renderIcons, renderStatus, wireLinks } from './sections.js'

gsap.registerPlugin(ScrollTrigger)

const params = new URLSearchParams(location.search)
// ?shot: sin transiciones CSS, para capturas automáticas.
if (params.has('shot')) document.documentElement.classList.add('no-transitions')

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = window.matchMedia('(pointer: fine)').matches

// Contenido
renderMenu()
renderIcons()
wireLinks()
renderStatus()
setInterval(renderStatus, 60_000)

// Scroll suave con mouse; en celular, el scroll nativo.
let lenis = null
if (!reduced && finePointer) {
  lenis = new Lenis({ duration: 1.2 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}
const scrub = lenis ? true : 0.5

// 3D
const stage = createStage(document.getElementById('stage'))
if (import.meta.env.DEV) Object.assign(window, { __stage: stage, __ST: ScrollTrigger })
const show = setupStage(stage, { reduced, scrub })

// Animaciones de la página
let heroIn = null
setupMotion({ reduced, scrub, lenis, onHeroIn: (fn) => (heroIn = fn) })

window.addEventListener('resize', () => {
  stage.resize()
  ScrollTrigger.refresh()
})
// Cuando cambia la altura de la página (el filtro del menú, una foto que
// terminó de cargar), las animaciones de abajo se recalculan. Sin esto,
// títulos más abajo esperaban en una posición vieja y no aparecían.
let lastHeight = 0
let refreshTimer = null
new ResizeObserver(() => {
  const h = document.documentElement.scrollHeight
  if (Math.abs(h - lastHeight) < 2) return
  lastHeight = h
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 120)
}).observe(document.querySelector('main'))
window.addEventListener('load', () => ScrollTrigger.refresh())
window.addEventListener('pointermove', (e) => show.onPointer(e), { passive: true })
// Las gorditas de la lluvia se tocan; el canvas no recibe clics, así que se
// revisa aquí y solo se intercepta si de verdad se tocó una.
window.addEventListener('pointerdown', (e) => {
  if (e.target.closest('a, button')) return
  show.poke(e.clientX, e.clientY)
})

// Solo se dibuja mientras hay 3D en pantalla, más un cuadro extra al salir
// para que no se quede pegada la última imagen.
let wasActive = true
gsap.ticker.add((time, deltaMs) => {
  const dt = Math.min(deltaMs, 100) / 1000
  show.update(dt, time)
  const active = show.active()
  if (active || wasActive) stage.render()
  wasActive = active
})

// Anclas con scroll suave
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'))
    if (!target) return
    e.preventDefault()
    if (lenis) lenis.scrollTo(target)
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  })
})

// Pantalla de carga: el contador avanza mientras se compilan los shaders.
const count = document.querySelector('.loader__count')
const progress = { v: 0 }
const paint = () => (count.textContent = `${Math.round(progress.v)}%`)
gsap.to(progress, { v: 88, duration: 1.4, ease: 'power1.out', onUpdate: paint })
lenis?.stop()

Promise.all([document.fonts.ready, stage.compile()]).then(() => {
  gsap.to(progress, {
    v: 100,
    duration: 0.3,
    overwrite: true,
    onUpdate: paint,
    onComplete: () => {
      document.body.classList.add('is-ready')
      lenis?.start()
      ScrollTrigger.refresh()
      heroIn?.()
      // Para revisar una posición de scroll: ?y=900
      const y = Number(params.get('y'))
      if (y) window.scrollTo(0, y)
    },
  })
})
