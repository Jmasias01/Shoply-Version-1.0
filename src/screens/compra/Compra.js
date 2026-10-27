// Pantalla de compra: total, lista de productos y botones «Cámara» y «Manual».
// Es la misma pantalla para la compra en curso y para el detalle de una compra finalizada;
// recibe el `id` de la compra y cambia solo la cabecera («Finalizar» o la etiqueta «Finalizada»).
// La flecha atrás nunca finaliza la compra: solo vuelve a la pantalla de origen.

import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AvisoBreve from '../../components/AvisoBreve';
import BotonAccion from '../../components/BotonAccion';
import BotonAtras from '../../components/BotonAtras';
import DialogoConfirmacion from '../../components/DialogoConfirmacion';
import EstadoVacio from '../../components/EstadoVacio';
import FilaProducto from '../../components/FilaProducto';
import Icono from '../../components/Icono';
import MensajeError from '../../components/MensajeError';
import MenuFlotante from '../../components/MenuFlotante';
import TarjetaAcento from '../../components/TarjetaAcento';
import { descartarCompra, finalizarCompra, obtenerCompra } from '../../services/comprasService';
import { borrarProducto } from '../../services/productosService';
import { calcularTotal } from '../../utils/calculos';
import { formatearCantidadProductos, formatearFecha, formatearMonto } from '../../utils/formato';
import { colores, espaciado, opacidadTextoSobreAcento, radios, tipografia } from '../../theme';

// Alto de la barra inferior sin el área segura (14 + 56 + 10 + 1 de borde).
const ALTO_BARRA_INFERIOR = 81;
const DURACION_AVISO_MS = 2500;

