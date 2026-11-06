// Menú de Gorditas Mamá Tita (tomado de gorditasmamatita.pulsoia.mx).
// Cada guiso viene en gordita y en burrito; aquí se agrupan en una sola fila
// con los dos precios. Para cambiar un precio, se cambia aquí y listo.

export const categorias = [
  { id: 'todo', nombre: 'Todo', icono: 'todo' },
  { id: 'basicas', nombre: 'Las Básicas', icono: 'basicas' },
  { id: 'preferidas', nombre: 'Las Preferidas', icono: 'preferidas' },
  { id: 'tradicionales', nombre: 'Las Tradicionales', icono: 'tradicionales' },
  { id: 'platillo', nombre: 'Platillo', icono: 'platillo' },
  { id: 'bebidas', nombre: 'Bebidas', icono: 'bebidas' },
]

export const guisos = [
  // Las Básicas
  { cat: 'basicas', nombre: 'Picadillo', gordita: 24, burrito: 38 },
  { cat: 'basicas', nombre: 'Frijoles con queso', gordita: 20, burrito: 35 },
  { cat: 'basicas', nombre: 'Huevito con jamón', gordita: 24, burrito: 38 },
  { cat: 'basicas', nombre: 'Huevito a la mexicana', gordita: 24, burrito: 38 },
  { cat: 'basicas', nombre: 'Chile beans', gordita: 24, burrito: 38 },
  { cat: 'basicas', nombre: 'Papas con chorizo', gordita: 24, burrito: 38 },
  // Las Preferidas
  { cat: 'preferidas', nombre: 'Chicharrón prensado', gordita: 29, burrito: 45 },
  { cat: 'preferidas', nombre: 'Chile relleno', gordita: 29, burrito: 45 },
  { cat: 'preferidas', nombre: 'Rajas con queso', gordita: 29, burrito: 45 },
  { cat: 'preferidas', nombre: 'Choriqueso', gordita: 29, burrito: 45 },
  { cat: 'preferidas', nombre: 'La Especial de Mamá Tita', nota: 'Todo en uno', gordita: 32, burrito: 50, estrella: true },
  // Las Tradicionales
  { cat: 'tradicionales', nombre: 'Asado de puerco', gordita: 26, burrito: 40 },
  { cat: 'tradicionales', nombre: 'Costilla verde', gordita: 26, burrito: 40 },
  { cat: 'tradicionales', nombre: 'Deshebrada en rojo', gordita: 26, burrito: 40 },
  { cat: 'tradicionales', nombre: 'Deshebrada en verde', gordita: 26, burrito: 40 },
  { cat: 'tradicionales', nombre: 'Chicharrón en salsa verde', gordita: 26, burrito: 40 },
  { cat: 'tradicionales', nombre: 'Pollo en mole', gordita: 26, burrito: 40 },
  { cat: 'tradicionales', nombre: 'Pollo en chipotle', gordita: 26, burrito: 40 },
  { cat: 'tradicionales', nombre: 'Quesadillas', gordita: 26, burrito: 40 },
  { cat: 'tradicionales', nombre: 'Sincronizada', gordita: 26, burrito: 40 },
]

export const platillo = {
  nombre: 'Platillo',
  descripcion: 'Huevitos al gusto, frijoles y un guisado, o bien chilaquiles. Incluye tortillas de harina recién hechas.',
  precio: 90,
}

export const bebidas = [
  { nombre: 'Coca-Cola 600 ml', precio: 25 },
  { nombre: 'Coca-Cola de vidrio 500 ml', precio: 20 },
  { nombre: 'Pepsi 400 ml', precio: 18 },
  { nombre: 'Mirinda', precio: 18 },
  { nombre: 'Manzanita', precio: 18 },
  { nombre: '7-Up 400 ml', precio: 18 },
  { nombre: 'Elite de fresa', precio: 18 },
  { nombre: 'Elite de toronja', precio: 18 },
  { nombre: 'Manzanita Sol', precio: 18 },
  { nombre: 'Agua de sabor', precio: 18 },
  { nombre: 'Agua natural', precio: 18 },
  { nombre: 'Café', precio: 18 },
]

export const negocio = {
  whatsapp: '5216141606076',
  telefono: '614 160 6076',
  direccion: ['Calle Sicomoro #2512', 'Col. Francisco I. Madero', 'Chihuahua, Chih.'],
  mapa: 'https://www.google.com/maps/search/?api=1&query=Calle+Sicomoro+2512+Francisco+I+Madero+Chihuahua',
  // Horas en decimal por día de la semana (0 = domingo). Domingo cerrado.
  horario: {
    1: [7.5, 15], 2: [7.5, 15], 3: [7.5, 15], 4: [7.5, 15], 5: [7.5, 15],
    6: [8, 14],
  },
  facturacion: 'https://gorditasmamatita.com/facturacion.html',
}

export const wa = (texto) => `https://wa.me/${negocio.whatsapp}?text=${encodeURIComponent(texto)}`
