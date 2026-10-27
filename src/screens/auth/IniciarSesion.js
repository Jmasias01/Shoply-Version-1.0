// Pantalla «Iniciar sesión»: correo y contraseña.
// Es la primera pantalla cuando no hay sesión. Valida los campos antes de llamar a Supabase
// y muestra los errores bajo cada campo (estado «Iniciar sesión – error» del Figma).

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CampoTexto from '../../components/CampoTexto';
import DisenoAuth from '../../components/DisenoAuth';
import LogoMarca from '../../components/LogoMarca';
import { useAuth } from '../../context/AuthContext';
import { validarCorreo } from '../../utils/validaciones';
import { colores, espaciado, tipografia } from '../../theme';

export default function IniciarSesion({ navigation }) {
  const { iniciarSesion } = useAuth();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  // Al escribir en un campo se borra su error: el usuario ya lo está corrigiendo.
  function cambiarCorreo(texto) {
    setCorreo(texto);
    setErrores({ ...errores, correo: null });
  }

  function cambiarContrasena(texto) {
    setContrasena(texto);
    setErrores({ ...errores, contrasena: null });
  }

  async function enviar() {
    // 1. Validaciones simples en la app, para no llamar a Supabase con datos incompletos.
    const erroresLocales = {
      correo: validarCorreo(correo),
      // Al iniciar sesión solo se exige que no esté vacía; el mínimo de 6 se pide al registrarse.
      contrasena: contrasena ? null : 'Este campo es obligatorio',
    };
    if (erroresLocales.correo || erroresLocales.contrasena) {
      setErrores(erroresLocales);
      return;
    }

    // 2. Llamada a Supabase. Si sale bien, AuthContext detecta la sesión
    //    y la navegación cambia sola a las pestañas.
    setCargando(true);
    const { error } = await iniciarSesion(correo, contrasena);
    setCargando(false);

    // El error de Supabase («Correo o contraseña incorrectos», sin conexión...) va bajo la contraseña.
    if (error) {
      setErrores({ correo: null, contrasena: error });
    }
  }

  return (
    <DisenoAuth
      textoBoton="Iniciar sesión"
      alPresionarBoton={enviar}
      cargando={cargando}
      pregunta="¿No tienes una cuenta?"
      textoEnlace="Regístrate"
      alPresionarEnlace={() => navigation.navigate('CrearCuenta')}
    >
      <View style={estilos.superior}>
        <View style={estilos.encabezado}>
          <LogoMarca />
          <View style={estilos.textos}>
            <Text style={estilos.titulo}>Bienvenido de nuevo</Text>
            <Text style={estilos.subtitulo}>Inicia sesión para acceder a la aplicación</Text>
          </View>
        </View>

        <View style={estilos.formulario}>
          <CampoTexto
            etiqueta="Correo electrónico"
            placeholder="tucorreo@ejemplo.com"
            icono="mail"
            valor={correo}
            alCambiar={cambiarCorreo}
            error={errores.correo}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
          />
          <CampoTexto
            etiqueta="Contraseña"
            placeholder="Ingresa tu contraseña"
            icono="lock"
            esContrasena
            valor={contrasena}
            alCambiar={cambiarContrasena}
            error={errores.contrasena}
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            onSubmitEditing={enviar}
          />
        </View>
      </View>
    </DisenoAuth>
  );
}

const estilos = StyleSheet.create({
  superior: {
    gap: 36,
  },
  encabezado: {
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
