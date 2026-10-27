// Menú pequeño que se abre junto a un botón (⋯): debajo y alineado a su borde derecho.
// Se usa en el menú de cada producto (Editar / Borrar) y en el de la cabecera
// de la compra (Cambiar tienda / Descartar compra).
// Si abajo no hay espacio (por la barra inferior), se abre hacia arriba.

import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Icono from './Icono';
import { colores, espaciado, sombras, tipografia } from '../theme';

const ALTURA_OPCION = 44;
const RELLENO = 6;
const SEPARACION_OPCIONES = 2;
const DISTANCIA_AL_BOTON = 6;
// Ancho mínimo del Figma (172 px). Si una opción es más larga, como «Descartar compra»,
// el menú crece para que el texto se vea completo.
const ANCHO_MINIMO_MENU = 172;
const ESPERA_AL_CERRAR_MS = 300;

// Alto total del menú según cuántas opciones tiene.
function calcularAltoMenu(cantidadOpciones) {
  return RELLENO * 2 + ALTURA_OPCION * cantidadOpciones + SEPARACION_OPCIONES * (cantidadOpciones - 1);
}

export default function MenuFlotante({
  ancla, // posición del botón tocado: { x, y, ancho, alto } (de measureInWindow)
  opciones, // [{ texto, icono, peligro, alPresionar }]
  alCerrar,
  espacioInferior = 120, // alto reservado abajo (barra de botones) donde el menú no debe caer
}) {
  const { width: anchoPantalla, height: altoPantalla } = useWindowDimensions();

  if (!ancla) {
    return null;
  }

  const altoMenu = calcularAltoMenu(opciones.length);
  const arribaDelBoton = ancla.y - DISTANCIA_AL_BOTON - altoMenu;
  const debajoDelBoton = ancla.y + ancla.alto + DISTANCIA_AL_BOTON;
  // Si el menú taparía la barra inferior, se abre hacia arriba.
  const cabeAbajo = debajoDelBoton + altoMenu <= altoPantalla - espacioInferior;
  const top = cabeAbajo ? debajoDelBoton : arribaDelBoton;
  // Alineado al borde derecho del botón.
  const right = anchoPantalla - (ancla.x + ancla.ancho);

  // Cierra el menú y luego ejecuta la opción. La pausa existe porque en iOS
  // no se puede abrir otro pop-up (por ejemplo «¿Descartar compra?») mientras
  // este menú todavía se está cerrando: el segundo no aparecería.
  function elegir(opcion) {
    alCerrar();
    setTimeout(opcion.alPresionar, ESPERA_AL_CERRAR_MS);
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={alCerrar} statusBarTranslucent>
      {/* Tocar fuera cierra el menú; el resto de la pantalla se oscurece muy levemente. */}
      <Pressable style={[StyleSheet.absoluteFill, estilos.velo]} onPress={alCerrar} />

      {/* Copia del botón tocado, resaltada encima del velo para que se vea cuál se abrió. */}
      <View
        pointerEvents="none"
        style={[
          estilos.botonResaltado,
          {
            left: ancla.x,
            top: ancla.y,
            width: ancla.ancho,
            height: ancla.alto,
            borderRadius: ancla.ancho / 2,
          },
        ]}
      >
        <Icono nombre="ellipsis" tamano={ancla.ancho > 40 ? 20 : 16} color={colores.acento} />
      </View>

      <View style={[estilos.menu, { top, right }]}>
        {opciones.map((opcion) => (
          <Pressable
            key={opcion.texto}
            onPress={() => elegir(opcion)}
            style={({ pressed }) => [estilos.opcion, pressed && estilos.opcionPresionada]}
          >
            <Icono nombre={opcion.icono} tamano={18} color={opcion.peligro ? colores.error : colores.texto} />
            <Text style={[estilos.texto, opcion.peligro && estilos.textoPeligro]} numberOfLines={1}>
              {opcion.texto}
            </Text>
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  velo: {
    backgroundColor: colores.veloMenu,
  },
  botonResaltado: {
    position: 'absolute',
    backgroundColor: colores.acentoSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    position: 'absolute',
    minWidth: ANCHO_MINIMO_MENU,
    padding: RELLENO,
    gap: SEPARACION_OPCIONES,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.fondo,
    ...sombras.menu,
  },
  opcion: {
    height: ALTURA_OPCION,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    paddingHorizontal: espaciado.md,
    borderRadius: 12,
  },
  opcionPresionada: {
    backgroundColor: colores.superficie,
  },
  texto: {
    ...tipografia.cuerpoMedium,
    color: colores.texto,
  },
  textoPeligro: {
    color: colores.error,
  },
});
