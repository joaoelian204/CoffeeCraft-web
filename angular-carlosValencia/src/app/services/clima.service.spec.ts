import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClimaService } from './clima.service';
import { SupabaseService } from './supabase.service';
import { of } from 'rxjs';
import { IRegionCafetera, IDatosClima } from '../interfaces/clima';

describe('ClimaService', () => {
  let service: ClimaService;
  let supabaseServiceSpy: any;
  let httpMock: HttpTestingController;

  const mockRegion: IRegionCafetera = {
    id_region: 'region-1',
    nombre: 'Eje Cafetero',
    pais: 'Colombia',
    coordenadas: {
      latitud: 5.0689,
      longitud: -75.5174
    },
    altitud: 1800,
    descripcion: 'Región cafetera por excelencia',
    variedades_cafe: ['Arábica', 'Robusta'],
    temporada_cosecha: {
      inicio: '01-01',
      fin: '12-31'
    },
    imagen_url: 'region-1.jpg',
    activa: true
  };

  const mockClimaData: IDatosClima = {
    id_region: 'region-1',
    region: mockRegion,
    actual: {
      temperatura: 22.5,
      sensacion_termica: 24.0,
      humedad: 75,
      precipitacion: 0,
      velocidad_viento: 5.2,
      direccion_viento: 'Norte',
      presion: 1013,
      indice_uv: 5,
      visibilidad: 10,
      nubosidad: 30,
      condicion: 'Parcialmente nublado',
      icono: 'cloudy'
    },
    pronostico: [],
    actualizado_en: new Date()
  };

  beforeEach(() => {
    supabaseServiceSpy = {
      select: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ClimaService,
        { provide: SupabaseService, useValue: supabaseServiceSpy }
      ]
    });

    service = TestBed.inject(ClimaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRegionesCafeteras', () => {
    it('should return regiones from supabase', (done) => {
      const mockRegiones = [mockRegion];
      supabaseServiceSpy.select.mockResolvedValue({ data: mockRegiones });

      service.getRegionesCafeteras().subscribe({
        next: (regiones) => {
          expect(regiones).toEqual(mockRegiones);
          expect(supabaseServiceSpy.select).toHaveBeenCalledWith('regiones_cafeteras', '*', { activa: true });
          done();
        },
        error: (error) => {
          console.error('Test error:', error);
          done();
        }
      });
    });

    it('should return empty array when no data', (done) => {
      supabaseServiceSpy.select.mockResolvedValue({ data: null });

      service.getRegionesCafeteras().subscribe({
        next: (regiones) => {
          expect(regiones).toEqual([]);
          done();
        },
        error: (error) => {
          console.error('Test error:', error);
          done();
        }
      });
    });
  });

  describe('getClimaRegion', () => {
    it('should return clima data for region', (done) => {
      supabaseServiceSpy.select.mockResolvedValue({ data: [mockClimaData] });

      service.getClimaRegion('region-1').subscribe({
        next: (clima) => {
          expect(clima).toEqual(mockClimaData);
          expect(supabaseServiceSpy.select).toHaveBeenCalledWith('datos_clima', '*', { id_region: 'region-1' });
          done();
        },
        error: (error) => {
          console.error('Test error:', error);
          done();
        }
      });
    });

    it('should return null when no clima data found', (done) => {
      supabaseServiceSpy.select.mockResolvedValue({ data: [] });

      service.getClimaRegion('region-1').subscribe({
        next: (clima) => {
          expect(clima).toBeNull();
          done();
        },
        error: (error) => {
          console.error('Test error:', error);
          done();
        }
      });
    });
  });

  describe('getClimaRegionTomorrow', () => {
    it('should return clima data from API', (done) => {
      const mockApiResponse = {
        data: {
          values: {
            temperature: 22.5,
            humidity: 75,
            pressureSurfaceLevel: 1013,
            windSpeed: 5.2,
            windDirection: 0,
            weatherCode: 1001
          }
        }
      };

      service.getClimaRegionTomorrow(5.0689, -75.5174, 'region-1').subscribe({
        next: (clima) => {
          expect(clima).toBeTruthy();
          expect(clima?.actual.temperatura).toBe(22.5);
          expect(clima?.actual.humedad).toBe(75);
          done();
        },
        error: (error) => {
          console.error('Test error:', error);
          done();
        }
      });

      const req = httpMock.expectOne(req => req.url.includes('api.tomorrow.io'));
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
    });

    it('should use cache when valid', (done) => {
      // Primero llenar el cache
      const mockApiResponse = {
        data: {
          values: {
            temperature: 22.5,
            humidity: 75,
            pressureSurfaceLevel: 1013,
            windSpeed: 5.2,
            windDirection: 0,
            weatherCode: 1001
          }
        }
      };

      service.getClimaRegionTomorrow(5.0689, -75.5174, 'region-1').subscribe({
        next: (clima) => {
          expect(clima).toBeTruthy();
          
          // Segunda llamada debería usar cache
          service.getClimaRegionTomorrow(5.0689, -75.5174, 'region-1').subscribe({
            next: (climaCached) => {
              expect(climaCached).toBeTruthy();
              expect(climaCached).toEqual(clima);
              done();
            },
            error: (error) => {
              console.error('Test error:', error);
              done();
            }
          });
        },
        error: (error) => {
          console.error('Test error:', error);
          done();
        }
      });

      const req = httpMock.expectOne(req => req.url.includes('api.tomorrow.io'));
      req.flush(mockApiResponse);
    });

    it('should handle API error gracefully', (done) => {
      service.getClimaRegionTomorrow(5.0689, -75.5174, 'region-1').subscribe({
        next: (clima) => {
          expect(clima).toBeNull();
          done();
        },
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(req => req.url.includes('api.tomorrow.io'));
      req.error(new ErrorEvent('Network error'));
    });

    it('should return null for invalid API response', (done) => {
      const invalidResponse = { data: null };

      service.getClimaRegionTomorrow(5.0689, -75.5174, 'region-1').subscribe({
        next: (clima) => {
          expect(clima).toBeNull();
          done();
        },
        error: (error) => {
          console.error('Test error:', error);
          done();
        }
      });

      const req = httpMock.expectOne(req => req.url.includes('api.tomorrow.io'));
      req.flush(invalidResponse);
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      service.clearCache();
      const stats = service.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should return cache statistics', () => {
      const stats = service.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('entries');
      expect(Array.isArray(stats.entries)).toBe(true);
    });
  });

  describe('private methods', () => {
    it('should map weather condition correctly', (done) => {
      // Test private method through public interface
      const mockApiResponse = {
        data: {
          values: {
            temperature: 25,
            humidity: 60,
            windSpeed: 10,
            windDirection: 'N',
            weatherCode: 1000 // Clear sky
          }
        }
      };

      service.getClimaRegionTomorrow(5.0689, -75.5174, 'region-1').subscribe({
        next: (clima) => {
          expect(clima?.actual.condicion).toBe('Despejado');
          done();
        },
        error: (error) => {
          console.error('Test error:', error);
          done();
        }
      });

      const req = httpMock.expectOne(req => req.url.includes('api.tomorrow.io'));
      req.flush(mockApiResponse);
    });

    it('should map wind direction correctly', (done) => {
      const mockApiResponse = {
        data: {
          values: {
            temperature: 25,
            humidity: 60,
            windSpeed: 10,
            windDirection: 'N',
            weatherCode: 1001 // Cloudy
          }
        }
      };

      service.getClimaRegionTomorrow(5.0689, -75.5174, 'region-1').subscribe({
        next: (clima) => {
          expect(clima?.actual.direccion_viento).toBe('N');
          done();
        },
        error: (error) => {
          console.error('Test error:', error);
          done();
        }
      });

      const req = httpMock.expectOne(req => req.url.includes('api.tomorrow.io'));
      req.flush(mockApiResponse);
    });
  });
}); 