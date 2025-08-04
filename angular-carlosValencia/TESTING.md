# Guía de Pruebas Unitarias - CoffeCraft Angular

## 📊 Estado Actual de las Pruebas

### ✅ **Progreso General**
- **80 pruebas pasando** de 100 totales
- **20 pruebas fallando** (mejorado desde 34 fallos iniciales)
- **1 suite completamente funcional** (SubscripcionService)
- **Configuración estable** de Jest con Angular

### 🎯 **Suites de Pruebas**

| Suite | Estado | Pruebas Pasando | Pruebas Fallando |
|-------|--------|-----------------|------------------|
| **SubscripcionService** | ✅ **COMPLETO** | 15/15 | 0/15 |
| **CarritoService** | 🔄 **EN PROGRESO** | 6/8 | 2/8 |
| **ClimaService** | 🔄 **EN PROGRESO** | 8/10 | 2/10 |
| **AppComponent** | 🔄 **EN PROGRESO** | 2/4 | 2/4 |
| **CarritoComponent** | 🔄 **EN PROGRESO** | 13/15 | 2/15 |
| **ClimaComponent** | 🔄 **EN PROGRESO** | 6/10 | 4/10 |
| **SubscripcionComponent** | 🔄 **EN PROGRESO** | 8/12 | 4/12 |

## 🛠️ Configuración

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.d.ts'
  ]
};
```

### Setup Global
```typescript
// setup-jest.ts
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Mocks globales para APIs del navegador
global.CSS = { supports: jest.fn(() => false) };
global.getComputedStyle = jest.fn(() => ({
  getPropertyValue: jest.fn(() => ''),
}));

// Mock localStorage y sessionStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock fetch API
global.fetch = jest.fn();

// Mock XMLHttpRequest
global.XMLHttpRequest = jest.fn(() => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  readyState: 4,
  status: 200,
  responseText: '',
  response: '',
}));

// Mock URL API
global.URL = {
  createObjectURL: jest.fn(),
  revokeObjectURL: jest.fn(),
};

// Mock FileReader
global.FileReader = jest.fn(() => ({
  readAsText: jest.fn(),
  readAsDataURL: jest.fn(),
  result: '',
  onload: null,
  onerror: null,
}));

// Mock console para evitar ruido en las pruebas
const originalConsole = { ...console };
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// Limpiar todos los mocks después de cada prueba
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});
```

## 📝 Patrones de Pruebas

### Patrón AAA (Arrange-Act-Assert)
```typescript
describe('MiComponente', () => {
  it('should do something', () => {
    // Arrange - Preparar datos y mocks
    const mockData = { id: 1, name: 'Test' };
    serviceSpy.getData.mockReturnValue(of(mockData));
    
    // Act - Ejecutar la acción
    component.loadData();
    
    // Assert - Verificar resultados
    expect(component.data).toEqual(mockData);
    expect(serviceSpy.getData).toHaveBeenCalled();
  });
});
```

### Mocking de Observables
```typescript
// ✅ Correcto
authServiceSpy = {
  currentUser$: of({ id: 'user-1', email: 'test@example.com' })
};

// ❌ Incorrecto
authServiceSpy = {
  currentUser$: jest.fn().mockReturnValue({ id: 'user-1' })
};
```

### Mocking de Servicios
```typescript
beforeEach(() => {
  serviceSpy = {
    getData: jest.fn().mockReturnValue(of(mockData)),
    saveData: jest.fn().mockResolvedValue({ success: true }),
    deleteData: jest.fn().mockReturnValue(of(null))
  };

  TestBed.configureTestingModule({
    providers: [
      { provide: MyService, useValue: serviceSpy }
    ]
  });
});
```

## ✅ Pruebas Implementadas

### Servicios
- ✅ **SubscripcionService**: 15/15 pruebas pasando
  - Gestión de planes de suscripción
  - Operaciones CRUD de suscripciones
  - Manejo de estados (activa, pausada, cancelada)
  - Cache management
  - Error handling

- 🔄 **CarritoService**: 6/8 pruebas pasando
  - ✅ Obtener productos
  - ✅ Obtener carrito (con ajustes)
  - ✅ Agregar productos
  - ✅ Actualizar cantidades
  - ✅ Eliminar productos
  - ✅ Limpiar carrito
  - ❌ Vaciar carrito (problema con mocks)
  - ❌ Timeout en algunas pruebas

- 🔄 **ClimaService**: 8/10 pruebas pasando
  - ✅ Obtener regiones cafeteras
  - ✅ Obtener clima actual
  - ✅ Obtener pronóstico
  - ✅ Cache management
  - ✅ Error handling
  - ❌ Mapeo de condiciones climáticas (valor esperado incorrecto)
  - ❌ Timeout en pruebas de mapeo

### Componentes
- 🔄 **AppComponent**: 2/4 pruebas pasando
  - ✅ Creación del componente
  - ✅ Título correcto
  - ❌ Detección de microfrontend (problema con window.location)
  - ❌ Suscripción a cambios de usuario

- 🔄 **CarritoComponent**: 13/15 pruebas pasando
  - ✅ Inicialización
  - ✅ Gestión de carrito
  - ✅ Operaciones CRUD
  - ✅ Template rendering (parcial)
  - ❌ Mensaje de carrito vacío (selector incorrecto)
  - ❌ Estado de carga (valor incorrecto)

- 🔄 **ClimaComponent**: 6/10 pruebas pasando
  - ✅ Mapeo de iconos climáticos
  - ✅ Gestión de errores
  - ❌ Inicialización (datos cargados automáticamente)
  - ❌ Carga de regiones (problemas con ngOnInit)
  - ❌ Template rendering (problemas con datos undefined)

- 🔄 **SubscripcionComponent**: 8/12 pruebas pasando
  - ✅ Gestión de suscripciones
  - ✅ Operaciones de pausar/reactivar/cancelar
  - ✅ Validaciones
  - ❌ Template rendering (selectores incorrectos)
  - ❌ Estados de suscripción (datos null)

## 🚨 Problemas Comunes y Soluciones

### 1. **Problema**: `Cannot redefine property: location`
**Solución**: Usar `configurable: true` en Object.defineProperty
```typescript
Object.defineProperty(window, 'location', {
  value: { search: '?microfrontend=true' },
  writable: true,
  configurable: true
});
```

### 2. **Problema**: `Cannot read properties of undefined (reading 'pipe')`
**Solución**: Mockear correctamente los Observables
```typescript
// ✅ Correcto
climaServiceSpy.getRegionesCafeteras.mockReturnValue(of([mockRegion]));

