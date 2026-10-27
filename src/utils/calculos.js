// Cálculos de dinero de la compra: subtotal de un producto y total de la compra.
// El total nunca se guarda en la base de datos; se calcula siempre con
// estas funciones, así se actualiza solo al agregar, editar o borrar productos.

// Redondea a 2 decimales. Evita errores de coma flotante como 0.1 + 0.2 = 0.30000000000000004.
function redondear(valor) {
  return Math.round(valor * 100) / 100;
}

/**
 * Subtotal de un producto = precio × cantidad.
 * Ejemplos:
 *   calcularSubtotal(4.5, 6)   → 27
 *   calcularSubtotal(6.85, 2)  → 13.7
 */
export function calcularSubtotal(precio, cantidad) {
  return redondear((Number(precio) || 0) * (Number(cantidad) || 0));
}

/**
 * Total de la compra = suma de los subtotales.
 * Recibe la lista de productos tal como llega de Supabase
 * (con `precio_unitario` y `cantidad`).
 * Ejemplo:
 *   calcularTotal([
 *     { precio_unitario: 4.5, cantidad: 6 },   // 27.00
 *     { precio_unitario: 24.9, cantidad: 1 },  // 24.90
 *   ]) → 51.9
 */
export function calcularTotal(productos) {
  const suma = productos.reduce(
    (acumulado, producto) =>
      acumulado + calcularSubtotal(producto.precio_unitario, producto.cantidad),
    0
  );
  return redondear(suma);
}
