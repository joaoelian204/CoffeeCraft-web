import { supabase } from '../lib/supabase';

export interface ProductoCarrito {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioOriginal?: number;
  imagen_url: string;
  imagenUrl: string; // Alias para compatibilidad
  origen: string;
  region: string;
  categoria: string;
  nivelTostado: string;
  peso: number;
  stock: number;
  calificacion: number;
  cantidadReseñas: number;
  notasSabor?: string[];
  descuento?: number;
  disponible: boolean;
  cantidadMaxima: number;
  productosRelacionados?: ProductoCarrito[];
}

export class CarritoService {
  // Enviar producto al carrito de Angular
  static agregarAlCarrito(producto: ProductoCarrito, cantidad: number = 1): void {
    // Enviar mensaje al shell para que lo reenvíe a Angular
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'AGREGAR_AL_CARRITO',
        data: {
          producto,
          cantidad
        }
      }, 'http://localhost:9000');
    } else {
      // Fallback: mostrar alerta
      alert(`✅ ¡${producto.nombre} agregado al carrito!\n\nNota: El carrito se maneja en el módulo de Angular.`);
    }
  }

  // Obtener productos desde Supabase para mostrar en React
  static async obtenerProductos(): Promise<ProductoCarrito[]> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('calificacion', { ascending: false });

      if (error) {
        console.error('Error obteniendo productos:', error);
        return [];
      }

      // Transformar los datos para que coincidan con la interfaz
      return (data || []).map(producto => ({
        ...producto,
        imagenUrl: producto.imagen_url,
        region: producto.region || producto.origen,
        categoria: producto.categoria || 'Café',
        nivelTostado: producto.nivel_tostado || 'Medio',
        peso: producto.peso || 250,
        stock: producto.stock || 0,
        calificacion: producto.calificacion || 4.5,
        cantidadReseñas: producto.cantidad_resenas || 0,
        notasSabor: Array.isArray(producto.notas_sabor) ? producto.notas_sabor : [],
        descuento: producto.descuento || 0,
        disponible: (producto.stock || 0) > 0,
        cantidadMaxima: Math.min(producto.stock || 0, 10),
        productosRelacionados: []
      }));
    } catch (error) {
      console.error('Error en obtenerProductos:', error);
      return [];
    }
  }

  // Obtener un producto específico
  static async obtenerProductoPorId(id: string): Promise<ProductoCarrito | null> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .eq('activo', true)
        .single();

      if (error) {
        console.error('Error obteniendo producto:', error);
        return null;
      }

      if (!data) return null;

      // Transformar los datos para que coincidan con la interfaz
      return {
        ...data,
        imagenUrl: data.imagen_url,
        region: data.region || data.origen,
        categoria: data.categoria || 'Café',
        nivelTostado: data.nivel_tostado || 'Medio',
        peso: data.peso || 250,
        stock: data.stock || 0,
        calificacion: data.calificacion || 4.5,
        cantidadReseñas: data.cantidad_resenas || 0,
        notasSabor: Array.isArray(data.notas_sabor) ? data.notas_sabor : [],
        descuento: data.descuento || 0,
        disponible: (data.stock || 0) > 0,
        cantidadMaxima: Math.min(data.stock || 0, 10),
        productosRelacionados: []
      };
    } catch (error) {
      console.error('Error en obtenerProductoPorId:', error);
      return null;
    }
  }
} 