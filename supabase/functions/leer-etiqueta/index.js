// @ts-nocheck
// Edge Function «leer-etiqueta»: recibe la foto de una etiqueta de precio y,
// con Gemini, devuelve el nombre del producto y su precio unitario.
// Corre en los servidores de Supabase (Deno), no en el teléfono: así la clave
// GEMINI_API_KEY nunca viaja dentro de la app. Solo atiende a usuarios con sesión.
//
// Está escrito en JavaScript, igual que el resto del proyecto. En el editor de
// Supabase el archivo se llama index.ts: se pega este mismo código allí.
// La línea «@ts-nocheck» de arriba le dice a TypeScript que no revise tipos,
// porque el código no los usa (y «Deno» solo existe en los servidores de Supabase).
//
// Entrada (JSON):  { "imagenBase64": "...", "tipoMime": "image/jpeg" }
// Salida  (JSON):  { "esEtiqueta": true, "nombre": "Leche Gloria Evaporada 400 g" | null, "precio": 4.5 | null }
//                  Si la foto no es una etiqueta de precio: { "esEtiqueta": false, "nombre": null, "precio": null }

// Modelo de la familia Gemini Flash: acepta imágenes y tiene nivel gratuito.
// Para cambiar de modelo basta con cambiar esta línea.
const MODELO = 'gemini-3.5-flash-lite';
const URL_GEMINI = 'https://generativelanguage.googleapis.com/v1beta/interactions';

// Los mismos límites que valida la app y la base de datos.
const NOMBRE_MAXIMO = 60;
const PRECIO_MAXIMO = 9999.99;

// Indicaciones para Gemini. Se le pide no inventar: si no lee un dato, lo deja vacío.
const INSTRUCCIONES = `Lee la etiqueta de precio de un estante de supermercado en Perú (precios en soles).
Responde solo con el JSON pedido:
- "esEtiqueta": true si la foto muestra una etiqueta o cartel de precio de supermercado,
  aunque esté incompleta, borrosa o solo se lea el nombre o solo el precio.
  false solo si claramente no es una etiqueta: personas, animales, paisajes, recibos, menús, etc.
  Si es false, usa "" para el nombre y 0 para el precio.
- "nombre": marca, producto y presentación, en formato de título (no todo en mayúsculas).
  Ejemplo: "Leche Gloria Evaporada 400 g". Máximo ${NOMBRE_MAXIMO} caracteres.
- "precio": precio a pagar por UNA unidad, como número con punto decimal (ejemplo: 4.5).
  Si hay precio normal y precio de oferta, usa el de oferta.
Si no puedes leer un dato con seguridad, usa "" para el nombre y 0 para el precio. No inventes datos.`;

// Forma exacta de la respuesta que se le pide a Gemini (salida estructurada).
const ESQUEMA_RESPUESTA = {
  type: 'object',
  properties: {
    esEtiqueta: { type: 'boolean' },
    nombre: { type: 'string' },
    precio: { type: 'number' },
  },
  required: ['esEtiqueta', 'nombre', 'precio'],
};

// Cabeceras CORS: permiten que la función también se pueda llamar desde la web.
const CABECERAS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

function responder(cuerpo, estado = 200) {
  return new Response(JSON.stringify(cuerpo), { status: estado, headers: CABECERAS });
}

