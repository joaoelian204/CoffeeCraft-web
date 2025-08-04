export interface IPlanSuscripcion {
  id: string;
  nombre: string;
  descripcion: string;
  precio_mensual: number;
  cantidad_cafe: number;
  frecuencia_entrega: string;
  beneficios: string[];
  activo: boolean;
  popular?: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface ISuscripcionUsuario {
  id: string;
  usuario_id: string;
  plan_id: string;
  plan?: IPlanSuscripcion;
  estado: 'activa' | 'pausada' | 'cancelada' | 'expirada';
  personalizaciones?: {
    nivel_tostado?: string;
    tipo_molido?: string;
    cantidad?: string;
    preferencias?: string[];
  };
  direccion_entrega?: IDireccion;
  metodo_pago?: IMetodoPago;
  fecha_inicio: string;
  fecha_proxima_entrega: string;
  fecha_fin?: string;
  creado_en: string;
  actualizado_en: string;
}

export interface IDireccion {
  calle: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  pais: string;
  predeterminada?: boolean;
}

export interface IMetodoPago {
  tipo: 'tarjeta_credito' | 'tarjeta_debito' | 'paypal' | 'transferencia_bancaria';
  numero_tarjeta?: string;
  fecha_expiracion?: string;
  nombre_titular?: string;
  predeterminado?: boolean;
}