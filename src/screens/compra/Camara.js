// Pantalla de cámara: toma la foto de una etiqueta de precio y la envía a leer con IA.
// Solo se envía la parte de la foto que queda dentro del marco guía (más un pequeño margen),
// para que la IA no lea las etiquetas vecinas. Se abre desde el botón «Cámara» de la compra
// y, al terminar de leer, se reemplaza por el formulario de producto con los datos encontrados.

import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import BotonPrimario from '../../components/BotonPrimario';
import Icono from '../../components/Icono';
import { leerEtiqueta } from '../../services/escaneoService';
import { calcularRecorte } from '../../utils/recorte';
import { colores, espaciado, sombras, tipografia } from '../../theme';

// Marco guía donde se encuadra la etiqueta (300 × 164 en el Figma de 390 px de ancho).
const ALTO_MARCO = 164;
const MARGEN_MARCO = 45;
// Margen extra alrededor del marco al recortar (10 % por lado), por si el encuadre no es perfecto.
const MARGEN_RECORTE = 0.1;
// Ancho máximo de la imagen que se envía: suficiente para leer la etiqueta
// y mucho más liviana que la foto original (que puede pesar varios MB).
const ANCHO_MAXIMO_FOTO = 1024;
const NO_ES_ETIQUETA = 'La foto no parece una etiqueta de precio. Inténtalo de nuevo.';

// Toma la foto, la recorta al marco guía, la reduce si hace falta y la devuelve en base64 (JPEG).
// `marco` y `vista` están en puntos de pantalla; la foto, en píxeles (calcularRecorte los convierte).
async function fotografiar(camara, marco, vista) {
  const foto = await camara.takePictureAsync({ quality: 0.8 });
  const recorte = calcularRecorte({
    marco,
    vista,
    foto: { ancho: foto.width, alto: foto.height },
    margen: MARGEN_RECORTE,
  });

  const contexto = ImageManipulator.manipulate(foto.uri);
  contexto.crop(recorte);
  // Solo se reduce si el recorte es más ancho que el máximo; el alto se calcula solo.
  if (recorte.width > ANCHO_MAXIMO_FOTO) {
    contexto.resize({ width: ANCHO_MAXIMO_FOTO, height: null });
  }
  const imagen = await contexto.renderAsync();
  const resultado = await imagen.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
  return resultado.base64;
}

