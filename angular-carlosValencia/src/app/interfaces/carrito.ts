import { IDireccion, IMetodoPago } from './subscripcion';

export interface IProducto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  origen: string;
  oferta?: boolean;
  calificacion?: number;
  notas_sabor?: string; // En SQL es TEXT, en React se transforma a array si es necesario
  proceso?: string;
  altitud?: number;
  creado_en?: string;
  actualizado_en?: string;
  stock?: number;
  activo?: boolean;
}

export interface IitemCarrito {
  id: string;
  carrito_id: string;
  producto_id: string;
  producto?: IProducto;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  creado_en: string;
  actualizado_en?: string;
  notas?: string;
}

export interface Carrito {
  id: string;
  usuario_id: string;
  items: IitemCarrito[];
  subtotal: number;
  impuesto: number;
  envio: number;
  descuento: number;
  total: number;
  codigo_cupon?: string;
  creado_en: string;
  actualizado_en: string;
}

export interface IPedido {
  id_pedido: string;
  id_usuario: string;
  estado: 'pendiente' | 'confirmado' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
  total: number;
  creado_en: string;
  detalles: IDetallePedido[];
  direccion_envio: IDireccion;
  direccion_facturacion: IDireccion;
  metodo_pago: IMetodoPago;
}

export interface IDetallePedido {
  id_detalle: string;
  id_pedido: string;
  id_producto: string;
  cantidad: number;
  total: number;
}

export interface ICupon {
  id: string;
  codigo: string;
  tipo: 'porcentaje' | 'fijo';
  valor: number;
  minimo_pedido: number;
  maximo_descuento?: number;
  fecha_expiracion: string;
  limite_uso: number;
  usados: number;
  activo: boolean;
}

export interface IResultadoPago {
  exito: boolean;
  id_transaccion?: string;
  error?: string;
  metodo_pago: IMetodoPago;
  monto: number;
  moneda: string;
}
