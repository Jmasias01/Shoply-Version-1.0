// Barra inferior de 3 pestañas (Inicio, Historial, Ajustes) tal como está en el Figma.
// La usa MainTabs como `tabBar` personalizada de React Navigation.
// La pestaña activa lleva el icono sobre una píldora de acento suave y el texto en acento.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icono from './Icono';
import { colores, espaciado, tipografia } from '../theme';

// Icono de cada pestaña según el nombre de su ruta en MainTabs.
const ICONO_POR_RUTA = {
  Inicio: 'house',
  Historial: 'history',
  Ajustes: 'settings',
};

export default function BarraPestanas({ state, descriptors, navigation }) {
  // Respeta el área segura inferior (la barra de gestos del teléfono).
  const margenes = useSafeAreaInsets();

  return (
    <View style={[estilos.barra, { paddingBottom: Math.max(margenes.bottom, 6) }]}>
      {state.routes.map((ruta, indice) => {
        const activa = state.index === indice;
        const titulo = descriptors[ruta.key].options.title ?? ruta.name;
        const color = activa ? colores.acento : colores.placeholder;

        function alPresionar() {
          // Así lo recomienda React Navigation: se emite el evento y, si nadie
          // lo cancela y la pestaña no está activa, se navega.
          const evento = navigation.emit({ type: 'tabPress', target: ruta.key, canPreventDefault: true });
          if (!activa && !evento.defaultPrevented) {
            navigation.navigate(ruta.name);
          }
        }

        return (
          <Pressable
            key={ruta.key}
            onPress={alPresionar}
            accessibilityRole="tab"
            accessibilityState={{ selected: activa }}
            style={estilos.pestana}
          >
            <View style={[estilos.pildora, activa && estilos.pildoraActiva]}>
              <Icono nombre={ICONO_POR_RUTA[ruta.name]} color={color} />
            </View>
            <Text style={[estilos.texto, { color }]}>{titulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: espaciado.md,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    backgroundColor: colores.fondo,
  },
  pestana: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  pildora: {
    width: 56,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pildoraActiva: {
    backgroundColor: colores.acentoSuave,
  },
  texto: {
    ...tipografia.pestana,
  },
});
