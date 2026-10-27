// Navegador raíz: decide qué ve el usuario según tenga sesión o no.
// Sin sesión → pila de autenticación. Con sesión → pestañas y pantallas de compra.
// Las pantallas de compra van aquí (fuera de las pestañas) para que tapen la barra inferior.

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PantallaCarga from '../components/PantallaCarga';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import Compra from '../screens/compra/Compra';
import FormularioProducto from '../screens/compra/FormularioProducto';
import CambiarTienda from '../screens/compra/CambiarTienda';
import Camara from '../screens/compra/Camara';

const Pila = createNativeStackNavigator();

// El formulario y «Cambiar tienda» son pop-ups sobre la compra: se abren como
// pantallas transparentes, con un fundido suave, para que se vea la compra detrás
// (desenfocada). El fondo y el desenfoque los dibuja FondoDesenfocado.
const opcionesPopUp = {
  presentation: 'transparentModal',
  animation: 'fade',
  contentStyle: { backgroundColor: 'transparent' },
};

// La cámara ocupa toda la pantalla y sube desde abajo.
const opcionesCamara = {
  presentation: 'fullScreenModal',
  animation: 'slide_from_bottom',
};

export default function RootNavigator() {
  const { usuario, cargando } = useAuth();

  // Mientras se lee la sesión guardada no se muestra nada, para no ver un instante el login.
  if (cargando) {
    return <PantallaCarga />;
  }

  // Al iniciar o cerrar sesión cambia `usuario` y React Navigation muestra
  // el otro grupo de pantallas solo; no hace falta navegar a mano.
  return (
    <Pila.Navigator screenOptions={{ headerShown: false }}>
      {usuario ? (
        <>
          <Pila.Screen name="Principal" component={MainTabs} />
          {/* Compra recibe el `id`; sirve para la compra en curso y para el detalle finalizado. */}
          <Pila.Screen name="Compra" component={Compra} />
          <Pila.Screen name="FormularioProducto" component={FormularioProducto} options={opcionesPopUp} />
          <Pila.Screen name="CambiarTienda" component={CambiarTienda} options={opcionesPopUp} />
          <Pila.Screen name="Camara" component={Camara} options={opcionesCamara} />
        </>
      ) : (
        <Pila.Screen name="Autenticacion" component={AuthStack} />
      )}
    </Pila.Navigator>
  );
}
