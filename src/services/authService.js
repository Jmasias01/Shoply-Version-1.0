// Servicio de cuenta: iniciar sesión, registrarse, cerrar sesión y leer el perfil.
// Lo usa AuthContext. Cada función atrapa los errores de Supabase y devuelve
// { datos, error }, donde `error` es un mensaje claro en español (nunca el error técnico).

import { supabase } from '../config/supabase';
// Los mensajes generales son los mismos en todos los servicios (ver errores.js).
import { MENSAJE_GENERICO, MENSAJE_SIN_CONEXION } from './errores';

// Traduce un error de Supabase Auth a un mensaje para el usuario.
// Supabase identifica cada error con un `code`; los de red llegan como AuthRetryableFetchError.
function traducirError(error) {
  if (!error) {
    return null;
  }
  if (error.name === 'AuthRetryableFetchError' || error.message === 'Network request failed') {
    return MENSAJE_SIN_CONEXION;
  }
  switch (error.code) {
    case 'invalid_credentials':
      return 'Correo o contraseña incorrectos';
    case 'email_not_confirmed':
      return 'Confirma tu correo antes de iniciar sesión';
    case 'user_already_exists':
    case 'email_exists':
      return 'Ya existe una cuenta con este correo';
    case 'weak_password':
      return 'La contraseña es muy débil';
    case 'email_address_invalid':
      return 'Ingresa un correo válido';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Demasiados intentos. Espera un momento.';
    default:
      // El usuario ve un mensaje simple, pero el error técnico queda en la terminal
      // de «npx expo start» para poder diagnosticarlo.
      console.warn('Error de Supabase Auth sin traducir:', error.code, error.status, error.message);
      return MENSAJE_GENERICO;
  }
}

/** Devuelve la sesión guardada en el teléfono (o null si no hay). */
export async function obtenerSesion() {
  try {
    const { data, error } = await supabase.auth.getSession();
    return { datos: data.session, error: traducirError(error) };
  } catch {
    return { datos: null, error: MENSAJE_SIN_CONEXION };
  }
}

/** Inicia sesión con correo y contraseña. */
export async function iniciarSesion(correo, contrasena) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password: contrasena,
    });
    return { datos: data.session, error: traducirError(error) };
  } catch {
    return { datos: null, error: MENSAJE_SIN_CONEXION };
  }
}

/**
 * Crea la cuenta. El nombre de usuario viaja en los metadatos del registro;
 * el trigger de la base de datos lo copia a la tabla `profiles`.
 * Si Supabase pide confirmar el correo, la sesión llega vacía (datos = null).
 */
export async function registrarse(nombreUsuario, correo, contrasena) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: correo.trim(),
      password: contrasena,
      options: { data: { nombre_usuario: nombreUsuario.trim() } },
    });
    return { datos: data.session, error: traducirError(error) };
  } catch {
    return { datos: null, error: MENSAJE_SIN_CONEXION };
  }
}

/** Cierra la sesión y borra la sesión guardada en el teléfono. */
export async function cerrarSesion() {
  try {
    const { error } = await supabase.auth.signOut();
    return { datos: null, error: traducirError(error) };
  } catch {
    return { datos: null, error: MENSAJE_SIN_CONEXION };
  }
}

/** Lee el nombre de usuario de la tabla `profiles`. RLS solo deja leer el propio. */
export async function obtenerNombreUsuario(idUsuario) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('nombre_usuario')
      .eq('id', idUsuario)
      .maybeSingle();
    if (error) {
      return { datos: null, error: MENSAJE_GENERICO };
    }
    return { datos: data?.nombre_usuario ?? null, error: null };
  } catch {
    return { datos: null, error: MENSAJE_SIN_CONEXION };
  }
}

/**
 * Escucha los cambios de sesión (al iniciar o cerrar sesión, o al renovar el token).
 * Devuelve una función para dejar de escuchar.
 */
export function escucharCambiosDeSesion(alCambiar) {
  const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => alCambiar(sesion));
  return () => data.subscription.unsubscribe();
}
