// Botón blanco con texto de acento y flecha (→), para usar sobre la tarjeta roja de Inicio.
// Se usa en «Iniciar compra» y «Continuar compra».

import { Pressable, StyleSheet, Text } from 'react-native';
import Icono from './Icono';
import { colores, espaciado, tipografia } from '../theme';

export default function BotonInvertido({ texto, alPresionar }) {
  return (
    <Pressable onPress={alPresionar} style={({ pressed }) => [estilos.boton, pressed && estilos.presionado]}>
      <Text style={estilos.texto}>{texto}</Text>
      <Icono nombre="arrow-right" color={colores.acento} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.sm,
    backgroundColor: colores.fondo,
  },
  presionado: {
    opacity: 0.85,
  },
  texto: {
    ...tipografia.boton,
    color: colores.acento,
  },
});
