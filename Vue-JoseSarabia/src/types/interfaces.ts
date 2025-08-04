export interface Historial {
  id: string;
  usuarioId: string;
  usuarioNombre?: string; // Opcional para cuando obtenemos datos del join
  usuarioEmail?: string;  // Opcional para cuando obtenemos datos del join
  fecha: string;
  subtotal: number;
  iva: number;
  total: number;
  numeroPedido?: string;
  estado?: string;
  items: HistorialItem[];
}

export interface HistorialItem {
  cafeId: string;
  nombre: string;
  cantidad: number;
  subtotal: number;
}
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'cliente' | 'admin';
  activo: boolean;
  fechaRegistro: string;
}

export interface CrearUsuarioForm {
  nombre: string;
  email: string;
  rol: 'cliente' | 'admin';
}

export interface Cafe {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  origen: string;
  tipoTueste: string;
  disponible: boolean;
  imagenUrl?: string;
}

export interface Compra {
  id: string;
  usuarioId: string;
  fecha: string;
  total: number;
  items: CompraItem[];
}

export interface CompraItem {
  cafeId: string;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}
