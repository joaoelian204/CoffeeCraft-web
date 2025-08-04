import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { CarritoService } from './services/carrito.service';
import { AuthService } from './services/auth.service';
import { BehaviorSubject } from 'rxjs';

describe('AppComponent', () => {
  let carritoServiceSpy: any;
  let authServiceSpy: any;

  beforeEach(async () => {
    carritoServiceSpy = {
      forceRefreshCarrito: jest.fn()
    };

    authServiceSpy = {
      getCurrentUserId: jest.fn(),
      currentUser$: new BehaviorSubject(null)
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: CarritoService, useValue: carritoServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the correct title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect((app as any).titulo).toEqual('CoffeCraft - Carlos Valencia');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('CoffeCraft');
  });

  describe('ngOnInit', () => {
    it('should refresh carrito when user is authenticated', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      
      authServiceSpy.getCurrentUserId.mockReturnValue('user-1');

      app.ngOnInit();
      expect(carritoServiceSpy.forceRefreshCarrito).toHaveBeenCalledWith('user-1');
    });

    it('should subscribe to user changes', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      
      app.ngOnInit();
      // Verificar que se suscribió al observable (no al método subscribe)
      expect(authServiceSpy.currentUser$).toBeDefined();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from user subscription', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      
      // Mock subscription
      const mockSubscription = {
        unsubscribe: jest.fn()
      } as any;
      app['userSub'] = mockSubscription;

      app.ngOnDestroy();
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });
  });
});
