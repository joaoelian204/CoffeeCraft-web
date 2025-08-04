import { supabase } from '../lib/supabase';
import type { DetalleProducto, FiltrosCatalogo, Producto } from '../types';

// Datos mock temporales para desarrollo
const PRODUCTOS_MOCK: Producto[] = [
  {
    id: '1',
    nombre: 'Café Andino Premium',
    descripcion: 'Café de altura cultivado en los Andes ecuatorianos, con notas de chocolate negro y frutos rojos.',
    precio: 25.99,
    precioOriginal: 32.99,
    descuento: 21,
    origen: 'Ecuador',
    region: 'Andes',
    nivelTostado: 'medio',
    notasSabor: ['chocolate negro', 'frutos rojos', 'nuez', 'caramelo'],
    imagenUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
    categoria: 'especial',
    stock: 50,
    peso: 250,
    calificacion: 4.8,
    cantidadReseñas: 127,
    activo: true
  },
  {
    id: '2',
    nombre: 'Café Amazónico Especial',
    descripcion: 'Café orgánico de la región amazónica con un perfil de sabor único y notas tropicales.',
    precio: 28.50,
    origen: 'Ecuador',
    region: 'Amazonía',
    nivelTostado: 'ligero',
    notasSabor: ['cítricos', 'flores', 'miel', 'especias'],
    imagenUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
    categoria: 'especial',
    stock: 30,
    peso: 250,
    calificacion: 4.6,
    cantidadReseñas: 89,
    activo: true
  },
  {
    id: '3',
    nombre: 'Café Costero Tradicional',
    descripcion: 'Café de la costa ecuatoriana con un tostado medio-oscuro y cuerpo robusto.',
    precio: 22.99,
    precioOriginal: 29.99,
    descuento: 23,
    origen: 'Ecuador',
    region: 'Costa',
    nivelTostado: 'oscuro',
    notasSabor: ['chocolate', 'nuez', 'caramelo', 'especias'],
    imagenUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    categoria: 'comercial',
    stock: 75,
    peso: 250,
    calificacion: 4.4,
    cantidadReseñas: 156,
    activo: true
  },
  {
    id: '4',
    nombre: 'Café Galápagos Exclusivo',
    descripcion: 'Café de edición limitada cultivado en las Islas Galápagos con un perfil de sabor excepcional.',
    precio: 45.99,
    origen: 'Ecuador',
    region: 'Galápagos',
    nivelTostado: 'medio',
    notasSabor: ['tropical', 'flores blancas', 'miel silvestre', 'especias'],
    imagenUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
    categoria: 'origen-unico',
    stock: 15,
    peso: 250,
    calificacion: 4.9,
    cantidadReseñas: 43,
    activo: true
  },
  {
    id: '5',
    nombre: 'Café Sierra Orgánico',
    descripcion: 'Café orgánico de la sierra ecuatoriana con un tostado ligero que preserva sus notas naturales.',
    precio: 26.50,
    origen: 'Ecuador',
    region: 'Sierra',
    nivelTostado: 'ligero',
    notasSabor: ['manzana', 'pera', 'miel', 'flores'],
    imagenUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    categoria: 'organico',
    stock: 40,
    peso: 250,
    calificacion: 4.7,
    cantidadReseñas: 98,
    activo: true
  },
  {
    id: '6',
    nombre: 'Café Valle Interandino',
    descripcion: 'Café cultivado en los valles interandinos con un balance perfecto entre acidez y dulzura.',
    precio: 24.99,
    precioOriginal: 31.99,
    descuento: 22,
    origen: 'Ecuador',
    region: 'Valle Interandino',
    nivelTostado: 'medio',
    notasSabor: ['chocolate', 'frutos rojos', 'nuez', 'caramelo'],
    imagenUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
    categoria: 'especial',
    stock: 60,
    peso: 250,
    calificacion: 4.5,
    cantidadReseñas: 112,
    activo: true
  }
];

// Interfaz para crear/actualizar productos
export interface ProductoInput {
  nombre: string;
  descripcion: string;
  precio: number;
  precioOriginal?: number;
  descuento?: number;
  origen: string;
  region: string;
  nivelTostado: 'ligero' | 'medio' | 'oscuro';
  notasSabor: string[];
  imagenUrl?: string;
  categoria: string;
  stock: number;
  peso: number;
  activo?: boolean;
}

export class CatalogoService {
  
