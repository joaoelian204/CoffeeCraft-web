import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Carrito } from '../../interfaces/carrito';
import { CarritoService, AuthService } from '../../services';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen p-6 max-w-5xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Tu Carrito de Compras</h1>
        <p class="text-gray-600">{{ carrito?.items?.length || 0 }} productos en tu carrito</p>
      </div>

      <ng-container *ngIf="carrito && carrito.items.length > 0; else emptyCart">
        <div class="grid md:grid-cols-3 gap-8">
          <div class="md:col-span-2 space-y-4">
            <div class="bg-white rounded-lg shadow-md p-4 flex flex-col md:flex-row items-center gap-4" *ngFor="let item of carrito.items; trackBy: trackById">
              <div class="flex-shrink-0">
                <img [src]="item.producto?.imagen_url || '/assets/placeholder.jpg'" [alt]="item.producto?.nombre || 'Producto'" class="w-20 h-20 object-cover rounded-lg" />
              </div>
              <div class="flex-1 w-full">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ item.producto?.nombre || 'Producto no disponible' }}</h3>
                <p class="text-sm text-gray-600 mb-1">{{ item.producto?.descripcion || 'Sin descripción' }}</p>
                <div class="text-sm text-gray-500">Origen: {{ item.producto?.origen || 'No especificado' }}</div>
              </div>
              <div class="flex items-center gap-2">
                <button class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100" (click)="actualizarCantidad(carrito.id, item.producto_id, item.cantidad - 1)">-</button>
                <span class="mx-2 font-semibold">{{ item.cantidad }}</span>
                <button class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100" (click)="actualizarCantidad(carrito.id, item.producto_id, item.cantidad + 1)">+</button>
              </div>
              <div class="text-right">
                <span class="block text-sm text-gray-500">
                  <ng-container *ngIf="item.producto; else sinPrecio1">{{ item.producto.precio | currency:'USD' }}</ng-container>
                  <ng-template #sinPrecio1>-</ng-template>
                </span>
                <span class="block text-lg font-semibold text-gray-900">
                  <ng-container *ngIf="item.producto; else sinPrecio2">{{ (item.producto.precio * item.cantidad) | currency:'USD' }}</ng-container>
                  <ng-template #sinPrecio2>-</ng-template>
                </span>
              </div>
              <button class="text-red-500 hover:text-red-700 text-xl" (click)="eliminarItem(carrito.id, item.producto_id)">✕</button>
            </div>
          </div>
          <div class="sticky top-8 h-fit">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-4">Resumen del Pedido</h3>
              <div class="flex justify-between mb-3">
                <span>Subtotal:</span>
                <span>{{ carrito.subtotal | currency:'USD' }}</span>
              </div>
              <div class="flex justify-between mb-3">
                <span>Impuestos:</span>
                <span>{{ carrito.impuesto | currency:'USD' }}</span>
              </div>
              <div class="flex justify-between mb-3">
                <span>Envío:</span>
                <span>{{ carrito.envio === 0 ? 'Gratis' : (carrito.envio | currency:'USD') }}</span>
              </div>
              <div class="flex justify-between mb-3 text-green-600" *ngIf="carrito.descuento > 0">
                <span>Descuento:</span>
                <span>-{{ carrito.descuento | currency:'USD' }}</span>
              </div>
              <div class="flex justify-between text-xl font-bold border-t pt-3 mt-4">
                <span>Total:</span>
                <span>{{ carrito.total | currency:'USD' }}</span>
              </div>
              <div class="flex gap-2 my-4">
                <input type="text" placeholder="Código de cupón" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg" #couponInput>
                <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300" (click)="aplicarCupon(couponInput.value)">Aplicar</button>
              </div>
              <button class="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700" (click)="mostrarCheckout = true">Proceder al Checkout</button>
              <button class="w-full py-2 mt-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600" (click)="limpiarCarrito()">🗑️ Limpiar Carrito</button>
            </div>
          </div>
        </div>
      </ng-container>
      <ng-template #emptyCart>
        <div class="text-center py-16">
          <div class="text-6xl mb-4">🛒</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
          <p class="text-gray-600 mb-6">Agrega algunos productos increíbles a tu carrito</p>
          <button class="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600" (click)="irATienda()">Comprar Ahora</button>
        </div>
      </ng-template>

      <!-- Modal de Checkout Mejorado -->
      <div *ngIf="mostrarCheckout" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in">
          <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-3xl" (click)="cerrarCheckout()">&times;</button>
          <h2 class="text-3xl font-extrabold mb-2 text-center text-green-700">Finalizar Compra</h2>
          <p class="text-center text-gray-500 mb-6">Completa tus datos para recibir la factura y el resumen de tu pedido</p>
          <form (ngSubmit)="enviarFactura()" #checkoutForm="ngForm" autocomplete="off" class="space-y-4">
            <div>
              <label class="block mb-1 font-semibold">Nombre completo</label>
              <input type="text" class="w-full border-2 border-gray-200 focus:border-green-500 rounded-lg px-3 py-2 transition" [(ngModel)]="checkoutData.nombre" name="nombre" required [ngClass]="{'border-red-400': submitted && !checkoutData.nombre}" />
            </div>
            <div>
              <label class="block mb-1 font-semibold">Correo electrónico</label>
              <input type="email" class="w-full border-2 border-gray-200 focus:border-green-500 rounded-lg px-3 py-2 transition" [(ngModel)]="checkoutData.email" name="email" required [ngClass]="{'border-red-400': submitted && !checkoutData.email}" />
            </div>
            <div>
              <label class="block mb-1 font-semibold">Dirección de envío</label>
              <input type="text" class="w-full border-2 border-gray-200 focus:border-green-500 rounded-lg px-3 py-2 transition" [(ngModel)]="checkoutData.direccion" name="direccion" required [ngClass]="{'border-red-400': submitted && !checkoutData.direccion}" />
            </div>
            <div class="bg-gray-50 rounded-lg p-4 mt-4">
              <h3 class="font-bold mb-2 text-gray-700">Resumen de tu compra</h3>
              <div *ngIf="carrito">
                <div class="flex justify-between text-sm mb-1" *ngFor="let item of carrito.items">
                  <span>{{item.producto?.nombre}} <span class="text-gray-400">x{{item.cantidad}}</span></span>
                  <span *ngIf="item.producto; else sinPrecioResumen">{{ (item.producto.precio * item.cantidad) | currency:'USD' }}</span>
                  <ng-template #sinPrecioResumen>-</ng-template>
                </div>
                <div class="border-t my-2"></div>
                <div class="flex justify-between text-base font-semibold">
                  <span>Total:</span>
                  <span>{{carrito.total | currency:'USD'}}</span>
                </div>
              </div>
            </div>
            <button type="submit" [disabled]="enviandoFactura" class="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-800 transition mt-4 flex items-center justify-center">
              <span *ngIf="!enviandoFactura && !facturaEnviada">Confirmar y Pagar</span>
              <span *ngIf="enviandoFactura" class="flex items-center"><svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Enviando...</span>
              <span *ngIf="facturaEnviada" class="flex items-center"><svg class="h-5 w-5 mr-2 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>¡Factura enviada!</span>
            </button>
            <div *ngIf="errorEnvioFactura" class="text-red-500 text-center mt-2">{{errorEnvioFactura}}</div>
          </form>
        </div>
      </div>
      <div *ngIf="cargando" class="text-center py-8">Cargando carrito...</div>
    </div>
  `,
})
export class CarritoComponent implements OnInit {
  carrito: Carrito | null = null;
  cargando = true;
  userId: string | null = null;
  mostrarCheckout = false;
  checkoutData = { nombre: '', email: '', direccion: '' };
  enviadoResumen: any = null;
  enviadoError: any = null;
  enviadoLoading = false;
  enviadoSuccess = false;
  submitted = false;
  enviandoFactura = false;
  facturaEnviada = false;
  errorEnvioFactura = '';

  constructor(
    private carritoService: CarritoService, 
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios de usuario
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userId = user.id;
        console.log('🔄 Carrito actualizado para usuario:', this.userId);
        // Esperar a que el token esté disponible antes de cargar el carrito
        this.esperarTokenYRecargarCarrito();
      } else {
        this.userId = null;
        console.log('🔄 Carrito limpiado, usuario no autenticado');
        this.carrito = null;
      }
    });
    // Suscribirse una sola vez al estado global del carrito
    this.carritoService.carrito$.subscribe({
      next: (carrito) => {
        console.log('🛒 Componente carrito recibió actualización:', carrito);
        this.carrito = carrito
          ? { ...carrito, items: Array.isArray(carrito.items) ? carrito.items : [] }
          : { items: [] } as any;
        console.log('📦 Carrito procesado en componente:', this.carrito);
        console.log('📋 Items en carrito:', this.carrito?.items?.length || 0);
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error cargando carrito:', error);
        this.cargando = false;
      }
    });
  }

  // Espera a que el shell envíe el token antes de recargar el carrito
  private esperarTokenYRecargarCarrito(): void {
    if (!this.userId) return;
    let intentos = 0;
    const intentar = () => {
      intentos++;
      let tokenRecibido = false;
      const tokenListener = (event: MessageEvent) => {
        if (event.data && event.data.type === 'AUTH_TOKEN_RESPONSE' && event.data.token) {
          tokenRecibido = true;
          window.removeEventListener('message', tokenListener);
          this.carritoService.getAll(this.userId!).subscribe();
        }
      };
      window.addEventListener('message', tokenListener);
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, '*');
      }
      setTimeout(() => {
        window.removeEventListener('message', tokenListener);
        if (!tokenRecibido && intentos < 3) {
          intentar();
        } else if (!tokenRecibido) {
          console.warn('No se pudo obtener el token tras varios intentos.');
        }
      }, 1000);
    };
    intentar();
  }

  async enviarFactura(): Promise<void> {
    this.submitted = true;
    this.errorEnvioFactura = '';
    this.enviandoFactura = true;

    if (!this.checkoutData.nombre || !this.checkoutData.email || !this.checkoutData.direccion) {
      this.errorEnvioFactura = 'Por favor completa todos los campos.';
      this.enviandoFactura = false;
      return;
    }

    if (!this.carrito || !this.carrito.items || this.carrito.items.length === 0) {
      this.errorEnvioFactura = 'El carrito está vacío.';
      this.enviandoFactura = false;
      return;
    }

    if (!this.userId) {
      this.errorEnvioFactura = 'Usuario no autenticado.';
      this.enviandoFactura = false;
      return;
    }

    try {
      // Crear el pedido usando el servicio de carrito
      const pedidoCreado = await this.carritoService.crearPedidoDesdeCarrito(
        this.carrito,
        this.checkoutData
      );
      
      console.log('✅ Pedido creado exitosamente:', pedidoCreado);

      // Mostrar mensaje de éxito
      this.facturaEnviada = true;
      
      // Limpiar el carrito después de crear el pedido
      if (this.carrito && this.carrito.id) {
        this.carritoService.clear(this.carrito.id, this.userId).subscribe({
          next: () => {
            console.log('🧹 Carrito limpiado después de crear pedido');
          },
          error: (error) => {
            console.error('❌ Error limpiando carrito:', error);
          }
        });
      }

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        this.cerrarCheckout();
      }, 2000);

    } catch (error) {
      console.error('❌ Error creando pedido:', error);
      this.errorEnvioFactura = 'Error al procesar el pedido. Por favor, intenta de nuevo.';
    } finally {
      this.enviandoFactura = false;
    }
  }

  cerrarCheckout(): void {
    this.mostrarCheckout = false;
    this.checkoutData = { nombre: '', email: '', direccion: '' };
    this.submitted = false;
    this.enviandoFactura = false;
    this.facturaEnviada = false;
    this.errorEnvioFactura = '';
  }

  actualizarCantidad(idCarrito: string, idProducto: string, nuevaCantidad: number): void {
    if (!this.carrito || !this.userId) return;
    if (nuevaCantidad < 1) {
      this.eliminarItem(idCarrito, idProducto);
      return;
    }
    this.carritoService.updateCantidad(idCarrito, idProducto, nuevaCantidad, this.userId).subscribe({
      error: (error) => {
        alert('Error al actualizar cantidad: ' + error.message);
      }
    });
  }

  eliminarItem(idCarrito: string, idProducto: string): void {
    if (!this.carrito || !this.userId) return;
    this.carritoService.delete(idCarrito, idProducto, this.userId).subscribe({
      next: (carrito) => {
        console.log('✅ Producto eliminado correctamente. Carrito actualizado:', carrito);
        this.carrito = carrito;
        // Feedback visual opcional
        // alert('Producto eliminado del carrito');
      },
      error: (error) => {
        alert('Error al eliminar producto: ' + error.message);
      },
      complete: () => {
        // Forzar recarga visual
        this.cdr?.markForCheck && this.cdr.markForCheck();
      }
    });
  }

  procederCheckout(): void {
    alert('Funcionalidad de checkout en desarrollo. Por favor, contacta al administrador.');
  }

  irATienda(): void {
    // Enviar mensaje al shell para navegar al catálogo
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'NAVIGATE_TO',
        route: '/catalogo'
      }, '*');
    } else {
      // Fallback: navegar dentro del iframe
      this.router.navigate(['/catalogo']);
    }
  }

  limpiarCarrito(): void {
    if (!this.carrito || !this.carrito.id || !this.userId) {
      console.error('No se puede limpiar el carrito: id no disponible o usuario no autenticado');
      return;
    }
    this.carritoService.clear(this.carrito.id, this.userId).subscribe({
      next: (carrito) => {
        console.log('✅ Carrito vaciado correctamente:', carrito);
        this.carrito = carrito;
        // Feedback visual opcional
        // alert('Carrito vaciado');
      },
      error: (error) => {
        console.error('Error limpiando carrito:', error);
        alert('Error limpiando carrito: ' + error.message);
      },
      complete: () => {
        this.cdr?.markForCheck && this.cdr.markForCheck();
      }
    });
  }


  trackById(index: number, item: any) {
    return item.id;
  }

  aplicarCupon(codigo: string): void {
    if (!codigo.trim()) {
      alert('Por favor ingresa un código de cupón');
      return;
    }
    
    // TODO: Implementar lógica de cupones
    console.log('Aplicando cupón:', codigo);
    alert(`Cupón ${codigo} aplicado (funcionalidad en desarrollo)`);
  }
}
