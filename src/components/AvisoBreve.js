// Aviso corto que flota sobre la parte inferior de la pantalla (estilo «toast»).
// La pantalla de compra lo usa para errores breves, por ejemplo si no se pudo borrar un producto.
// Quien lo usa decide cuándo mostrarlo y cuándo quitarlo (pasando `mensaje` o null).

import { StyleSheet, Text, View } from 'react-native';
import { colores, espaciado, tipografia } from '../theme';

export default function AvisoBreve({ mensaje, distanciaInferior = 110 }) {
  if (!mensaje) {
    return null;
  }

  return (
    // pointerEvents="none": el aviso no bloquea los toques a los botones de abajo.
    <View pointerEvents="none" style={[estilos.contenedor, { bottom: distanciaInferior }]}>
      <View style={estilos.aviso}>
        <Text style={estilos.texto}>{mensaje}</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    position: 'absolute',
    left: espaciado.margenLateral,
    right: espaciado.margenLateral,
    alignItems: 'center',
  },
  aviso: {
    paddingHorizontal: espaciado.lg,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colores.texto,
  },
  texto: {
    ...tipografia.pequeno,
    color: colores.textoSobreAcento,
    textAlign: 'center',
  },
});