  // Helper para mapear producto de Supabase a interfaz TypeScript
  private static mapearProducto(productoSupabase: any): Producto {
    return {
      id: productoSupabase.id,
      nombre: productoSupabase.nombre,
      descripcion: productoSupabase.descripcion,
      precio: productoSupabase.precio,
      precioOriginal: productoSupabase.precio_original,
      descuento: productoSupabase.descuento,
      origen: productoSupabase.origen,
      region: productoSupabase.region,
      nivelTostado: productoSupabase.nivel_tostado,
      notasSabor: productoSupabase.notas_sabor || [],
      imagenUrl: productoSupabase.imagen_url,
      categoria: productoSupabase.categoria,
      stock: productoSupabase.stock,
      peso: productoSupabase.peso,
      calificacion: productoSupabase.calificacion,
      cantidadReseñas: productoSupabase.cantidad_resenas,
      activo: productoSupabase.activo
    };
  }
  
  // ==========================================
  // OPERACIONES CRUD
  // ==========================================
  
  // CREATE - Crear nuevo producto
  static async crearProducto(productoData: ProductoInput): Promise<Producto> {
    // Calcular descuento automáticamente si hay precio original
    const descuento = productoData.precioOriginal && productoData.precioOriginal > productoData.precio
      ? Math.round(((productoData.precioOriginal - productoData.precio) / productoData.precioOriginal) * 100)
      : 0;

    const { data, error } = await supabase
      .from('productos')
      .insert({
        nombre: productoData.nombre,
        descripcion: productoData.descripcion,
        precio: productoData.precio,
        precio_original: productoData.precioOriginal || null,
        descuento: descuento,
        origen: productoData.origen,
        region: productoData.region,
        nivel_tostado: productoData.nivelTostado,
        notas_sabor: productoData.notasSabor,
        imagen_url: productoData.imagenUrl || null,
        categoria: productoData.categoria,
        stock: productoData.stock,
        peso: productoData.peso,
        calificacion: 0.0,
        cantidad_resenas: 0,
        activo: productoData.activo ?? true
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error al crear producto: ${error.message}`);
    }
    
    return this.mapearProducto(data);
  }
  
  // UPDATE - Actualizar producto existente
  static async actualizarProducto(id: string, productoData: Partial<ProductoInput>): Promise<Producto> {
    // Preparar datos para actualización
    const updateData: any = {};
    
    if (productoData.nombre !== undefined) updateData.nombre = productoData.nombre;
    if (productoData.descripcion !== undefined) updateData.descripcion = productoData.descripcion;
    if (productoData.precio !== undefined) updateData.precio = productoData.precio;
    if (productoData.precioOriginal !== undefined) updateData.precio_original = productoData.precioOriginal;
    if (productoData.origen !== undefined) updateData.origen = productoData.origen;
    if (productoData.region !== undefined) updateData.region = productoData.region;
    if (productoData.nivelTostado !== undefined) updateData.nivel_tostado = productoData.nivelTostado;
    if (productoData.notasSabor !== undefined) updateData.notas_sabor = productoData.notasSabor;
    if (productoData.imagenUrl !== undefined) updateData.imagen_url = productoData.imagenUrl;
    if (productoData.categoria !== undefined) updateData.categoria = productoData.categoria;
    if (productoData.stock !== undefined) updateData.stock = productoData.stock;
    if (productoData.peso !== undefined) updateData.peso = productoData.peso;
    if (productoData.activo !== undefined) updateData.activo = productoData.activo;
    
    // Recalcular descuento si se actualizan los precios
    if (productoData.precio !== undefined || productoData.precioOriginal !== undefined) {
      const precioOriginal = productoData.precioOriginal ?? updateData.precio_original;
      const precio = productoData.precio ?? updateData.precio;
      
      if (precioOriginal && precioOriginal > precio) {
        updateData.descuento = Math.round(((precioOriginal - precio) / precioOriginal) * 100);
      } else {
        updateData.descuento = 0;
      }
    }
    
    const { data, error } = await supabase
      .from('productos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }
    
    if (!data) {
      throw new Error(`Producto no encontrado con ID: ${id}`);
    }
    
    return this.mapearProducto(data);
  }
  
  // DELETE - Eliminar producto (soft delete)
  static async eliminarProducto(id: string): Promise<void> {
    const { error } = await supabase
      .from('productos')
      .update({ activo: false })
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }
  
  // DELETE - Eliminar producto permanentemente (hard delete)
  static async eliminarProductoPermanente(id: string): Promise<void> {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error al eliminar producto permanentemente: ${error.message}`);
    }
  }
  
