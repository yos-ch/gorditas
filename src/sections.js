import { categorias, guisos, platillo, bebidas, negocio, wa } from './data/menu.js'
import { icono } from './icons.js'

const pesos = (n) => `$${n}`

function el(tag, className, html) {
  const e = document.createElement(tag)
  if (className) e.className = className
  if (html !== undefined) e.innerHTML = html
  return e
}

// ── Menú con filtro de íconos ─────────────────────────────────────────────
export function renderMenu() {
  const filters = document.querySelector('[data-filters]')
  const list = document.querySelector('[data-menu]')
  if (!filters || !list) return

  const titulos = {
    basicas: ['Las Básicas', 'Las de siempre'],
    preferidas: ['Las Preferidas', 'Las que más se piden'],
    tradicionales: ['Las Tradicionales', 'Guisos de olla, como en casa'],
    platillo: ['Platillo', 'Para desayunar en forma'],
    bebidas: ['Bebidas', 'Para acompañar'],
  }

  function dish(g) {
    const row = el('div', `dish${g.estrella ? ' dish--star' : ''}`)
    row.append(
      el('p', 'dish__name', `${g.nombre}${g.nota ? `<em>${g.nota}</em>` : ''}`),
      el('p', 'price', `${pesos(g.gordita)}<small>gordita</small>`),
      el('p', 'price', `${pesos(g.burrito)}<small>burrito</small>`)
    )
    return row
  }

  function group(cat) {
    const [t, s] = titulos[cat]
    return el('h3', 'menu__group', `${t} <small>${s}</small>`)
  }

  function show(cat) {
    list.textContent = ''
    const cats = cat === 'todo' ? ['basicas', 'preferidas', 'tradicionales', 'platillo', 'bebidas'] : [cat]
    let i = 0
    const stagger = (node) => {
      node.classList.add('is-in')
      node.style.animationDelay = `${Math.min(i++, 14) * 35}ms`
      return node
    }
    cats.forEach((c) => {
      list.appendChild(group(c))
      if (c === 'platillo') {
        const row = el('div', 'dish dish--wide')
        row.append(el('p', 'dish__name', `${platillo.nombre}<em>${platillo.descripcion}</em>`), el('p', 'price', pesos(platillo.precio)))
        list.appendChild(stagger(row))
      } else if (c === 'bebidas') {
        bebidas.forEach((b) => {
          const row = el('div', 'dish')
          row.style.gridTemplateColumns = '1fr auto'
          row.append(el('p', 'dish__name', b.nombre), el('p', 'price', pesos(b.precio)))
          list.appendChild(stagger(row))
        })
      } else {
        guisos.filter((g) => g.cat === c).forEach((g) => list.appendChild(stagger(dish(g))))
      }
    })
  }

  categorias.forEach((c, i) => {
    const b = el('button', `filter${i === 0 ? ' is-on' : ''}`)
    b.type = 'button'
    b.setAttribute('role', 'tab')
    b.setAttribute('aria-selected', String(i === 0))
    b.append(el('span', 'filter__icon', icono(c.icono)), el('span', 'filter__label', c.nombre))
    b.addEventListener('click', () => {
      filters.querySelectorAll('.filter').forEach((x) => {
        x.classList.toggle('is-on', x === b)
        x.setAttribute('aria-selected', String(x === b))
      })
      show(c.id)
    })
    filters.appendChild(b)
  })
  show('todo')
}

// ── Íconos sueltos (data-icon) ────────────────────────────────────────────
export function renderIcons() {
  document.querySelectorAll('[data-icon]').forEach((n) => {
    n.innerHTML = icono(n.dataset.icon, { sinAnillo: n.hasAttribute('data-icon-plain') })
  })
}

// ── Enlaces de WhatsApp, mapa y facturación ───────────────────────────────
export function wireLinks() {
  document.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = wa(a.dataset.wa)
    a.target = '_blank'
    a.rel = 'noopener'
  })
  document.querySelectorAll('[data-map]').forEach((a) => (a.href = negocio.mapa))
  document.querySelectorAll('[data-facturacion]').forEach((a) => (a.href = negocio.facturacion))
}

// ── ¿Abierto o cerrado? Con la hora de Chihuahua ──────────────────────────
function ahoraChihuahua() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chihuahua',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(new Date())
  const get = (t) => parts.find((p) => p.type === t)?.value
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'))
  const hora = (Number(get('hour')) % 24) + Number(get('minute')) / 60
  return { dia, hora }
}

const hora12 = (h) => {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh > 12 ? hh - 12 : hh}${mm ? `:${String(mm).padStart(2, '0')}` : ''}`
}

export function estado() {
  const { dia, hora } = ahoraChihuahua()
  const hoy = negocio.horario[dia]
  if (hoy && hora >= hoy[0] && hora < hoy[1]) return { abierto: true, grande: '¡Abierto!', dia }
  if (hoy && hora < hoy[0]) return { abierto: false, grande: `Abrimos a las ${hora12(hoy[0])}`, dia }
  return { abierto: false, grande: 'Cerrado', dia }
}

export function renderStatus() {
  const e = estado()
  document.querySelector('[data-hero-open]').textContent = e.grande
  const hoy = e.dia === 0 ? 'domingo' : e.dia === 6 ? 'sabado' : 'semana'
  document.querySelectorAll('[data-slot]').forEach((s) => s.classList.toggle('is-today', s.dataset.slot === hoy))
}
