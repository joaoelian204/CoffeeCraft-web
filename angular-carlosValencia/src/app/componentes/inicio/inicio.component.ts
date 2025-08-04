import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IProducto } from '../../interfaces/carrito';
import { CarritoService, AuthService } from '../../services';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-16 px-8">
      <div class="max-w-6xl mx-auto text-center">
        <!-- Indicador de usuario -->
        <div class="mb-8 p-4 bg-white rounded-lg shadow-md inline-block">
          <ng-container *ngIf="currentUser$ | async as user; else noUser">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                👤
              </div>
              <div class="text-left">
                <div class="font-semibold text-gray-800">{{ user.user_metadata?.full_name || user.user_metadata?.name || (user.email ? user.email.split('@')[0] : 'Usuario') }}</div>
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </div>
            </div>
          </ng-container>
          <ng-template #noUser>
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm">
                👤
              </div>
              <div class="text-left">
                <div class="font-semibold text-gray-600">No autenticado</div>
                <div class="text-sm text-gray-400">Inicia sesión en el shell</div>
              </div>
            </div>
          </ng-template>
        </div>

        <h1 class="text-5xl font-bold mb-4 text-[#654321]">Bienvenido a CoffeCraft</h1>
        <p class="text-xl text-gray-600 mb-12">Tu experiencia premium de café personalizada</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div *ngFor="let producto of productos" class="bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-[#8B4513] flex flex-col items-center transition-transform hover:-translate-y-2 hover:shadow-2xl relative group">
            <img [src]="producto.imagen_url" [alt]="producto.nombre" class="w-44 h-44 object-cover rounded-xl mb-4 shadow-md border border-gray-200 group-hover:scale-105 transition-transform duration-300" />
            <h3 class="text-2xl font-extrabold mb-2 text-[#654321] tracking-tight">{{ producto.nombre }}</h3>
            <p class="text-gray-700 mb-2 text-base">{{ producto.descripcion }}</p>
            <span class="text-xs text-gray-500 mb-2 uppercase tracking-wider">Origen: {{ producto.origen }}</span>
            <span *ngIf="producto.oferta" class="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">OFERTA</span>
            <span class="text-2xl font-bold text-[#8B4513] mb-4">{{ producto.precio | currency:'USD' }}</span>
            <button class="px-8 py-3 rounded-lg font-bold bg-gradient-to-r from-[#8B4513] to-[#654321] text-white hover:from-[#654321] hover:to-[#8B4513] shadow-lg mt-auto transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:ring-offset-2 focus:bg-[#654321] focus:text-white active:scale-95" (click)="agregarProductoAlCarrito(producto)">
              <span class="inline-block align-middle">+ Agregar al carrito</span>
            </button>
          </div>
        </div>
        <div *ngIf="mensajeExito" class="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce flex items-center gap-2">
          <span class="text-2xl">✅</span> {{ mensajeExito }}
        </div>
      </div>
    </div>
  `
})
export class InicioComponent implements OnInit {
  productos: IProducto[] = [];
  mensajeExito: string | null = null;

  constructor(
    private carritoService: CarritoService,
    private authService: AuthService
  ) {}

  get currentUser$() {
    return this.authService.currentUser$;
  }

  ngOnInit() {
    this.carritoService.getProductos().subscribe({
      next: (productos) => {
        console.log('Productos recibidos:', productos);
        this.productos = productos;
      },
      error: (err) => console.error('Error al obtener productos:', err)
    });
  }

  agregarProductoAlCarrito(producto: IProducto): void {
    // Obtener userId del servicio de autenticación
    const userId = this.authService.getCurrentUserId();
    
    if (!userId) {
      this.mensajeExito = 'Debes iniciar sesión para agregar productos al carrito';
      setTimeout(() => this.mensajeExito = null, 3000);
      return;
    }
    
    console.log('🛒 Agregando producto al carrito para usuario:', userId);
    
    this.carritoService.add(producto, 1, userId).subscribe({
      next: () => {
        this.carritoService.getAll(userId).subscribe();
        this.mensajeExito = `¡${producto.nombre} agregado al carrito!`;
        setTimeout(() => this.mensajeExito = null, 2000);
      },
      error: (error) => {
        this.mensajeExito = 'Error al agregar al carrito';
        setTimeout(() => this.mensajeExito = null, 2000);
        console.error('Error agregando producto:', error);
      }
    });
  }
} 