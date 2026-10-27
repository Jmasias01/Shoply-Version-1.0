# Shoply

App móvil para llevar el control de las compras del supermercado. Mientras estás en la tienda agregas lo que metes al carrito (nombre, precio y cantidad) y ves en todo momento **qué llevas y cuánto suma**. Después puedes consultar tu historial.

- Tiendas: Plaza Vea, Tottus, Wong y «Otra tienda».
- País: Perú · Moneda: soles (`S/ 200.00`).

## Tecnologías

| Área | Herramienta |
|---|---|
| Framework | React Native con Expo (JavaScript) |
| Navegación | React Navigation (3 pestañas inferiores + pantallas apiladas) |
| Backend y base de datos | Supabase (Postgres + Auth) con Row Level Security |
| Tipografía | Plus Jakarta Sans |
| Iconos | Lucide (`lucide-react-native`) |
| Desenfoque | `expo-blur` |
| Cámara | `expo-camera` y `expo-image-manipulator` (recorta la foto al marco guía y la reduce antes de enviarla) |
| Lectura de etiquetas | Gemini Flash (`gemini-3.5-flash-lite`) dentro de una Edge Function de Supabase |
| Conexión | `@react-native-community/netinfo` (aviso de «Sin conexión») |

## Guía de instalación

Sigue los pasos en orden. Cada persona usa **su propio proyecto de Supabase y su propia clave de Gemini**; ninguna clave viene en el repositorio.

### 1. Requisitos

