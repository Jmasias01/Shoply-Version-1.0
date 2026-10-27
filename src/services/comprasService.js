// Servicio de compras: crear, leer, cambiar de tienda, finalizar y descartar compras.
// Lo usan Inicio, Historial, la pantalla de compra y Cambiar tienda. Cada función devuelve
// { datos, error }, donde `error` ya es un mensaje en español (ver errores.js).
// La seguridad la pone RLS en la base de datos: cada usuario solo ve sus propias compras.

import { supabase } from '../config/supabase';
import { obtenerAnioActual } from '../utils/formato';
import { MENSAJE_SIN_CONEXION, mensajeDeError } from './errores';

// Código de Postgres cuando se viola un índice único: aquí significa
// que el usuario ya tiene una compra en curso (solo puede haber una).
const CODIGO_DUPLICADO = '23505';

// Primer día del año actual en Perú, en el formato de la columna `fecha`.
// Inicio e Historial solo muestran compras del año en curso.
function inicioDelAnio() {
  return `${obtenerAnioActual()}-01-01`;
}

/**
 * Devuelve la compra en curso del usuario con el precio y la cantidad de sus productos
 * (para mostrar el total y la cantidad en Inicio), o null si no tiene ninguna.
 */
export async function obtenerCompraEnCurso() {
  try {
    const { data, error } = await supabase
      .from('shopping_trips')
      .select('id, tienda, fecha, iniciado_en, trip_items(precio_unitario, cantidad)')
      .eq('estado', 'en_curso')
      .maybeSingle();
    return { datos: data, error: mensajeDeError(error) };
  } catch {
    return { datos: null, error: MENSAJE_SIN_CONEXION };
  }
}

/**
 * Devuelve las compras finalizadas del año en curso, de la más reciente a la más antigua.
 * Con `limite` devuelve solo las primeras: Inicio pide 3 y el Historial las pide todas.
 */
export async function obtenerComprasFinalizadas(limite) {
  try {
    let consulta = supabase
      .from('shopping_trips')
      .select('id, tienda, fecha, trip_items(precio_unitario, cantidad)')
      .eq('estado', 'finalizado')
      .gte('fecha', inicioDelAnio())
      .order('fecha', { ascending: false })
      .order('finalizado_en', { ascending: false });
    // El límite es opcional: sin él llegan todas las compras del año.
    if (limite) {
      consulta = consulta.limit(limite);
    }
    const { data, error } = await consulta;
    return { datos: data ?? [], error: mensajeDeError(error) };
  } catch {
    return { datos: [], error: MENSAJE_SIN_CONEXION };
  }
}

/**
 * Devuelve una compra con todos sus productos, lo último agregado primero.
 * Sirve tanto para la compra en curso como para el detalle de una finalizada.
 */
export async function obtenerCompra(idCompra) {
  try {
    const { data, error } = await supabase
      .from('shopping_trips')
      .select('id, tienda, fecha, estado, trip_items(id, nombre, cantidad, precio_unitario, origen, creado_en)')
      .eq('id', idCompra)
      .order('creado_en', { referencedTable: 'trip_items', ascending: false })
      .maybeSingle();
    return { datos: data, error: mensajeDeError(error) };
  } catch {
    return { datos: null, error: MENSAJE_SIN_CONEXION };
  }
}

/**
 * Crea una compra en curso en la tienda elegida. La fecha (hora de Perú),
 * el estado y el usuario los pone la base de datos por defecto.
 */
export async function crearCompra(tienda) {
  try {
    const { data, error } = await supabase
      .from('shopping_trips')
      .insert({ tienda: tienda.trim() })
      .select('id')
      .single();
    if (error?.code === CODIGO_DUPLICADO) {
      return { datos: null, error: 'Ya tienes una compra en curso.' };
    }
    return { datos: data, error: mensajeDeError(error) };
  } catch {
    return { datos: null, error: MENSAJE_SIN_CONEXION };
  }
}

/** Cambia la tienda de una compra. Los productos y el total no cambian. */
export async function cambiarTienda(idCompra, tienda) {
  try {
    const { error } = await supabase
      .from('shopping_trips')
      .update({ tienda: tienda.trim() })
      .eq('id', idCompra);
    return { datos: null, error: mensajeDeError(error) };
  } catch {
    return { datos: null, error: MENSAJE_SIN_CONEXION };
  }
}

/** Marca la compra como finalizada y guarda la hora en que se finalizó. */
export async function finalizarCompra(idCompra) {
  try {
    const { error } = await supabase
      .from('shopping_trips')
      .update({ estado: 'finalizado', finalizado_en: new Date().toISOString() })
      .eq('id', idCompra);
    return { datos: null, error: mensajeDeError(error) };
  } catch {
    return { datos: null, error: MENSAJE_SIN_CONEXION };
  }
}

/** Borra la compra. Sus productos se borran solos (on delete cascade). */
export async function descartarCompra(idCompra) {
  try {
    const { error } = await supabase.from('shopping_trips').delete().eq('id', idCompra);
    return { datos: null, error: mensajeDeError(error) };
  } catch {
    return { datos: null, error: MENSAJE_SIN_CONEXION };
  }
}
