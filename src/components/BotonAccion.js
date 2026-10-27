// Botón con icono de la barra inferior de la compra: «Cámara» (primario) y «Manual» (secundario).
// Ocupa la mitad del ancho; los dos botones van uno al lado del otro.

import { Pressable, StyleSheet, Text } from 'react-native';
import Icono from './Icono';
import { colores, espaciado, medidas, radios, sombras, tipografia } from '../theme';

export default function BotonAccion({ texto, icono, estilo = 'primario', alPresionar }) {
  const esPrimario = estilo === 'primario';
  // Primario: fondo de acento y texto blanco. Secundario: acento suave y texto de acento.
  const colorContenido = esPrimario ? colores.textoSobreAcento : colores.acento;

  return (
    <Pressable
      onPress={alPresionar}
      style={({ pressed }) => [
        estilos.boton,
        esPrimario ? estilos.primario : estilos.secundario,
        pressed && estilos.presionado,
      ]}
    >
      <Icono nombre={icono} color={colorContenido} />
      <Text style={[estilos.texto, { color: colorContenido }]}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    flex: 1,
    height: medidas.alturaBoton,
    borderRadius: radios.pildora,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.sm,
  },
  primario: {
    backgroundColor: colores.acento,
    ...sombras.acento,
  },
  secundario: {
    backgroundColor: colores.acentoSuave,
  },
  presionado: {
    opacity: 0.85,
  },
  texto: {
    ...tipografia.boton,
  },
});
