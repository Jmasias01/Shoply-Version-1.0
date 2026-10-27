// Las 3 pestañas inferiores de la app: Inicio, Historial y Ajustes.
// Usa la barra personalizada BarraPestanas para que se vea como en el Figma.

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BarraPestanas from '../components/BarraPestanas';
import Inicio from '../screens/inicio/Inicio';
import Historial from '../screens/historial/Historial';
import Ajustes from '../screens/ajustes/Ajustes';

const Pestanas = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Pestanas.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BarraPestanas {...props} />}
    >
      <Pestanas.Screen name="Inicio" component={Inicio} />
      <Pestanas.Screen name="Historial" component={Historial} />
      <Pestanas.Screen name="Ajustes" component={Ajustes} />
    </Pestanas.Navigator>
  );
}
