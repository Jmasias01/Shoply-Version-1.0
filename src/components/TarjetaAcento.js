// Tarjeta roja (color de acento) con los dos círculos decorativos del Figma.
// Se usa en Inicio («¿Vas de compras hoy?» / «Compra en curso») y en el total de la compra.
// `variante="compacta"` usa los círculos más pequeños de la pantalla de compra.

import { StyleSheet, View } from 'react-native';
import { colores, radios, sombras } from '../theme';

export default function TarjetaAcento({ variante = 'grande', style, children }) {
  const compacta = variante === 'compacta';

  return (
    // Dos capas: la de afuera lleva la sombra y la de adentro recorta los círculos.
    // En iOS, overflow «hidden» también recorta la sombra, por eso no van juntas.
    <View style={estilos.sombra}>
      <View style={[estilos.tarjeta, style]}>
        {/* Los círculos se anclan a la derecha para verse igual en cualquier ancho de pantalla. */}
        <View style={[estilos.circulo, compacta ? estilos.circuloGrandeCompacta : estilos.circuloGrande]} />
        <View style={[estilos.circulo, compacta ? estilos.circuloChicoCompacta : estilos.circuloChico]} />
        {children}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  sombra: {
    borderRadius: radios.tarjetaAcento,
    backgroundColor: colores.acento,
    ...sombras.tarjetaAcento,
  },
  tarjeta: {
    borderRadius: radios.tarjetaAcento,
    overflow: 'hidden',
  },
  circulo: {
    position: 'absolute',
    backgroundColor: colores.decoracion,
  },
  // Inicio: círculos de 180 y 120 px.
  circuloGrande: { width: 180, height: 180, borderRadius: 90, top: -70, right: -58 },
  circuloChico: { width: 120, height: 120, borderRadius: 60, top: 70, right: -28 },
  // Pantalla de compra: círculos de 150 y 100 px.
  circuloGrandeCompacta: { width: 150, height: 150, borderRadius: 75, top: -60, right: -48 },
  circuloChicoCompacta: { width: 100, height: 100, borderRadius: 50, top: 50, right: -28 },
});