// Comprueba que quien llama es un usuario con sesión iniciada, preguntándole a Supabase Auth.
// La app (supabase.functions.invoke) envía la sesión en «Authorization» y la clave pública en «apikey».
// Hace falta porque la opción «Verify JWT» deja pasar la clave pública sola, y esa clave
// está dentro de la app: sin esta comprobación, cualquiera podría gastar la cuota de Gemini.
async function hayUsuarioConectado(peticion) {
  const autorizacion = peticion.headers.get('Authorization');
  const clavePublica = peticion.headers.get('apikey');
  if (!autorizacion || !clavePublica) {
    return false;
  }
  const respuesta = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/user`, {
    headers: { Authorization: autorizacion, apikey: clavePublica },
  });
  // 200 solo si «Authorization» trae la sesión de un usuario; con la clave pública sola, no.
  return respuesta.ok;
}

// En la respuesta de Gemini, el texto generado está en
// steps[] (type "model_output") → content[] (type "text") → text.
function extraerTexto(interaccion) {
  for (const paso of interaccion.steps ?? []) {
    if (paso.type !== 'model_output') continue;
    for (const parte of paso.content ?? []) {
      if (parte.type === 'text' && parte.text) return parte.text;
    }
  }
  return '';
}

// Convierte el texto de Gemini en { esEtiqueta, nombre, precio }, validando los límites.
// Un dato vacío, fuera de rango o ilegible se devuelve como null.
function interpretar(texto) {
  // Por si Gemini agrega texto alrededor del JSON, se toma solo lo que está entre llaves.
  const json = texto.slice(texto.indexOf('{'), texto.lastIndexOf('}') + 1);
  let datos = {};
  try {
    datos = JSON.parse(json);
  } catch {
    datos = {};
  }

  // Solo se rechaza la foto si Gemini dice claramente que no es una etiqueta (false).
  // Si no lo dice, se asume que sí, para no rechazar por error una etiqueta real.
  if (datos.esEtiqueta === false) {
    return { esEtiqueta: false, nombre: null, precio: null };
  }

  const nombre = typeof datos.nombre === 'string' ? datos.nombre.trim().slice(0, NOMBRE_MAXIMO) : '';
  const precio = Number(datos.precio);
  const precioValido = Number.isFinite(precio) && precio > 0 && precio <= PRECIO_MAXIMO;

  return {
    esEtiqueta: true,
    nombre: nombre || null,
    // Se redondea a 2 decimales, como la columna precio_unitario.
    precio: precioValido ? Math.round(precio * 100) / 100 : null,
  };
}

Deno.serve(async (peticion) => {
  // Respuesta rápida a la consulta previa (preflight) de los navegadores.
  if (peticion.method === 'OPTIONS') {
    return new Response('ok', { headers: CABECERAS });
  }

  try {
    if (!(await hayUsuarioConectado(peticion))) {
      return responder({ error: 'Debes iniciar sesión.' }, 401);
    }

    const { imagenBase64, tipoMime = 'image/jpeg' } = await peticion.json();
    if (!imagenBase64) {
      return responder({ error: 'Falta la imagen.' }, 400);
    }

    const clave = Deno.env.get('GEMINI_API_KEY');
    if (!clave) {
      return responder({ error: 'Falta configurar el secreto GEMINI_API_KEY en Supabase.' }, 500);
    }

    const respuestaGemini = await fetch(URL_GEMINI, {
      method: 'POST',
      headers: { 'x-goog-api-key': clave, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODELO,
        input: [
          { type: 'text', text: INSTRUCCIONES },
          { type: 'image', data: imagenBase64, mime_type: tipoMime },
        ],
        response_format: { type: 'text', mime_type: 'application/json', schema: ESQUEMA_RESPUESTA },
      }),
    });

    if (!respuestaGemini.ok) {
      // El detalle queda en los registros (Logs) de la función en Supabase.
      console.error('Gemini respondió', respuestaGemini.status, await respuestaGemini.text());
      // 429: se acabó la cuota del nivel gratuito (por minuto o por día).
      // Se devuelve el mismo código para que la app muestre un aviso específico.
      if (respuestaGemini.status === 429) {
        return responder({ error: 'Se alcanzó el límite de lecturas.' }, 429);
      }
      return responder({ error: 'No se pudo leer la etiqueta.' }, 502);
    }

    const interaccion = await respuestaGemini.json();
    return responder(interpretar(extraerTexto(interaccion)));
  } catch (error) {
    console.error('Error en leer-etiqueta:', error);
    return responder({ error: 'No se pudo leer la etiqueta.' }, 500);
  }
});
