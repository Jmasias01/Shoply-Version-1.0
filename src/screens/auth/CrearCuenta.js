// Pantalla «Crear cuenta»: nombre de usuario, correo y contraseña.
// Se abre desde el enlace «Regístrate» de Iniciar sesión. El nombre de usuario
// viaja en los metadatos del registro y el trigger de la base lo copia a `profiles`.

import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import BotonAtras from '../../components/BotonAtras';
import CampoTexto from '../../components/CampoTexto';
import DisenoAuth from '../../components/DisenoAuth';
import { useAuth } from '../../context/AuthContext';
import { validarContrasena, validarCorreo, validarNombreUsuario } from '../../utils/validaciones';
import { colores, espaciado, tipografia } from '../../theme';

export default function CrearCuenta({ navigation }) {
  const { registrarse } = useAuth();

  const [nombreUsuario, setNombreUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  // Al escribir en un campo se borra solo el error de ese campo.
  function cambiarCampo(campo, setValor) {
    return (texto) => {
      setValor(texto);
      setErrores({ ...errores, [campo]: null });
    };
  }

  async function enviar() {
    const erroresLocales = {
      nombreUsuario: validarNombreUsuario(nombreUsuario),
      correo: validarCorreo(correo),
      contrasena: validarContrasena(contrasena),
    };
    if (erroresLocales.nombreUsuario || erroresLocales.correo || erroresLocales.contrasena) {
      setErrores(erroresLocales);
      return;
    }

    setCargando(true);
    const { datos: sesion, error } = await registrarse(nombreUsuario, correo, contrasena);
    setCargando(false);

    if (error) {
      // «Ya existe una cuenta con este correo» se entiende mejor bajo el correo;
      // el resto (sin conexión, etc.) va bajo la contraseña, junto al botón.
      const campo = error.includes('correo') ? 'correo' : 'contrasena';
      setErrores({ [campo]: error });
      return;
    }

    // Si Supabase tiene activado «Confirm email», no llega sesión hasta confirmar.
    // Si está desactivado, AuthContext recibe la sesión y la app entra directo a Inicio.
    if (!sesion) {
      Alert.alert('Revisa tu correo', 'Te enviamos un enlace para confirmar tu cuenta.');
      navigation.goBack();
    }
  }

  return (
    <DisenoAuth
      textoBoton="Crear cuenta"
      alPresionarBoton={enviar}
      cargando={cargando}
      pregunta="¿Ya tienes una cuenta?"
      textoEnlace="Inicia sesión"
      alPresionarEnlace={() => navigation.goBack()}
    >
      <View style={estilos.superior}>
        <BotonAtras alPresionar={() => navigation.goBack()} />

        <View style={estilos.textos}>
          <Text style={estilos.titulo}>Crea tu cuenta</Text>
          <Text style={estilos.subtitulo}>Regístrate para empezar a usar la aplicación</Text>
        </View>

        <View style={estilos.formulario}>
          <CampoTexto
            etiqueta="Nombre de usuario"
            placeholder="Ej. Jhon"
            icono="user"
            valor={nombreUsuario}
            alCambiar={cambiarCampo('nombreUsuario', setNombreUsuario)}
            error={errores.nombreUsuario}
            autoCapitalize="words"
            autoComplete="name"
          />
          <CampoTexto
            etiqueta="Correo electrónico"
            placeholder="tucorreo@ejemplo.com"
            icono="mail"
            valor={correo}
            alCambiar={cambiarCampo('correo', setCorreo)}
            error={errores.correo}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
          />
          <CampoTexto
            etiqueta="Contraseña"
            placeholder="Mínimo 6 caracteres"
            icono="lock"
            esContrasena
            valor={contrasena}
            alCambiar={cambiarCampo('contrasena', setContrasena)}
            error={errores.contrasena}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            onSubmitEditing={enviar}
          />
        </View>
      </View>
    </DisenoAuth>
  );
}

const estilos = StyleSheet.create({
  superior: {
    gap: 28,
  },
  textos: {
    gap: espaciado.sm,
  },
  titulo: {
    ...tipografia.h1,
    color: colores.texto,
  },
  subtitulo: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
  },
  formulario: {
    gap: espaciado.entreCampos,
  },
});