  // RESTORE - Restaurar producto eliminado
  static async restaurarProducto(id: string): Promise<Producto> {
    const { data, error } = await supabase
      .from('productos')
      .update({ activo: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error al restaurar producto: ${error.message}`);
    }
    
    if (!data) {
      throw new Error(`Producto no encontrado con ID: ${id}`);
    }
    
    return this.mapearProducto(data);
  }
  
  // ==========================================
  // OPERACIONES DE LECTURA (READ)
  // ==========================================
  
  // Obtener todos los productos con filtros
  static async obtenerProductos(filtros?: FiltrosCatalogo): Promise<Producto[]> {
    try {
      let query = supabase
        .from('productos')
        .select('*')
        .eq('activo', true);
      
      // Aplicar filtros
      if (filtros?.categoria) {
        query = query.eq('categoria', filtros.categoria);
      }
      
      if (filtros?.nivelTostado) {
        query = query.eq('nivel_tostado', filtros.nivelTostado);
      }
      
      if (filtros?.busqueda) {
        query = query.or(`nombre.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%`);
      }
      
      if (filtros?.precioMin && filtros?.precioMax) {
        query = query.gte('precio', filtros.precioMin).lte('precio', filtros.precioMax);
      } else if (filtros?.precioMin) {
        query = query.gte('precio', filtros.precioMin);
      } else if (filtros?.precioMax) {
        query = query.lte('precio', filtros.precioMax);
      }
      
      if (filtros?.origen) {
        query = query.eq('origen', filtros.origen);
      }
      
      if (filtros?.region) {
        query = query.eq('region', filtros.region);
      }
      
      if (filtros?.soloDisponibles) {
        query = query.gt('stock', 0);
      }
      
      if (filtros?.soloOfertas) {
        query = query.gt('descuento', 0);
      }
      
      // Ordenar por calificación descendente
      query = query.order('calificacion', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error al obtener productos de Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        // Fallback a datos mock si hay error
        return PRODUCTOS_MOCK;
      }
      
      // Mapear productos de Supabase a la interfaz TypeScript
      return data.map(producto => this.mapearProducto(producto));
      
    } catch (error) {
      console.error('Error en obtenerProductos:', error);
      // Fallback a datos mock en caso de error
      return PRODUCTOS_MOCK;
    }
  }

  // Obtener todos los productos incluyendo inactivos (para administración)
  static async obtenerTodosLosProductos(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('creado_en', { ascending: false });
    
    if (error) {
      throw new Error(`Error al obtener todos los productos: ${error.message}`);
    }
    
    return data ? data.map(this.mapearProducto) : [];
  }

  // Obtener productos eliminados (inactivos)
  static async obtenerProductosEliminados(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', false)
      .order('creado_en', { ascending: false });
    
    if (error) {
      throw new Error(`Error al obtener productos eliminados: ${error.message}`);
    }
    
    return data ? data.map(this.mapearProducto) : [];
  }

  // Obtener producto por ID con detalles
  static async obtenerProductoPorId(id: string): Promise<DetalleProducto> {
    const { data: producto, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .eq('activo', true)
      .single();
    
    if (error || !producto) {
      throw new Error(`Producto no encontrado con ID: ${id}`);
    }
    
    // Obtener productos relacionados
    const { data: productosRelacionados } = await supabase
      .from('productos')
      .select('*')
      .eq('categoria', producto.categoria)
      .neq('id', id)
      .eq('activo', true)
      .limit(4);
    
    const productoMapeado = this.mapearProducto(producto);
    const relacionadosMapeados = productosRelacionados ? productosRelacionados.map(this.mapearProducto) : [];
    
    const detalleProducto: DetalleProducto = {
      producto: productoMapeado,
      productosRelacionados: relacionadosMapeados,
      disponible: producto.stock > 0,
      cantidadMaxima: Math.min(producto.stock, 10) // Máximo 10 por compra
    };
    
    return detalleProducto;
  }

  // Obtener producto por ID para administración (incluye inactivos)
  static async obtenerProductoPorIdAdmin(id: string): Promise<Producto> {
    const { data: producto, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !producto) {
      throw new Error(`Producto no encontrado con ID: ${id}`);
    }
    
    return this.mapearProducto(producto);
  }

  // ==========================================
  // OPERACIONES AUXILIARES
  // ==========================================

  // Obtener productos relacionados
  static async obtenerProductosRelacionados(categoria: string, idExcluir: string): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('categoria', categoria)
      .neq('id', idExcluir)
      .eq('activo', true)
      .limit(4);
    
    if (error) {
      throw new Error(`Error al obtener productos relacionados: ${error.message}`);
    }
    
    return data ? data.map(this.mapearProducto) : [];
  }

  // Obtener categorías disponibles
  static async obtenerCategorias(): Promise<string[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('categoria')
      .eq('activo', true);
    
    if (error) {
      throw new Error(`Error al obtener categorías: ${error.message}`);
    }
    
    return [...new Set(data?.map(p => p.categoria) || [])];
  }

  // Obtener orígenes disponibles
  static async obtenerOrigenes(): Promise<string[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('origen')
      .eq('activo', true);
    
    if (error) {
      throw new Error(`Error al obtener orígenes: ${error.message}`);
    }
    
    return [...new Set(data?.map(p => p.origen) || [])];
  }

  // Obtener regiones disponibles
  static async obtenerRegiones(): Promise<string[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('region')
      .eq('activo', true);
    
    if (error) {
      throw new Error(`Error al obtener regiones: ${error.message}`);
    }
    
    return [...new Set(data?.map(p => p.region) || [])];
  }

  // Buscar productos por texto
  static async buscarProductos(texto: string): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .or(`nombre.ilike.%${texto}%,descripcion.ilike.%${texto}%`)
      .eq('activo', true)
      .limit(20);
    
    if (error) {
      throw new Error(`Error al buscar productos: ${error.message}`);
    }
    
    return data ? data.map(this.mapearProducto) : [];
  }

  // Obtener productos con ofertas
  static async obtenerProductosEnOferta(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .gt('descuento', 0)
      .eq('activo', true)
      .order('descuento', { ascending: false })
      .limit(10);
    
    if (error) {
      throw new Error(`Error al obtener productos en oferta: ${error.message}`);
    }
    
    return data ? data.map(this.mapearProducto) : [];
  }

  // Obtener productos más populares
  static async obtenerProductosPopulares(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('cantidad_resenas', { ascending: false })
      .limit(8);
    
    if (error) {
      throw new Error(`Error al obtener productos populares: ${error.message}`);
    }
    
    return data ? data.map(this.mapearProducto) : [];
  }

  // Obtener productos por rango de precio
  static async obtenerProductosPorPrecio(precioMin: number, precioMax: number): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .gte('precio', precioMin)
      .lte('precio', precioMax)
      .eq('activo', true)
      .order('precio', { ascending: true });
    
    if (error) {
      throw new Error(`Error al obtener productos por precio: ${error.message}`);
    }
    
    return data ? data.map(this.mapearProducto) : [];
  }

  // ==========================================
  // OPERACIONES DE STOCK
  // ==========================================

  // Actualizar stock de producto
  static async actualizarStock(id: string, nuevoStock: number): Promise<void> {
    const { error } = await supabase
      .from('productos')
      .update({ stock: nuevoStock })
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error al actualizar stock: ${error.message}`);
    }
  }

