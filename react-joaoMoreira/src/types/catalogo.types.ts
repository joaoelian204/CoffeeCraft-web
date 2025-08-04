// Tipos básicos usando const assertions (compatible con erasableSyntaxOnly)
export const NivelTostado = {
  LIGERO: 'ligero',
  MEDIO: 'medio',
  OSCURO: 'oscuro'
} as const;

export type NivelTostado = typeof NivelTostado[keyof typeof NivelTostado];

export const CategoriaCafe = {
  ORIGEN_UNICO: 'origen-unico',
  MEZCLA: 'mezcla',
  ESPECIAL: 'especial',
  ORGANICO: 'organico',
  ARABICA: 'arabica',
  ROBUSTA: 'robusta',
  COMERCIAL: 'comercial'
} as const;

export type CategoriaCafe = typeof CategoriaCafe[keyof typeof CategoriaCafe];

// Para promociones/ofertas
export interface Promocion {
    id: string;
    titulo: string;
    descripcion: string;
    descuento: number;
    productosAplicables: string[];
    fechaInicio: Date;
    fechaFin: Date;
    codigoPromo?: string;
    activo: boolean;
  }

// Producto principal
export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioOriginal?: number;
  descuento?: number;
  origen: string;
  region: string;
  nivelTostado: NivelTostado;
  notasSabor: string | string[];
  imagenUrl: string;
  categoria: CategoriaCafe;
  stock: number;
  peso: number; // gramos
  calificacion: number;
  cantidadReseñas: number;
  activo: boolean;
}

// Para la lista/catálogo
export interface FiltrosCatalogo {
  categoria?: CategoriaCafe;
  nivelTostado?: NivelTostado;
  precioMin?: number;
  precioMax?: number;
  rangoPrecio?: {
    min?: number;
    max?: number;
  };
  origen?: string;
  region?: string;
  busqueda?: string;
  soloDisponibles?: boolean;
  soloOfertas?: boolean;
}

// Para vista detallada
export interface DetalleProducto {
  producto: Producto;
  productosRelacionados: Producto[];
  disponible: boolean;
  cantidadMaxima: number;
}

// Categoría para organización
export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  cantidadProductos: number;
  activo: boolean;
}

// Usuario básico
export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fechaRegistro: Date;
}

// Reseña de producto
export interface Reseña {
  id: string;
  idUsuario: string;
  idProducto: string;
  calificacion: number;
  comentario: string;
  fecha: Date;
  nombreUsuario: string;
}

// Para cancelación de pedidos
export interface CancelacionPedido {
  id: string;
  idPedido: string;
  idUsuario: string;
  motivo: MotivoCancelacionPedido;
  descripcionMotivo?: string;
  productos: ProductoCancelado[];
  montoReembolso: number;
  estadoReembolso: EstadoReembolso;
  fechaCancelacion: Date;
  fechaReembolso?: Date;
  observacionesAdmin?: string;
  aprobadoPor?: string;
}

export interface ProductoCancelado {
  idProducto: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  reembolsable: boolean;
}

export const MotivoCancelacionPedido = {
  CAMBIO_OPINION: 'cambio-opinion',
  PRODUCTO_DEFECTUOSO: 'producto-defectuoso',
  ENTREGA_TARDIA: 'entrega-tardia',
  ERROR_PEDIDO: 'error-pedido',
  PRECIO_ENCONTRADO_MEJOR: 'precio-mejor',
  PROBLEMA_PAGO: 'problema-pago',
  OTROS: 'otros'
} as const;

export type MotivoCancelacionPedido = typeof MotivoCancelacionPedido[keyof typeof MotivoCancelacionPedido];

export const EstadoReembolso = {
  PENDIENTE: 'pendiente',
  PROCESANDO: 'procesando',
  COMPLETADO: 'completado',
  RECHAZADO: 'rechazado',
  CANCELADO: 'cancelado'
} as const;

export type EstadoReembolso = typeof EstadoReembolso[keyof typeof EstadoReembolso];
