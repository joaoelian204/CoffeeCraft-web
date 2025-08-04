import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { IPlanSuscripcion, ISuscripcionUsuario } from '../interfaces/subscripcion';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SubscripcionService {
  private suscripcionUsuarioSubject = new BehaviorSubject<ISuscripcionUsuario | null>(null);
  public suscripcionUsuario$ = this.suscripcionUsuarioSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  // Obtener todos los planes de suscripción
  getPlanes(): Observable<IPlanSuscripcion[]> {
    return new Observable<IPlanSuscripcion[]>(observer => {
      this.supabaseService.getSubscriptionPlans().then(({ data, error }) => {
        if (error) {
          console.error('Error obteniendo planes:', error);
          observer.next([]);
        } else {
          const planes = (data || []).map((plan: any) => ({
          ...plan,
            beneficios: Array.isArray(plan.beneficios) ? plan.beneficios : [],
            popular: plan.nombre === 'Premium'
          }));
          observer.next(planes);
        }
        observer.complete();
      });
    }).pipe(
      catchError((error): Observable<IPlanSuscripcion[]> => {
        console.error('Error en getPlanes:', error);
        return of([]);
      })
    );
  }

  // Obtener la suscripción actual con datos completos del plan
  getAll(userId: string): Observable<ISuscripcionUsuario | null> {
    console.log('🔍 getAll() llamado para usuario:', userId);
    
    return new Observable<ISuscripcionUsuario | null>(observer => {
      // Verificar autenticación antes de hacer la consulta
      this.authService.getCurrentUserToken().then(token => {
        if (!token) {
          console.error('❌ No hay token de autenticación disponible');
          this.suscripcionUsuarioSubject.next(null);
          observer.next(null);
          observer.complete();
          return;
        }

        console.log('🔑 Token disponible, procediendo con consulta...');
        
        this.supabaseService.select('suscripciones_usuarios', '*', { usuario_id: userId })
          .then((response) => {
            console.log('📋 Respuesta completa de getAll():', response);
            
            if (!response) {
              console.error('❌ Respuesta nula de getAll');
              this.suscripcionUsuarioSubject.next(null);
              observer.next(null);
              observer.complete();
              return;
            }
            
            const { data, error } = response;
            
            if (error) {
              console.error('❌ Error en getAll:', error);
              this.suscripcionUsuarioSubject.next(null);
              observer.next(null);
              observer.complete();
              return;
            }

            if (!Array.isArray(data) || data.length === 0) {
              console.log('⚠️ No se encontraron suscripciones para el usuario');
              this.suscripcionUsuarioSubject.next(null);
              observer.next(null);
              observer.complete();
              return;
            }

            const suscripcion = data[0] as any;
            console.log('✅ Suscripción encontrada:', suscripcion);

            // Obtener los datos completos del plan
            this.getPlanById(suscripcion.plan_id).subscribe({
              next: (plan) => {
                console.log('📋 Plan obtenido:', plan);
                const suscripcionCompleta: ISuscripcionUsuario = {
                  ...suscripcion,
                  plan: plan || undefined
                };
                console.log('🎯 Suscripción completa creada:', suscripcionCompleta);
                this.suscripcionUsuarioSubject.next(suscripcionCompleta);
                observer.next(suscripcionCompleta);
                observer.complete();
              },
              error: (error) => {
                console.error('❌ Error obteniendo plan:', error);
                const suscripcionCompleta: ISuscripcionUsuario = {
                  ...suscripcion,
                  plan: undefined
                };
                this.suscripcionUsuarioSubject.next(suscripcionCompleta);
                observer.next(suscripcionCompleta);
                observer.complete();
              }
            });
          })
          .catch((error) => {
            console.error('❌ Error en promesa de getAll:', error);
            this.suscripcionUsuarioSubject.next(null);
            observer.next(null);
            observer.complete();
          });
      });
    }).pipe(
      catchError((error): Observable<ISuscripcionUsuario | null> => {
        console.error('❌ Error obteniendo suscripción:', error);
        this.suscripcionUsuarioSubject.next(null);
        return of(null);
      })
    );
  }

  // Obtener un plan específico por ID
  getPlanById(planId: string): Observable<IPlanSuscripcion | null> {
    return new Observable<IPlanSuscripcion | null>(observer => {
      this.supabaseService.select('planes_suscripcion', '*', { id: planId })
        .then(({ data, error }) => {
          if (error) {
            console.error('Error obteniendo plan por ID:', error);
            observer.next(null);
          } else if (data && data.length > 0) {
            const plan = data[0] as any;
            const planCompleto: IPlanSuscripcion = {
              ...plan,
              beneficios: Array.isArray(plan.beneficios) ? plan.beneficios : [],
              popular: plan.nombre === 'Premium'
            };
            observer.next(planCompleto);
          } else {
            observer.next(null);
          }
          observer.complete();
        });
    }).pipe(
      catchError((error): Observable<IPlanSuscripcion | null> => {
        console.error('Error en getPlanById:', error);
        return of(null);
      })
    );
  }

  // Agregar una nueva suscripción
  add(
    plan: IPlanSuscripcion,
    personalizaciones: any = {},
    direccion: any = {},
    metodoPago: any = {},
    userId: string
  ): Observable<ISuscripcionUsuario | null> {
    console.log('➕ add() llamado para usuario:', userId, 'plan:', plan.nombre);
    
    const suscripcionData = {
      usuario_id: userId,
      plan_id: plan.id,
      estado: 'activa',
      personalizaciones: personalizaciones || {},
      direccion_entrega: direccion || {},
      metodo_pago: metodoPago || {},
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_proxima_entrega: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    console.log('📝 Datos de suscripción a crear:', suscripcionData);

    return new Observable<ISuscripcionUsuario | null>(observer => {
      // Obtener token del shell
      this.authService.getCurrentUserToken().then(token => {
        if (!token) {
          console.error('❌ No hay token de autenticación disponible');
          observer.next(null);
          observer.complete();
          return;
        }

        console.log('🔑 Token disponible, usando fetch directo...');
        
        // Usar fetch directo con el token JWT
        const url = 'https://aydbyfxeudluyscfjxqp.supabase.co/rest/v1/suscripciones_usuarios?select=*';
        
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZGJ5ZnhldWRsdXlzY2ZqeHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NTY2NzAsImV4cCI6MjA2NzQzMjY3MH0.dH09IlJkCw5GuVeBan7JKXeQ-5mEV53CzfGTuKnazY8',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(suscripcionData)
        })
        .then(response => {
          console.log('📋 Respuesta fetch:', response.status, response.statusText);
          
          if (!response.ok) {
            return response.text().then(text => {
              console.error('❌ Error en respuesta fetch:', text);
              throw new Error(`HTTP ${response.status}: ${text}`);
            });
          }
          
          return response.json();
        })
        .then(data => {
          console.log('📋 Datos de respuesta fetch:', data);
          
          if (data && data.length > 0) {
            const nuevaSuscripcion = data[0] as any;
            const suscripcionCompleta: ISuscripcionUsuario = {
              ...nuevaSuscripcion,
              plan: plan
            };
            console.log('✅ Nueva suscripción creada:', suscripcionCompleta);
            this.suscripcionUsuarioSubject.next(suscripcionCompleta);
            observer.next(suscripcionCompleta);
          } else {
            console.warn('⚠️ No se recibieron datos en la respuesta');
            observer.next(null);
          }
          observer.complete();
        })
        .catch((error) => {
          console.error('❌ Error en fetch:', error);
          observer.next(null);
          observer.complete();
        });
      });
    }).pipe(
      catchError((error): Observable<ISuscripcionUsuario | null> => {
        console.error('❌ Error en add:', error);
        return of(null);
      })
    );
  }

  // Actualizar el plan de una suscripción existente
  updatePlan(
    subscriptionId: string,
    userId: string,
    planId: string,
    estado: string,
    personalizaciones: any,
    direccion: any,
    metodoPago: any
  ): Observable<ISuscripcionUsuario | null> {
    console.log('🔄 updatePlan() llamado para suscripción:', subscriptionId, 'nuevo plan:', planId);
    
    const updateData = {
      plan_id: planId,
      estado: estado,
      personalizaciones: personalizaciones || {},
      direccion_entrega: direccion || {},
      metodo_pago: metodoPago || {},
      actualizado_en: new Date().toISOString()
    };

    console.log('📝 Datos de actualización:', updateData);

    return new Observable<ISuscripcionUsuario | null>(observer => {
      this.supabaseService.update('suscripciones_usuarios', subscriptionId, updateData)
        .then(({ data, error }) => {
          console.log('📋 Respuesta de updatePlan():', { data, error });
          
          if (error) {
            console.error('❌ Error en updatePlan:', error);
            observer.next(null);
          } else if (data && data.length > 0) {
            const suscripcionActualizada = data[0] as any;
            console.log('✅ Suscripción actualizada:', suscripcionActualizada);
            
            // Obtener los datos completos del nuevo plan
            this.getPlanById(planId).subscribe({
              next: (plan) => {
                const suscripcionCompleta: ISuscripcionUsuario = {
                  ...suscripcionActualizada,
                  plan: plan || undefined
                };
                this.suscripcionUsuarioSubject.next(suscripcionCompleta);
                observer.next(suscripcionCompleta);
                observer.complete();
              },
              error: (error) => {
                console.error('❌ Error obteniendo plan actualizado:', error);
                const suscripcionCompleta: ISuscripcionUsuario = {
                  ...suscripcionActualizada,
                  plan: undefined
                };
                this.suscripcionUsuarioSubject.next(suscripcionCompleta);
                observer.next(suscripcionCompleta);
                observer.complete();
              }
            });
          } else {
            observer.next(null);
            observer.complete();
          }
        });
    }).pipe(
      catchError((error): Observable<ISuscripcionUsuario | null> => {
        console.error('❌ Error en updatePlan:', error);
        return of(null);
      })
    );
  }

  // Actualizar suscripción
  update(subscriptionId: string, data: Partial<ISuscripcionUsuario>): Observable<ISuscripcionUsuario | null> {
    return new Observable<ISuscripcionUsuario | null>(observer => {
      this.supabaseService.update('suscripciones_usuarios', subscriptionId, data)
        .then(({ data: result, error }) => {
          if (error) {
            console.error('Error actualizando suscripción:', error);
            observer.next(null);
          } else if (result && result.length > 0) {
            const suscripcionActualizada = result[0] as ISuscripcionUsuario;
            this.suscripcionUsuarioSubject.next(suscripcionActualizada);
            observer.next(suscripcionActualizada);
          } else {
            observer.next(null);
          }
          observer.complete();
        });
    }).pipe(
      catchError((error): Observable<ISuscripcionUsuario | null> => {
        console.error('Error en update:', error);
        return of(null);
      })
    );
  }

  // Pausar suscripción
  pause(subscriptionId: string): Observable<ISuscripcionUsuario | null> {
    return this.update(subscriptionId, { estado: 'pausada' });
  }

  // Reactivar suscripción
  resume(subscriptionId: string): Observable<ISuscripcionUsuario | null> {
    return this.update(subscriptionId, { estado: 'activa' });
  }

  // Cancelar suscripción
  cancel(subscriptionId: string): Observable<ISuscripcionUsuario | null> {
    return this.update(subscriptionId, { estado: 'cancelada' });
  }

  // Obtener estadísticas de suscripción (para futuras funcionalidades)
  getStats(): Observable<any> {
    return new Observable<any>(observer => {
      this.supabaseService.select('suscripciones_usuarios', 'count', {})
        .then(({ data, error }) => {
          if (error) {
            console.error('Error obteniendo estadísticas:', error);
            observer.next({});
          } else {
            observer.next({ total: data });
          }
          observer.complete();
        });
    }).pipe(
      catchError((error): Observable<any> => {
        console.error('Error en getStats:', error);
        return of({});
      })
    );
  }
}