// Agrupa las compras finalizadas por mes para la pantalla Historial.
// Es una función pura: recibe la lista de Supabase y devuelve los grupos listos para dibujar.

import { calcularTotal } from './calculos';
import { formatearMesAnio } from './formato';

/**
 * Agrupa las compras por mes, respetando el orden en que llegan
 * (de la más reciente a la más antigua). Cada grupo trae su título y su total.
 * Ejemplo:
 *   agruparComprasPorMes([
 *     { fecha: '2026-10-15', trip_items: [{ precio_unitario: 400, cantidad: 1 }] },
 *     { fecha: '2026-10-01', trip_items: [{ precio_unitario: 300, cantidad: 1 }] },
 *     { fecha: '2026-09-01', trip_items: [{ precio_unitario: 200, cantidad: 1 }] },
 *   ])
 *   → [
 *       { clave: '2026-10', titulo: 'Octubre 2026', total: 700, compras: [...2 compras] },
 *       { clave: '2026-09', titulo: 'Setiembre 2026', total: 200, compras: [...1 compra] },
 *     ]
 */
export function agruparComprasPorMes(compras) {
  const grupos = [];

  for (const compra of compras) {
    // «2026-10-15» → «2026-10»: las compras del mismo mes comparten esta clave.
    const clave = compra.fecha.slice(0, 7);
    const ultimoGrupo = grupos[grupos.length - 1];

    // Como las compras vienen ordenadas por fecha, las del mismo mes llegan juntas:
    // basta con mirar el último grupo creado.
    if (ultimoGrupo && ultimoGrupo.clave === clave) {
      ultimoGrupo.compras.push(compra);
    } else {
      grupos.push({ clave, titulo: formatearMesAnio(compra.fecha), compras: [compra] });
    }
  }

  // El total del mes es la suma de los totales de sus compras.
  return grupos.map((grupo) => ({
    ...grupo,
    total: grupo.compras.reduce((suma, compra) => suma + calcularTotal(compra.trip_items), 0),
  }));
}
