// Fila de una compra: icono de tienda, nombre de la tienda, fecha y monto total.
// Se usa en «Últimas compras» de Inicio y, más adelante, en el Historial.
// Recibe los datos crudos y les da formato aquí, para que siempre se vean igual.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icono from './Icono';
import { formatearFecha, formatearMonto } from '../utils/formato';
import { colores, espaciado, radios, tipografia } from '../theme';

export default function FilaCompra({ tienda, fecha, monto, alPresionar }) {
  return (
    <Pressable
      onPress={alPresionar}
      style={({ pressed }) => [estilos.fila, pressed && estilos.presionada]}
    >
      <View style={estilos.iconoTienda}>
        <Icono nombre="store" color={colores.acento} />
      </View>

      <View style={estilos.datos}>
        <Text style={estilos.tienda} numberOfLines={1}>
          {tienda}
        </Text>
        <Text style={estilos.fecha}>{formatearFecha(fecha)}</Text>
      </View>

      <Text style={estilos.monto}>{formatearMonto(monto)}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: espaciado.lg,
    paddingVertical: 14,
  },
  presionada: {
    opacity: 0.7,
  },
  iconoTienda: {
    width: 44,
    height: 44,
    borderRadius: radios.campo,
    backgroundColor: colores.acentoSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datos: {
    flex: 1,
    gap: 2,
  },
  tienda: {
    ...tipografia.cuerpoDestacado,
    color: colores.texto,
  },
  fecha: {
    ...tipografia.pequeno,
    color: colores.textoSecundario,
  },
  monto: {
    ...tipografia.cuerpoDestacado,
    color: colores.texto,
  },
});
