import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { IDatosClima, IRegionCafetera } from '../../interfaces/clima';
import { ClimaService } from '../../services';

@Component({
  selector: 'app-clima',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Clima Cafetero
          </h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Condiciones meteorológicas en tiempo real de las principales regiones productoras de café del mundo
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="cargando" class="flex justify-center items-center py-20">
          <div class="text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600 text-lg">Obteniendo datos meteorológicos...</p>
            <p class="text-xs text-gray-400 mt-2">Estado: {{ cargando ? 'Cargando' : 'Completado' }}</p>
          </div>
        </div>

        <!-- Weather Cards Grid -->
        <div *ngIf="!cargando" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            *ngFor="let region of regiones; trackBy: trackById" 
            class="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            (click)="seleccionarRegion(region.id_region)"
          >
            <!-- Region Header -->
            <div class="p-6 pb-4">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ region.nombre }}</h3>
                  <p class="text-gray-500 flex items-center gap-2">
                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                    {{ region.pais }}
                  </p>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-500">{{ region.altitud }}m</div>
                  <div class="text-xs text-gray-400">altitud</div>
                </div>
              </div>
              
              <!-- Coffee Varieties -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span 
                  *ngFor="let variedad of region.variedades_cafe" 
                  class="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200"
                >
                  {{ variedad }}
                </span>
              </div>
            </div>

            <!-- Weather Data -->
            <div *ngIf="datosClima[region.id_region]" class="px-6 pb-6">
              <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4">
                <!-- Main Weather Info -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="text-4xl">
                      {{ getWeatherIcon(datosClima[region.id_region].actual.condicion) }}
                    </div>
                    <div>
                      <div class="text-3xl font-bold text-gray-900">
                        {{ datosClima[region.id_region].actual.temperatura.toFixed(1) }}°C
                      </div>
                      <div class="text-sm text-gray-600">
                        {{ datosClima[region.id_region].actual.condicion }}
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-gray-500">Sensación</div>
                    <div class="text-lg font-semibold text-gray-700">
                      {{ datosClima[region.id_region].actual.sensacion_termica.toFixed(1) }}°C
                    </div>
                  </div>
                </div>

                <!-- Weather Details Grid -->
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div class="flex items-center gap-2">
                    <span class="text-blue-500">💧</span>
                    <span class="text-gray-600">Humedad</span>
                    <span class="font-semibold text-gray-900 ml-auto">
                      {{ datosClima[region.id_region].actual.humedad.toFixed(0) }}%
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-500">🌧️</span>
                    <span class="text-gray-600">Lluvia</span>
                    <span class="font-semibold text-gray-900 ml-auto">
                      {{ datosClima[region.id_region].actual.precipitacion.toFixed(1) }}mm
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-500">💨</span>
                    <span class="text-gray-600">Viento</span>
                    <span class="font-semibold text-gray-900 ml-auto">
                      {{ datosClima[region.id_region].actual.velocidad_viento.toFixed(1) }} km/h
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-500">👁️</span>
                    <span class="text-gray-600">Visibilidad</span>
                    <span class="font-semibold text-gray-900 ml-auto">
                      {{ datosClima[region.id_region].actual.visibilidad.toFixed(1) }} km
                    </span>
                  </div>
                </div>
              </div>

              <!-- Update Time -->
              <div class="text-xs text-gray-400 text-center">
                Actualizado: {{ datosClima[region.id_region].actualizado_en | date:'HH:mm' }}
              </div>
            </div>

            <!-- Loading Weather State -->
            <div *ngIf="!datosClima[region.id_region] && !errores[region.id_region]" class="px-6 pb-6">
              <div class="bg-gray-50 rounded-xl p-4 text-center">
                <div class="animate-pulse">
                  <div class="h-8 bg-gray-200 rounded mb-2"></div>
                  <div class="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </div>
              </div>
            </div>

            <!-- Error State -->
            <div *ngIf="errores[region.id_region]" class="px-6 pb-6">
              <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <div class="text-red-500 mb-2">⚠️</div>
                <div class="text-sm text-red-600">Error al cargar datos</div>
                <button 
                  (click)="recargarClima(region.id_region); $event.stopPropagation()"
                  class="mt-2 text-xs text-red-500 hover:text-red-700 underline"
                >
                  Reintentar
                </button>
              </div>
            </div>

            <!-- Hover Effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300 pointer-events-none"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!cargando && regiones.length === 0" class="text-center py-20">
          <div class="text-6xl mb-4">☕</div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">No hay regiones disponibles</h3>
          <p class="text-gray-600">No se encontraron regiones cafeteras para mostrar.</p>
        </div>

        <!-- Refresh Button -->
        <div *ngIf="!cargando" class="text-center mt-12">
          <button 
            (click)="recargarTodo()"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span class="text-lg">🔄</span>
            Actualizar datos
          </button>
        </div>
      </div>
    </div>
  `
})
export class ClimaComponent implements OnInit, OnDestroy {
  regiones: IRegionCafetera[] = [
    {
      id_region: '1',
      nombre: 'Antioquia',
      pais: 'Colombia',
      coordenadas: { latitud: 6.25184, longitud: -75.56359 },
      altitud: 1500,
      descripcion: 'Región cafetera de Antioquia',
      variedades_cafe: ['Caturra', 'Castillo'],
      temporada_cosecha: { inicio: '03-01', fin: '06-30' },
      imagen_url: '',
      activa: true
    },
    {
      id_region: '2',
      nombre: 'Chiapas',
      pais: 'México',
      coordenadas: { latitud: 16.7569, longitud: -93.1292 },
      altitud: 1200,
      descripcion: 'Región cafetera de Chiapas',
      variedades_cafe: ['Bourbon', 'Typica'],
      temporada_cosecha: { inicio: '11-01', fin: '03-31' },
      imagen_url: '',
      activa: true
    },
    {
      id_region: '3',
      nombre: 'Tarrazú',
      pais: 'Costa Rica',
      coordenadas: { latitud: 9.656, longitud: -84.021 },
      altitud: 1600,
      descripcion: 'Región cafetera de Tarrazú',
      variedades_cafe: ['Caturra', 'Catuai'],
      temporada_cosecha: { inicio: '12-01', fin: '03-31' },
      imagen_url: '',
      activa: true
    },
    {
      id_region: '4',
      nombre: 'Yirgacheffe',
      pais: 'Etiopía',
      coordenadas: { latitud: 6.162, longitud: 38.205 },
      altitud: 1800,
      descripcion: 'Región cafetera de Yirgacheffe',
      variedades_cafe: ['Heirloom'],
      temporada_cosecha: { inicio: '10-01', fin: '01-31' },
      imagen_url: '',
      activa: true
    },
    {
      id_region: '5',
      nombre: 'Sidamo',
      pais: 'Etiopía',
      coordenadas: { latitud: 6.9147, longitud: 39.1377 },
      altitud: 1700,
      descripcion: 'Región cafetera de Sidamo',
      variedades_cafe: ['Heirloom'],
      temporada_cosecha: { inicio: '10-01', fin: '01-31' },
      imagen_url: '',
      activa: true
    }
  ];
  
  datosClima: { [regionId: string]: IDatosClima } = {};
  errores: { [regionId: string]: boolean } = {};
  private _cargando = true;
  private destroy$ = new Subject<void>();

  constructor(
    private climaService: ClimaService,
    private cdr: ChangeDetectorRef
  ) {}

  get cargando(): boolean {
    return this._cargando;
  }

  set cargando(value: boolean) {
    console.log('🔄 Cambiando estado cargando de', this._cargando, 'a', value);
    this._cargando = value;
    this.cdr.detectChanges(); // Forzar detección de cambios
  }

  ngOnInit(): void {
    this.cargarClimaParaTodas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarClimaParaTodas(): void {
    this.cargando = true;
    this.errores = {};
    
    console.log('=== INICIANDO CARGA DE CLIMA ===');
    console.log('Regiones a cargar:', this.regiones.length);
    console.log('Regiones:', this.regiones);
    
    // Timeout de seguridad para evitar que se quede colgado
    setTimeout(() => {
      if (this.cargando) {
        console.warn('⚠️ TIMEOUT ALCANZADO - Forzando fin de carga');
        this.cargando = false;
        // Cargar datos mock como fallback
        // this.cargarDatosMock(); // Eliminado
      }
    }, 5000); // 5 segundos de timeout
    
    let peticionesCompletadas = 0;
    const totalPeticiones = this.regiones.length;
    
    this.regiones.forEach((region, index) => {
      const { latitud, longitud } = region.coordenadas;
      console.log(`🌍 [${index + 1}/${totalPeticiones}] Cargando clima para ${region.nombre} (${latitud}, ${longitud})`);
      
      this.climaService.getClimaRegionTomorrow(latitud, longitud, region.id_region)
        .pipe(
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (data) => {
            console.log(`📊 Datos recibidos para ${region.nombre}:`, data);
            if (data) {
              data.id_region = region.id_region;
              data.region = region;
              this.datosClima[region.id_region] = data;
              console.log(`✅ Datos guardados para ${region.nombre}`);
            } else {
              console.warn(`⚠️ No se recibieron datos para ${region.nombre}`);
            }
          },
          error: (error) => {
            console.error(`❌ Error cargando clima para ${region.nombre}:`, error);
            this.errores[region.id_region] = true;
          },
          complete: () => {
            peticionesCompletadas++;
            console.log(`✅ [${peticionesCompletadas}/${totalPeticiones}] Finalizada petición para ${region.nombre}`);
            
            if (peticionesCompletadas === totalPeticiones) {
              console.log('🎉 TODAS LAS PETICIONES COMPLETADAS');
              this.cargando = false;
              console.log('Estado cargando actualizado a:', this.cargando);
              console.log('Datos del clima cargados:', this.datosClima);
            }
          }
        });
    });
  }

  recargarClima(regionId: string): void {
    const region = this.regiones.find(r => r.id_region === regionId);
    if (!region) return;

    delete this.errores[regionId];
    delete this.datosClima[regionId];

    const { latitud, longitud } = region.coordenadas;
    this.climaService.getClimaRegionTomorrow(latitud, longitud, regionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data) {
            data.id_region = regionId;
            data.region = region;
            this.datosClima[regionId] = data;
          }
        },
        error: (error) => {
          console.error(`Error recargando clima para ${region.nombre}:`, error);
          this.errores[regionId] = true;
        }
      });
  }

  recargarTodo(): void {
    this.climaService.clearCache();
    this.cargarClimaParaTodas();
  }

  seleccionarRegion(idRegion: string): void {
    console.log('Región seleccionada:', idRegion);
    // Aquí puedes agregar lógica para mostrar más detalles de la región
  }

  getWeatherIcon(condition: string): string {
    const iconMap: { [key: string]: string } = {
      'Despejado': '☀️',
      'Nublado': '☁️',
      'Lluvia': '🌧️',
      'Llovizna': '🌦️',
      'Tormenta': '⛈️',
      'Niebla': '🌫️',
      'Bruma': '🌫️'
    };
    return iconMap[condition] || '🌤️';
  }

  trackById(index: number, region: IRegionCafetera) {
    return region.id_region;
  }
}

