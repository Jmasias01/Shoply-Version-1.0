// Formulario de producto (hoja inferior sobre la compra): agregar o editar un producto.
// Se abre desde «Manual», desde «Editar» del menú (⋯) o desde la cámara, con los datos
// leídos por la IA (los campos leídos se marcan con (✦) y los que faltan, en rojo).
// Solo guarda en Supabase al pulsar el botón principal; (X) cierra sin guardar.
// Todos los avisos y errores van en el mensaje inferior, para que la hoja no cambie de alto.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BotonPrimario from '../../components/BotonPrimario';
import CampoTexto from '../../components/CampoTexto';
import FondoDesenfocado from '../../components/FondoDesenfocado';
import Icono from '../../components/Icono';
import SelectorCantidad from '../../components/SelectorCantidad';
import { agregarProducto, editarProducto } from '../../services/productosService';
import { calcularSubtotal } from '../../utils/calculos';
import { formatearMonto } from '../../utils/formato';
import { LIMITES, convertirPrecio, esProductoValido, validarPrecio } from '../../utils/validaciones';
import { colores, espaciado, radios, sombras, tipografia } from '../../theme';

const ERROR_AL_GUARDAR = 'No se pudo guardar · revisa tu conexión';

// Estado inicial de un campo que viene de la cámara:
// «ia» si la IA lo leyó, «error» si no pudo leerlo y «normal» si no hubo escaneo.
function estadoInicial(escaneo, dato) {
  if (!escaneo) {
    return 'normal';
  }
  return dato == null ? 'error' : 'ia';
}

// Mensaje del escaneo según qué campos leyó la IA; null si ya no hay nada que avisar.
function mensajeDeEscaneo(estadoNombre, estadoPrecio) {
  const faltaNombre = estadoNombre === 'error';
  const faltaPrecio = estadoPrecio === 'error';
  if (faltaNombre && faltaPrecio) {
    return { texto: 'No se pudo leer la etiqueta. Ingrésala a mano.', tipo: 'error' };
  }
  if (faltaPrecio) {
    return { texto: 'No se pudo leer el precio. Ingrésalo.', tipo: 'error' };
  }
  if (faltaNombre) {
    return { texto: 'No se pudo leer el nombre. Ingrésalo.', tipo: 'error' };
  }
  if (estadoNombre === 'ia' && estadoPrecio === 'ia') {
    return { texto: 'Leído con IA', tipo: 'ia' };
  }
  return null;
}

// Texto y tipo del mensaje inferior ('normal', 'error' o 'ia').
// Va de lo más importante (un error al guardar) a lo menos importante (la ayuda).
function elegirMensaje({ errorGuardado, nombre, modoEditar, valido, estadoNombre, estadoPrecio }) {
  if (errorGuardado) {
    return { texto: errorGuardado, tipo: 'error' };
  }
  if (nombre.length >= LIMITES.nombreMaximo) {
    return { texto: 'Máximo 60 caracteres', tipo: 'normal' };
  }
  if (modoEditar) {
    return { texto: 'El total se actualiza al guardar', tipo: 'normal' };
  }
  const deEscaneo = mensajeDeEscaneo(estadoNombre, estadoPrecio);
  if (deEscaneo) {
    return deEscaneo;
  }
  return {
    texto: valido ? 'Todo listo para agregar' : 'Completa nombre y precio para continuar',
    tipo: 'normal',
  };
}

// Icono que acompaña al mensaje inferior según su tipo.
const ICONO_MENSAJE = { error: 'alert-circle', ia: 'sparkles' };
const COLOR_MENSAJE = { normal: colores.textoSecundario, error: colores.error, ia: colores.acento };

