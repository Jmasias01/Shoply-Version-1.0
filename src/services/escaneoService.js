// Servicio de escaneo: envía la foto de una etiqueta a la Edge Function «leer-etiqueta»
// de Supabase, que usa Gemini para leer el nombre y el precio.
// Lo usa la pantalla Cámara. La app nunca habla con Gemini directamente:
// así la clave de Gemini queda guardada en Supabase y no dentro del teléfono.

import { FunctionsFetchError } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { MENSAJE_SIN_CONEXION } from './errores';

const ERROR_LECTURA = 'No se pudo leer la etiqueta. Inténtalo de nuevo.';
const LIMITE_ALCANZADO = 'Se alcanzó el límite de lecturas. Inténtalo más tarde.';

// Código HTTP que devuelve la función cuando se acabó la cuota gratuita de Gemini.
const CODIGO_LIMITE = 429;

/**
 * Lee una etiqueta de precio a partir de una foto en base64 (JPEG).
 * Devuelve { datos: { esEtiqueta, nombre, precio }, error }.
 *   - esEtiqueta: false si la foto no parece una etiqueta de precio (la cámara pide otra foto).
 *   - nombre o precio en null si Gemini no pudo leerlos; el formulario los marca para completarlos.
 */
export async function leerEtiqueta(imagenBase64) {
  try {
    // invoke envía también la sesión del usuario: la función solo acepta usuarios conectados.
    const { data, error } = await supabase.functions.invoke('leer-etiqueta', {
      body: { imagenBase64, tipoMime: 'image/jpeg' },
    });
    if (error) {
      // FunctionsFetchError: la petición ni siquiera llegó (sin señal).
      if (error instanceof FunctionsFetchError) {
        return { datos: null, error: MENSAJE_SIN_CONEXION };
      }
      // La función respondió con error: en `error.context` viene su respuesta,
      // y el código 429 significa que se acabó la cuota de lecturas de Gemini.
      if (error.context?.status === CODIGO_LIMITE) {
        return { datos: null, error: LIMITE_ALCANZADO };
      }
      console.warn('Error de la función leer-etiqueta:', error.message);
      return { datos: null, error: ERROR_LECTURA };
    }
    return {
      datos: {
        // Solo un «false» explícito rechaza la foto; si no llega el dato, se asume que sí es etiqueta.
        esEtiqueta: data?.esEtiqueta !== false,
        nombre: data?.nombre ?? null,
        precio: data?.precio ?? null,
      },
      error: null,
    };
  } catch {
    return { datos: null, error: MENSAJE_SIN_CONEXION };
  }
}
