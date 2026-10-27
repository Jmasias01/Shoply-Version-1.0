// Botón principal en forma de píldora (56 px) con la sombra suave del acento.
// Estados: predeterminado y deshabilitado (cuando faltan datos o mientras se guarda).
// Se usa en los formularios, en el pop-up de tienda y en Iniciar sesión / Crear cuenta.

import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colores, medidas, radios, sombras, tipografia } from '../theme';

export default function BotonPrimario({ texto, alPresionar, deshabilitado = false, cargando = false }) {
  // Mientras se guarda también se bloquea, para evitar pulsaciones dobles.
  const bloqueado = deshabilitado || cargando;

  return (
    <Pressable
      onPress={alPresionar}
      disabled={bloqueado}
      style={({ pressed }) => [
        estilos.boton,
        bloqueado ? estilos.deshabilitado : sombras.acento,
        pressed && estilos.presionado,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={colores.textoSobreAcento} />
      ) : (
        <Text style={estilos.texto}>{texto}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    height: medidas.alturaBoton,
    borderRadius: radios.pildora,
    backgroundColor: colores.acento,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deshabilitado: {
    backgroundColor: colores.acentoDeshabilitado,
  },
  presionado: {
    opacity: 0.85,
  },
  texto: {
    ...tipografia.boton,
    color: colores.textoSobreAcento,
  },
});
