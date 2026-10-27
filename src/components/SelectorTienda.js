// Pop-up para elegir la tienda: Plaza Vea, Tottus, Wong u «Otra tienda» (escrita a mano).
// Lo reutilizan dos pantallas:
//   - Inicio («¿Dónde comprarás?»): con botón «Empezar compra».
//   - Cambiar tienda: sin botón; la tienda elegida se guarda al cerrar con la (X).

import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import BotonPrimario from './BotonPrimario';
import FondoDesenfocado from './FondoDesenfocado';
import Icono from './Icono';
import OpcionTienda from './OpcionTienda';
import { colores, espaciado, medidas, radios, sombras, tipografia } from '../theme';

export const TIENDAS = ['Plaza Vea', 'Tottus', 'Wong'];

// Valor especial de la selección cuando el usuario escribe el nombre de otra tienda.
const OTRA = 'otra';

export default function SelectorTienda({
  visible = true,
  enModal = true,
  titulo,
  subtitulo,
  tiendaInicial, // tienda marcada al abrir (en «Cambiar tienda» es la actual)
  mostrarBoton = true, // true: «Empezar compra». false: se guarda al cerrar
  textoBoton = 'Empezar compra',
  cargando = false,
  error, // mensaje de error opcional, debajo de las opciones
  alConfirmar, // recibe la tienda elegida (o null si «Otra tienda» quedó vacía)
  alCerrar,
}) {
  const [seleccion, setSeleccion] = useState(null);
  const [otraTienda, setOtraTienda] = useState('');

  // Cada vez que se abre, la opción marcada es la tienda inicial.
  // Si no es una de las fijas, se marca «Otra tienda» con su nombre escrito.
  useEffect(() => {
    if (!visible) {
      return;
    }
    if (TIENDAS.includes(tiendaInicial)) {
      setSeleccion(tiendaInicial);
      setOtraTienda('');
    } else if (tiendaInicial) {
      setSeleccion(OTRA);
      setOtraTienda(tiendaInicial);
    } else {
      setSeleccion(null);
      setOtraTienda('');
    }
  }, [visible, tiendaInicial]);

  // La tienda que se guardaría ahora; null si «Otra tienda» está vacía o no hay selección.
  const tiendaElegida = seleccion === OTRA ? otraTienda.trim() || null : seleccion;
  const otraSeleccionada = seleccion === OTRA;

  // Con botón, cerrar solo cierra. Sin botón, cerrar es «guardar»: se envía la elección.
  function cerrar() {
    if (mostrarBoton) {
      alCerrar();
    } else {
      alConfirmar(tiendaElegida);
    }
  }

  return (
    <FondoDesenfocado visible={visible} alCerrar={cerrar} enModal={enModal}>
      <View style={[estilos.tarjeta, !mostrarBoton && estilos.tarjetaSinBoton]}>
        <View style={estilos.encabezado}>
          <View style={estilos.textos}>
            {/* Todos los textos en una sola línea, como pide el diseño. */}
            <Text style={estilos.titulo} numberOfLines={1}>
              {titulo}
            </Text>
            <Text style={estilos.subtitulo} numberOfLines={1}>
              {subtitulo}
            </Text>
          </View>
          <Pressable onPress={cerrar} hitSlop={8} accessibilityLabel="Cerrar" style={estilos.botonCerrar}>
            <Icono nombre="x" tamano={18} />
          </Pressable>
        </View>

        <View style={estilos.opciones}>
          {TIENDAS.map((tienda) => (
            <OpcionTienda
              key={tienda}
              tienda={tienda}
              seleccionada={seleccion === tienda}
              alPresionar={() => setSeleccion(tienda)}
            />
          ))}

          {/* «Otra tienda»: al tocar el campo para escribir, queda seleccionada. */}
          <View style={[estilos.otraTienda, otraSeleccionada && estilos.otraTiendaSeleccionada]}>
            <Icono nombre="pencil" color={otraSeleccionada ? colores.acento : colores.placeholder} />
            <TextInput
              style={estilos.inputOtraTienda}
              value={otraTienda}
              onChangeText={setOtraTienda}
              onFocus={() => setSeleccion(OTRA)}
              placeholder="Otra tienda: escribe su nombre"
              placeholderTextColor={colores.placeholder}
              maxLength={60}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>
        </View>

        {error ? <Text style={estilos.error}>{error}</Text> : null}

        {mostrarBoton ? (
          <BotonPrimario
            texto={textoBoton}
            alPresionar={() => alConfirmar(tiendaElegida)}
            deshabilitado={!tiendaElegida}
            cargando={cargando}
          />
        ) : (
          <Text style={estilos.ayuda}>Se guarda al cerrar esta ventana</Text>
        )}
      </View>
    </FondoDesenfocado>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.fondo,
    borderRadius: radios.dialogo,
    padding: espaciado.xl,
    gap: espaciado.entreCampos,
    ...sombras.neutra,
  },
  tarjetaSinBoton: {
    gap: 18,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espaciado.md,
  },
  textos: {
    flex: 1,
    gap: 6,
  },
  titulo: {
    ...tipografia.h2,
    color: colores.texto,
  },
  subtitulo: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
  },
  botonCerrar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opciones: {
    gap: 10,
  },
  otraTienda: {
    height: medidas.alturaCampo,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    paddingHorizontal: espaciado.lg,
    borderRadius: radios.campo,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colores.borde,
    backgroundColor: colores.fondo,
  },
  otraTiendaSeleccionada: {
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderColor: colores.acento,
    backgroundColor: colores.acentoSuave,
  },
  inputOtraTienda: {
    flex: 1,
    ...tipografia.cuerpo,
    color: colores.texto,
    paddingVertical: 0,
  },
  error: {
    ...tipografia.pequeno,
    color: colores.error,
    textAlign: 'center',
  },
  ayuda: {
    ...tipografia.pequeno,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
});
