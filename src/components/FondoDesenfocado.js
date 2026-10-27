// Fondo oscurecido (32 %) y desenfocado (BlurView) para todos los pop-ups:
// diálogos, selector de tienda y formulario de producto.
// Con `posicion="abajo"` el contenido se pega al borde inferior (hojas inferiores).
// Con `enModal={false}` se dibuja dentro de una pantalla transparente en vez de un Modal.

import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { colores, espaciado } from '../theme';

// En el Figma el desenfoque es de 14 px; en expo-blur la intensidad va de 1 a 100.
// 30 da un resultado visual parecido.
const INTENSIDAD_DESENFOQUE = 30;

export default function FondoDesenfocado({ visible = true, alCerrar, posicion = 'centro', enModal = true, children }) {
  const contenido = (
    <View style={StyleSheet.absoluteFill}>
      {/* En Android, sin un BlurTargetView, BlurView solo dibuja una capa translúcida.
          Por eso el velo oscuro de 32 % va siempre encima: el fondo se ve igual de apagado. */}
      <BlurView intensity={INTENSIDAD_DESENFOQUE} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, estilos.velo]} />

      {/* En iOS el teclado tapa el contenido; «padding» lo empuja hacia arriba. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[estilos.contenedor, posicion === 'abajo' ? estilos.abajo : estilos.centro]}
      >
        {/* Tocar fuera del contenido cierra el pop-up. */}
        <Pressable style={StyleSheet.absoluteFill} onPress={alCerrar} accessibilityLabel="Cerrar" />
        {children}
      </KeyboardAvoidingView>
    </View>
  );

  // Las pantallas «Formulario de producto» y «Cambiar tienda» ya se abren como
  // pantallas transparentes; abrir además un Modal encima puede fallar en iOS.
  if (!enModal) {
    return contenido;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={alCerrar} statusBarTranslucent>
      {contenido}
    </Modal>
  );
}

const estilos = StyleSheet.create({
  velo: {
    backgroundColor: colores.velo,
  },
  contenedor: {
    flex: 1,
  },
  centro: {
    justifyContent: 'center',
    paddingHorizontal: espaciado.margenLateral,
  },
  abajo: {
    justifyContent: 'flex-end',
  },
});
