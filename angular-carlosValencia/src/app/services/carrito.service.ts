import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { Carrito, IProducto, IitemCarrito } from '../interfaces/carrito';
import { environment } from '../../environments/environments';

// Interfaces para pedidos
export interface Pedido {
  id?: string;
  numero_pedido?: string;
  usuario_id: string;
  estado_id: string;
  subtotal: number;
  iva: number;
  envio: number;
  descuento: number;
  total: number;
  direccion_entrega?: any;
  metodo_pago?: any;
  notas?: string;
  fecha_pedido?: string;
  fecha_entrega_estimada?: string;
  fecha_entrega_real?: string;
  creado_en?: string;
  actualizado_en?: string;
}

export interface ItemPedido {
  id?: string;
  pedido_id: string;
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  creado_en?: string;
}


@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  // Vaciar el carrito completamente para un usuario
  public vaciarCarrito(userId: string): void {
    if (!userId) return;
    this.getAll(userId).subscribe((carrito: Carrito | null) => {
      if (carrito && carrito.id) {
        this.clear(carrito.id, userId).subscribe();
      }
    });
  }
  private carritoSubject = new BehaviorSubject<Carrito | null>(null);
  public carrito$ = this.carritoSubject.asObservable();

  // Singleton para el listener global de AGREGAR_AL_CARRITO
  private static carritoListenerRegistered = false;
  constructor(private supabaseService: SupabaseService) {
    if (!CarritoService.carritoListenerRegistered) {
      window.addEventListener('message', this.globalMessageListener, false);
      CarritoService.carritoListenerRegistered = true;
      console.log('� Listener de mensajes configurado (singleton)');
    }
  }

  // Listener global para mensajes postMessage
  private globalMessageListener = (event: MessageEvent) => {
    if (event.data && event.data.type === 'AGREGAR_AL_CARRITO') {
      console.log('🛒 Recibido producto de React:', event.data.data);
      this.handleProductFromReact(event.data.data);
    } else if (event.data && event.data.type === 'AUTH_TOKEN_RESPONSE') {
      // Ignorar respuestas de token que no son para nosotros
      //console.log('📨 Respuesta de token ignorada en globalMessageListener');
    } else {
      //console.log('📨 Mensaje ignorado - tipo no reconocido');
    }
  };

  // Obtener todos los productos
  getProductos(): Observable<IProducto[]> {
    return from(this.supabaseService.select('productos', '*')).pipe(
      map(res => Array.isArray(res.data) ? res.data as unknown as IProducto[] : [])
    );
  }

  // Manejar productos agregados desde React
  private handleProductFromReact(data: any) {
    console.log('🛒 Procesando producto de React:', data);
    // Refuerzo: evitar listeners duplicados y race conditions
    let tokenListener: any;
    let timeoutId: any;
    let tokenProcesado = false;
    const cleanup = () => {
      if (tokenListener) window.removeEventListener('message', tokenListener);
      if (timeoutId) clearTimeout(timeoutId);
    };
    tokenListener = (event: MessageEvent) => {
      if (tokenProcesado) return;
      if (event.data && event.data.type === 'AUTH_TOKEN_RESPONSE') {
        tokenProcesado = true;
        cleanup();
        if (!event.data.token) {
          console.warn('⚠️ No hay token disponible para agregar producto');
          return;
        }
        try {
          const tokenParts = event.data.token.split('.');
          const payload = JSON.parse(atob(tokenParts[1]));
          const userId = payload.sub;
          console.log('🆔 ID de usuario extraído del token:', userId);
          const productoAngular: IProducto = {
            id: data.producto.id,
            nombre: data.producto.nombre,
            descripcion: data.producto.descripcion,
            precio: data.producto.precio,
            imagen_url: data.producto.imagenUrl || data.producto.imagen_url,
            origen: data.producto.origen,
            notas_sabor: data.producto.notasSabor || data.producto.notas_sabor || '',
            stock: data.producto.stock,
            activo: data.producto.activo !== undefined ? data.producto.activo : true,
            creado_en: new Date().toISOString()
          };
          console.log('🔄 Producto convertido a formato Angular:', productoAngular);
          console.log('📦 Cantidad a agregar:', data.cantidad);
          this.add(productoAngular, data.cantidad, userId).subscribe({
            next: (carrito) => {
              console.log('✅ Producto agregado exitosamente:', carrito);
              if (carrito && carrito.items) {
                this.carritoSubject.next(carrito);
              } else {
                this.carritoSubject.next({ items: [] } as any);
              }
            },
            error: (error) => {
              console.error('❌ Error agregando producto:', error);
              this.carritoSubject.next({ items: [] } as any);
            }
          });
        } catch (error) {
          console.error('❌ Error procesando producto de React:', error);
          this.carritoSubject.next({ items: [] } as any);
        }
      }
    };
    window.addEventListener('message', tokenListener);
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, '*');
    }
    timeoutId = setTimeout(() => {
      cleanup();
      if (!tokenProcesado) {
        console.warn('⚠️ Timeout esperando token del shell (handleProductFromReact)');
      }
    }, 4000);
  }

  // Forzar actualización del carrito tras cada navegación entre microfrontends
  // (debe llamarse desde el componente principal de Angular al detectar navegación)
  public forceRefreshCarrito(userId: string) {
    if (!userId) {
      // Si no hay usuario, limpiar el carrito localmente y no hacer petición
      console.log('🧹 Limpiando carrito local (sin usuario)');
      this.carritoSubject.next({ items: [] } as any);
      return;
    }
    this.getAll(userId).subscribe({
      next: (carrito) => {
        console.log('🔄 Carrito forzado tras navegación:', carrito);
        this.carritoSubject.next(carrito);
      },
      error: (err) => {
        console.error('❌ Error forzando actualización de carrito:', err);
        this.carritoSubject.next({ items: [] } as any);
      }
    });
  }

  // Obtener el carrito actual y actualizar el estado global
  getAll(userId: string): Observable<Carrito | null> {
    console.log('🛒 Obteniendo carrito para usuario:', userId);
    
    return new Observable(observer => {
      let timeoutId: any;
      const tokenListener = (event: MessageEvent) => {
        if (event.data && event.data.type === 'AUTH_TOKEN_RESPONSE') {
          clearTimeout(timeoutId);
          window.removeEventListener('message', tokenListener);
          const accessToken = event.data.token;
          if (!accessToken) {
            console.warn('⚠️ No hay token disponible, usando anonKey');
          }
          const headers: any = {
            'Content-Type': 'application/json',
            'apikey': environment.supabase.anonKey
          };
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          fetch(`${environment.supabase.url}/rest/v1/carritos?select=*&usuario_id=eq.${userId}`, {
            method: 'GET',
            headers: headers
          }).then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          }).then(carritoRes => {
            const carritoData = Array.isArray(carritoRes) ? carritoRes[0] : carritoRes;
            if (!carritoData) {
              // Si no hay carrito, no intentar crear uno (ya se crea automáticamente)
              // En su lugar, devolver un carrito vacío temporal
              console.log('🛒 No se encontró carrito, devolviendo carrito vacío temporal');
              observer.next({ 
                id: null,
                usuario_id: userId,
                subtotal: 0,
                impuesto: 0,
                envio: 0,
                descuento: 0,
                total: 0,
                items: [] 
              } as any);
              observer.complete();
              return;
            } else {
              return fetch(`${environment.supabase.url}/rest/v1/items_carrito?select=*&carrito_id=eq.${carritoData.id}`, {
                method: 'GET',
                headers: headers
              }).then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
              }).then(itemsRes => {
                const items = itemsRes || [];
                if (items.length === 0) {
                  observer.next({ ...carritoData, items: [] });
                  observer.complete();
                  return;
                }
                // Eliminar IDs duplicados antes de consultar productos
                const uniqueProductoIdsArr = Array.from(new Set(items.map((item: any) => item.producto_id)));
                const productoIds = uniqueProductoIdsArr.join(',');
                if (!productoIds) {
                  // No hay productos, devolver carrito vacío
                  observer.next({ ...carritoData, items: [] });
                  observer.complete();
                  return;
                }
                fetch(`${environment.supabase.url}/rest/v1/productos?id=in.(${productoIds})`, {
                  method: 'GET',
                  headers: headers
                })
                  .then(response => response.json())
                  .then((productosRes: any[]) => {
                    // Mapear productos por id para acceso rápido
                    const productosMap = new Map<string, any>();
                    (productosRes || []).forEach(p => productosMap.set(p.id, p));
                    const itemsConProductos = items.map((item: any) => ({
                      ...item,
                      producto: productosMap.get(item.producto_id) || null
                    }));
                    const subtotal = itemsConProductos.reduce(
                      (sum: number, item: any) => sum + (item.producto?.precio || 0) * item.cantidad,
                      0
                    );
                    const impuesto = subtotal * 0.12;
                    const envio = subtotal > 50 ? 0 : 5;
                    const total = subtotal + impuesto + envio;
                    observer.next({ ...carritoData, subtotal, impuesto, envio, total, items: itemsConProductos });
                    observer.complete();
                  })
                  .catch(() => {
                    // Si falla la petición de productos, devolver los items sin producto
                    const itemsConProductos = items.map((item: any) => ({ ...item, producto: null }));
                    observer.next({ ...carritoData, items: itemsConProductos });
                    observer.complete();
                  });
              });
            }
          }).catch(error => {
            console.error('❌ Error obteniendo carrito:', error);
            
            // Si es un error 401 (Unauthorized), intentar refrescar el token
            if (error.message && error.message.includes('401')) {
              console.log('🔄 Error 401 detectado, solicitando nuevo token...');
              // Solicitar nuevo token al shell
              if (window.parent && window.parent !== window) {
                window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, '*');
              }
              // Reintentar después de un breve delay
              setTimeout(() => {
                this.getAll(userId).subscribe({
                  next: (carritoReintentado) => {
                    observer.next(carritoReintentado);
                    observer.complete();
                  },
                  error: (reintentoError) => {
                    console.error('❌ Error en reintento después de 401:', reintentoError);
                    observer.next({ items: [] } as any);
                    observer.complete();
                  }
                });
              }, 1000);
              return;
            }
            
            // Si es un error 409 (Conflict), puede ser que el carrito se esté creando
            // Reintentar después de un breve delay
            if (error.message && error.message.includes('409')) {
              console.log('🔄 Error 409 detectado, reintentando en 1 segundo...');
              setTimeout(() => {
                this.getAll(userId).subscribe({
                  next: (carritoReintentado) => {
                    observer.next(carritoReintentado);
                    observer.complete();
                  },
                  error: (reintentoError) => {
                    console.error('❌ Error en reintento:', reintentoError);
                    observer.next({ items: [] } as any);
                    observer.complete();
                  }
                });
              }, 1000);
              return;
            }
            
            // Para otros errores, devolver carrito vacío
            observer.next({ items: [] } as any);
            observer.complete();
          });
        }
      };
      window.addEventListener('message', tokenListener);
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, '*');
      }
      timeoutId = setTimeout(() => {
        window.removeEventListener('message', tokenListener);
        console.warn('⚠️ Timeout esperando token del shell');
        observer.next({ items: [] } as any);
        observer.complete();
      }, 3000);
    });
  }

  // Agregar producto al carrito
  add(producto: IProducto, cantidad: number, userId: string): Observable<Carrito | null> {
    console.log('🛒 Iniciando add() para producto:', producto.nombre, 'cantidad:', cantidad, 'usuario:', userId);
    return new Observable(observer => {
      // Solicitar token al shell por postMessage
      console.log('🔑 Solicitando token al shell (add)...');
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, '*');
      }
      const tokenListener = (event: MessageEvent) => {
        if (event.data && event.data.type === 'AUTH_TOKEN_RESPONSE') {
          const accessToken = event.data.token;
          window.removeEventListener('message', tokenListener);
          if (!accessToken) {
            console.warn('⚠️ No hay token disponible, usando anonKey');
          }
          const headers: any = {
            'Content-Type': 'application/json',
            'apikey': environment.supabase.anonKey
          };
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          // 1. Obtener el carrito del usuario
          fetch(`${environment.supabase.url}/rest/v1/carritos?select=*&usuario_id=eq.${userId}`, {
            method: 'GET',
            headers: headers
          })
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then(carritoRes => {
              let carritoId = null;
              if (Array.isArray(carritoRes) && carritoRes.length > 0) {
                carritoId = carritoRes[0].id;
              } else {
                // Si no hay carrito, esperar un momento y reintentar
                console.log('🔄 No se encontró carrito, reintentando en 2 segundos...');
                return new Promise((resolve, reject) => {
                  setTimeout(() => {
                    fetch(`${environment.supabase.url}/rest/v1/carritos?select=*&usuario_id=eq.${userId}`, {
                      method: 'GET',
                      headers: headers
                    })
                      .then(response => response.json())
                      .then(retryRes => {
                        if (Array.isArray(retryRes) && retryRes.length > 0) {
                          resolve(retryRes[0].id);
                        } else {
                          reject(new Error('No se pudo obtener el carrito después del reintento'));
                        }
                      })
                      .catch(reject);
                  }, 2000);
                });
              }
              return carritoId;
            })
            .then(carritoId => {
              if (!carritoId) {
                throw new Error('No se pudo obtener el ID del carrito');
              }
              
              // 2. Buscar si ya existe el item en el carrito
              return fetch(`${environment.supabase.url}/rest/v1/items_carrito?carrito_id=eq.${carritoId}&producto_id=eq.${producto.id}`, {
                method: 'GET',
                headers: headers
              })
                .then(response => {
                  if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  return response.json();
                })
                .then(items => {
                  if (Array.isArray(items) && items.length > 0) {
                    // Ya existe, actualizar cantidad
                    const itemExistente = items[0];
                    const nuevaCantidad = (itemExistente.cantidad || 0) + cantidad;
                    return fetch(`${environment.supabase.url}/rest/v1/items_carrito?carrito_id=eq.${carritoId}&producto_id=eq.${producto.id}`, {
                      method: 'PATCH',
                      headers: headers,
                      body: JSON.stringify({ cantidad: nuevaCantidad })
                    });
                  } else {
                    // No existe, crear nuevo item
                    const nuevoItem = {
                      carrito_id: carritoId,
                      producto_id: producto.id,
                      cantidad,
                      precio_unitario: producto.precio,
                      subtotal: producto.precio * cantidad
                    };
                    return fetch(`${environment.supabase.url}/rest/v1/items_carrito`, {
                      method: 'POST',
                      headers: headers,
                      body: JSON.stringify(nuevoItem)
                    });
                  }
                });
            })
            .then(() => {
              // Refrescar el carrito actualizado
              this.getAll(userId).subscribe({
                next: (carritoActualizado) => {
                  observer.next(carritoActualizado);
                  observer.complete();
                },
                error: (getError) => {
                  observer.next(null);
                  observer.complete();
                }
              });
            })
            .catch(error => {
              console.error('❌ Error en add():', error);
              this.getAll(userId).subscribe({
                next: (carritoActualizado) => {
                  observer.next(carritoActualizado);
                  observer.complete();
                },
                error: () => {
                  observer.next(null);
                  observer.complete();
                }
              });
            });
        }
      };
      window.addEventListener('message', tokenListener);
      setTimeout(() => {
        window.removeEventListener('message', tokenListener);
        observer.error(new Error('Timeout esperando token del shell (add)'));
      }, 3000);
    });
  }

  // Actualizar cantidad de un producto en el carrito usando fetch y JWT
  updateCantidad(idCarrito: string, idProducto: string, nuevaCantidad: number, userId: string): Observable<Carrito | null> {
    console.log('[updateCantidad] Actualizando cantidad:', { idCarrito, idProducto, nuevaCantidad, userId });
    return new Observable<Carrito | null>(observer => {
      let timeoutId: any;
      const tokenListener = (event: MessageEvent) => {
        if (event.data && event.data.type === 'AUTH_TOKEN_RESPONSE') {
          clearTimeout(timeoutId);
          window.removeEventListener('message', tokenListener);
          const accessToken = event.data.token;
          if (!accessToken) {
            console.warn('[updateCantidad] ⚠️ No hay token disponible, usando anonKey');
          }
          const headers: any = {
            'Content-Type': 'application/json',
            'apikey': environment.supabase.anonKey
          };
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          fetch(`${environment.supabase.url}/rest/v1/items_carrito?carrito_id=eq.${idCarrito}&producto_id=eq.${idProducto}`, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify({ cantidad: nuevaCantidad })
          })
            .then(async response => {
              let resJson = null;
              try { resJson = await response.json(); } catch {}
              console.log('[updateCantidad] Respuesta de Supabase (fetch):', response.status, resJson);
              if (!response.ok) {
                console.error('[updateCantidad] Error de Supabase (fetch):', response.status, resJson);
                observer.error(resJson || response.statusText);
                return;
              }
              this.getAll(userId).subscribe({
                next: (carrito) => {
                  this.carritoSubject.next(carrito);
                  observer.next(carrito);
                  observer.complete();
                },
                error: (err) => {
                  observer.error(err);
                }
              });
            })
            .catch(err => {
              console.error('[updateCantidad] Error en fetch:', err);
              observer.error(err);
            });
        }
      };
      window.addEventListener('message', tokenListener);
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, '*');
      }
      timeoutId = setTimeout(() => {
        window.removeEventListener('message', tokenListener);
        console.warn('[updateCantidad] ⚠️ Timeout esperando token del shell');
        observer.error('Timeout esperando token del shell (updateCantidad)');
      }, 3000);
    });
  }

  // Eliminar un producto del carrito usando fetch y JWT (sin forzar estado vacío)
  delete(idCarrito: string, idProducto: string, userId: string): Observable<Carrito | null> {
    console.log('[delete] Intentando eliminar producto del carrito (con JWT):', { idCarrito, idProducto, userId });
    return new Observable<Carrito | null>(observer => {
      let timeoutId: any;
      const tokenListener = (event: MessageEvent) => {
        if (event.data && event.data.type === 'AUTH_TOKEN_RESPONSE') {
          clearTimeout(timeoutId);
          window.removeEventListener('message', tokenListener);
          const accessToken = event.data.token;
          if (!accessToken) {
            console.warn('[delete] ⚠️ No hay token disponible, usando anonKey');
          }
          const headers: any = {
            'Content-Type': 'application/json',
            'apikey': environment.supabase.anonKey
          };
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          fetch(`${environment.supabase.url}/rest/v1/items_carrito?carrito_id=eq.${idCarrito}&producto_id=eq.${idProducto}`, {
            method: 'DELETE',
            headers: headers
          })
            .then(async response => {
              let resJson = null;
              try { resJson = await response.json(); } catch {}
              console.log('[delete] Respuesta de Supabase (fetch):', response.status, resJson);
              if (!response.ok) {
                console.error('[delete] Error de Supabase (fetch):', response.status, resJson);
                observer.error(resJson || response.statusText);
                return;
              }
              // Simplemente refrescar el carrito, no forzar vacío
              this.getAll(userId).subscribe({
                next: (carrito) => {
                  this.carritoSubject.next(carrito);
                  observer.next(carrito);
                  observer.complete();
                },
                error: (err) => {
                  observer.error(err);
                }
              });
            })
            .catch(err => {
              console.error('[delete] Error en fetch:', err);
              observer.error(err);
            });
        }
      };
      window.addEventListener('message', tokenListener);
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, '*');
      }
      timeoutId = setTimeout(() => {
        window.removeEventListener('message', tokenListener);
        console.warn('[delete] ⚠️ Timeout esperando token del shell');
        observer.error('Timeout esperando token del shell (delete)');
      }, 3000);
    });
  }

  // Limpiar el carrito usando fetch y el token JWT del usuario autenticado
  clear(idCarrito: string, userId: string): Observable<Carrito | null> {
    console.log('[clear] Intentando limpiar carrito (con JWT):', { idCarrito, userId });
    return new Observable<Carrito | null>(observer => {
      let timeoutId: any;
      const tokenListener = (event: MessageEvent) => {
        if (event.data && event.data.type === 'AUTH_TOKEN_RESPONSE') {
          clearTimeout(timeoutId);
          window.removeEventListener('message', tokenListener);
          const accessToken = event.data.token;
          if (!accessToken) {
            console.warn('[clear] ⚠️ No hay token disponible, usando anonKey');
          }
          const headers: any = {
            'Content-Type': 'application/json',
            'apikey': environment.supabase.anonKey
          };
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          // Eliminar todos los items del carrito usando fetch
          fetch(`${environment.supabase.url}/rest/v1/items_carrito?carrito_id=eq.${idCarrito}`, {
            method: 'DELETE',
            headers: headers
          })
            .then(async response => {
              let resJson = null;
              try { resJson = await response.json(); } catch {}
              console.log('[clear] Respuesta de Supabase (fetch):', response.status, resJson);
              if (!response.ok) {
                console.error('[clear] Error de Supabase (fetch):', response.status, resJson);
                observer.error(resJson || response.statusText);
                return;
              }
              // Primer intento de refresco inmediato
              this.getAll(userId).subscribe({
                next: (carrito) => {
                  if (carrito && Array.isArray(carrito.items) && carrito.items.length === 0) {
                    this.carritoSubject.next(carrito);
                    observer.next(carrito);
                    observer.complete();
                  } else {
                    // Segundo intento tras pequeño delay
                    setTimeout(() => {
                      this.getAll(userId).subscribe({
                        next: (carrito2) => {
                          if (carrito2 && Array.isArray(carrito2.items) && carrito2.items.length === 0) {
                            this.carritoSubject.next(carrito2);
                            observer.next(carrito2);
                            observer.complete();
                          } else {
                            // Forzar estado vacío si persisten los items
                            const emptyCarrito = carrito2 ? { ...carrito2, items: [] } : { items: [] };
                            this.carritoSubject.next(emptyCarrito as any);
                            observer.next(emptyCarrito as any);
                            observer.complete();
                          }
                        },
                        error: (err) => {
                          observer.error(err);
                        }
                      });
                    }, 350);
                  }
                },
                error: (err) => {
                  observer.error(err);
                }
              });
            })
            .catch(err => {
              console.error('[clear] Error en fetch:', err);
              observer.error(err);
            });
        }
      };
      window.addEventListener('message', tokenListener);
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, '*');
      }
      timeoutId = setTimeout(() => {
        window.removeEventListener('message', tokenListener);
        console.warn('[clear] ⚠️ Timeout esperando token del shell');
        observer.error('Timeout esperando token del shell (clear)');
      }, 3000);
    });
  }

  // =====================================================
  // MÉTODOS PARA CREAR PEDIDOS
  // =====================================================

  // Obtener token de autenticación del shell
  private async getAuthToken(): Promise<string | null> {
    return new Promise((resolve) => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, '*');
        
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'AUTH_TOKEN_RESPONSE') {
            window.removeEventListener('message', handleMessage);
            resolve(event.data.token);
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        // Timeout después de 5 segundos
        setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          resolve(null);
        }, 5000);
      } else {
        resolve(null);
      }
    });
  }

  // Crear un nuevo pedido desde el carrito
  async crearPedidoDesdeCarrito(
    carrito: Carrito, 
    checkoutData: { nombre: string; email: string; direccion: string }
  ): Promise<Pedido> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación');
      }

      const headers: any = {
        'Content-Type': 'application/json',
        'apikey': environment.supabase.anonKey,
        'Authorization': `Bearer ${token}`,
        'Prefer': 'return=representation'
      };

      // Extraer userId del token
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.sub;

                  // Obtener el UUID del estado "Pagado" (ya que el pago se procesó exitosamente)
            const estadoResponse = await fetch(
              `${environment.supabase.url}/rest/v1/estados_pedido?nombre=eq.Pagado&select=id`,
              { headers }
            );

            if (!estadoResponse.ok) {
              throw new Error('Error obteniendo estado de pedido');
            }

            const estados = await estadoResponse.json();
            if (!estados || estados.length === 0) {
              throw new Error('No se encontró el estado "Pagado"');
            }

            const estadoPagadoId = estados[0].id;
            console.log('🆔 UUID del estado Pagado:', estadoPagadoId);

                  // Crear el pedido principal
            const pedido: Omit<Pedido, 'id' | 'fecha_pedido' | 'creado_en' | 'actualizado_en'> = {
              usuario_id: userId,
              estado_id: estadoPagadoId,
        subtotal: carrito.subtotal,
        iva: carrito.impuesto,
        envio: carrito.envio,
        descuento: carrito.descuento,
        total: carrito.total,
        direccion_entrega: {
          nombre: checkoutData.nombre,
          email: checkoutData.email,
          direccion: checkoutData.direccion
        },
        metodo_pago: {
          tipo: 'tarjeta',
          estado: 'procesado'
        },
        notas: `Pedido creado desde carrito - ${new Date().toLocaleString()}`
      };

      console.log('🛒 Creando pedido:', pedido);

      // 1. Crear el pedido principal
      console.log('📤 Enviando pedido a Supabase:', JSON.stringify(pedido, null, 2));
      
      const pedidoResponse = await fetch(`${environment.supabase.url}/rest/v1/pedidos`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(pedido)
      });

      console.log('📥 Respuesta del servidor:', {
        status: pedidoResponse.status,
        statusText: pedidoResponse.statusText,
        ok: pedidoResponse.ok
      });

      if (!pedidoResponse.ok) {
        let errorData;
        try {
          errorData = await pedidoResponse.json();
        } catch (e) {
          const errorText = await pedidoResponse.text();
          console.error('❌ Error creando pedido - Respuesta no JSON:', errorText);
          throw new Error(`Error al crear el pedido: ${pedidoResponse.status} ${pedidoResponse.statusText}`);
        }
        console.error('❌ Error creando pedido:', errorData);
        console.error('📋 Datos enviados:', pedido);
        throw new Error(`Error al crear el pedido: ${errorData.message || errorData.details || 'Error desconocido'}`);
      }

      let pedidoData;
      try {
        pedidoData = await pedidoResponse.json();
      } catch (e) {
        const responseText = await pedidoResponse.text();
        console.error('❌ Error parseando respuesta JSON:', responseText);
        throw new Error('Error al procesar la respuesta del servidor');
      }
      console.log('✅ Pedido creado:', pedidoData);

      // 2. Crear los items del pedido
      if (carrito.items && carrito.items.length > 0) {
        const items: Omit<ItemPedido, 'id' | 'pedido_id' | 'creado_en'>[] = carrito.items.map(item => ({
          producto_id: item.producto_id,
          nombre: item.producto?.nombre || 'Producto',
          cantidad: item.cantidad,
          precio_unitario: item.producto?.precio || 0,
          subtotal: (item.producto?.precio || 0) * item.cantidad
        }));

        console.log('📦 Items del pedido:', items);

        const itemsResponse = await fetch(`${environment.supabase.url}/rest/v1/items_pedido`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(items.map(item => ({
            ...item,
            pedido_id: pedidoData[0].id // Fixed: access first element of array
          })))
        });

        if (!itemsResponse.ok) {
          const errorData = await itemsResponse.json();
          console.error('Error creando items del pedido:', errorData);
          throw new Error('Error al crear los items del pedido');
        }

        console.log('✅ Items del pedido creados');
      }

      return pedidoData;
    } catch (error) {
      console.error('Error en crearPedidoDesdeCarrito:', error);
      throw error;
    }
  }

  // Obtener pedidos del usuario
  async obtenerPedidosUsuario(usuarioId: string): Promise<Pedido[]> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación');
      }

      const headers: any = {
        'Content-Type': 'application/json',
        'apikey': environment.supabase.anonKey,
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(
        `${environment.supabase.url}/rest/v1/pedidos?usuario_id=eq.${usuarioId}&select=*&order=fecha_pedido.desc`,
        { headers }
      );

      if (!response.ok) {
        console.error('Error obteniendo pedidos:', response.statusText);
        return [];
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error en obtenerPedidosUsuario:', error);
      return [];
    }
  }
}