import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CarritoService } from './services/carrito.service';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  protected titulo = 'CoffeCraft - Carlos Valencia';
  protected isMicrofrontend = false;
  private userSub: Subscription | undefined;

  constructor(
    private carritoService: CarritoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Detectar si está en modo microfrontend
    this.isMicrofrontend = window.location.search.includes('microfrontend=true');

    // Refrescar carrito al iniciar si el usuario está autenticado
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.carritoService.forceRefreshCarrito(userId);
    }

    // Suscribirse a cambios de usuario para refrescar el carrito automáticamente
    this.userSub = this.authService.currentUser$.subscribe(user => {
      if (user && user.id) {
        this.carritoService.forceRefreshCarrito(user.id);
      } else {
        // Si el usuario se desloguea, limpiar el carrito
        this.carritoService.forceRefreshCarrito('');
      }
    });
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
  }
}
