// Opción de selección única (botón de radio) para elegir una tienda.
// Se usa en el pop-up «¿Dónde comprarás?» y en «Cambiar tienda».
// Seleccionada: fondo de acento suave, borde de acento y radio relleno.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colores, espaciado, medidas, radios, tipografia } from '../theme';

export default function OpcionTienda({ tienda, seleccionada = false, alPresionar }) {
  return (
    <Pressable
      onPress={alPresionar}
      accessibilityRole="radio"
      accessibilityState={{ selected: seleccionada }}
      style={[estilos.opcion, seleccionada && estilos.opcionSeleccionada]}
    >
      <View style={[estilos.radio, seleccionada && estilos.radioSeleccionado]}>
        {seleccionada ? <View style={estilos.puntoRadio} /> : null}
      </View>
      <Text style={estilos.tienda} numberOfLines={1}>
        {tienda}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  opcion: {
    height: medidas.alturaCampo,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    paddingHorizontal: espaciado.lg,
    borderRadius: radios.campo,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  opcionSeleccionada: {
    borderWidth: 1.5,
    borderColor: colores.acento,
    backgroundColor: colores.acentoSuave,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colores.placeholder,
    backgroundColor: colores.fondo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSeleccionado: {
    borderColor: colores.acento,
  },
  puntoRadio: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colores.acento,
  },
  tienda: {
    flex: 1,
    ...tipografia.cuerpoDestacado,
    color: colores.texto,
  },
});
