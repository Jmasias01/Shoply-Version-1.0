// Isotipo de Shoply: bolsa de compras blanca sobre un cuadrado de acento (64 px, radio 20).
// Se usa en la cabecera de Iniciar sesión.

import { StyleSheet, View } from 'react-native';
import Icono from './Icono';
import { colores, radios } from '../theme';

export default function LogoMarca() {
  return (
    <View style={estilos.logo}>
      <Icono nombre="shopping-bag" tamano={32} color={colores.textoSobreAcento} />
    </View>
  );
}

const estilos = StyleSheet.create({
  logo: {
    width: 64,
    height: 64,
    borderRadius: radios.marca,
    backgroundColor: colores.acento,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
