// Traduce los errores de la base de datos (Supabase) a mensajes claros en español.
// Lo usan comprasService y productosService para que las pantallas nunca
// muestren el error técnico, solo un aviso que el usuario entienda.

export const MENSAJE_SIN_CONEXION = 'Sin conexión. Inténtalo de nuevo.';
export const MENSAJE_GENERICO = 'Ocurrió un problema. Inténtalo de nuevo.';

/**
 * Convierte un error de Supabase (o una excepción) en un mensaje para el usuario.
 * Ejemplos:
 *   mensajeDeError(null)                                   → null
 *   mensajeDeError({ message: 'TypeError: Network request failed' }) → "Sin conexión. Inténtalo de nuevo."
 */
export function mensajeDeError(error) {
  if (!error) {
    return null;
  }
  const texto = String(error.message ?? error);
  // Sin señal, fetch falla con «Network request failed» (móvil) o «Failed to fetch» (web).
  if (/network request failed|failed to fetch/i.test(texto)) {
    return MENSAJE_SIN_CONEXION;
  }
  // El resto queda en la terminal de «npx expo start» para poder diagnosticarlo.
  console.warn('Error de Supabase sin traducir:', error.code, texto);
  return MENSAJE_GENERICO;
}
