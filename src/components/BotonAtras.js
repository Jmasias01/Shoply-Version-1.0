// Botón «atrás» circular de 44 px con la flecha (chevron-left).
// Se usa en la cabecera de la pantalla de compra y en el detalle de compra finalizada.
// Solo vuelve atrás: nunca finaliza la compra.

import { Pressable, StyleSheet } from 'react-native';
import Icono from './Icono';
import { colores, medidas } from '../theme';

export default function BotonAtras({ alPresionar }) {
  return (
    <Pressable
      onPress={alPresionar}
      accessibilityLabel="Volver"
      style={({ pressed }) => [estilos.boton, pressed && estilos.presionado]}
    >
      <Icono nombre="chevron-left" />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    width: medidas.botonAtras,
    height: medidas.botonAtras,
    borderRadius: medidas.botonAtras / 2,
    backgroundColor: colores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presionado: {
    opacity: 0.7,
  },
});
