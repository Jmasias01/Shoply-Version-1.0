// Fila de un producto de la compra: nombre, «cantidad × precio», subtotal y botón (⋯).
// Se usa en la lista de productos de la pantalla de compra.
// Al tocar (⋯) mide la posición del botón en pantalla para que el menú se abra justo debajo.

import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icono from './Icono';
import { calcularSubtotal } from '../utils/calculos';
import { formatearMonto } from '../utils/formato';
import { colores, espaciado, tipografia } from '../theme';

export default function FilaProducto({ nombre, cantidad, precio, menuAbierto = false, alAbrirMenu }) {
  const refBoton = useRef(null);

  // measureInWindow da la posición del botón respecto a la ventana;
  // la pantalla de compra la usa para ubicar el menú debajo (o arriba si no hay espacio).
  function abrirMenu() {
    refBoton.current?.measureInWindow((x, y, ancho, alto) => {
      alAbrirMenu?.({ x, y, ancho, alto });
    });
  }

  return (
    <View style={estilos.fila}>
      <View style={estilos.datos}>
        {/* Nombre largo: hasta 2 líneas y termina en «…». */}
        <Text style={estilos.nombre} numberOfLines={2}>
          {nombre}
        </Text>
        <Text style={estilos.detalle}>
          {cantidad} × {formatearMonto(precio)}
        </Text>
      </View>

      {/* El subtotal y el (⋯) se alinean con la primera línea del nombre. */}
      <Text style={estilos.subtotal}>{formatearMonto(calcularSubtotal(precio, cantidad))}</Text>

      <Pressable
        ref={refBoton}
        onPress={abrirMenu}
        hitSlop={6}
        accessibilityLabel="Opciones del producto"
        style={[estilos.botonMenu, menuAbierto && estilos.botonMenuActivo]}
      >
        <Icono nombre="ellipsis" tamano={16} color={menuAbierto ? colores.acento : colores.texto} />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espaciado.md,
    paddingLeft: espaciado.lg,
    paddingRight: espaciado.md,
    paddingVertical: 14,
  },
  datos: {
    flex: 1,
    gap: 2,
    paddingTop: 6,
  },
  nombre: {
    ...tipografia.cuerpoDestacado,
    color: colores.texto,
  },
  detalle: {
    ...tipografia.pequeno,
    color: colores.textoSecundario,
  },
  subtotal: {
    ...tipografia.cuerpoDestacado,
    color: colores.texto,
    paddingTop: 6,
  },
  botonMenu: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colores.fondo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonMenuActivo: {
    backgroundColor: colores.acentoSuave,
  },
});