export default function Compra({ navigation, route }) {
  const { id } = route.params;
  const margenes = useSafeAreaInsets();

  const [compra, setCompra] = useState(null);
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);

  // Menús (⋯): guardan la posición del botón tocado para abrir el menú junto a él.
  const [menuProducto, setMenuProducto] = useState(null); // { producto, ancla }
  const [anclaMenuCabecera, setAnclaMenuCabecera] = useState(null);
  const refBotonMenu = useRef(null);

  // Diálogo abierto: 'finalizar', 'vacia' (finalizar sin productos) o 'descartar'.
  const [dialogo, setDialogo] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const [aviso, setAviso] = useState(null);
  const refTemporizador = useRef(null);

  async function cargarCompra() {
    const { datos, error: errorAlCargar } = await obtenerCompra(id);
    if (errorAlCargar) {
      setError(errorAlCargar);
      return;
    }
    // Si la compra ya no existe (por ejemplo, se descartó en otro teléfono), se vuelve atrás.
    if (!datos) {
      navigation.goBack();
      return;
    }
    setError(null);
    setCompra(datos);
    setProductos(datos.trip_items);
  }

  // Se recarga al entrar y al volver del formulario o de «Cambiar tienda».
  useFocusEffect(
    useCallback(() => {
      cargarCompra();
    }, [id])
  );

  // Al salir de la pantalla se cancela el temporizador del aviso, si quedaba uno.
  useEffect(() => () => clearTimeout(refTemporizador.current), []);

  function mostrarAviso(texto) {
    clearTimeout(refTemporizador.current);
    setAviso(texto);
    refTemporizador.current = setTimeout(() => setAviso(null), DURACION_AVISO_MS);
  }

  function abrirMenuCabecera() {
    refBotonMenu.current?.measureInWindow((x, y, ancho, alto) => {
      setAnclaMenuCabecera({ x, y, ancho, alto });
    });
  }

  // «Borrar» del menú: se borra de inmediato, sin diálogo, porque el menú ya fue el paso previo.
  // El producto desaparece al instante de la lista; si falla, vuelve a aparecer.
  async function borrar(producto) {
    const anteriores = productos;
    setProductos(productos.filter((p) => p.id !== producto.id));
    const { error: errorAlBorrar } = await borrarProducto(producto.id);
    if (errorAlBorrar) {
      setProductos(anteriores);
      mostrarAviso(errorAlBorrar);
    }
  }

  // Finalizar con productos pide confirmación; sin productos ofrece descartar.
  function pulsarFinalizar() {
    setDialogo(productos.length > 0 ? 'finalizar' : 'vacia');
  }

  // Ejecuta finalizar o descartar y vuelve a Inicio. Si falla, cierra el diálogo y avisa.
  async function ejecutarYVolverAInicio(accion) {
    setProcesando(true);
    const { error: errorAccion } = await accion(id);
    if (errorAccion) {
      setProcesando(false);
      setDialogo(null);
      mostrarAviso(errorAccion);
      return;
    }
    // popTo vuelve a las pestañas (quitando esta pantalla) y abre la pestaña Inicio.
    navigation.popTo('Principal', { screen: 'Inicio' });
  }

  const total = calcularTotal(productos);
  const finalizada = compra?.estado === 'finalizado';
  const altoBarra = ALTO_BARRA_INFERIOR + margenes.bottom;

  // Mientras llega la compra por primera vez se muestra un indicador (o el error).
  // Siempre con el botón atrás, para que el usuario nunca quede atrapado en esta pantalla.
  if (!compra) {
    return (
      <SafeAreaView style={estilos.pantalla} edges={['top']}>
        <View style={estilos.cabecera}>
          <BotonAtras alPresionar={() => navigation.goBack()} />
        </View>
        <View style={estilos.centrado}>
          {error ? (
            <MensajeError mensaje={error} alReintentar={cargarCompra} />
          ) : (
            <ActivityIndicator size="large" color={colores.acento} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      {/* Cabecera: atrás, tienda y fecha, menú (⋯) y «Finalizar» (o «Finalizada»). */}
      <View style={estilos.cabecera}>
        <BotonAtras alPresionar={() => navigation.goBack()} />
        <View style={estilos.tiendaYFecha}>
          <Text style={estilos.tienda} numberOfLines={1}>
            {compra.tienda}
          </Text>
          <Text style={estilos.fecha}>{formatearFecha(compra.fecha)}</Text>
        </View>
        <Pressable ref={refBotonMenu} onPress={abrirMenuCabecera} accessibilityLabel="Opciones de la compra" style={estilos.botonMenu}>
          <Icono nombre="ellipsis" />
        </Pressable>
        {finalizada ? (
          <View style={estilos.estadoFinalizada}>
            <Icono nombre="check" tamano={17} color={colores.textoSecundario} />
            <Text style={estilos.textoFinalizada}>Finalizada</Text>
          </View>
        ) : (
          <Pressable onPress={pulsarFinalizar} style={({ pressed }) => [estilos.botonFinalizar, pressed && estilos.presionado]}>
            <Text style={estilos.textoFinalizar}>Finalizar</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={estilos.contenido}>
        <TarjetaAcento variante="compacta" style={estilos.tarjetaTotal}>
          <View style={estilos.textosTotal}>
            <Text style={estilos.etiquetaTotal}>Total de la compra</Text>
            <Text style={estilos.montoTotal}>{formatearMonto(total)}</Text>
          </View>
          <View style={estilos.cantidad}>
            <Text style={estilos.textoCantidad}>{formatearCantidadProductos(productos.length)}</Text>
          </View>
        </TarjetaAcento>

        {error ? <MensajeError mensaje={error} alReintentar={cargarCompra} /> : null}

        {productos.length === 0 ? (
          <EstadoVacio
            icono="shopping-bag"
            titulo="Aún no agregas productos"
            subtitulo="Usa la cámara o añádelo manualmente."
            style={estilos.vacia}
          />
        ) : (
          <View style={estilos.seccion}>
            <View style={estilos.encabezadoSeccion}>
              <Text style={estilos.tituloSeccion}>Productos</Text>
              <Text style={estilos.orden}>Lo último, arriba</Text>
            </View>
            <View style={estilos.lista}>
              {productos.map((producto, indice) => (
                <View key={producto.id}>
                  {indice > 0 ? <View style={estilos.divisor} /> : null}
                  <FilaProducto
                    nombre={producto.nombre}
                    cantidad={producto.cantidad}
                    precio={producto.precio_unitario}
                    menuAbierto={menuProducto?.producto.id === producto.id}
                    alAbrirMenu={(ancla) => setMenuProducto({ producto, ancla })}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Barra inferior fija: «Cámara» (leer la etiqueta con IA) y «Manual». */}
      <View style={[estilos.barraInferior, { paddingBottom: Math.max(margenes.bottom, 10) }]}>
        <BotonAccion
          texto="Cámara"
          icono="camera"
          alPresionar={() => navigation.navigate('Camara', { idCompra: id })}
        />
        <BotonAccion
          texto="Manual"
          icono="pencil"
          estilo="secundario"
          alPresionar={() => navigation.navigate('FormularioProducto', { idCompra: id })}
        />
      </View>

      <AvisoBreve mensaje={aviso} distanciaInferior={altoBarra + espaciado.md} />

      {/* Menú (⋯) de un producto. */}
      <MenuFlotante
        ancla={menuProducto?.ancla}
        espacioInferior={altoBarra}
        alCerrar={() => setMenuProducto(null)}
        opciones={[
          {
            texto: 'Editar',
            icono: 'pencil',
            alPresionar: () =>
              navigation.navigate('FormularioProducto', { idCompra: id, producto: menuProducto.producto }),
          },
          { texto: 'Borrar', icono: 'trash', peligro: true, alPresionar: () => borrar(menuProducto.producto) },
        ]}
      />

      {/* Menú (⋯) de la cabecera: no tiene diseño en Figma; sigue el estilo del menú de producto. */}
      <MenuFlotante
        ancla={anclaMenuCabecera}
        espacioInferior={altoBarra}
        alCerrar={() => setAnclaMenuCabecera(null)}
        opciones={[
          {
            texto: 'Cambiar tienda',
            icono: 'store',
            alPresionar: () => navigation.navigate('CambiarTienda', { idCompra: id, tiendaActual: compra.tienda }),
          },
          { texto: 'Descartar compra', icono: 'trash', peligro: true, alPresionar: () => setDialogo('descartar') },
        ]}
      />

      <DialogoConfirmacion
        visible={dialogo === 'finalizar'}
        icono="check"
        titulo="¿Finalizar compra?"
        mensaje="Podrás editarla después desde el Historial."
        resumen={{ detalle: formatearCantidadProductos(productos.length), monto: formatearMonto(total) }}
        textoCancelar="Volver"
        textoConfirmar="Finalizar"
        cargando={procesando}
        alCancelar={() => setDialogo(null)}
        alConfirmar={() => ejecutarYVolverAInicio(finalizarCompra)}
      />

      <DialogoConfirmacion
        visible={dialogo === 'vacia'}
        tipo="peligro"
        icono="trash"
        titulo="Compra sin productos"
        mensaje="No agregaste productos. ¿Quieres descartar esta compra?"
        textoCancelar="Volver"
        textoConfirmar="Descartar"
        cargando={procesando}
        alCancelar={() => setDialogo(null)}
        alConfirmar={() => ejecutarYVolverAInicio(descartarCompra)}
      />

      <DialogoConfirmacion
        visible={dialogo === 'descartar'}
        tipo="peligro"
        icono="trash"
        titulo="¿Descartar compra?"
        mensaje="Se eliminará esta compra y todos sus productos."
        textoCancelar="Cancelar"
        textoConfirmar="Descartar"
        cargando={procesando}
        alCancelar={() => setDialogo(null)}
        alConfirmar={() => ejecutarYVolverAInicio(descartarCompra)}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    padding: espaciado.margenLateral,
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: espaciado.margenLateral,
    paddingVertical: espaciado.sm,
  },
  tiendaYFecha: {
    flex: 1,
  },
  tienda: {
    ...tipografia.cuerpoDestacado,
    color: colores.texto,
  },
  fecha: {
    ...tipografia.pequeno,
    color: colores.textoSecundario,
  },
  botonMenu: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonFinalizar: {
    height: 44,
    paddingHorizontal: espaciado.lg,
    borderRadius: 22,
    backgroundColor: colores.acentoSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presionado: {
    opacity: 0.7,
  },
  textoFinalizar: {
    ...tipografia.boton,
    color: colores.acento,
  },
  estadoFinalizada: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: espaciado.md,
    paddingRight: 14,
    borderRadius: 22,
    backgroundColor: colores.superficie,
  },
  textoFinalizada: {
    ...tipografia.pestana,
    color: colores.textoSecundario,
  },
  contenido: {
    // flexGrow permite que la lista vacía se centre en el espacio libre.
    flexGrow: 1,
    gap: espaciado.entreCampos,
    paddingTop: espaciado.md,
    paddingBottom: espaciado.lg,
    paddingHorizontal: espaciado.margenLateral,
  },
  tarjetaTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: espaciado.entreCampos,
  },
  textosTotal: {
    gap: 2,
  },
  etiquetaTotal: {
    ...tipografia.pequeno,
    color: colores.textoSobreAcento,
    opacity: opacidadTextoSobreAcento,
  },
  montoTotal: {
    ...tipografia.montoGrande,
    color: colores.textoSobreAcento,
  },
  cantidad: {
    paddingHorizontal: espaciado.md,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colores.etiquetaSobreAcento,
  },
  textoCantidad: {
    ...tipografia.pestana,
    color: colores.textoSobreAcento,
  },
  vacia: {
    flex: 1,
    paddingBottom: 40,
  },
  seccion: {
    gap: espaciado.md,
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
  orden: {
    ...tipografia.pequeno,
    color: colores.textoSecundario,
  },
  lista: {
    paddingVertical: 2,
    borderRadius: radios.lista,
    backgroundColor: colores.superficie,
  },
  divisor: {
    height: 1,
    marginHorizontal: espaciado.lg,
    backgroundColor: colores.borde,
  },
  barraInferior: {
    flexDirection: 'row',
    gap: espaciado.md,
    paddingTop: 14,
    paddingHorizontal: espaciado.margenLateral,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    backgroundColor: colores.fondo,
  },
});
