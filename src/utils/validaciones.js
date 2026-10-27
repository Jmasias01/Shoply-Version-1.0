// Validaciones de la app: cuenta (correo, contraseña) y producto (nombre, precio, cantidad).
// Las usan Iniciar sesión / Crear cuenta y el formulario de producto antes de llamar a Supabase.
// Los límites del producto se repiten como `check` en la base de datos (schema.sql).

// ---------------------------------------------------------------------------
// Cuenta
// ---------------------------------------------------------------------------

const CONTRASENA_MINIMA = 6;

// Formato simple de correo: algo@algo.algo, sin espacios.
// No pretende cubrir todos los casos; Supabase hace la validación final.
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Devuelve el mensaje de error del correo, o null si es válido.
 * Ejemplos:
 *   validarCorreo('')                → "Este campo es obligatorio"
 *   validarCorreo('jhon@gmail')      → "Ingresa un correo válido"
 *   validarCorreo('jhon@gmail.com')  → null
 */
export function validarCorreo(correo) {
  const limpio = (correo || '').trim();
  if (!limpio) {
    return 'Este campo es obligatorio';
  }
  return FORMATO_CORREO.test(limpio) ? null : 'Ingresa un correo válido';
}

/**
 * Devuelve el mensaje de error de la contraseña, o null si es válida.
 * Ejemplos:
 *   validarContrasena('')        → "Este campo es obligatorio"
 *   validarContrasena('12345')   → "Mínimo 6 caracteres"
 *   validarContrasena('123456')  → null
 */
export function validarContrasena(contrasena) {
  if (!contrasena) {
    return 'Este campo es obligatorio';
  }
  return contrasena.length >= CONTRASENA_MINIMA ? null : 'Mínimo 6 caracteres';
}

/**
 * Devuelve el mensaje de error del nombre de usuario, o null si es válido.
 * Ejemplo:
 *   validarNombreUsuario('  ')    → "Este campo es obligatorio"
 */
export function validarNombreUsuario(nombreUsuario) {
  return (nombreUsuario || '').trim() ? null : 'Este campo es obligatorio';
}

// ---------------------------------------------------------------------------
// Producto
// ---------------------------------------------------------------------------

export const LIMITES = {
  nombreMaximo: 60,
  precioMaximo: 9999.99,
  cantidadMinima: 1,
  cantidadMaxima: 99,
};

/**
 * El nombre es válido si, sin espacios al borde, tiene entre 1 y 60 caracteres.
 * Ejemplos:
 *   validarNombre('Leche Gloria')  → true
 *   validarNombre('   ')           → false
 */
export function validarNombre(nombre) {
  const limpio = (nombre || '').trim();
  return limpio.length >= 1 && limpio.length <= LIMITES.nombreMaximo;
}

/**
 * Convierte el texto del campo de precio en número.
 * El teclado decimal puede escribir coma, por eso se acepta "4,50" y "4.50".
 * Devuelve null si el texto no es un número con máximo 2 decimales.
 * Ejemplos:
 *   convertirPrecio('4,50')   → 4.5
 *   convertirPrecio('12')     → 12
 *   convertirPrecio('1.234')  → null  (más de 2 decimales)
 *   convertirPrecio('abc')    → null
 */
export function convertirPrecio(texto) {
  const normalizado = String(texto || '').trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) {
    return null;
  }
  return Number(normalizado);
}

/**
 * El precio es válido si es mayor que 0, hasta 9999.99 y con máximo 2 decimales.
 * Ejemplos:
 *   validarPrecio('4,50')     → true
 *   validarPrecio('0')        → false
 *   validarPrecio('10000')    → false
 */
export function validarPrecio(texto) {
  const precio = convertirPrecio(texto);
  return precio !== null && precio > 0 && precio <= LIMITES.precioMaximo;
}

/**
 * La cantidad es válida si es un entero de 1 a 99.
 * Ejemplos:
 *   validarCantidad(1)    → true
 *   validarCantidad(0)    → false
 *   validarCantidad(2.5)  → false
 */
export function validarCantidad(cantidad) {
  return (
    Number.isInteger(cantidad) &&
    cantidad >= LIMITES.cantidadMinima &&
    cantidad <= LIMITES.cantidadMaxima
  );
}

/**
 * Un producto se puede guardar solo si nombre, precio y cantidad son válidos.
 * Ejemplo:
 *   esProductoValido({ nombre: 'Arroz', precio: '24.90', cantidad: 1 })  → true
 */
export function esProductoValido({ nombre, precio, cantidad }) {
  return validarNombre(nombre) && validarPrecio(precio) && validarCantidad(cantidad);
}
