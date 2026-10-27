// Contexto de autenticación: comparte con toda la app quién está conectado.
// App.js envuelve la navegación con <AuthProvider>; cualquier pantalla usa useAuth()
// para leer el usuario y su nombre, o para iniciar sesión, registrarse y cerrar sesión.

import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState(null);
  // true mientras se lee la sesión guardada; así no se ve un instante la pantalla de login.
  const [cargando, setCargando] = useState(true);

  // Al abrir la app: recupera la sesión guardada y empieza a escuchar sus cambios.
  useEffect(() => {
    authService.obtenerSesion().then(({ datos }) => {
      setSesion(datos);
      setCargando(false);
    });

    const dejarDeEscuchar = authService.escucharCambiosDeSesion(setSesion);
    return dejarDeEscuchar;
  }, []);

  const usuario = sesion?.user ?? null;
  const idUsuario = usuario?.id;

  // Cada vez que cambia el usuario se carga su nombre desde `profiles`.
  // Mientras llega se usa el de los metadatos del registro, para no mostrar un hueco.
  useEffect(() => {
    if (!idUsuario) {
      setNombreUsuario(null);
      return;
    }
    setNombreUsuario(usuario.user_metadata?.nombre_usuario ?? null);
    authService.obtenerNombreUsuario(idUsuario).then(({ datos }) => {
      if (datos) {
        setNombreUsuario(datos);
      }
    });
  }, [idUsuario]);

  const valor = {
    usuario,
    nombreUsuario,
    cargando,
    iniciarSesion: authService.iniciarSesion,
    registrarse: authService.registrarse,
    cerrarSesion: authService.cerrarSesion,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// Atajo para usar el contexto: const { usuario, cerrarSesion } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
