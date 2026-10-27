// Tarjeta roja de Inicio cuando hay una compra en curso: etiqueta «Compra en curso»,
// tienda, cantidad de productos, hora de inicio, total hasta ahora y «Continuar compra».
// Recibe la compra tal como llega de Supabase (con sus `trip_items`).

import { StyleSheet, Text, View } from 'react-native';
import BotonInvertido from './BotonInvertido';
import TarjetaAcento from './TarjetaAcento';
import { calcularTotal } from '../utils/calculos';
import { formatearCantidadProductos, formatearHora, formatearMonto } from '../utils/formato';
import { colores, espaciado, opacidadTextoSobreAcento, tipografia } from '../theme';

export default function TarjetaCompraEnCurso({ compra, alContinuar }) {
  const cantidad = compra.trip_items.length;

  return (
    <TarjetaAcento style={estilos.tarjeta}>
      <View style={estilos.etiqueta}>
        <View style={estilos.puntoVerde} />
        <Text style={estilos.textoEtiqueta}>Compra en curso</Text>
      </View>

      <View style={estilos.textos}>
        <Text style={estilos.tienda} numberOfLines={1}>
          {compra.tienda}
        </Text>
        {/* La hora sale de `iniciado_en`, en hora de Perú: «desde las 10:24 a. m.». */}
        <Text style={estilos.detalle}>
          {formatearCantidadProductos(cantidad)} · desde las {formatearHora(compra.iniciado_en)}
        </Text>
      </View>

      <View>
        <Text style={estilos.detalle}>Total hasta ahora</Text>
        <Text style={estilos.monto}>{formatearMonto(calcularTotal(compra.trip_items))}</Text>
      </View>

      <BotonInvertido texto="Continuar compra" alPresionar={alContinuar} />
    </TarjetaAcento>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    gap: espaciado.lg,
    paddingTop: 22,
    paddingBottom: espaciado.entreCampos,
    paddingHorizontal: espaciado.entreCampos,
  },
  etiqueta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colores.etiquetaSobreAcento,
  },
  puntoVerde: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colores.exito,
  },
  textoEtiqueta: {
    ...tipografia.pestana,
    color: colores.textoSobreAcento,
  },
  textos: {
    gap: 2,
  },
  tienda: {
    ...tipografia.h2,
    color: colores.textoSobreAcento,
  },
  detalle: {
    ...tipografia.pequeno,
    color: colores.textoSobreAcento,
    opacity: opacidadTextoSobreAcento,
  },
  monto: {
    ...tipografia.montoGrande,
    color: colores.textoSobreAcento,
  },
});
