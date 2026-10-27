// Pop-up «Cambiar tienda» sobre la compra; reutiliza SelectorTienda sin botón.
// Se abre desde el menú (⋯) de la cabecera. Al cerrar con la (X) se guarda la tienda elegida.
// Si eligió «Otra tienda» y dejó el nombre vacío, se mantiene la tienda anterior.

import { useState } from 'react';
import { Alert } from 'react-native';
import SelectorTienda from '../../components/SelectorTienda';
import { cambiarTienda } from '../../services/comprasService';

export default function CambiarTienda({ navigation, route }) {
  const { idCompra, tiendaActual } = route.params;
  const [guardando, setGuardando] = useState(false);

  // Recibe la tienda elegida al cerrar (o null si «Otra tienda» quedó vacía).
  async function guardarYCerrar(tienda) {
    // Evita guardar dos veces si el usuario toca la (X) de nuevo mientras se guarda.
    if (guardando) {
      return;
    }
    // Sin cambios (o con el nombre vacío) no hay nada que guardar.
    if (!tienda || tienda === tiendaActual) {
      navigation.goBack();
      return;
    }
    setGuardando(true);
    const { error } = await cambiarTienda(idCompra, tienda);
    if (error) {
      Alert.alert('No se pudo cambiar la tienda', error);
    }
    // Al volver, la compra se recarga y muestra la tienda nueva.
    navigation.goBack();
  }

  return (
    <SelectorTienda
      enModal={false}
      titulo="Cambiar tienda"
      subtitulo="Elige la tienda de esta compra."
      tiendaInicial={tiendaActual}
      mostrarBoton={false}
      alConfirmar={guardarYCerrar}
    />
  );
}
