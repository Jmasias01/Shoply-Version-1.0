// Caja gris con una lista de compras (FilaCompra) separadas por divisores.
// Se usa en «Últimas compras» de Inicio y en cada mes del Historial.
// Recibe las compras tal como llegan de Supabase y calcula el total de cada una.

import { StyleSheet, View } from 'react-native';
import FilaCompra from './FilaCompra';
import { calcularTotal } from '../utils/calculos';
import { colores, espaciado, radios } from '../theme';

export default function ListaCompras({ compras, alPresionarCompra, style }) {
  return (
    <View style={[estilos.lista, style]}>
      {compras.map((compra, indice) => (
        <View key={compra.id}>
          {/* Divisor entre filas: no va antes de la primera. */}
          {indice > 0 ? <View style={estilos.divisor} /> : null}
          <FilaCompra
            tienda={compra.tienda}
            fecha={compra.fecha}
            monto={calcularTotal(compra.trip_items)}
            alPresionar={() => alPresionarCompra(compra)}
          />
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  lista: {
    paddingVertical: 2,
    borderRadius: radios.lista,
    backgroundColor: colores.superficie,
  },
  // El divisor empieza después del icono de la tienda (16 + 44 + 14 = 74 px), como en el Figma.
  divisor: {
    height: 1,
    marginLeft: 74,
    marginRight: espaciado.lg,
    backgroundColor: colores.borde,
  },
});
