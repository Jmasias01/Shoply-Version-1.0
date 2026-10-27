// Estado vacío: ícono dentro de un círculo de acento suave, título y subtítulo.
// Sigue el diseño de «Aún no agregas productos» (compra vacía) del Figma y se reutiliza
// en la compra sin productos y en el Historial sin compras.

import { StyleSheet, Text, View } from 'react-native';
import Icono from './Icono';
import { colores, espaciado, tipografia } from '../theme';

export default function EstadoVacio({ icono, titulo, subtitulo, style }) {
  return (
    <View style={[estilos.contenedor, style]}>
      <View style={estilos.circulo}>
        <Icono nombre={icono} tamano={34} color={colores.acento} />
      </View>
      <Text style={estilos.titulo}>{titulo}</Text>
      {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.md,
  },
  circulo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colores.acentoSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    ...tipografia.cuerpoDestacado,
    color: colores.texto,
    textAlign: 'center',
  },
  subtitulo: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
});