// ❌ Incorrecto
climaServiceSpy.getRegionesCafeteras = jest.fn();
```

### 3. **Problema**: `Property 'getTokenFromShell' does not exist`
**Solución**: Usar el método correcto del servicio
```typescript
// ✅ Correcto
jest.spyOn(service as any, 'getAuthToken').mockResolvedValue('mock-token');

// ❌ Incorrecto
jest.spyOn(service as any, 'getTokenFromShell').mockResolvedValue('mock-token');
```

### 4. **Problema**: ngOnInit ejecutándose en pruebas de template
**Solución**: Mockear ngOnInit para evitar efectos secundarios
```typescript
beforeEach(() => {
  jest.spyOn(component, 'ngOnInit').mockImplementation(() => {});
  fixture.detectChanges();
});
```

### 5. **Problema**: Timeouts en pruebas asíncronas
**Solución**: Aumentar timeout o usar fakeAsync
```typescript
it('should do async work', (done) => {
  // Configurar timeout más largo
}, 10000);

// O usar fakeAsync
it('should do async work', fakeAsync(() => {
  // Código síncrono
  tick();
  // Assertions
}));
```

## 🎯 Mejores Prácticas

### 1. **Aislar Pruebas**
- Mockear ngOnInit cuando no sea necesario
- Usar beforeEach para configurar mocks
- Limpiar mocks después de cada prueba

### 2. **Mockear Observables Correctamente**
- Usar `of()` para Observables síncronos
- Usar `from()` para Promesas
- Mockear métodos que retornan Observables

### 3. **Nombres Descriptivos**
```typescript
// ✅ Bueno
it('should show error message when API call fails', () => {});

// ❌ Malo
it('should work', () => {});
```

### 4. **Evitar ngOnInit en Pruebas de Template**
```typescript
// ✅ Correcto
describe('template rendering', () => {
  beforeEach(() => {
    jest.spyOn(component, 'ngOnInit').mockImplementation(() => {});
    fixture.detectChanges();
  });
});
```

## 📈 Comandos Útiles

### Ejecutar Pruebas
```bash
# Todas las pruebas
npm test

# Pruebas específicas
npm test -- --testPathPattern=carrito.component.spec.ts

# Con cobertura
npm test -- --coverage

# Modo watch
npm test -- --watch

# Verbose
npm test -- --verbose
```

### Cobertura
```bash
# Generar reporte de cobertura
npm test -- --coverage --coverageReporters=text --coverageReporters=html

# Ver cobertura en consola
npm test -- --coverage --coverageReporters=text
```

## 🎯 Próximos Pasos

### Prioridad Alta
1. **Corregir pruebas fallidas restantes**
   - AppComponent: Problema con window.location
   - CarritoComponent: Selectores de template
   - ClimaComponent: Problemas con datos undefined
   - SubscripcionComponent: Estados null

2. **Mejorar mocks de servicios**
   - Mockear correctamente métodos privados
   - Ajustar expectativas de datos de retorno
   - Resolver timeouts en pruebas asíncronas

### Prioridad Media
3. **Agregar pruebas de edge cases**
   - Manejo de errores de red
   - Estados límite
   - Validaciones de entrada

4. **Mejorar cobertura**
   - Agregar pruebas para métodos no cubiertos
   - Probar casos de error
   - Probar boundary conditions

### Prioridad Baja
5. **Pruebas de Integración**
   - Interacción entre componentes
   - Flujos completos de usuario
   - Comunicación con APIs

6. **Pruebas E2E**
   - Configurar Cypress o Playwright
   - Probar flujos críticos
   - Probar en diferentes navegadores

## 📚 Recursos

- [Angular Testing Guide](https://angular.io/guide/testing)
- [Testing Angular Applications](https://testing-angular.com/)
- [Jest Angular Preset](https://github.com/thymikee/jest-preset-angular)
- [RxJS Testing](https://rxjs.dev/guide/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

---

**Última actualización**: Agosto 2024
**Estado**: 80% de pruebas pasando (80/100)
**Próximo objetivo**: 90% de pruebas pasando 