// Funciones puras para mostrar montos, fechas y horas con el formato de Shoply.
// Se usan en todas las pantallas (Inicio, Compra, diálogos, filas) para que
// un monto o una fecha se vea siempre igual en toda la app.

// Abreviaturas de mes en español de Perú. Septiembre es «set.», no «sep.».
const MESES_CORTOS = [
  'ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.',
  'jul.', 'ago.', 'set.', 'oct.', 'nov.', 'dic.',
];

// Perú está en UTC−5 todo el año (no hay horario de verano),
// así que basta restar 5 horas para obtener la hora de Lima.
const DESFASE_LIMA_MS = -5 * 60 * 60 * 1000;

/**
 * Da formato de soles con dos decimales siempre.
 * Ejemplos:
 *   formatearMonto(200)    → "S/ 200.00"
 *   formatearMonto(87.4)   → "S/ 87.40"
 *   formatearMonto('4.5')  → "S/ 4.50"
 */
export function formatearMonto(monto) {
  const numero = Number(monto) || 0;
  return `S/ ${numero.toFixed(2)}`;
}

/**
 * Obtiene día, mes (0–11) y año de una fecha.
 * Acepta:
 *   - un texto "AAAA-MM-DD" (así llega la columna `date` de Supabase);
 *     se lee tal cual para que la zona horaria no cambie el día.
 *   - un objeto Date; se convierte a la hora de Lima.
 */
function obtenerPartesFecha(fecha) {
  if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    return { dia, mes: mes - 1, anio };
  }

  const enLima = new Date(new Date(fecha).getTime() + DESFASE_LIMA_MS);
  return {
    dia: enLima.getUTCDate(),
    mes: enLima.getUTCMonth(),
    anio: enLima.getUTCFullYear(),
  };
}

/**
 * Da formato de día + mes abreviado + año. Es la única función de fechas de la app.
 * Ejemplos:
 *   formatearFecha('2026-09-01')  → "1 set. 2026"
 *   formatearFecha('2026-10-15')  → "15 oct. 2026"
 */
export function formatearFecha(fecha) {
  const { dia, mes, anio } = obtenerPartesFecha(fecha);
  return `${dia} ${MESES_CORTOS[mes]} ${anio}`;
}

// Nombres completos de los meses para los encabezados del Historial.
// En Perú se escribe «setiembre», igual que la abreviatura «set.».
const MESES_COMPLETOS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/**
 * Mes completo con mayúscula inicial y año, para los encabezados del Historial.
 * Ejemplos:
 *   formatearMesAnio('2026-10-15')  → "Octubre 2026"
 *   formatearMesAnio('2026-09-01')  → "Setiembre 2026"
 */
export function formatearMesAnio(fecha) {
  const { mes, anio } = obtenerPartesFecha(fecha);
  return `${MESES_COMPLETOS[mes]} ${anio}`;
}

/**
 * Año actual en hora de Perú. Sirve para mostrar solo las compras del año en curso.
 * Ejemplo (el 31 dic. 2026 a las 11 p. m. en Lima, que ya es 1 ene. en UTC):
 *   obtenerAnioActual()  → 2026
 */
export function obtenerAnioActual() {
  return obtenerPartesFecha(new Date()).anio;
}

/**
 * Hora en formato de 12 horas, en hora de Perú, con «a. m.» o «p. m.».
 * Recibe la fecha y hora tal como llega de Supabase (por ejemplo, `iniciado_en`).
 * Ejemplos:
 *   formatearHora('2026-10-17T15:24:00Z')  → "10:24 a. m."
 *   formatearHora('2026-10-17T17:05:00Z')  → "12:05 p. m."
 */
export function formatearHora(fechaHora) {
  const enLima = new Date(new Date(fechaHora).getTime() + DESFASE_LIMA_MS);
  const horas24 = enLima.getUTCHours();
  const minutos = String(enLima.getUTCMinutes()).padStart(2, '0');
  // 0 → 12 (medianoche) y 13 → 1: el reloj de 12 horas nunca muestra 0.
  const horas12 = horas24 % 12 === 0 ? 12 : horas24 % 12;
  const sufijo = horas24 < 12 ? 'a. m.' : 'p. m.';
  return `${horas12}:${minutos} ${sufijo}`;
}

/**
 * Texto de la cantidad de productos, en singular o plural.
 * Ejemplos:
 *   formatearCantidadProductos(1)  → "1 producto"
 *   formatearCantidadProductos(5)  → "5 productos"
 */
export function formatearCantidadProductos(cantidad) {
  return cantidad === 1 ? '1 producto' : `${cantidad} productos`;
}
