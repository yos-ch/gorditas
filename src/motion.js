import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Parte un texto en letras dentro de máscaras, respetando los <br>.
function splitLetters(node) {
  const frag = document.createDocumentFragment()
  ;[...node.childNodes].forEach((child) => {
    if (child.nodeType === 3) {
      ;[...child.textContent].forEach((c) => {
        if (c === ' ') return frag.appendChild(document.createTextNode(' '))
        const m = document.createElement('span')
        m.className = 'ch-mask'
        const s = document.createElement('span')
        s.className = 'ch'
        s.textContent = c
        m.appendChild(s)
        frag.appendChild(m)
      })
    } else {
      frag.appendChild(child.cloneNode(true))
    }
  })
  node.textContent = ''
  node.appendChild(frag)
  return node.querySelectorAll('.ch')
}

// Igual, pero cada palabra entera sube como un bloque (para títulos largos).
function splitWords(node) {
  const frag = document.createDocumentFragment()
  ;[...node.childNodes].forEach((child) => {
    if (child.nodeType === 3) {
      child.textContent.split(/(\s+)/).forEach((w) => {
        if (!w) return
        if (/^\s+$/.test(w)) return frag.appendChild(document.createTextNode(' '))
        const m = document.createElement('span')
        m.className = 'ch-mask'
        const s = document.createElement('span')
        s.className = 'ch'
        s.textContent = w
        m.appendChild(s)
        frag.appendChild(m)
      })
    } else {
      frag.appendChild(child.cloneNode(true))
    }
  })
  node.textContent = ''
  node.appendChild(frag)
  return node.querySelectorAll('.ch')
}

export function setupMotion({ reduced, scrub, lenis, onHeroIn }) {
  // ── Títulos ─────────────────────────────────────────────────────────────
  const heroWords = [...document.querySelectorAll('.hero [data-letters]')]
  const heroChars = heroWords.flatMap((n) => [...splitLetters(n)])
  gsap.set(heroChars, { yPercent: 110 })

  document.querySelectorAll('[data-letters]:not(.hero [data-letters])').forEach((n) => {
    const chars = splitLetters(n)
    if (reduced) return
    gsap.from(chars, {
      yPercent: 110,
      rotate: 6,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.04,
      scrollTrigger: { trigger: n, start: 'top 85%', once: true },
    })
  })
  document.querySelectorAll('[data-letters-words]').forEach((n) => {
    const words = splitWords(n)
    if (reduced) return
    gsap.from(words, {
      yPercent: 110,
      rotate: 4,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.07,
      scrollTrigger: { trigger: n, start: 'top 85%', once: true },
    })
  })

  // Entrada del hero (al quitar la pantalla de carga).
  const heroRise = document.querySelectorAll('.hero [data-rise]')
  gsap.set(heroRise, { opacity: 0, y: 24 })
  onHeroIn(() => {
    const tl = gsap.timeline()
    tl.to(heroChars, { yPercent: 0, duration: reduced ? 0 : 1.1, ease: 'power4.out', stagger: 0.05 })
    tl.to(heroRise, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.1 }, 0.4)
    return tl
  })

  // Las letras gigantes del hero se separan un poco al bajar.
  gsap.to('.hero__giant', {
    yPercent: -18,
    scale: 0.92,
    ease: 'none',
    scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub },
  })

  // ── Aparición suave ─────────────────────────────────────────────────────
  document.querySelectorAll('[data-rise]:not(.hero [data-rise])').forEach((n) => {
    if (reduced) return
    gsap.from(n, {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: n, start: 'top 88%', once: true },
    })
  })

  // ── Parallax de fotos ───────────────────────────────────────────────────
  document.querySelectorAll('[data-float]').forEach((n) => {
    const dir = Number(n.dataset.float) || 1
    gsap.fromTo(
      n,
      { yPercent: 14 * dir },
      {
        yPercent: -14 * dir,
        ease: 'none',
        scrollTrigger: { trigger: n, start: 'top bottom', end: 'bottom top', scrub },
      }
    )
  })

  // ── Letras a mano: se revelan como pincelada ────────────────────────────
  document.querySelectorAll('[data-brush]').forEach((n) => {
    if (reduced) return
    gsap.fromTo(
      n,
      { clipPath: 'inset(-20% 100% -20% 0)' },
      {
        clipPath: 'inset(-20% 0% -20% 0)',
        duration: 1.4,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: n, start: 'top 85%', once: true },
      }
    )
  })

  // ── Cintas infinitas, aceleradas por la velocidad del scroll ─────────────
  const tracks = [...document.querySelectorAll('[data-marquee]')].map((n) => ({
    n,
    dir: Number(n.dataset.marquee),
    x: 0,
  }))
  gsap.ticker.add((_, dt) => {
    const v = lenis ? Math.min(40, Math.abs(lenis.velocity)) : 0
    const speed = (reduced ? 0 : 60 + v * 18) * (dt / 1000)
    tracks.forEach((t) => {
      const w = t.n.scrollWidth / 2
      t.x = (t.x - speed * t.dir) % w
      if (t.x > 0) t.x -= w
      t.n.style.transform = `translateX(${t.x}px)`
    })
  })

  // ── Galería horizontal ──────────────────────────────────────────────────
  const track = document.querySelector('[data-track]')
  const ghost = document.querySelector('[data-ghost]')
  if (track) {
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 40)
    gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: { trigger: '#galeria', start: 'top top', end: 'bottom bottom', scrub, invalidateOnRefresh: true },
    })
    gsap.to(ghost, {
      x: () => -dist() * 0.35,
      ease: 'none',
      scrollTrigger: { trigger: '#galeria', start: 'top top', end: 'bottom bottom', scrub, invalidateOnRefresh: true },
    })
    // Las tarjetas se enderezan un poco al pasar por el centro.
    track.querySelectorAll('.card').forEach((c) => {
      gsap.from(c, {
        y: 120,
        rotate: 12,
        opacity: 0,
        duration: 0.9,
        ease: 'back.out(1.4)',
        scrollTrigger: { trigger: '#galeria', start: 'top 60%', once: true },
        delay: [...track.children].indexOf(c) * 0.06,
      })
    })
  }

  // ── Encabezado: cambia de color según la sección que tiene debajo ────────
  const header = document.querySelector('.header')
  document.querySelectorAll('[data-bg]').forEach((s) => {
    ScrollTrigger.create({
      trigger: s,
      start: 'top 60px',
      end: 'bottom 60px',
      onToggle: (self) => self.isActive && (header.dataset.on = s.dataset.bg),
    })
  })
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 80)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  // El logo gira con la velocidad del scroll.
  const logo = document.querySelector('.header__logo')
  let rot = 0
  gsap.ticker.add(() => {
    const v = lenis ? lenis.velocity : 0
    rot += (v * 0.4 - rot) * 0.1
    logo.style.transform = `rotate(${rot}deg)`
  })
}
