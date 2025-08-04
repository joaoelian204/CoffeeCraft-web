import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IPlanSuscripcion, ISuscripcionUsuario } from '../../interfaces/subscripcion';
import { SubscripcionService } from '../../services';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-planes-suscripcion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscripcion.component.html'
})
export class PlanesSuscripcionComponent implements OnInit {
  planes: IPlanSuscripcion[] = [];
  cargando = true;
  userId: string | null = null;
  suscripcionUsuario: ISuscripcionUsuario | null = null;

  constructor(
    private subscripcionService: SubscripcionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarPlanes();
    
    // Suscribirse a cambios de usuario autenticado
    this.authService.currentUser$.subscribe(user => {
      this.userId = user?.id || null;
      if (this.userId) {
        // Inicializa y suscríbete al estado global de la suscripción
        this.subscripcionService.getAll(this.userId).subscribe();
      }
    });
    
    this.subscripcionService.suscripcionUsuario$.subscribe({
      next: (suscripcion) => {
        this.suscripcionUsuario = suscripcion;
        console.log('📋 Suscripción actual:', suscripcion);
      }
    });
  }

  private cargarPlanes(): void {
    this.subscripcionService.getPlanes().subscribe({
      next: (planes) => {
        console.log('📋 Planes cargados:', planes);
        // Ordenar: premium (popular) al centro, básica a la izquierda, mejorado a la derecha
        if (planes.length === 3) {
          const popularIdx = planes.findIndex(p => p.popular);
          if (popularIdx !== -1) {
            // Reordenar: [básica, premium, mejorado]
            const premium = planes.splice(popularIdx, 1)[0];
            // Suponemos que la básica es la de menor precio y la mejorado la de mayor
            planes.sort((a, b) => a.precio_mensual - b.precio_mensual);
            this.planes = [planes[0], premium, planes[1]];
          } else {
            // Si no hay popular, solo ordena por precio
            this.planes = planes.sort((a, b) => a.precio_mensual - b.precio_mensual);
          }
        } else {
          // Si no son 3, solo ordena por precio
          this.planes = planes.sort((a, b) => a.precio_mensual - b.precio_mensual);
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando planes:', error);
        this.cargando = false;
      }
    });
  }

  seleccionarPlan(plan: IPlanSuscripcion): void {
    if (!this.userId) {
      window.alert('Debes iniciar sesión para suscribirte a un plan');
      return;
    }
    
    if (confirm(`¿Estás seguro de que quieres seleccionar el plan ${plan.nombre} por $${plan.precio_mensual}/mes?`)) {
      // Datos de ejemplo para la suscripción
      const personalizaciones = {
        nivel_tostado: 'Medio',
        tipo_molido: 'Molido fino',
        cantidad: '250g',
        preferencias: ['Chocolate', 'Caramelo']
      };
      
      const direccion = {
        calle: 'Calle Principal 123',
        ciudad: 'Ciudad',
        provincia: 'Provincia',
        codigo_postal: '12345',
        pais: 'País',
        predeterminada: true
      };
      
      const metodoPago = {
        tipo: 'tarjeta_credito' as const,
        numero_tarjeta: '**** **** **** 1234',
        fecha_expiracion: '12/25',
        nombre_titular: 'Usuario Demo',
        predeterminado: true
      };

      let subscriptionObservable: Observable<ISuscripcionUsuario | null>;

      console.log('🔍 Estado actual de suscripción:', {
        suscripcionUsuario: this.suscripcionUsuario,
        tieneId: this.suscripcionUsuario?.id,
        userId: this.userId
      });

      if (this.suscripcionUsuario && this.suscripcionUsuario.id) {
        // Si ya existe una suscripción, actualizarla
        console.log('🔄 Actualizando suscripción existente:', this.suscripcionUsuario.id, 'a plan:', plan.nombre);
        subscriptionObservable = this.subscripcionService.updatePlan(
          this.suscripcionUsuario.id, // ID de la suscripción existente
          this.userId,
          plan.id, // Nuevo plan ID
          'activa', // Establecer como activa
          personalizaciones,
          direccion,
          metodoPago
        );
      } else {
        // Si no existe suscripción, crear una nueva
        console.log('➕ Creando nueva suscripción para plan:', plan.nombre);
        subscriptionObservable = this.subscripcionService.add(plan, personalizaciones, direccion, metodoPago, this.userId);
      }

      subscriptionObservable.subscribe({
        next: (suscripcion) => {
          if (suscripcion) {
            window.alert(`¡Suscripción al plan ${plan.nombre} realizada con éxito!`);
            // Recargar la suscripción actual
            this.subscripcionService.getAll(this.userId!).subscribe();
          } else {
            window.alert('Error al seleccionar el plan. Inténtalo de nuevo.');
          }
        },
        error: (error) => {
          console.error('Error al seleccionar el plan:', error);
          window.alert('Error al seleccionar el plan. Consulta la consola para más detalles.');
        }
      });
    }
  }

  pausarSuscripcion(): void {
    if (this.suscripcionUsuario) {
      this.subscripcionService.pause(this.suscripcionUsuario.id).subscribe({
        next: () => {
          window.alert('Suscripción pausada exitosamente');
          // Recargar la suscripción actual
          if (this.userId) {
            this.subscripcionService.getAll(this.userId).subscribe();
          }
        },
        error: (error) => {
          console.error('Error pausando suscripción:', error);
          window.alert('Error al pausar la suscripción');
        }
      });
    }
  }

  reactivarSuscripcion(): void {
    if (this.suscripcionUsuario) {
      this.subscripcionService.resume(this.suscripcionUsuario.id).subscribe({
        next: () => {
          window.alert('Suscripción reactivada exitosamente');
          // Recargar la suscripción actual
          if (this.userId) {
            this.subscripcionService.getAll(this.userId).subscribe();
          }
        },
        error: (error) => {
          console.error('Error reactivando suscripción:', error);
          window.alert('Error al reactivar la suscripción');
        }
      });
    }
  }

  cancelarSuscripcion(): void {
    if (this.suscripcionUsuario) {
      if (confirm('¿Estás seguro de que quieres cancelar tu suscripción? Esta acción no se puede deshacer.')) {
        this.subscripcionService.cancel(this.suscripcionUsuario.id).subscribe({
          next: () => {
            window.alert('Suscripción cancelada exitosamente');
            // Recargar la suscripción actual
            if (this.userId) {
              this.subscripcionService.getAll(this.userId).subscribe();
            }
          },
          error: (error) => {
            console.error('Error cancelando suscripción:', error);
            window.alert('Error al cancelar la suscripción');
          }
        });
      }
    }
  }

  trackById(index: number, plan: IPlanSuscripcion) {
    return plan.id;
  }
}
