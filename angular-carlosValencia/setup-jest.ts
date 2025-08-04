import 'zone.js';
import 'zone.js/testing';

// Configuración global para Jest con Angular
Object.defineProperty(window, 'CSS', { value: null });

Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance'],
      getPropertyValue: () => {
        return '';
      },
    };
  },
});

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>',
});

Object.defineProperty(window, 'matchMedia', {
  value: () => {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    };
  },
});

Object.defineProperty(window, 'ResizeObserver', {
  value: () => {
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {},
    };
  },
});

Object.defineProperty(window, 'IntersectionObserver', {
  value: () => {
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {},
    };
  },
});

// Mock para postMessage
Object.defineProperty(window, 'postMessage', {
  value: jest.fn(),
  writable: true,
});

// Mock para alert y confirm
Object.defineProperty(window, 'alert', {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(window, 'confirm', {
  value: jest.fn(),
  writable: true,
});

// Mock para localStorage
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

// Mock para sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Mock para fetch API
Object.defineProperty(window, 'fetch', {
  value: jest.fn(),
  writable: true,
});

// Mock para XMLHttpRequest
Object.defineProperty(window, 'XMLHttpRequest', {
  value: jest.fn(() => ({
    open: jest.fn(),
    send: jest.fn(),
    setRequestHeader: jest.fn(),
    readyState: 4,
    status: 200,
    responseText: '{}',
    response: '{}',
  })),
  writable: true,
});

// Mock para URL API
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn(),
  },
  writable: true,
});

// Mock para FileReader
Object.defineProperty(window, 'FileReader', {
  value: jest.fn(() => ({
    readAsText: jest.fn(),
    readAsDataURL: jest.fn(),
    result: '',
    onload: null,
    onerror: null,
  })),
  writable: true,
});

// Mock para console para evitar ruido en las pruebas
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
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
});

// Inicializar el entorno de pruebas de Angular
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { DatePipe } from '@angular/common';

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Configurar providers globales para pipes
TestBed.configureTestingModule({
  providers: [
    DatePipe
  ]
}); 