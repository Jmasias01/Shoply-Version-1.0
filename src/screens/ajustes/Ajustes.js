// Pestaña «Ajustes»: tarjeta de perfil, «Mis tiendas» (próximamente) y «Cerrar sesión».
// Es la tercera pestaña de la barra inferior. Cerrar sesión pide confirmación
// y, al confirmar, la navegación vuelve sola a Iniciar sesión.

import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DialogoConfirmacion from '../../components/DialogoConfirmacion';
import Icono from '../../components/Icono';
import { useAuth } from '../../context/AuthContext';
import { colores, espaciado, tipografia } from '../../theme';

export default function Ajustes() {
  const { usuario, nombreUsuario, cerrarSesion } = useAuth();
  const [dialogoVisible, setDialogoVisible] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  // Inicial del nombre para el avatar («Jhon» → «J»).
  const inicial = (nombreUsuario || '?').charAt(0).toUpperCase();

  async function confirmarCierre() {
    setCerrando(true);
    const { error } = await cerrarSesion();
    // Si sale bien no hay nada más que hacer: AuthContext pierde la sesión
    // y RootNavigator muestra Iniciar sesión.
    if (error) {
      setCerrando(false);
      setDialogoVisible(false);
      Alert.alert('No se pudo cerrar sesión', error);
    }
  }

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <View style={estilos.contenido}>
        <Text style={estilos.titulo}>Ajustes</Text>

        {/* Tarjeta de perfil */}
        <View style={estilos.perfil}>
          <View style={estilos.avatar}>
            <Text style={estilos.inicial}>{inicial}</Text>
          </View>
          <View style={estilos.datosPerfil}>
            <Text style={estilos.nombre} numberOfLines={1}>
              {nombreUsuario}
            </Text>
            <Text style={estilos.correo} numberOfLines={1}>
              {usuario?.email}
            </Text>
          </View>
        </View>

        {/* Sección «Cuenta» */}
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Cuenta</Text>
          <View style={estilos.lista}>
            {/* «Mis tiendas» se ve deshabilitado: es una función para después del MVP. */}
            <View style={estilos.fila}>
              <View style={[estilos.cajaIcono, estilos.cajaIconoBlanca]}>
                <Icono nombre="store" color={colores.placeholder} />
              </View>
              <Text style={[estilos.textoFila, estilos.textoDeshabilitado]}>Mis tiendas</Text>
              <View style={estilos.etiqueta}>
                <Text style={estilos.textoEtiqueta}>Próximamente</Text>
              </View>
            </View>

            <View style={estilos.divisor} />

            <Pressable
              onPress={() => setDialogoVisible(true)}
              style={({ pressed }) => [estilos.fila, pressed && estilos.filaPresionada]}
            >
              <View style={[estilos.cajaIcono, estilos.cajaIconoError]}>
                <Icono nombre="log-out" color={colores.error} />
              </View>
              <Text style={[estilos.textoFila, estilos.textoError]}>Cerrar sesión</Text>
            </Pressable>
          </View>
        </View>

        {/* Empuja la versión hasta el pie de la pantalla. */}
        <View style={estilos.espacio} />
        <Text style={estilos.version}>Shoply · versión 1.0</Text>
      </View>

      <DialogoConfirmacion
        visible={dialogoVisible}
        tipo="peligro"
        icono="log-out"
        titulo="¿Cerrar sesión?"
        mensaje="Tendrás que ingresar tu correo y contraseña otra vez."
        textoCancelar="Cancelar"
        textoConfirmar="Cerrar sesión"
        cargando={cerrando}
        alCancelar={() => setDialogoVisible(false)}
        alConfirmar={confirmarCierre}
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
    flex: 1,
    gap: espaciado.xl,
    paddingTop: espaciado.md,
    paddingBottom: espaciado.entreCampos,
    paddingHorizontal: espaciado.margenLateral,
  },
  titulo: {
    ...tipografia.h1,
    color: colores.texto,
  },
  perfil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: espaciado.lg,
    borderRadius: 20,
    backgroundColor: colores.superficie,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colores.acentoSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: {
    ...tipografia.cuerpoDestacado,
    color: colores.acento,
  },
  datosPerfil: {
    flex: 1,
    gap: 2,
  },
  nombre: {
    ...tipografia.cuerpoDestacado,
    color: colores.texto,
  },
  correo: {
    ...tipografia.pequeno,
    color: colores.textoSecundario,
  },
  seccion: {
    gap: 10,
  },
  tituloSeccion: {
    ...tipografia.cuerpoDestacado,
    color: colores.texto,
  },
  lista: {
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: colores.superficie,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: espaciado.lg,
    paddingVertical: 14,
  },
  filaPresionada: {
    opacity: 0.7,
  },
  cajaIcono: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cajaIconoBlanca: {
    backgroundColor: colores.fondo,
  },
  cajaIconoError: {
    backgroundColor: colores.errorSuave,
  },
  textoFila: {
    flex: 1,
    ...tipografia.cuerpoDestacado,
  },
  textoDeshabilitado: {
    color: colores.placeholder,
  },
  textoError: {
    color: colores.error,
  },
  etiqueta: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colores.fondo,
  },
  textoEtiqueta: {
    ...tipografia.pestana,
    color: colores.textoSecundario,
  },
  // El divisor empieza después del icono (16 + 40 + 14 = 70 px), como en el Figma.
  divisor: {
    height: 1,
    marginLeft: 70,
    marginRight: espaciado.lg,
    backgroundColor: colores.borde,
  },
  espacio: {
    flex: 1,
  },
  version: {
    ...tipografia.pequeno,
    color: colores.placeholder,
    textAlign: 'center',
  },
});
