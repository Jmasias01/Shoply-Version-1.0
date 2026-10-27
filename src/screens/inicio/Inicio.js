// Pestaña «Inicio»: saludo, tarjeta de compra y «Últimas compras».
// La tarjeta cambia según haya o no una compra en curso («Iniciar compra» o «Continuar compra»).
// Los datos se recargan cada vez que se entra o se vuelve a esta pestaña (useFocusEffect),
// y también al jalar la pantalla hacia abajo.

import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import BotonInvertido from '../../components/BotonInvertido';
import ListaCompras from '../../components/ListaCompras';
import MensajeError from '../../components/MensajeError';
import SelectorTienda from '../../components/SelectorTienda';
import TarjetaAcento from '../../components/TarjetaAcento';
import TarjetaCompraEnCurso from '../../components/TarjetaCompraEnCurso';
import { useAuth } from '../../context/AuthContext';
import { crearCompra, obtenerCompraEnCurso, obtenerComprasFinalizadas } from '../../services/comprasService';
import { colores, espaciado, fuentes, opacidadTextoSobreAcento, radios, tipografia } from '../../theme';

const CANTIDAD_ULTIMAS_COMPRAS = 3;

export default function Inicio({ navigation }) {
  const { nombreUsuario } = useAuth();

  const [compraEnCurso, setCompraEnCurso] = useState(null);
  const [ultimasCompras, setUltimasCompras] = useState([]);
  const [error, setError] = useState(null);
  const [actualizando, setActualizando] = useState(false); // al jalar la pantalla hacia abajo

  const [selectorVisible, setSelectorVisible] = useState(false);
  const [creando, setCreando] = useState(false);
  const [errorCrear, setErrorCrear] = useState(null);

  // Pide a la vez la compra en curso y las últimas compras (Promise.all las espera juntas).
  async function cargarDatos() {
    const [enCurso, ultimas] = await Promise.all([
      obtenerCompraEnCurso(),
      obtenerComprasFinalizadas(CANTIDAD_ULTIMAS_COMPRAS),
    ]);
    // Si una consulta falla (por ejemplo, sin señal), se conservan los datos que ya se veían:
    // así no aparece «Iniciar compra» cuando en realidad hay una compra en curso.
    if (!enCurso.error) {
      setCompraEnCurso(enCurso.datos);
    }
    if (!ultimas.error) {
      setUltimasCompras(ultimas.datos);
    }
    setError(enCurso.error || ultimas.error);
  }

  // «Jalar para actualizar»: muestra la ruedita arriba mientras recarga.
  async function actualizar() {
    setActualizando(true);
    await cargarDatos();
    setActualizando(false);
  }

  // useFocusEffect recarga al volver de una compra, para que Inicio siempre esté al día.
  // useCallback evita que se vuelva a crear la función en cada dibujo.
  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  function abrirSelector() {
    setErrorCrear(null);
    setSelectorVisible(true);
  }

  // «Empezar compra»: crea la compra en Supabase y abre la pantalla de compra.
  async function empezarCompra(tienda) {
    setCreando(true);
    const { datos, error: errorAlCrear } = await crearCompra(tienda);
    setCreando(false);
    if (errorAlCrear) {
      setErrorCrear(errorAlCrear);
      // Si ya había una compra en curso (por ejemplo, iniciada en otro teléfono),
      // se recarga Inicio para que la tarjeta la muestre.
      cargarDatos();
      return;
    }
    setSelectorVisible(false);
    navigation.navigate('Compra', { id: datos.id });
  }

  const inicial = (nombreUsuario || '?').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <ScrollView
        contentContainerStyle={estilos.contenido}
        refreshControl={<RefreshControl refreshing={actualizando} onRefresh={actualizar} tintColor={colores.acento} colors={[colores.acento]} />}
      >
        {/* Saludo en una sola línea, alineado por la línea base del texto. */}
        <View style={estilos.saludo}>
          <View style={estilos.textosSaludo}>
            <Text style={estilos.bienvenido}>Bienvenido,</Text>
            <Text style={estilos.nombre} numberOfLines={1}>
              {nombreUsuario}
            </Text>
          </View>
          <View style={estilos.avatar}>
            <Text style={estilos.inicial}>{inicial}</Text>
          </View>
        </View>

        {compraEnCurso ? (
          <TarjetaCompraEnCurso
            compra={compraEnCurso}
            alContinuar={() => navigation.navigate('Compra', { id: compraEnCurso.id })}
          />
        ) : (
          <TarjetaAcento style={estilos.tarjeta}>
            <View style={estilos.textosTarjeta}>
              <Text style={estilos.tituloTarjeta}>¿Vas de compras hoy?</Text>
              <Text style={estilos.subtituloTarjeta}>Comienza a registrar tus productos ¡Ya!</Text>
            </View>
            <BotonInvertido texto="Iniciar compra" alPresionar={abrirSelector} />
          </TarjetaAcento>
        )}

        <View style={estilos.seccion}>
          <View style={estilos.encabezadoSeccion}>
            <Text style={estilos.tituloSeccion}>Últimas compras</Text>
            <Text style={estilos.verTodo} onPress={() => navigation.navigate('Historial')} suppressHighlighting>
              Ver todo
            </Text>
          </View>

          {error ? <MensajeError mensaje={error} alReintentar={cargarDatos} /> : null}

          {ultimasCompras.length === 0 ? (
            // Usuario nuevo o sin compras este año (por ejemplo, a inicios de enero).
            <View style={estilos.cajaVacia}>
              <Text style={estilos.listaVacia}>Aún no tienes compras. ¡Empieza una!</Text>
            </View>
          ) : (
            <ListaCompras
              compras={ultimasCompras}
              style={estilos.lista}
              alPresionarCompra={(compra) => navigation.navigate('Compra', { id: compra.id })}
            />
          )}
        </View>
      </ScrollView>

      <SelectorTienda
        visible={selectorVisible}
        titulo="¿Dónde comprarás?"
        subtitulo="Elige una tienda para empezar."
        cargando={creando}
        error={errorCrear}
        alConfirmar={empezarCompra}
        alCerrar={() => setSelectorVisible(false)}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    gap: 28,
    paddingTop: espaciado.md,
    paddingBottom: espaciado.lg,
    paddingHorizontal: espaciado.margenLateral,
  },
  saludo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaciado.md,
  },
  textosSaludo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  bienvenido: {
    ...tipografia.cuerpo,
    color: colores.texto,
  },
  nombre: {
    ...tipografia.h1,
    color: colores.texto,
    flexShrink: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colores.acentoSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: {
    ...tipografia.cuerpoDestacado,
    color: colores.acento,
  },
  tarjeta: {
    gap: espaciado.lg,
    paddingTop: 22,
    paddingBottom: espaciado.entreCampos,
    paddingHorizontal: espaciado.entreCampos,
  },
  textosTarjeta: {
    gap: 6,
  },
  tituloTarjeta: {
    ...tipografia.h2,
    color: colores.textoSobreAcento,
  },
  subtituloTarjeta: {
    ...tipografia.cuerpo,
    color: colores.textoSobreAcento,
    opacity: opacidadTextoSobreAcento,
  },
  seccion: {
    gap: 14,
  },
  encabezadoSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tituloSeccion: {
    ...tipografia.cuerpoDestacado,
    color: colores.texto,
  },
  verTodo: {
    ...tipografia.pequeno,
    fontFamily: fuentes.semibold,
    color: colores.acento,
  },
  // En Inicio la lista lleva 4 px arriba y abajo (en el Historial, 2 px).
  lista: {
    paddingVertical: espaciado.xs,
  },
  cajaVacia: {
    borderRadius: radios.lista,
    backgroundColor: colores.superficie,
  },
  listaVacia: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
    textAlign: 'center',
    paddingVertical: espaciado.xl,
    paddingHorizontal: espaciado.lg,
  },
});
