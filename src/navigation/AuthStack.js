// Pila de autenticación: Iniciar sesión y Crear cuenta.
// RootNavigator la muestra cuando no hay sesión iniciada.

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IniciarSesion from '../screens/auth/IniciarSesion';
import CrearCuenta from '../screens/auth/CrearCuenta';

const Pila = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Pila.Navigator screenOptions={{ headerShown: false }}>
      <Pila.Screen name="IniciarSesion" component={IniciarSesion} />
      <Pila.Screen name="CrearCuenta" component={CrearCuenta} />
    </Pila.Navigator>
  );
}
