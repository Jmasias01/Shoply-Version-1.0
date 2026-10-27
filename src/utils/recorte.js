// Calcula qué parte de la foto corresponde al marco guía que el usuario ve en la cámara.
// La usa la pantalla Cámara para enviar a la IA solo la etiqueta encuadrada,
// y no las etiquetas vecinas que también salen en la foto.

/**
 * La vista previa de la cámara llena la pantalla «recortando» la imagen (como `cover`):
 * la foto se agranda hasta cubrir toda la vista y lo que sobra a los lados queda oculto.
 * Esta función hace el camino inverso: convierte el marco (en puntos de pantalla)
 * a un rectángulo en píxeles de la foto.
 *
 * - marco:  { x, y, ancho, alto }  posición del marco guía dentro de la vista (puntos)
 * - vista:  { ancho, alto }        tamaño de la vista de la cámara (puntos)
 * - foto:   { ancho, alto }        tamaño de la foto tomada (píxeles)
 * - margen: fracción extra alrededor del marco (0.1 = 10 % por lado), por si el
 *           usuario no encuadró perfecto.
 *
 * Devuelve { originX, originY, width, height } en píxeles, listo para
 * ImageManipulator.crop(), siempre dentro de los bordes de la foto.
 *
 * Ejemplo: foto de 3000 × 4000 px en una vista de 390 × 844 puntos.
 *   La foto se agranda × 0.211 (844 / 4000) para cubrir el alto; mide 633 puntos de ancho
 *   y se ocultan 121.5 puntos a cada lado. Un marco de 300 × 164 en (45, 354)
 *   corresponde a unos 1422 × 777 px de la foto, empezando en (789, 1678).
 */
export function calcularRecorte({ marco, vista, foto, margen = 0 }) {
  // Escala de la vista previa: cuántos puntos de pantalla ocupa cada píxel de la foto.
  // Se usa la mayor de las dos para que la foto cubra la vista entera (como `cover`).
  const escala = Math.max(vista.ancho / foto.ancho, vista.alto / foto.alto);

  // Parte de la foto agrandada que queda fuera de la pantalla, a cada lado.
  const ocultoX = (foto.ancho * escala - vista.ancho) / 2;
  const ocultoY = (foto.alto * escala - vista.alto) / 2;

  // Marco con el margen extra (en puntos de pantalla).
  const extraX = marco.ancho * margen;
  const extraY = marco.alto * margen;
  const izquierda = marco.x - extraX;
  const arriba = marco.y - extraY;
  const ancho = marco.ancho + extraX * 2;
  const alto = marco.alto + extraY * 2;

  // De puntos de pantalla a píxeles de la foto: se suma lo oculto y se divide entre la escala.
  // Se calculan los cuatro bordes del recorte para poder ajustarlos a la foto uno por uno.
  const bordeIzquierdo = (izquierda + ocultoX) / escala;
  const bordeSuperior = (arriba + ocultoY) / escala;
  const bordeDerecho = bordeIzquierdo + ancho / escala;
  const bordeInferior = bordeSuperior + alto / escala;

  // El recorte nunca puede salirse de la foto: cada borde se limita a sus límites.
  const x1 = Math.max(0, bordeIzquierdo);
  const y1 = Math.max(0, bordeSuperior);
  const x2 = Math.min(foto.ancho, bordeDerecho);
  const y2 = Math.min(foto.alto, bordeInferior);

  // ImageManipulator trabaja con píxeles enteros.
  return {
    originX: Math.round(x1),
    originY: Math.round(y1),
    width: Math.round(x2 - x1),
    height: Math.round(y2 - y1),
  };
}
