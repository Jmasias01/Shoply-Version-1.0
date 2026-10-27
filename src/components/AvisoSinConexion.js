// Aviso flotante «Sin conexión» que aparece arriba, sobre cualquier pantalla,
// mientras el teléfono no tiene internet. App.js lo monta una sola vez para toda la app.
// Así el usuario sabe ANTES de intentar guardar algo que no se va a poder.

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import Icono from './Icono';
import { colores, espaciado, tipografia } from '../theme';

export default function AvisoSinConexion() {
  const margenes = useSafeAreaInsets();
  const [sinConexion, setSinConexion] = useState(false);

  // NetInfo avisa cada vez que cambia la conexión. Al salir, se deja de escuchar.
  useEffect(() => {
    const dejarDeEscuchar = NetInfo.addEventListener((estado) => {
      // Mientras NetInfo no sabe (null) no se muestra nada: solo con un «false» seguro.
      setSinConexion(estado.isConnected === false || estado.isInternetReachable === false);
    });
    return dejarDeEscuchar;
  }, []);

  if (!sinConexion) {
    return null;
  }

  return (
    // pointerEvents="none": el aviso no bloquea los toques a lo que está debajo.
    <View pointerEvents="none" style={[estilos.contenedor, { top: margenes.top + espaciado.xs }]}>
      <View style={estilos.aviso}>
        <Icono nombre="wifi-off" tamano={16} color={colores.textoSobreAcento} />
        <Text style={estilos.texto}>Sin conexión. Revisa tu internet.</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: espaciado.sm,
    borderRadius: 20,
    backgroundColor: colores.texto,
  },
  texto: {
    ...tipografia.pequeno,
    color: colores.textoSobreAcento,
  },
});
