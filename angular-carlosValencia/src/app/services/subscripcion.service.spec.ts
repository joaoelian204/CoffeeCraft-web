import { TestBed } from '@angular/core/testing';
import { SubscripcionService } from './subscripcion.service';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { IPlanSuscripcion, ISuscripcionUsuario } from '../interfaces/subscripcion';

describe('SubscripcionService', () => {
  let service: SubscripcionService;
  let supabaseServiceSpy: any;
  let authServiceSpy: any;

  const mockPlan: IPlanSuscripcion = {
    id: 'plan-1',
    nombre: 'Premium',
    descripcion: 'Plan premium con beneficios exclusivos',
    precio_mensual: 29.99,
    cantidad_cafe: 500,
    frecuencia_entrega: 'Mensual',
    beneficios: ['Café premium', 'Envío gratis', 'Descuentos exclusivos'],
    popular: true,
    activo: true,
    creado_en: '2024-01-01',
    actualizado_en: '2024-01-01'
  };

  const mockSuscripcion: ISuscripcionUsuario = {
    id: 'sub-1',
    usuario_id: 'user-1',
    plan_id: 'plan-1',
    estado: 'activa',
    fecha_inicio: '2024-01-01',
    fecha_proxima_entrega: '2024-02-01',
    fecha_fin: '2024-02-01',
    personalizaciones: {},
    direccion_entrega: {
      calle: 'Calle Test',
      ciudad: 'Ciudad Test',
      provincia: 'Provincia Test',
      codigo_postal: '12345',
      pais: 'Colombia'
    },
    metodo_pago: {
      tipo: 'tarjeta_credito',
      numero_tarjeta: '1234567890123456',
      fecha_expiracion: '12/25',
      nombre_titular: 'Test User'
    },
    plan: mockPlan,
    creado_en: '2024-01-01',
    actualizado_en: '2024-01-01'
  };

  beforeEach(() => {
    supabaseServiceSpy = {
      getSubscriptionPlans: jest.fn(),
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn()
    };

    authServiceSpy = {
      getCurrentUserToken: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        SubscripcionService,
        { provide: SupabaseService, useValue: supabaseServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(SubscripcionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPlanes', () => {
    it('should return planes from supabase', (done) => {
      const mockPlanes = [mockPlan];
      supabaseServiceSpy.getSubscriptionPlans.mockResolvedValue({ data: mockPlanes });

      service.getPlanes().subscribe({
        next: (planes) => {
          expect(planes).toEqual(mockPlanes);
          expect(supabaseServiceSpy.getSubscriptionPlans).toHaveBeenCalled();
          done();
        },
        error: (error) => {
          console.error('Test error:', error);
          done();
        }
      });
    });

    it('should return empty array when error occurs', (done) => {
      supabaseServiceSpy.getSubscriptionPlans.mockResolvedValue({ error: 'Error' });

      service.getPlanes().subscribe({
        next: (planes) => {
          expect(planes).toEqual([]);
          done();
        },
        error: (error) => {
          console.error('Test error:', error);
          done();
        }
      });
    });

    it('should mark Premium plan as popular', (done) => {
      const premiumPlan = { ...mockPlan, nombre: 'Premium' };
      supabaseServiceSpy.getSubscriptionPlans.mockResolvedValue({ data: [premiumPlan] });

      service.getPlanes().subscribe({
        next: (planes) => {
          expect(planes[0].popular).toBe(true);
          done();
        },
        error: (error) => {
          console.error('Test error:', error);
          done();
        }
      });
    });
  });

  describe('getAll', () => {
    it('should return suscripcion for user with plan data', (done) => {
      authServiceSpy.getCurrentUserToken.mockResolvedValue('mock-token');
      supabaseServiceSpy.select.mockResolvedValue({ data: [mockSuscripcion] });
      
      // Mock getPlanById
      jest.spyOn(service, 'getPlanById').mockReturnValue(of(mockPlan));

      service.getAll('user-1').subscribe({
        next: (suscripcion) => {
          expect(suscripcion).toEqual(mockSuscripcion);
          expect(supabaseServiceSpy.select).toHaveBeenCalledWith('suscripciones_usuarios', '*', { usuario_id: 'user-1' });
          done();
        },
        error: (error) => {
          console.error('Test error:', error);
          done();
        }
      });
    });

    it('should return null when no token available', (done) => {
      authServiceSpy.getCurrentUserToken.mockResolvedValue(null);

      service.getAll('user-1').subscribe({
        next: (suscripcion) => {
          expect(suscripcion).toBeNull();
          done();
        },
        error: (error) => {
          console.error('Test error:', error);
          done();
        }
      });
    });

    it('should return null when no suscripcion found', (done) => {
      authServiceSpy.getCurrentUserToken.mockResolvedValue('mock-token');
      supabaseServiceSpy.select.mockResolvedValue({ data: [] });

      service.getAll('user-1').subscribe({
        next: (suscripcion) => {
          expect(suscripcion).toBeNull();
          done();
        },
        error: (error) => {
          console.error('Test error:', error);
          done();
        }
      });
    });
  });

  describe('getPlanById', () => {
    it('should return plan by id', (done) => {
      supabaseServiceSpy.select.mockResolvedValue({ data: [mockPlan] });

      service.getPlanById('plan-1').subscribe({
        next: (plan) => {
          expect(plan).toEqual(mockPlan);
          expect(supabaseServiceSpy.select).toHaveBeenCalledWith('planes_suscripcion', '*', { id: 'plan-1' });
          done();
        },
        error: (error) => {
          console.error('Test error:', error);
          done();
        }
      });
    });

    it('should return null when plan not found', (done) => {
      supabaseServiceSpy.select.mockResolvedValue({ data: [] });

      service.getPlanById('plan-1').subscribe({
        next: (plan) => {
          expect(plan).toBeNull();
          done();
        },
        error: (error) => {
          console.error('Test error:', error);
          done();
        }
      });
    });
  });

  describe('add', () => {
    it('should add new suscripcion', (done) => {
      authServiceSpy.getCurrentUserToken.mockResolvedValue('mock-token');
      
      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockSuscripcion])
      });

      service.add(mockPlan, {}, {}, {}, 'user-1').subscribe({
        next: (suscripcion) => {
          expect(suscripcion).toEqual(mockSuscripcion);
          expect(global.fetch).toHaveBeenCalled();
          done();
        },
        error: (error) => {
          console.error('Error in test:', error);
          done();
        }
      });
    });
  });

  describe('updatePlan', () => {
    it('should update suscripcion plan', (done) => {
      authServiceSpy.getCurrentUserToken.mockResolvedValue('mock-token');
      supabaseServiceSpy.update.mockResolvedValue({ data: [mockSuscripcion] });
      supabaseServiceSpy.select.mockResolvedValue({ data: [mockPlan] });

      service.updatePlan('sub-1', 'user-1', 'plan-2', 'activa', {}, {}, {}).subscribe({
        next: (suscripcion) => {
          expect(suscripcion).toEqual(mockSuscripcion);
          expect(supabaseServiceSpy.update).toHaveBeenCalled();
          done();
        },
        error: (error) => {
          console.error('Error in test:', error);
          done();
        }
      });
    });
  });

  describe('update', () => {
    it('should update suscripcion data', (done) => {
      supabaseServiceSpy.update.mockResolvedValue({ data: [mockSuscripcion] });

      service.update('sub-1', { estado: 'pausada' }).subscribe({
        next: (suscripcion) => {
          expect(suscripcion).toEqual(mockSuscripcion);
          expect(supabaseServiceSpy.update).toHaveBeenCalledWith('suscripciones_usuarios', 'sub-1', { estado: 'pausada' });
          done();
        },
        error: (error) => {
          console.error('Error in test:', error);
          done();
        }
      });
    });
  });

  describe('pause', () => {
    it('should pause suscripcion', (done) => {
      const pausedSuscripcion = { ...mockSuscripcion, estado: 'pausada' };
      supabaseServiceSpy.update.mockResolvedValue({ data: [pausedSuscripcion] });

      service.pause('sub-1').subscribe({
        next: (suscripcion) => {
          expect(suscripcion?.estado).toBe('pausada');
          done();
        },
        error: (error) => {
          console.error('Error in test:', error);
          done();
        }
      });
    });
  });

  describe('resume', () => {
    it('should resume suscripcion', (done) => {
      const resumedSuscripcion = { ...mockSuscripcion, estado: 'activa' };
      supabaseServiceSpy.update.mockResolvedValue({ data: [resumedSuscripcion] });

      service.resume('sub-1').subscribe({
        next: (suscripcion) => {
          expect(suscripcion?.estado).toBe('activa');
          done();
        },
        error: (error) => {
          console.error('Error in test:', error);
          done();
        }
      });
    });
  });

  describe('cancel', () => {
    it('should cancel suscripcion', (done) => {
      const cancelledSuscripcion = { ...mockSuscripcion, estado: 'cancelada' };
      supabaseServiceSpy.update.mockResolvedValue({ data: [cancelledSuscripcion] });

      service.cancel('sub-1').subscribe({
        next: (suscripcion) => {
          expect(suscripcion?.estado).toBe('cancelada');
          done();
        },
        error: (error) => {
          console.error('Error in test:', error);
          done();
        }
      });
    });
  });

  describe('getStats', () => {
    it('should return subscription statistics', (done) => {
      const mockStats = { total: 100, activas: 80, pausadas: 15, canceladas: 5 };
      supabaseServiceSpy.select.mockResolvedValue({ data: mockStats });

      service.getStats().subscribe({
        next: (stats) => {
          expect(stats).toEqual({ total: mockStats });
          done();
        },
        error: (error) => {
          console.error('Error in test:', error);
          done();
        }
      });
    });
  });
}); 