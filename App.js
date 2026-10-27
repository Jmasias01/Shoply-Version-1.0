// Punto de entrada de Shoply.
// Carga las fuentes Plus Jakarta Sans (con pantalla de espera mientras tanto),
// prepara las áreas seguras, la sesión (AuthProvider) y la navegación de la app.

import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
// Cada peso se importa desde su propia carpeta para que la app
// solo incluya las 4 fuentes que usa el Figma (y no las 14 del paquete).
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import AvisoSinConexion from './src/components/AvisoSinConexion';
import PantallaCarga from './src/components/PantallaCarga';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colores } from './src/theme';

// Tema de React Navigation con el fondo blanco de Shoply,
// para que no se vea un parpadeo gris al cambiar de pantalla.
const temaNavegacion = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colores.fondo, primary: colores.acento },
};

export default function App() {
  // useFonts devuelve true cuando las fuentes ya están listas para usarse.
  const [fuentesCargadas] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  if (!fuentesCargadas) {
    return <PantallaCarga />;
  }

  // AuthProvider va por fuera de la navegación para que todas las pantallas
  // (y el propio RootNavigator) puedan saber si hay sesión.
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={temaNavegacion}>
          <RootNavigator />
        </NavigationContainer>
        {/* Va después de la navegación para quedar encima de todas las pantallas. */}
        <AvisoSinConexion />
      </AuthProvider>
      {/* Barra de estado real del teléfono (texto oscuro sobre fondo blanco). */}
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