- [Node.js](https://nodejs.org) 20 o superior.
- La app **Expo Go** actualizada en el teléfono (Android o iOS). El proyecto usa **Expo SDK 58**.
- Una cuenta en [supabase.com](https://supabase.com) y una cuenta de Google (para la clave de Gemini). Ambas tienen plan gratuito.

### 2. Descargar el proyecto e instalar dependencias

```bash
git clone https://github.com/Jmasias01/Shoply-Version-1.0.git
```

```bash
cd Shoply-Version-1.0
```

```bash
npm install
```

### 3. Crear la base de datos en Supabase

1. Crea un proyecto nuevo en Supabase (región sugerida: São Paulo, la más cercana a Perú).
2. **Habilita pg_cron:** *Database → Extensions* → busca «pg_cron» y actívala. La necesita el borrado anual de compras.
3. **Crea las tablas:** *SQL Editor → New query* → pega todo el contenido de [`supabase/schema.sql`](supabase/schema.sql) → *Run*. El script se puede volver a ejecutar sin errores.
4. **Desactiva la confirmación de correo (recomendado para probar):** *Authentication → Sign In / Providers → Email* → desactiva «Confirm email» → *Save*. Así, al registrarte entras directo a Inicio.

### 4. Configurar las claves de la app (`.env`)

1. En Supabase, pulsa **Connect** (o *Project Settings → API Keys*) y copia:
   - la **Project URL**, con la forma `https://xxxx.supabase.co` (**sin** `/rest/v1` al final);
   - la clave **Publishable** (`sb_publishable_...`) o la **anon public** de la pestaña *Legacy*. **Nunca** uses la `secret` ni la `service_role`.
2. Copia `.env.example` como `.env` y pega los valores, sin comillas ni espacios:

| Variable | Qué es |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (publishable o anon) del proyecto |

El archivo `.env` está en `.gitignore` y **nunca se sube** al repositorio. La clave pública es segura dentro de la app porque los datos los protege Row Level Security (RLS): cada usuario solo puede leer y modificar sus propias filas.

### 5. Activar la lectura de etiquetas con IA

La foto de la etiqueta se envía a la Edge Function `leer-etiqueta` de Supabase, que le pregunta a Gemini el nombre y el precio. **La clave de Gemini nunca está en la app ni en el `.env`**: vive como secreto en Supabase.

1. **Crea la clave de Gemini:** [aistudio.google.com](https://aistudio.google.com) → *Get API key* → *Create API key*. Usa el nivel gratuito; no hace falta configurar facturación.
2. **Guárdala como secreto:** Supabase → *Edge Functions* → *Secrets* → *Add new secret* con el nombre exacto `GEMINI_API_KEY`.
3. **Despliega la función:** Supabase → *Edge Functions* → *Deploy a new function* → *Via Editor* → nombre `leer-etiqueta` → borra el código de ejemplo, pega **todo** el contenido de [`supabase/functions/leer-etiqueta/index.js`](supabase/functions/leer-etiqueta/index.js) (la primera línea debe ser `// @ts-nocheck`) → *Deploy*.

La función solo atiende a usuarios con sesión iniciada: lo comprueba ella misma con Supabase Auth, así nadie sin cuenta puede gastar tu cuota de Gemini. Si algo falla, los detalles aparecen en *Edge Functions → leer-etiqueta → Logs*.

### 6. Ejecutar la app

```bash
npx expo start -c
```

Escanea el código QR con Expo Go (Android) o con la cámara (iOS). La opción `-c` limpia la caché; úsala la primera vez y cada vez que cambies el `.env`.

### Problemas comunes

| Síntoma | Causa y solución |
|---|---|
| Pantalla roja «Faltan EXPO_PUBLIC_SUPABASE_URL…» | No existe el `.env` o le faltan valores. Revisa el paso 4 y reinicia con `npx expo start -c`. |
| «Ocurrió un problema» al crear la cuenta | La URL del `.env` termina en `/rest/v1`. Déjala como `https://xxxx.supabase.co`. |
| «Sin conexión» aunque hay internet | Supabase pausa los proyectos gratuitos tras unos 7 días sin uso. Entra al panel y pulsa *Restore project*. |
| Expo Go dice «Project is incompatible» | Tu Expo Go usa otro SDK. Actualiza Expo Go, o actualiza el proyecto con `npx expo install expo@^<SDK>.0.0 --fix`. |
| «No se pudo leer la etiqueta» | Revisa que exista el secreto `GEMINI_API_KEY` y que la función esté desplegada; mira sus *Logs*. |
| «Se alcanzó el límite de lecturas» | Se agotó la cuota gratuita de Gemini. Espera un rato o agrega el producto con «Manual». |

### Qué crea `schema.sql`

| Elemento | Para qué |
|---|---|
| `profiles` | Nombre de usuario de cada cuenta |
| `shopping_trips` | Compras (`en_curso` o `finalizado`), con un índice que impide tener dos en curso |
| `trip_items` | Productos de cada compra, con los límites de nombre, precio y cantidad |
| Políticas RLS | Cada usuario solo ve y modifica lo suyo |
| Trigger `al_crear_usuario` | Crea el perfil al registrarse, con el nombre enviado en el registro |
| Tarea `borrado-anual-compras` | Cada 1 de enero borra las compras finalizadas de años anteriores |

## Estructura de carpetas

```
Shoply-Version-1.0/
  App.js                  # punto de entrada: fuentes, AuthProvider y navegación
  app.json                # configuración de Expo
  .env.example            # nombres de las variables de entorno (sin valores)
  supabase/
    schema.sql            # tablas, RLS, restricciones, perfil automático y borrado anual
    functions/leer-etiqueta/index.js  # Edge Function que lee etiquetas con Gemini
  src/
    theme.js              # colores, tipografías, radios, espaciados y sombras
    config/supabase.js    # cliente de Supabase (sesión guardada en AsyncStorage)
    context/AuthContext.js # sesión y datos del usuario para toda la app
    navigation/           # RootNavigator, AuthStack, MainTabs
    screens/
      auth/               # IniciarSesion, CrearCuenta
      inicio/             # Inicio
      compra/             # Compra, FormularioProducto, CambiarTienda, Camara
      historial/          # Historial
      ajustes/            # Ajustes
    components/           # componentes reutilizables
    services/             # authService, comprasService, productosService, escaneoService y errores
    utils/                # formato.js, calculos.js, validaciones.js, historial.js, recorte.js
```

### Componentes reutilizables (`src/components/`)

| Componente | Uso |
|---|---|
| `Icono` | Único punto de acceso a los iconos (Lucide, 20 px, trazo 1.8) |
| `CampoTexto` | Campo con etiqueta, icono, estados predeterminado / enfocado / error / leído con IA y (ojo) para contraseñas |
| `BotonPrimario` | Botón píldora con estado deshabilitado y de carga |
| `BotonAtras` | Botón circular de 44 px para volver |
| `FilaCompra` | Tienda, fecha y monto de una compra |
| `FilaProducto` | Nombre, cantidad × precio, subtotal y botón (⋯) |
| `SelectorCantidad` | (−) cantidad (+), de 1 a 99 |
| `OpcionTienda` | Opción de selección única para elegir tienda |
| `DialogoConfirmacion` | Diálogo normal o de peligro, con resumen opcional |
| `FondoDesenfocado` | Modal transparente con fondo oscurecido y desenfocado |
| `BarraPestanas` | Barra inferior de Inicio, Historial y Ajustes |
| `LogoMarca` | Isotipo de Shoply (bolsa sobre cuadrado de acento) |
| `DisenoAuth` | Estructura común de Iniciar sesión y Crear cuenta |
| `TarjetaAcento` | Tarjeta roja con los círculos decorativos (Inicio y total de la compra) |
| `TarjetaCompraEnCurso` | Tarjeta de Inicio con la compra en curso, su total y «Continuar compra» |
| `BotonInvertido` | Botón blanco con flecha sobre la tarjeta roja |
| `BotonAccion` | Botones «Cámara» y «Manual» de la barra inferior de la compra |
| `SelectorTienda` | Pop-up para elegir tienda («¿Dónde comprarás?» y «Cambiar tienda») |
| `MenuFlotante` | Menú (⋯) que se abre junto al botón tocado |
| `ListaCompras` | Caja con filas de compras y divisores (Inicio e Historial) |
| `AvisoBreve` | Aviso corto flotante para errores breves |
| `AvisoSinConexion` | Aviso «Sin conexión» arriba de todas las pantallas mientras no hay internet |
| `EstadoVacio` | Ícono, título y subtítulo para pantallas sin datos (compra vacía, Historial vacío) |
| `MensajeError` | Error con botón «Reintentar» cuando no se pudieron cargar los datos |

## Funcionalidades

- **Cuenta:** registro, inicio de sesión con correo y contraseña, y cierre de sesión.
- **Compra:** elegir la tienda, agregar productos a mano o con la cámara, editarlos y borrarlos, ver el total al instante, cambiar de tienda, finalizar o descartar la compra.
- **Lectura de etiquetas con IA:** la cámara recorta la foto al marco guía y Gemini lee el nombre y el precio; los datos que no se pudieron leer se marcan para completarlos.
- **Inicio:** compra en curso con su total y las últimas compras del año.
- **Historial:** compras finalizadas del año agrupadas por mes, con el total de cada mes; cada compra se puede abrir y seguir editando.
- **Detalles de uso:** aviso de «Sin conexión», botón «Reintentar» cuando falla la carga y «jalar para actualizar» en Inicio e Historial.
