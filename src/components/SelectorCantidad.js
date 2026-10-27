// Selector de cantidad con botones (−) y (+), de 1 a 99.
// Se usa en el formulario de producto (agregar y editar).
// El (−) se ve deshabilitado en 1 y el (+) en 99, según las reglas de negocio.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icono from './Icono';
import { LIMITES } from '../utils/validaciones';
import { colores, tipografia } from '../theme';

export default function SelectorCantidad({ valor, alCambiar }) {
  const puedeRestar = valor > LIMITES.cantidadMinima;
  const puedeSumar = valor < LIMITES.cantidadMaxima;

  return (
    <View style={estilos.contenedor}>
      <Pressable
        onPress={() => alCambiar(valor - 1)}
        disabled={!puedeRestar}
        accessibilityLabel="Restar uno"
        style={[estilos.boton, estilos.botonRestar]}
      >
        <Icono nombre="minus" color={puedeRestar ? colores.texto : colores.placeholder} />
      </Pressable>

      <Text style={estilos.valor}>{valor}</Text>

      <Pressable
        onPress={() => alCambiar(valor + 1)}
        disabled={!puedeSumar}
        accessibilityLabel="Sumar uno"
        style={[estilos.boton, puedeSumar ? estilos.botonSumar : estilos.botonSumarDeshabilitado]}
      >
        <Icono nombre="plus" color={colores.textoSobreAcento} />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    padding: 4,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  boton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonRestar: {
    backgroundColor: colores.fondo,
  },
  botonSumar: {
    backgroundColor: colores.acento,
  },
  botonSumarDeshabilitado: {
    backgroundColor: colores.acentoDeshabilitado,
  },
  valor: {
    ...tipografia.h2,
    color: colores.texto,
    width: 52,
    textAlign: 'center',
  },
});
