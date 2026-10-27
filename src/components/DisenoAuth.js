// Estructura común de Iniciar sesión y Crear cuenta: contenido arriba,
// botón principal y enlace («¿No tienes una cuenta? Regístrate») pegados abajo.
// Se desplaza y sube con el teclado para que los campos nunca queden tapados.

import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BotonPrimario from './BotonPrimario';
import { colores, espaciado, fuentes, tipografia } from '../theme';

export default function DisenoAuth({
  children, // encabezado y formulario de la pantalla
  textoBoton,
  alPresionarBoton,
  cargando,
  pregunta, // «¿No tienes una cuenta?»
  textoEnlace, // «Regístrate»
  alPresionarEnlace,
}) {
  return (
    <SafeAreaView style={estilos.pantalla}>
      {/* En iOS el teclado tapa el contenido; «padding» lo empuja hacia arriba. */}
      <KeyboardAvoidingView style={estilos.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <View>{children}</View>

          <View style={estilos.acciones}>
            <BotonPrimario texto={textoBoton} alPresionar={alPresionarBoton} cargando={cargando} />
            <View style={estilos.enlace}>
              <Text style={estilos.pregunta}>{pregunta}</Text>
              <Pressable onPress={alPresionarEnlace} hitSlop={8} disabled={cargando}>
                <Text style={estilos.textoEnlace}>{textoEnlace}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    // flexGrow + space-between deja el botón abajo cuando sobra espacio
    // y permite desplazarse cuando el teclado lo reduce.
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: espaciado.xl,
    paddingTop: espaciado.lg,
    paddingBottom: espaciado.sm,
    paddingHorizontal: espaciado.margenLateral,
  },
  acciones: {
    gap: espaciado.entreCampos,
  },
  enlace: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  pregunta: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
  },
  textoEnlace: {
    ...tipografia.cuerpo,
    fontFamily: fuentes.bold,
    color: colores.acento,
  },
});
