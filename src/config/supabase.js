// Cliente único de Supabase para toda la app.
// Guarda la sesión en AsyncStorage para que el usuario siga conectado al cerrar la app.
// Lo usan los archivos de src/services/ (las pantallas nunca llaman a Supabase directamente).

import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';

// Los valores salen del archivo .env (ver .env.example). Nunca se escriben en el código.
const urlSupabase = process.env.EXPO_PUBLIC_SUPABASE_URL;
const clavePublica = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Si falta el .env, avisamos con un mensaje claro en lugar de un error confuso de Supabase.
if (!urlSupabase || !clavePublica) {
  throw new Error(
    'Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copia .env.example como .env, completa los valores y reinicia con «npx expo start -c».'
  );
}

export const supabase = createClient(urlSupabase, clavePublica, {
  auth: {
    storage: AsyncStorage, // dónde se guarda la sesión en el teléfono
    autoRefreshToken: true, // renueva el token antes de que venza
    persistSession: true, // conserva la sesión entre aperturas de la app
    detectSessionInUrl: false, // solo aplica a la web; en el móvil no hay URL de retorno
    lock: processLock, // evita que dos renovaciones del token choquen entre sí
  },
});

// El token solo se renueva mientras la app está en primer plano:
// en segundo plano no tiene sentido gastar batería ni datos.
AppState.addEventListener('change', (estado) => {
  if (estado === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