  // Reducir stock (para compras)
  static async reducirStock(id: string, cantidad: number): Promise<void> {
    // Primero verificar stock disponible
    const { data: producto, error: errorConsulta } = await supabase
      .from('productos')
      .select('stock')
      .eq('id', id)
      .single();
    
    if (errorConsulta) {
      throw new Error(`Error al consultar stock: ${errorConsulta.message}`);
    }
    
    if (!producto || producto.stock < cantidad) {
      throw new Error('Stock insuficiente para esta operación');
    }
    
    // Actualizar stock
    const { error } = await supabase
      .from('productos')
      .update({ stock: producto.stock - cantidad })
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error al reducir stock: ${error.message}`);
    }
  }

  // ==========================================
  // ESTADÍSTICAS Y REPORTES
  // ==========================================

  // Obtener estadísticas generales
  static async obtenerEstadisticas(): Promise<{
    totalProductos: number;
    productosActivos: number;
    productosInactivos: number;
    promedioCalificacion: number;
    totalStock: number;
    valorInventario: number;
  }> {
    try {
      // Obtener todos los productos
      const { data: productos, error } = await supabase
        .from('productos')
        .select('activo, calificacion, stock, precio');
      
      if (error) {
        throw new Error(`Error al obtener estadísticas: ${error.message}`);
      }
      
      if (!productos || productos.length === 0) {
        return {
          totalProductos: 0,
          productosActivos: 0,
          productosInactivos: 0,
          promedioCalificacion: 0,
          totalStock: 0,
          valorInventario: 0
        };
      }
      
      const productosActivos = productos.filter(p => p.activo);
      const promedioCalificacion = productosActivos.length > 0 
        ? productosActivos.reduce((sum, p) => sum + (p.calificacion || 0), 0) / productosActivos.length 
        : 0;
      const totalStock = productosActivos.reduce((sum, p) => sum + (p.stock || 0), 0);
      const valorInventario = productosActivos.reduce((sum, p) => sum + ((p.stock || 0) * (p.precio || 0)), 0);
      
      return {
        totalProductos: productos.length,
        productosActivos: productosActivos.length,
        productosInactivos: productos.length - productosActivos.length,
        promedioCalificacion: Math.round(promedioCalificacion * 100) / 100,
        totalStock,
        valorInventario: Math.round(valorInventario * 100) / 100
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}
