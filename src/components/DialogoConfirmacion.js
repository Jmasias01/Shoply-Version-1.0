// Diálogo centrado para confirmar acciones: finalizar, descartar o cerrar sesión.
// Tipo «normal» usa el acento; tipo «peligro» usa el color de error.
// Puede mostrar un resumen opcional (por ejemplo «5 productos» · «S/ 87.40»).

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import FondoDesenfocado from './FondoDesenfocado';
import Icono from './Icono';
import { colores, espaciado, radios, sombras, tipografia } from '../theme';

export default function DialogoConfirmacion({
  visible,
  tipo = 'normal', // 'normal' | 'peligro'
  icono = 'check',
  titulo,
  mensaje,
  resumen, // opcional: { detalle: '5 productos', monto: 'S/ 87.40' }
  textoCancelar = 'Cancelar',
  textoConfirmar,
  alCancelar,
  alConfirmar,
  cargando = false,
}) {
  const esPeligro = tipo === 'peligro';

  return (
    <FondoDesenfocado visible={visible} alCerrar={alCancelar}>
      <View style={estilos.dialogo}>
        <View style={[estilos.circuloIcono, esPeligro && estilos.circuloIconoPeligro]}>
          <Icono nombre={icono} tamano={24} color={esPeligro ? colores.error : colores.acento} />
        </View>

        <View style={estilos.textos}>
          <Text style={estilos.titulo}>{titulo}</Text>
          <Text style={estilos.mensaje}>{mensaje}</Text>
        </View>

        {resumen ? (
          <View style={estilos.resumen}>
            <Text style={estilos.resumenDetalle}>{resumen.detalle}</Text>
            <Text style={estilos.resumenMonto}>{resumen.monto}</Text>
          </View>
        ) : null}

        <View style={estilos.botones}>
          <Pressable onPress={alCancelar} disabled={cargando} style={[estilos.boton, estilos.botonCancelar]}>
            <Text style={estilos.textoCancelar}>{textoCancelar}</Text>
          </Pressable>

          {/* Se bloquea mientras se ejecuta la acción para evitar pulsaciones dobles. */}
          <Pressable
            onPress={alConfirmar}
            disabled={cargando}
            style={[estilos.boton, esPeligro ? estilos.botonPeligro : estilos.botonConfirmar]}
          >
            {cargando ? (
              <ActivityIndicator color={colores.textoSobreAcento} />
            ) : (
              <Text style={estilos.textoConfirmar}>{textoConfirmar}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </FondoDesenfocado>
  );
}

const estilos = StyleSheet.create({
  dialogo: {
    backgroundColor: colores.fondo,
    borderRadius: radios.dialogo,
    paddingTop: 28,
    paddingBottom: espaciado.xl,
    paddingHorizontal: espaciado.xl,
    alignItems: 'center',
    gap: espaciado.lg,
    ...sombras.neutra,
  },
  circuloIcono: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colores.acentoSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloIconoPeligro: {
    backgroundColor: colores.errorSuave,
  },
  textos: {
    gap: 6,
    width: '100%',
  },
  titulo: {
    ...tipografia.h2,
    color: colores.texto,
    textAlign: 'center',
  },
  mensaje: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  resumen: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espaciado.lg,
    paddingVertical: 14,
    borderRadius: radios.tarjeta,
    backgroundColor: colores.superficie,
  },
  resumenDetalle: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
  },
  resumenMonto: {
    ...tipografia.h2,
    color: colores.texto,
  },
  botones: {
    width: '100%',
    flexDirection: 'row',
    gap: espaciado.md,
  },
  boton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    paddingHorizontal: espaciado.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonCancelar: {
    backgroundColor: colores.superficie,
  },
  botonConfirmar: {
    backgroundColor: colores.acento,
  },
  botonPeligro: {
    backgroundColor: colores.error,
  },
  textoCancelar: {
    ...tipografia.boton,
    color: colores.texto,
  },
  textoConfirmar: {
    ...tipografia.boton,
    color: colores.textoSobreAcento,
  },
});
