// Tema de Shoply: colores, tipografías, radios, espaciados y sombras.
// Es la única fuente de estilos de la app; todos los componentes y pantallas
// importan sus valores desde aquí para que ningún color quede escrito a mano.

// ---------------------------------------------------------------------------
// Acentos disponibles. El Figma está en modo «Rojo» y es el que se usa.
// Para cambiar de color basta con cambiar la línea `const acento = ...` de abajo.
// ---------------------------------------------------------------------------
const ACENTOS = {
  rojo: { primario: '#D92D20', suave: '#FEECEB', deshabilitado: '#F4B9B4' },
  morado: { primario: '#5B4BE1', suave: '#EEEBFD', deshabilitado: '#C8C1F5' },
  naranja: { primario: '#EA580C', suave: '#FFF1E6', deshabilitado: '#F9C9A6' },
  negro: { primario: '#111111', suave: '#EDEDF0', deshabilitado: '#B9BAC1' },
};

// Acento activo de la app (decidido por el usuario: rojo).
const acento = ACENTOS.rojo;

export const colores = {
  // Fondos
  fondo: '#FFFFFF',
  superficie: '#F6F7FB',

  // Textos
  texto: '#111111',
  textoSecundario: '#6B7080',
  placeholder: '#A0A5B5',
  textoSobreAcento: '#FFFFFF',

  // Bordes
  borde: '#ECEDF3',

  // Acento (sale del objeto activo de arriba)
  acento: acento.primario,
  acentoSuave: acento.suave,
  acentoDeshabilitado: acento.deshabilitado,

  // Error: token aparte, nunca se reutiliza el acento para errores,
  // así se puede cambiar uno sin afectar al otro.
  error: '#E5484D',
  errorSuave: '#FDECEC',

  // Punto verde de «Compra en curso» en Inicio.
  exito: '#4ADE80',

  // Fondo oscurecido detrás de los pop-ups (32 % de negro).
  velo: 'rgba(17, 17, 17, 0.32)',
  // Oscurecido muy leve detrás de los menús (⋯), para que se note qué está abierto.
  veloMenu: 'rgba(17, 17, 17, 0.04)',

  // Elementos blancos translúcidos sobre la tarjeta de acento:
  // los círculos decorativos y las etiquetas («Compra en curso», «5 productos»).
  decoracion: 'rgba(255, 255, 255, 0.10)',
  etiquetaSobreAcento: 'rgba(255, 255, 255, 0.18)',

  // Pantalla de la cámara (fondo oscuro).
  fondoCamara: '#0F0F14',
  botonSobreCamara: 'rgba(255, 255, 255, 0.16)', // botones redondos translúcidos
  veloCamara: 'rgba(0, 0, 0, 0.5)', // oscurece todo lo que queda fuera del marco guía
  indicacionCamara: 'rgba(0, 0, 0, 0.45)', // fondo de «Encuadra solo la etiqueta…»
};

// Opacidad de los textos secundarios sobre la tarjeta de acento (82 % en el Figma).
export const opacidadTextoSobreAcento = 0.82;

// Nombres de las fuentes tal como se registran en App.js con useFonts.
export const fuentes = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
};

// Estilos de texto del Figma. El interletrado en Figma va en %:
// −2 % de 28 px ≈ −0.56 y −1 % de 22 px ≈ −0.22.
export const tipografia = {
  h1: { fontFamily: fuentes.bold, fontSize: 28, lineHeight: 36, letterSpacing: -0.56 },
  h2: { fontFamily: fuentes.bold, fontSize: 22, lineHeight: 30, letterSpacing: -0.22 },
  cuerpo: { fontFamily: fuentes.regular, fontSize: 15, lineHeight: 22 },
  cuerpoMedium: { fontFamily: fuentes.medium, fontSize: 15, lineHeight: 22 },
  cuerpoDestacado: { fontFamily: fuentes.semibold, fontSize: 15, lineHeight: 22 },
  pequeno: { fontFamily: fuentes.regular, fontSize: 13, lineHeight: 18 },
  etiqueta: { fontFamily: fuentes.medium, fontSize: 14, lineHeight: 20 },
  boton: { fontFamily: fuentes.semibold, fontSize: 16, lineHeight: 22 },
  pestana: { fontFamily: fuentes.semibold, fontSize: 12, lineHeight: 16 },
  montoGrande: { fontFamily: fuentes.bold, fontSize: 32, lineHeight: 40, letterSpacing: -0.64 },
};

export const espaciado = {
  margenLateral: 24, // margen izquierdo y derecho de las pantallas
  entreCampos: 20, // separación vertical entre campos de formulario
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radios = {
  campo: 14,
  tarjeta: 16,
  marca: 20,
  lista: 20, // cajas grises de las listas (productos, últimas compras)
  tarjetaAcento: 24, // tarjeta roja de Inicio y del total
  dialogo: 28,
  pildora: 28, // botón primario de 56 px de alto
};

export const medidas = {
  alturaCampo: 54,
  alturaBoton: 56,
  botonAtras: 44,
  icono: 20,
  trazoIcono: 1.8,
};

// Sombras listas para usar en StyleSheet (iOS usa shadow*, Android usa elevation).
// La del acento es el color de acento con 28 % de opacidad, como en el Figma.
export const sombras = {
  acento: {
    shadowColor: colores.acento,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  neutra: {
    shadowColor: '#121233',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 20 },
    elevation: 12,
  },
  // Tarjeta roja de Inicio y del total de la compra.
  tarjetaAcento: {
    shadowColor: colores.acento,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  // Menús pequeños (⋯) de producto y de la cabecera.
  menu: {
    shadowColor: '#111111',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  // Hoja inferior del formulario de producto: la sombra va hacia arriba.
  hoja: {
    shadowColor: '#121233',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
  },
};