export default function Camara({ navigation, route }) {
  const { idCompra } = route.params;
  const margenes = useSafeAreaInsets();
  const { width: anchoPantalla, height: altoPantalla } = useWindowDimensions();
  // Tamaño real de la vista de la cámara (se mide al dibujarse). Hasta entonces se usa
  // el de la pantalla. Hace falta para saber dónde cae el marco dentro de la foto.
  const [vista, setVista] = useState(null);

  const [permiso, pedirPermiso] = useCameraPermissions();
  const refCamara = useRef(null);
  const [lista, setLista] = useState(false); // la cámara ya muestra la imagen
  const [linterna, setLinterna] = useState(false);
  const [leyendo, setLeyendo] = useState(false);
  const [error, setError] = useState(null);

  // Posición del marco guía: centrado, un poco por encima de la mitad de la vista.
  // Se calcula una sola vez aquí para dibujarlo y para recortar la foto con las mismas medidas.
  const tamanoVista = vista ?? { ancho: anchoPantalla, alto: altoPantalla };
  const marco = {
    x: MARGEN_MARCO,
    y: tamanoVista.alto * 0.42,
    ancho: tamanoVista.ancho - MARGEN_MARCO * 2,
    alto: ALTO_MARCO,
  };
  const colorEsquinas = leyendo ? colores.acento : colores.textoSobreAcento;

  // Abre el formulario en lugar de la cámara (replace: «atrás» vuelve a la compra, no a la cámara).
  function abrirFormulario(escaneo) {
    navigation.replace('FormularioProducto', { idCompra, escaneo });
  }

  async function capturar() {
    if (!lista || leyendo) {
      return;
    }
    setError(null);
    setLeyendo(true);
    try {
      const imagenBase64 = await fotografiar(refCamara.current, marco, tamanoVista);
      const { datos, error: errorLectura } = await leerEtiqueta(imagenBase64);
      if (errorLectura) {
        setError(errorLectura);
        setLeyendo(false);
        return;
      }
      // Si la foto no es una etiqueta (una persona, un paisaje, un recibo...),
      // no se abre el formulario: se pide otra foto.
      if (!datos.esEtiqueta) {
        setError(NO_ES_ETIQUETA);
        setLeyendo(false);
        return;
      }
      // Es una etiqueta: se abre el formulario aunque falte algún dato;
      // ahí se marcan en rojo los campos que hay que completar.
      abrirFormulario({ nombre: datos.nombre, precio: datos.precio });
    } catch {
      setError('No se pudo tomar la foto. Inténtalo de nuevo.');
      setLeyendo(false);
    }
  }

  // Mientras se averigua si hay permiso, solo se ve el fondo oscuro.
  if (!permiso) {
    return <View style={estilos.pantalla} />;
  }

  // Sin permiso: se explica para qué se usa la cámara y se ofrece pedirlo
  // (o abrir los Ajustes del teléfono si el usuario ya lo negó antes).
  if (!permiso.granted) {
    return (
      <View style={[estilos.pantalla, estilos.sinPermiso, { paddingTop: margenes.top + espaciado.xl }]}>
        <StatusBar style="light" />
        <Icono nombre="camera" tamano={40} color={colores.textoSobreAcento} />
        <Text style={estilos.tituloPermiso}>Permite el uso de la cámara</Text>
        <Text style={estilos.textoPermiso}>Shoply la usa solo para leer las etiquetas de precio.</Text>
        <View style={estilos.botonesPermiso}>
          <BotonPrimario
            texto={permiso.canAskAgain ? 'Permitir cámara' : 'Abrir Ajustes'}
            alPresionar={permiso.canAskAgain ? pedirPermiso : () => Linking.openSettings()}
          />
          <Text style={estilos.enlacePermiso} onPress={() => abrirFormulario(undefined)}>
            Agregar manualmente
          </Text>
          <Text style={estilos.enlacePermiso} onPress={() => navigation.goBack()}>
            Cerrar
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={estilos.pantalla}
      onLayout={(evento) => {
        const { width, height } = evento.nativeEvent.layout;
        setVista({ ancho: width, alto: height });
      }}
    >
      <StatusBar style="light" />

      <CameraView
        ref={refCamara}
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={linterna}
        onCameraReady={() => setLista(true)}
      />

      {/* Velo oscuro alrededor del marco: cuatro rectángulos (arriba, abajo, izquierda, derecha). */}
      <View style={[estilos.velo, { top: 0, left: 0, right: 0, height: marco.y }]} />
      <View style={[estilos.velo, { top: marco.y + marco.alto, left: 0, right: 0, bottom: 0 }]} />
      <View style={[estilos.velo, { top: marco.y, left: 0, width: MARGEN_MARCO, height: ALTO_MARCO }]} />
      <View style={[estilos.velo, { top: marco.y, right: 0, width: MARGEN_MARCO, height: ALTO_MARCO }]} />

      {/* Marco guía: cuatro esquinas; se vuelven rojas mientras se lee la etiqueta. */}
      <View style={[estilos.marco, { top: marco.y, left: marco.x, width: marco.ancho }]} pointerEvents="none">
        <View style={[estilos.esquina, estilos.esquinaSupIzq, { borderColor: colorEsquinas }]} />
        <View style={[estilos.esquina, estilos.esquinaSupDer, { borderColor: colorEsquinas }]} />
        <View style={[estilos.esquina, estilos.esquinaInfIzq, { borderColor: colorEsquinas }]} />
        <View style={[estilos.esquina, estilos.esquinaInfDer, { borderColor: colorEsquinas }]} />
      </View>

      {/* Controles superiores: cerrar, título y linterna. */}
      <View style={[estilos.controlesSuperiores, { top: margenes.top + espaciado.sm }]}>
        <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Cerrar" style={estilos.botonRedondo}>
          <Icono nombre="x" color={colores.textoSobreAcento} />
        </Pressable>
        <Text style={estilos.titulo}>Foto de etiqueta</Text>
        <Pressable
          onPress={() => setLinterna(!linterna)}
          accessibilityLabel={linterna ? 'Apagar linterna' : 'Encender linterna'}
          style={[estilos.botonRedondo, linterna && estilos.botonActivo]}
        >
          <Icono nombre="zap" color={linterna ? colores.texto : colores.textoSobreAcento} />
        </Pressable>
      </View>

      {/* Debajo del marco: la indicación, el aviso «Leyendo etiqueta…» o el error. */}
      <View style={[estilos.zonaMensaje, { top: marco.y + marco.alto + espaciado.xl }]}>
        {leyendo ? (
          <View style={estilos.tarjetaLeyendo}>
            <View style={estilos.circuloCarga}>
              <ActivityIndicator color={colores.acento} />
            </View>
            <View>
              <Text style={estilos.tituloLeyendo}>Leyendo etiqueta…</Text>
              <Text style={estilos.textoLeyendo}>Esto toma unos segundos</Text>
            </View>
          </View>
        ) : (
          <View style={estilos.indicacion}>
            <Icono nombre={error ? 'alert-circle' : 'sparkles'} tamano={16} color={colores.textoSobreAcento} />
            <Text style={estilos.textoIndicacion}>{error ?? 'Encuadra solo la etiqueta del estante'}</Text>
          </View>
        )}
      </View>

      {/* Controles inferiores: manual, capturar y un espacio para que el botón quede al centro. */}
      <View
        style={[estilos.controlesInferiores, { bottom: margenes.bottom + espaciado.xl }, leyendo && estilos.atenuado]}
        pointerEvents={leyendo ? 'none' : 'auto'}
      >
        <Pressable onPress={() => abrirFormulario(undefined)} style={estilos.botonManual}>
          <View style={estilos.botonRedondo}>
            <Icono nombre="pencil" color={colores.textoSobreAcento} />
          </View>
          <Text style={estilos.textoManual}>Manual</Text>
        </Pressable>

        <Pressable
          onPress={capturar}
          disabled={!lista}
          accessibilityLabel="Tomar foto"
          style={({ pressed }) => [estilos.botonCapturar, pressed && estilos.capturaPresionada]}
        >
          <View style={estilos.circuloCapturar} />
        </Pressable>

        <View style={estilos.espacio} />
      </View>
    </View>
  );
}

const LARGO_ESQUINA = 30;
const GROSOR_ESQUINA = 3;

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondoCamara,
  },
  sinPermiso: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.md,
    paddingHorizontal: espaciado.margenLateral,
  },
  tituloPermiso: {
    ...tipografia.h2,
    color: colores.textoSobreAcento,
    textAlign: 'center',
  },
  textoPermiso: {
    ...tipografia.cuerpo,
    color: colores.placeholder,
    textAlign: 'center',
  },
  botonesPermiso: {
    alignSelf: 'stretch',
    gap: espaciado.lg,
    marginTop: espaciado.xl,
  },
  enlacePermiso: {
    ...tipografia.boton,
    color: colores.textoSobreAcento,
    textAlign: 'center',
  },
  velo: {
    position: 'absolute',
    backgroundColor: colores.veloCamara,
  },
  marco: {
    position: 'absolute',
    height: ALTO_MARCO,
  },
  esquina: {
    position: 'absolute',
    width: LARGO_ESQUINA,
    height: LARGO_ESQUINA,
  },
  // Cada esquina dibuja solo dos de sus bordes y redondea la punta exterior.
  esquinaSupIzq: { top: 0, left: 0, borderTopWidth: GROSOR_ESQUINA, borderLeftWidth: GROSOR_ESQUINA, borderTopLeftRadius: 14 },
  esquinaSupDer: { top: 0, right: 0, borderTopWidth: GROSOR_ESQUINA, borderRightWidth: GROSOR_ESQUINA, borderTopRightRadius: 14 },
  esquinaInfIzq: { bottom: 0, left: 0, borderBottomWidth: GROSOR_ESQUINA, borderLeftWidth: GROSOR_ESQUINA, borderBottomLeftRadius: 14 },
  esquinaInfDer: { bottom: 0, right: 0, borderBottomWidth: GROSOR_ESQUINA, borderRightWidth: GROSOR_ESQUINA, borderBottomRightRadius: 14 },
  controlesSuperiores: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espaciado.margenLateral,
  },
  botonRedondo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colores.botonSobreCamara,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonActivo: {
    backgroundColor: colores.textoSobreAcento,
  },
  titulo: {
    ...tipografia.cuerpoDestacado,
    color: colores.textoSobreAcento,
  },
  zonaMensaje: {
    position: 'absolute',
    left: espaciado.margenLateral,
    right: espaciado.margenLateral,
    alignItems: 'center',
  },
  indicacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: espaciado.sm,
    borderRadius: 20,
    backgroundColor: colores.indicacionCamara,
  },
  textoIndicacion: {
    ...tipografia.pequeno,
    color: colores.textoSobreAcento,
    flexShrink: 1,
  },
  tarjetaLeyendo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    paddingLeft: 18,
    paddingRight: 22,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: colores.fondo,
    ...sombras.neutra,
  },
  circuloCarga: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colores.acentoSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloLeyendo: {
    ...tipografia.cuerpoDestacado,
    color: colores.texto,
  },
  textoLeyendo: {
    ...tipografia.pequeno,
    color: colores.textoSecundario,
  },
  controlesInferiores: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  // Mientras se lee la etiqueta los controles se ven apagados (35 %) y no responden.
  atenuado: {
    opacity: 0.35,
  },
  botonManual: {
    alignItems: 'center',
    gap: 6,
  },
  textoManual: {
    ...tipografia.pequeno,
    color: colores.textoSobreAcento,
  },
  // Botón de captura: anillo blanco de 78 px con un círculo blanco adentro.
  botonCapturar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: colores.textoSobreAcento,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capturaPresionada: {
    transform: [{ scale: 0.94 }],
  },
  circuloCapturar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colores.textoSobreAcento,
  },
  espacio: {
    width: 44,
  },
});
