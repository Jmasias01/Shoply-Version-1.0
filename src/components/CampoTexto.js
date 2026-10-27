// Campo de texto del Figma: etiqueta, caja con icono opcional y mensaje de error.
// Estados: predeterminado, enfocado (borde de acento), error (borde rojo) e «IA»
// (fondo de acento suave y (✦) al final, cuando el dato lo leyó la cámara).
// Se usa en Iniciar sesión, Crear cuenta y el formulario de producto.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Icono from './Icono';
import { colores, espaciado, medidas, radios, tipografia } from '../theme';

export default function CampoTexto({
  etiqueta,
  valor,
  alCambiar,
  placeholder,
  icono, // nombre de un icono de <Icono />, opcional
  error, // texto del error, que se muestra debajo; si viene vacío no hay mensaje
  estado = 'normal', // 'normal' | 'error' (solo el borde rojo, sin mensaje) | 'ia' (leído con IA)
  esContrasena = false, // muestra el botón (ojo) para ver u ocultar la contraseña
  ...propsInput // el resto (keyboardType, maxLength, autoCapitalize...) va directo al TextInput
}) {
  const [enfocado, setEnfocado] = useState(false);
  const [contrasenaVisible, setContrasenaVisible] = useState(false);

  const hayError = Boolean(error) || estado === 'error';
  const leidoConIa = estado === 'ia' && !hayError;

  // El error tiene prioridad sobre el foco: así el usuario ve qué debe corregir.
  const estiloCaja = [
    estilos.caja,
    enfocado && estilos.cajaEnfocada,
    leidoConIa && estilos.cajaIa,
    hayError && estilos.cajaError,
  ];
  // En el Figma el icono se pinta de acento cuando el campo está enfocado o lo leyó la IA.
  const colorIcono = (enfocado || leidoConIa) && !hayError ? colores.acento : colores.placeholder;

  return (
    <View style={estilos.contenedor}>
      {etiqueta ? <Text style={estilos.etiqueta}>{etiqueta}</Text> : null}

      <View style={estiloCaja}>
        {icono ? <Icono nombre={icono} color={colorIcono} /> : null}

        <TextInput
          style={estilos.input}
          value={valor}
          onChangeText={alCambiar}
          placeholder={placeholder}
          placeholderTextColor={colores.placeholder}
          secureTextEntry={esContrasena && !contrasenaVisible}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          {...propsInput}
        />

        {esContrasena ? (
          <Pressable
            onPress={() => setContrasenaVisible(!contrasenaVisible)}
            hitSlop={10}
            accessibilityLabel={contrasenaVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Icono nombre={contrasenaVisible ? 'eye' : 'eye-off'} color={colores.placeholder} />
          </Pressable>
        ) : null}

        {leidoConIa ? <Icono nombre="sparkles" color={colores.acento} /> : null}
      </View>

      {error ? (
        <View style={estilos.filaError}>
          <Icono nombre="alert-circle" color={colores.error} tamano={16} />
          <Text style={estilos.textoError}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: espaciado.sm,
  },
  etiqueta: {
    ...tipografia.etiqueta,
    color: colores.texto,
  },
  caja: {
    height: medidas.alturaCampo,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    paddingHorizontal: espaciado.lg,
    borderRadius: radios.campo,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  cajaEnfocada: {
    borderWidth: 1.5,
    borderColor: colores.acento,
    backgroundColor: colores.fondo,
  },
  cajaIa: {
    borderColor: colores.acentoDeshabilitado,
    backgroundColor: colores.acentoSuave,
  },
  cajaError: {
    borderWidth: 1.5,
    borderColor: colores.error,
    backgroundColor: colores.superficie,
  },
  input: {
    flex: 1,
    ...tipografia.cuerpo,
    color: colores.texto,
    // Android agrega un relleno interno por defecto que descentra el texto.
    paddingVertical: 0,
  },
  filaError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textoError: {
    ...tipografia.pequeno,
    color: colores.error,
  },
});
