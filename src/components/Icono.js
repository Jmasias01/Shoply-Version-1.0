// Componente único de iconos de la app.
// Envuelve Lucide con el tamaño (20 px) y el trazo (1.8) del Figma.
// Toda la app usa <Icono nombre="..." />; si algún día se cambia de librería,
// solo hay que tocar este archivo.

import {
  ArrowRight,
  Banknote,
  Camera,
  Check,
  ChevronLeft,
  CircleAlert,
  Ellipsis,
  Eye,
  EyeOff,
  History,
  House,
  Lock,
  LogOut,
  Mail,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Trash2,
  User,
  WifiOff,
  X,
  Zap,
} from 'lucide-react-native';
import { colores, medidas } from '../theme';

// Relaciona el nombre que usamos en la app con el icono de Lucide.
// Los nombres son los mismos de la hoja «Componentes» del Figma.
const ICONOS = {
  'alert-circle': CircleAlert,
  'arrow-right': ArrowRight,
  banknote: Banknote,
  camera: Camera,
  check: Check,
  'chevron-left': ChevronLeft,
  ellipsis: Ellipsis,
  eye: Eye,
  'eye-off': EyeOff,
  history: History,
  house: House,
  lock: Lock,
  'log-out': LogOut,
  mail: Mail,
  minus: Minus,
  pencil: Pencil,
  plus: Plus,
  'refresh-cw': RefreshCw,
  settings: Settings,
  'shopping-bag': ShoppingBag,
  sparkles: Sparkles,
  store: Store,
  tag: Tag,
  trash: Trash2,
  user: User,
  'wifi-off': WifiOff,
  x: X,
  zap: Zap,
};

export default function Icono({ nombre, color = colores.texto, tamano = medidas.icono }) {
  const ComponenteIcono = ICONOS[nombre];

  // Si se pide un nombre que no existe, no rompemos la pantalla: no se dibuja nada.
  if (!ComponenteIcono) {
    return null;
  }

  return <ComponenteIcono size={tamano} color={color} strokeWidth={medidas.trazoIcono} />;
}