export default function FormularioProducto({ navigation, route }) {
  // `producto` solo llega al editar; `escaneo` ({ nombre, precio }) solo desde la cámara.
  const { idCompra, producto, escaneo } = route.params;
  const modoEditar = Boolean(producto);
  // Se guarda de dónde vino el producto: leído de la etiqueta o escrito a mano.
  const origen = escaneo ? 'etiqueta' : 'manual';
  const margenes = useSafeAreaInsets();

  // Al editar, los campos empiezan con los datos del producto; desde la cámara, con lo leído.
  const nombreInicial = producto?.nombre ?? escaneo?.nombre ?? '';
  const precioInicial = producto?.precio_unitario ?? escaneo?.precio;
  const [nombre, setNombre] = useState(nombreInicial);
  const [precio, setPrecio] = useState(precioInicial != null ? Number(precioInicial).toFixed(2) : '');
  const [estadoNombre, setEstadoNombre] = useState(estadoInicial(escaneo, escaneo?.nombre));
  const [estadoPrecio, setEstadoPrecio] = useState(estadoInicial(escaneo, escaneo?.precio));
  const [cantidad, setCantidad] = useState(producto?.cantidad ?? 1);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(null);

  const valido = esProductoValido({ nombre, precio, cantidad });
  const precioValido = validarPrecio(precio);
  const subtotal = precioValido ? calcularSubtotal(convertirPrecio(precio), cantidad) : 0;
  const mensaje = elegirMensaje({ errorGuardado, nombre, modoEditar, valido, estadoNombre, estadoPrecio });

  // Si el usuario cambia algo después de un error, el error ya no aplica.
  // Si cambia un campo leído (o no leído) por la IA, ese campo vuelve a su estado normal.
  function alCambiar(setValor, setEstado) {
    return (valor) => {
      setValor(valor);
      setErrorGuardado(null);
      setEstado?.('normal');
    };
  }

  async function guardar() {
    setGuardando(true);
    const datos = { nombre, precio, cantidad };
    const { error } = modoEditar
      ? await editarProducto(producto.id, datos)
      : await agregarProducto(idCompra, datos, origen);
    setGuardando(false);

    // Si falla, los datos escritos se conservan y se muestra el error abajo.
    if (error) {
      setErrorGuardado(ERROR_AL_GUARDAR);
      return;
    }
    // Al volver, la pantalla de compra se recarga sola (useFocusEffect).
    navigation.goBack();
  }

  const cerrar = () => navigation.goBack();

  return (
    <FondoDesenfocado enModal={false} posicion="abajo" alCerrar={cerrar}>
      <View style={[estilos.hoja, { paddingBottom: Math.max(margenes.bottom, espaciado.lg) + espaciado.lg }]}>
        {/* 1. Asa */}
        <View style={estilos.asa} />

        {/* 2. Encabezado: solo el título y la (X). */}
        <View style={estilos.encabezado}>
          <Text style={estilos.titulo}>{modoEditar ? 'Editar producto' : 'Agregar producto'}</Text>
          <Pressable onPress={cerrar} hitSlop={8} accessibilityLabel="Cerrar" style={estilos.botonCerrar}>
            <Icono nombre="x" tamano={18} />
          </Pressable>
        </View>

        {/* 3. Campos sin mensajes debajo y la cantidad con el subtotal. */}
        <View style={estilos.campos}>
          <CampoTexto
            etiqueta="Nombre del producto"
            placeholder="Ej. Leche Gloria 400 g"
            icono="tag"
            valor={nombre}
            alCambiar={alCambiar(setNombre, setEstadoNombre)}
            estado={estadoNombre}
            maxLength={LIMITES.nombreMaximo}
            autoCapitalize="sentences"
          />
          <CampoTexto
            etiqueta="Precio unitario (S/)"
            placeholder="0.00"
            icono="banknote"
            valor={precio}
            alCambiar={alCambiar(setPrecio, setEstadoPrecio)}
            estado={estadoPrecio}
            keyboardType="decimal-pad"
          />

          <View style={estilos.bloqueCantidad}>
            <Text style={estilos.etiqueta}>Cantidad</Text>
            <View style={estilos.filaCantidad}>
              <SelectorCantidad valor={cantidad} alCambiar={alCambiar(setCantidad)} />
              <View style={estilos.subtotal}>
                <Text style={estilos.textoSubtotal}>Subtotal</Text>
                <Text style={[estilos.montoSubtotal, !precioValido && estilos.montoVacio]}>
                  {formatearMonto(subtotal)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4. Botón principal. */}
        <BotonPrimario
          texto={modoEditar ? 'Guardar cambios' : 'Agregar producto'}
          alPresionar={guardar}
          deshabilitado={!valido}
          cargando={guardando}
        />

        {/* 5. Mensaje inferior: una sola línea, siempre presente, con icono si es error o IA. */}
        <View style={estilos.filaMensaje}>
          {ICONO_MENSAJE[mensaje.tipo] ? (
            <Icono nombre={ICONO_MENSAJE[mensaje.tipo]} tamano={16} color={COLOR_MENSAJE[mensaje.tipo]} />
          ) : null}
          <Text style={[estilos.mensaje, { color: COLOR_MENSAJE[mensaje.tipo] }]} numberOfLines={1}>
            {mensaje.texto}
          </Text>
        </View>
      </View>
    </FondoDesenfocado>
  );
}

const estilos = StyleSheet.create({
  hoja: {
    gap: espaciado.entreCampos,
    paddingTop: espaciado.md,
    paddingHorizontal: espaciado.margenLateral,
    borderTopLeftRadius: radios.dialogo,
    borderTopRightRadius: radios.dialogo,
    backgroundColor: colores.fondo,
    ...sombras.hoja,
  },
  asa: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colores.borde,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
  },
  titulo: {
    flex: 1,
    ...tipografia.h2,
    color: colores.texto,
  },
  botonCerrar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  campos: {
    gap: 18,
  },
  bloqueCantidad: {
    gap: espaciado.sm,
  },
  etiqueta: {
    ...tipografia.etiqueta,
    color: colores.texto,
  },
  filaCantidad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtotal: {
    alignItems: 'flex-end',
  },
  textoSubtotal: {
    ...tipografia.pequeno,
    color: colores.textoSecundario,
  },
  montoSubtotal: {
    ...tipografia.h2,
    color: colores.texto,
  },
  // Sin precio válido el subtotal (S/ 0.00) se ve gris, como en el Figma.
  montoVacio: {
    color: colores.placeholder,
  },
  filaMensaje: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  mensaje: {
    ...tipografia.pequeno,
    flexShrink: 1,
  },
});
