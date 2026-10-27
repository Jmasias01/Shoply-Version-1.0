// Servicio de productos: agregar, editar y borrar productos de una compra.
// Lo usan el formulario de producto y el menú (⋯) de cada producto.
// Cada producto se guarda en Supabase en el momento: no hay botón «guardar todo».

import { supabase } from '../config/supabase';
import { convertirPrecio } from '../utils/validaciones';
import { MENSAJE_SIN_CONEXION, mensajeDeError } from './errores';

// Convierte los datos del formulario al formato de la tabla `trip_items`.
// El precio llega como texto ("4,50") y se guarda siempre como número.
function aFilaDeTabla({ nombre, precio, cantidad }) {
  return {
    nombre: nombre.trim(),
    precio_unitario: convertirPrecio(precio),
    cantidad,
  };
}

/**
 * Agrega un producto a la compra. `origen` es 'manual' (formulario) o
 * 'etiqueta' (leído con la cámara).
 */
export async function agregarProducto(idCompra, producto, origen = 'manual') {
  try {
    const { error } = await supabase
      .from('trip_items')
      .insert({ ...aFilaDeTabla(producto), trip_id: idCompra, origen });
    return { datos: null, error: mensajeDeError(error) };
  } catch {
    return { datos: null, error: MENSAJE_SIN_CONEXION };
  }
}

/** Guarda los cambios de nombre, precio y cantidad de un producto. */
export async function editarProducto(idProducto, producto) {
  try {
    const { error } = await supabase
      .from('trip_items')
      .update(aFilaDeTabla(producto))
      .eq('id', idProducto);
    return { datos: null, error: mensajeDeError(error) };
  } catch {
    return { datos: null, error: MENSAJE_SIN_CONEXION };
  }
}

/** Borra un producto de la compra. */
export async function borrarProducto(idProducto) {
  try {
    const { error } = await supabase.from('trip_items').delete().eq('id', idProducto);
    return { datos: null, error: mensajeDeError(error) };
  } catch {
    return { datos: null, error: MENSAJE_SIN_CONEXION };
  }
}
