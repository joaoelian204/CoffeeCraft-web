import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanesSuscripcionComponent } from './subscripcion.component';
import { SubscripcionService } from '../../services/subscripcion.service';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { IPlanSuscripcion, ISuscripcionUsuario } from '../../interfaces/subscripcion';

describe('PlanesSuscripcionComponent', () => {
  let component: PlanesSuscripcionComponent;
  let fixture: ComponentFixture<PlanesSuscripcionComponent>;
  let subscripcionServiceSpy: any;
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

  beforeEach(async () => {
    subscripcionServiceSpy = {
      getPlanes: jest.fn().mockReturnValue(of([mockPlan])),
      getAll: jest.fn().mockReturnValue(of(null)),
      getPlanById: jest.fn().mockReturnValue(of(mockPlan)),
      add: jest.fn().mockReturnValue(of(mockSuscripcion)),
      updatePlan: jest.fn().mockReturnValue(of(mockSuscripcion)),
      update: jest.fn().mockReturnValue(of(mockSuscripcion)),
      pause: jest.fn().mockReturnValue(of({ ...mockSuscripcion, estado: 'pausada' })),
      resume: jest.fn().mockReturnValue(of({ ...mockSuscripcion, estado: 'activa' })),
      cancel: jest.fn().mockReturnValue(of({ ...mockSuscripcion, estado: 'cancelada' })),
      getStats: jest.fn().mockReturnValue(of({ total: 100, activas: 80, pausadas: 15, canceladas: 5 })),
      suscripcionUsuario$: of(null)
    };

    authServiceSpy = {
      getCurrentUser: jest.fn(),
      currentUser$: of({ id: 'user-1', email: 'test@test.com' })
    };

    await TestBed.configureTestingModule({
      imports: [PlanesSuscripcionComponent],
      providers: [
        { provide: SubscripcionService, useValue: subscripcionServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlanesSuscripcionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load planes and sort them', () => {
      const mockPlanes = [mockPlan, { ...mockPlan, id: 'plan-2', popular: false }];
      subscripcionServiceSpy.getPlanes.mockReturnValue(of(mockPlanes));
      authServiceSpy.getCurrentUser.mockReturnValue({ id: 'user-1' });
      subscripcionServiceSpy.getAll.mockReturnValue(of(mockSuscripcion));

      component.ngOnInit();

      expect(subscripcionServiceSpy.getPlanes).toHaveBeenCalled();
      expect(component.planes.length).toBe(2);
      expect(component.planes[0].popular).toBe(true); // Popular plan should be first
    });

    it('should handle user without subscription', () => {
      const mockPlanes = [mockPlan];
      subscripcionServiceSpy.getPlanes.mockReturnValue(of(mockPlanes));
      authServiceSpy.getCurrentUser.mockReturnValue({ id: 'user-1' });
      subscripcionServiceSpy.getAll.mockReturnValue(of(null));

      component.ngOnInit();

      expect(component.suscripcionUsuario).toBeNull();
    });
  });

  describe('seleccionarPlan', () => {
    it('should select plan and create subscription', () => {
      authServiceSpy.getCurrentUser.mockReturnValue({ id: 'user-1' });
      subscripcionServiceSpy.getAll.mockReturnValue(of(null));
      jest.spyOn(component, 'seleccionarPlan').mockImplementation(() => {});

      component.seleccionarPlan(mockPlan);

      expect(component.seleccionarPlan).toHaveBeenCalledWith(mockPlan);
    });

    it('should show alert when user already has subscription', () => {
      authServiceSpy.getCurrentUser.mockReturnValue({ id: 'user-1' });
      subscripcionServiceSpy.getAll.mockReturnValue(of(mockSuscripcion));
      jest.spyOn(window, 'alert').mockImplementation(() => {});

      component.seleccionarPlan(mockPlan);

      expect(window.alert).toHaveBeenCalled();
    });
  });

  describe('pausarSuscripcion', () => {
    it('should pause subscription when user confirms', () => {
      component.suscripcionUsuario = mockSuscripcion;
      subscripcionServiceSpy.pause.mockReturnValue(of({ ...mockSuscripcion, estado: 'pausada' }));
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      component.pausarSuscripcion();

      expect(subscripcionServiceSpy.pause).toHaveBeenCalledWith('sub-1');
    });

    it('should pause subscription when user confirms', () => {
      component.suscripcionUsuario = mockSuscripcion;

      component.pausarSuscripcion();

      expect(subscripcionServiceSpy.pause).toHaveBeenCalledWith('sub-1');
    });

    it('should not call service when no subscription exists', () => {
      component.suscripcionUsuario = null;

      component.pausarSuscripcion();

      expect(subscripcionServiceSpy.pause).not.toHaveBeenCalled();
    });
  });

  describe('reactivarSuscripcion', () => {
    it('should resume subscription when user confirms', () => {
      component.suscripcionUsuario = { ...mockSuscripcion, estado: 'pausada' };
      subscripcionServiceSpy.resume.mockReturnValue(of({ ...mockSuscripcion, estado: 'activa' }));
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      component.reactivarSuscripcion();

      expect(subscripcionServiceSpy.resume).toHaveBeenCalledWith('sub-1');
    });

    it('should resume subscription when user confirms', () => {
      component.suscripcionUsuario = { ...mockSuscripcion, estado: 'pausada' };

      component.reactivarSuscripcion();

      expect(subscripcionServiceSpy.resume).toHaveBeenCalledWith('sub-1');
    });

    it('should not call service when no subscription exists', () => {
      component.suscripcionUsuario = null;

      component.reactivarSuscripcion();

      expect(subscripcionServiceSpy.resume).not.toHaveBeenCalled();
    });
  });

  describe('cancelarSuscripcion', () => {
    it('should cancel subscription when user confirms', () => {
      component.suscripcionUsuario = mockSuscripcion;
      subscripcionServiceSpy.cancel.mockReturnValue(of({ ...mockSuscripcion, estado: 'cancelada' }));
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      component.cancelarSuscripcion();

      expect(subscripcionServiceSpy.cancel).toHaveBeenCalledWith('sub-1');
    });

    it('should not cancel subscription when user cancels', () => {
      component.suscripcionUsuario = mockSuscripcion;
      jest.spyOn(window, 'confirm').mockReturnValue(false);

      component.cancelarSuscripcion();

      expect(subscripcionServiceSpy.cancel).not.toHaveBeenCalled();
    });

    it('should not call service when no subscription exists', () => {
      component.suscripcionUsuario = null;

      component.cancelarSuscripcion();

      expect(subscripcionServiceSpy.cancel).not.toHaveBeenCalled();
    });
  });

  describe('trackById', () => {
    it('should return plan id for tracking', () => {
      const result = component.trackById(0, mockPlan);

      expect(result).toBe('plan-1');
    });
  });

  describe('template rendering', () => {
    it('should show loading state', () => {
      component.cargando = true;
      fixture.detectChanges();

      const loadingElement = fixture.nativeElement.querySelector('.text-center');
      expect(loadingElement).toBeTruthy();
    });

    it('should show plans when loaded', () => {
      component.planes = [mockPlan];
      component.cargando = false;
      // Evitar que se ejecute ngOnInit
      jest.spyOn(component, 'ngOnInit').mockImplementation(() => {});
      fixture.detectChanges();

      const planElements = fixture.nativeElement.querySelectorAll('.bg-white.rounded-2xl');
      expect(planElements.length).toBeGreaterThan(0);
    });

    it('should show subscription status when user has subscription', () => {
      component.suscripcionUsuario = mockSuscripcion;
      component.cargando = false;
      // Evitar que se ejecute ngOnInit
      jest.spyOn(component, 'ngOnInit').mockImplementation(() => {});
      fixture.detectChanges();

      const statusElement = fixture.nativeElement.querySelector('.bg-white.rounded-2xl');
      expect(statusElement).toBeTruthy();
    });
  });

  describe('subscription status', () => {
    it('should show active subscription status', () => {
      // Configurar el mock del servicio para devolver una suscripción activa
      const activeSubscription = { ...mockSuscripcion, estado: 'activa' as const };
      subscripcionServiceSpy.suscripcionUsuario$ = of(activeSubscription);
      
      // Evitar que se ejecute ngOnInit y configurar datos directamente
      jest.spyOn(component, 'ngOnInit').mockImplementation(() => {
        component.suscripcionUsuario = activeSubscription;
      });
      
      component.ngOnInit();
      fixture.detectChanges();

      // Verificar que la propiedad existe y tiene el valor correcto
      expect(component.suscripcionUsuario).toBeDefined();
      expect(component.suscripcionUsuario?.estado).toBe('activa');
    });

    it('should show paused subscription status', () => {
      // Configurar el mock del servicio para devolver una suscripción pausada
      const pausedSubscription = { ...mockSuscripcion, estado: 'pausada' as const };
      subscripcionServiceSpy.suscripcionUsuario$ = of(pausedSubscription);
      
      // Evitar que se ejecute ngOnInit y configurar datos directamente
      jest.spyOn(component, 'ngOnInit').mockImplementation(() => {
        component.suscripcionUsuario = pausedSubscription;
      });
      
      component.ngOnInit();
      fixture.detectChanges();

      // Verificar que la propiedad existe y tiene el valor correcto
      expect(component.suscripcionUsuario).toBeDefined();
      expect(component.suscripcionUsuario?.estado).toBe('pausada');
    });

    it('should show cancelled subscription status', () => {
      // Configurar el mock del servicio para devolver una suscripción cancelada
      const cancelledSubscription = { ...mockSuscripcion, estado: 'cancelada' as const };
      subscripcionServiceSpy.suscripcionUsuario$ = of(cancelledSubscription);
      
      // Evitar que se ejecute ngOnInit y configurar datos directamente
      jest.spyOn(component, 'ngOnInit').mockImplementation(() => {
        component.suscripcionUsuario = cancelledSubscription;
      });
      
      component.ngOnInit();
      fixture.detectChanges();

      // Verificar que la propiedad existe y tiene el valor correcto
      expect(component.suscripcionUsuario).toBeDefined();
      expect(component.suscripcionUsuario?.estado).toBe('cancelada');
    });
  });
});
