// Caja de error con el mensaje y un botón «Reintentar».
// La usan Inicio, Historial y la pantalla de compra cuando no se pudieron cargar los datos
// (por ejemplo, sin señal): así el usuario puede volver a intentarlo sin salir de la pantalla.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icono from './Icono';
import { colores, espaciado, fuentes, radios, tipografia } from '../theme';

export default function MensajeError({ mensaje, alReintentar }) {
  return (
    <View style={estilos.caja}>
      <Icono nombre="alert-circle" tamano={18} color={colores.error} />
      <Text style={estilos.texto}>{mensaje}</Text>
      {alReintentar ? (
        <Pressable onPress={alReintentar} hitSlop={8} style={estilos.boton} accessibilityLabel="Reintentar">
          <Icono nombre="refresh-cw" tamano={16} color={colores.error} />
          <Text style={estilos.textoBoton}>Reintentar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    paddingHorizontal: espaciado.lg,
    paddingVertical: espaciado.md,
    borderRadius: radios.campo,
    backgroundColor: colores.errorSuave,
  },
  texto: {
    flex: 1,
    ...tipografia.pequeno,
    color: colores.error,
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textoBoton: {
    ...tipografia.pequeno,
    fontFamily: fuentes.semibold,
    color: colores.error,
  },
});
