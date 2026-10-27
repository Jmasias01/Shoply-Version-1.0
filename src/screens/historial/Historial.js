// Pestaña «Historial»: todas las compras finalizadas del año, agrupadas por mes.
// Cada mes muestra su total; tocar una compra abre su detalle (la pantalla de compra),
// donde todavía se puede editar. Se llega desde la barra inferior o desde «Ver todo» de Inicio.
// Se puede jalar la lista hacia abajo para actualizarla.

import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import EstadoVacio from '../../components/EstadoVacio';
import ListaCompras from '../../components/ListaCompras';
import MensajeError from '../../components/MensajeError';
import { obtenerComprasFinalizadas } from '../../services/comprasService';
import { formatearMonto } from '../../utils/formato';
import { agruparComprasPorMes } from '../../utils/historial';
import { colores, espaciado, tipografia } from '../../theme';

export default function Historial({ navigation }) {
  const [meses, setMeses] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false); // al jalar la lista hacia abajo
  const [error, setError] = useState(null);

  // Sin límite: llegan todas las compras finalizadas del año y se agrupan por mes.
  async function cargarHistorial() {
    const { datos, error: errorAlCargar } = await obtenerComprasFinalizadas();
    // Si falla (por ejemplo, sin señal), se conserva la lista que ya se veía.
    if (!errorAlCargar) {
      setMeses(agruparComprasPorMes(datos));
    }
    setError(errorAlCargar);
    setCargando(false);
  }

  // «Jalar para actualizar»: muestra la ruedita arriba mientras recarga.
  async function actualizar() {
    setActualizando(true);
    await cargarHistorial();
    setActualizando(false);
  }

  // Se recarga al entrar, para incluir la compra que se acaba de finalizar o editar.
  useFocusEffect(
    useCallback(() => {
      cargarHistorial();
    }, [])
  );

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <ScrollView
        contentContainerStyle={estilos.contenido}
        refreshControl={<RefreshControl refreshing={actualizando} onRefresh={actualizar} tintColor={colores.acento} colors={[colores.acento]} />}
      >
        <View style={estilos.encabezado}>
          <Text style={estilos.titulo}>Historial</Text>
          <Text style={estilos.subtitulo}>Revisa todas tus compras</Text>
        </View>

        {error ? <MensajeError mensaje={error} alReintentar={cargarHistorial} /> : null}

        {cargando ? <ActivityIndicator color={colores.acento} /> : null}

        {!cargando && !error && meses.length === 0 ? (
          <EstadoVacio
            icono="history"
            titulo="Aún no tienes compras finalizadas"
            subtitulo="Cuando finalices una compra este año, aparecerá aquí."
            style={estilos.vacio}
          />
        ) : null}

        {meses.map((mes) => (
          <View key={mes.clave} style={estilos.mes}>
            <View style={estilos.encabezadoMes}>
              <Text style={estilos.tituloMes}>{mes.titulo}</Text>
              <Text style={estilos.totalMes}>Total {formatearMonto(mes.total)}</Text>
            </View>
            <ListaCompras
              compras={mes.compras}
              alPresionarCompra={(compra) => navigation.navigate('Compra', { id: compra.id })}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    gap: espaciado.xl,
    paddingTop: espaciado.md,
    paddingBottom: espaciado.xl,
    paddingHorizontal: espaciado.margenLateral,
  },
  encabezado: {
    gap: 2,
  },
  titulo: {
    ...tipografia.h1,
    color: colores.texto,
  },
  subtitulo: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
  },
  vacio: {
    marginTop: 48,
  },
  mes: {
    gap: 10,
  },
  encabezadoMes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tituloMes: {
    ...tipografia.cuerpoDestacado,
    color: colores.texto,
  },
  totalMes: {
    ...tipografia.pequeno,
    color: colores.textoSecundario,
  },
});
