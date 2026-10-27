// Pantalla de espera con un indicador centrado.
// App.js la muestra mientras se cargan las fuentes Plus Jakarta Sans,
// para que ningún texto aparezca primero con la fuente del sistema.

import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colores } from '../theme';

export default function PantallaCarga() {
  return (
    <View style={estilos.contenedor}>
      <ActivityIndicator size="large" color={colores.acento} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondo,
  },
});
