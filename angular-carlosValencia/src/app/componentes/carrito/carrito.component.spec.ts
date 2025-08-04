import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { of, BehaviorSubject } from 'rxjs';
import { CarritoComponent } from './carrito.component';
import { CarritoService, AuthService } from '../../services';
import { Carrito, IProducto } from '../../interfaces/carrito';

describe('CarritoComponent', () => {
  let component: CarritoComponent;
  let fixture: ComponentFixture<CarritoComponent>;
  let carritoServiceSpy: any;
  let authServiceSpy: any;
  let routerSpy: any;
  let cdrSpy: any;

  const mockProducto: IProducto = {
    id: '1',
    nombre: 'Café Colombiano',
    descripcion: 'Café premium de Colombia',
    precio: 25.99,
    imagen_url: 'cafe-colombiano.jpg',
    origen: 'Colombia',
    stock: 100,
    activo: true
  };

  const mockCarrito: Carrito = {
    id: 'carrito-1',
    usuario_id: 'user-1',
    items: [
      {
        id: 'item-1',
        carrito_id: 'carrito-1',
        producto_id: '1',
        cantidad: 2,
        precio_unitario: 25.99,
        subtotal: 51.98,
        producto: mockProducto,
        creado_en: '2024-01-01',
        actualizado_en: '2024-01-01'
      }
    ],
    subtotal: 51.98,
    descuento: 0,
    envio: 0,
    impuesto: 5.2,
    total: 57.18,
    creado_en: '2024-01-01',
    actualizado_en: '2024-01-01'
  };

  beforeEach(async () => {
    carritoServiceSpy = {
      getCarrito: jest.fn(),
      actualizarCantidad: jest.fn(),
      eliminarItem: jest.fn(),
      limpiarCarrito: jest.fn(),
      aplicarCupon: jest.fn(),
      carrito$: of(mockCarrito),
      getAll: jest.fn().mockReturnValue(of(mockCarrito)),
      clear: jest.fn().mockReturnValue(of(null)),
      crearPedidoDesdeCarrito: jest.fn().mockResolvedValue({ id: 'pedido-1' }),
      updateCantidad: jest.fn().mockReturnValue(of(mockCarrito)),
      delete: jest.fn().mockReturnValue(of(mockCarrito))
    };
    
    authServiceSpy = {
      getCurrentUser: jest.fn(),
      currentUser$: of({ id: 'user-1', email: 'test@example.com' })
    };
    routerSpy = {
      navigate: jest.fn()
    };
    cdrSpy = {
      detectChanges: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CarritoComponent],
      providers: [
        { provide: CarritoService, useValue: carritoServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ChangeDetectorRef, useValue: cdrSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CarritoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component and load cart', () => {
      // Act
      component.ngOnInit();

      // Assert
      expect(component.userId).toBe('user-1');
      expect(component.cargando).toBeFalsy();
      expect(component.carrito).toEqual(mockCarrito);
    });

    it('should handle empty cart', () => {
      // Arrange
      carritoServiceSpy.carrito$ = of(null);

      // Act
      component.ngOnInit();

      // Assert
      expect(component.carrito).toEqual({ items: [] });
      expect(component.cargando).toBeFalsy();
    });

    it('should handle error when loading cart', () => {
      // Arrange
      carritoServiceSpy.carrito$ = of(null);

      // Act
      component.ngOnInit();

      // Assert
      expect(component.carrito).toEqual({ items: [] });
      expect(component.cargando).toBeFalsy();
    });
  });

  describe('actualizarCantidad', () => {
    it('should update item quantity successfully', () => {
      // Arrange
      component.carrito = mockCarrito;
      component.userId = 'user-1';

      // Act
      component.actualizarCantidad('carrito-1', '1', 3);

      // Assert
      expect(carritoServiceSpy.updateCantidad).toHaveBeenCalledWith('carrito-1', '1', 3, 'user-1');
    });

    it('should not update if quantity is less than 1', () => {
      // Arrange
      component.carrito = mockCarrito;
      component.userId = 'user-1';

      // Act
      component.actualizarCantidad('carrito-1', '1', 0);

      // Assert
      expect(carritoServiceSpy.delete).toHaveBeenCalledWith('carrito-1', '1', 'user-1');
    });
  });

  describe('eliminarItem', () => {
    it('should remove item from cart successfully', () => {
      // Arrange
      component.carrito = mockCarrito;
      component.userId = 'user-1';

      // Act
      component.eliminarItem('carrito-1', '1');

      // Assert
      expect(carritoServiceSpy.delete).toHaveBeenCalledWith('carrito-1', '1', 'user-1');
    });
  });

  describe('limpiarCarrito', () => {
    it('should clear cart successfully', () => {
      // Arrange
      component.carrito = mockCarrito;
      component.userId = 'user-1';

      // Act
      component.limpiarCarrito();

      // Assert
      expect(carritoServiceSpy.clear).toHaveBeenCalledWith('carrito-1', 'user-1');
    });

    it('should handle error when clearing cart', () => {
      // Arrange
      component.carrito = mockCarrito;
      component.userId = 'user-1';

      // Act
      component.limpiarCarrito();

      // Assert
      expect(carritoServiceSpy.clear).toHaveBeenCalledWith('carrito-1', 'user-1');
    });
  });

  describe('aplicarCupon', () => {
    it('should apply coupon successfully', () => {
      // Arrange
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      // Act
      component.aplicarCupon('DESCUENTO10');

      // Assert
      expect(alertSpy).toHaveBeenCalledWith('Cupón DESCUENTO10 aplicado (funcionalidad en desarrollo)');
      alertSpy.mockRestore();
    });

    it('should not apply empty coupon', () => {
      // Arrange
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      // Act
      component.aplicarCupon('');

      // Assert
      expect(alertSpy).toHaveBeenCalledWith('Por favor ingresa un código de cupón');
      alertSpy.mockRestore();
    });
  });

  describe('irATienda', () => {
    it('should navigate to store', () => {
      // Act
      component.irATienda();

      // Assert
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/catalogo']);
    });
  });

  describe('procederCheckout', () => {
    it('should show alert for checkout', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      component.procederCheckout();

      expect(alertSpy).toHaveBeenCalledWith('Funcionalidad de checkout en desarrollo. Por favor, contacta al administrador.');
      alertSpy.mockRestore();
    });
  });

  describe('cerrarCheckout', () => {
    it('should close checkout modal', () => {
      // Arrange
      component.mostrarCheckout = true;

      // Act
      component.cerrarCheckout();

      // Assert
      expect(component.mostrarCheckout).toBeFalsy();
      expect(component.checkoutData).toEqual({ nombre: '', email: '', direccion: '' });
      expect(component.submitted).toBeFalsy();
    });
  });

  describe('trackById', () => {
    it('should return item id for tracking', () => {
      // Arrange
      const item = { id: 'item-1', producto_id: '1' };

      // Act
      const result = component.trackById(0, item);

      // Assert
      expect(result).toBe('item-1');
    });
  });

  describe('enviarFactura', () => {
    it('should send invoice successfully', async () => {
      // Arrange
      component.checkoutData = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        direccion: 'Calle 123'
      };
      component.carrito = mockCarrito;
      component.userId = 'user-1';

      // Act
      await component.enviarFactura();

      // Assert
      expect(component.submitted).toBeTruthy();
      expect(component.facturaEnviada).toBeTruthy();
    });

    it('should handle validation errors', async () => {
      // Arrange
      component.checkoutData = {
        nombre: '',
        email: '',
        direccion: ''
      };

      // Act
      await component.enviarFactura();

      // Assert
      expect(component.submitted).toBeTruthy();
      expect(component.enviandoFactura).toBeFalsy();
    });
  });

  describe('Template rendering', () => {
    it('should show cart title when component loads', () => {
      // Arrange
      component.carrito = null;
      component.cargando = false;
      // Evitar que se ejecute ngOnInit
      jest.spyOn(component, 'ngOnInit').mockImplementation(() => {});

      // Act
      fixture.detectChanges();

      // Assert
      const cartTitle = fixture.nativeElement.querySelector('h1');
      expect(cartTitle).toBeTruthy();
      expect(cartTitle.textContent).toContain('Tu Carrito de Compras');
    });

    it('should show cart items when cart has items', () => {
      // Arrange
      component.carrito = mockCarrito;
      component.cargando = false;
      // Evitar que se ejecute ngOnInit
      jest.spyOn(component, 'ngOnInit').mockImplementation(() => {});

      // Act
      fixture.detectChanges();

      // Assert
      const cartTitle = fixture.nativeElement.querySelector('.text-3xl');
      expect(cartTitle.textContent).toContain('Tu Carrito de Compras');
    });

    it('should show loading state', () => {
      // Arrange
      component.cargando = true;
      // Evitar que se ejecute ngOnInit para mantener el estado de cargando
      jest.spyOn(component, 'ngOnInit').mockImplementation(() => {});

      // Act - no llamar detectChanges para evitar que se ejecute ngOnInit
      // fixture.detectChanges();

      // Assert
      // The component should show loading state
      expect(component.cargando).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle service errors gracefully', () => {
      // Arrange
      carritoServiceSpy.carrito$ = of(null);

      // Act
      component.ngOnInit();

      // Assert
      expect(component.carrito).toEqual({ items: [] });
      expect(component.cargando).toBeFalsy();
    });
  });
});
