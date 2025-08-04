import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, from, throwError } from 'rxjs';
import { IRegionCafetera, IDatosClima } from '../interfaces/clima';
import { SupabaseService } from './supabase.service';
import { map, catchError, tap, shareReplay } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ClimaService {
  private regionesSubject = new BehaviorSubject<IRegionCafetera[]>([]);
  public regiones$ = this.regionesSubject.asObservable();
  
  // Cache para los datos del clima
  private climaCache = new Map<string, { data: IDatosClima; timestamp: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

  constructor(
    private supabaseService: SupabaseService,
    private http: HttpClient
  ) {}

  getRegionesCafeteras(): Observable<IRegionCafetera[]> {
    return from(this.supabaseService.select('regiones_cafeteras', '*', { activa: true })).pipe(
      map(res => Array.isArray(res.data) ? res.data as unknown as IRegionCafetera[] : [])
    );
  }

  getClimaRegion(idRegion: string): Observable<IDatosClima | null> {
    return from(this.supabaseService.select('datos_clima', '*', { id_region: idRegion })).pipe(
      map(res => Array.isArray(res.data) && res.data.length > 0 ? res.data[0] as unknown as IDatosClima : null)
    );
  }

  getClimaRegionTomorrow(lat: number, lon: number, regionId?: string): Observable<IDatosClima | null> {
    // Verificar cache
    if (regionId && this.isCacheValid(regionId)) {
      console.log(`Usando cache para región ${regionId}`);
      return of(this.climaCache.get(regionId)!.data);
    }

    // Usar coordenadas como location
    const url = `${environment.mateoBlue.baseUrl}?location=${lat},${lon}&apikey=${environment.mateoBlue.apiKey}`;
    console.log(`Haciendo petición a: ${url}`);
    
    const headers = {
      'accept': 'application/json'
    };
    
    return this.http.get<any>(url, { headers }).pipe(
      tap(response => {
        console.log('Respuesta completa de la API:', response);
      }),
      map(res => {
        if (!res || !res.data) {
          console.warn('Respuesta inválida de la API de clima:', res);
          return null;
        }
        
        console.log('Datos de la API encontrados:', res.data);
        const climaData = this.mapTomorrowResponseToClima(res, regionId);
        console.log('Datos mapeados:', climaData);
        
        // Guardar en cache
        if (regionId) {
          this.climaCache.set(regionId, {
            data: climaData,
            timestamp: Date.now()
          });
        }
        
        return climaData;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error detallado obteniendo clima de la API:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          error: error.error
        });
        return throwError(() => new Error(`Error al obtener clima: ${error.message}`));
      }),
      shareReplay(1) // Compartir la respuesta entre múltiples suscriptores
    );
  }

  private mapTomorrowResponseToClima(apiResponse: any, regionId?: string): IDatosClima {
    console.log('Mapeando respuesta de la API:', apiResponse);
    
    if (!apiResponse || !apiResponse.data) {
      console.warn('No se encontraron datos en la respuesta:', apiResponse);
      return this.createDefaultClimaData(regionId);
    }
    
    const data = apiResponse.data;
    const values = data.values;
    
    if (!values) {
      console.warn('No se encontraron valores en la respuesta:', data);
      return this.createDefaultClimaData(regionId);
    }
    
    console.log('Valores encontrados:', values);
    
    return {
      id_region: regionId || '',
      region: null, // Se setea después en el componente
      actual: {
        temperatura: values.temperature || 0,
        sensacion_termica: values.temperatureApparent || values.temperature || 0,
        humedad: values.humidity || 0,
        precipitacion: values.rainIntensity || 0,
        velocidad_viento: values.windSpeed || 0,
        direccion_viento: this.getWindDirection(values.windDirection) || 'N',
        presion: values.pressureSurfaceLevel || 0,
        indice_uv: values.uvIndex || 0,
        visibilidad: (values.visibility || 0) / 1000, // Convertir de metros a km
        nubosidad: values.cloudCover || 0,
        condicion: this.mapWeatherCondition(values.weatherCode),
        icono: this.getWeatherIcon(values.weatherCode)
      },
      pronostico: [], // /realtime no incluye pronóstico
      actualizado_en: new Date(data.time || Date.now())
    } as IDatosClima;
  }

  private createDefaultClimaData(regionId?: string): IDatosClima {
    return {
      id_region: regionId || '',
      region: null,
      actual: {
        temperatura: 20,
        sensacion_termica: 20,
        humedad: 50,
        precipitacion: 0,
        velocidad_viento: 5,
        direccion_viento: 'N',
        presion: 1013,
        indice_uv: 5,
        visibilidad: 10,
        nubosidad: 30,
        condicion: 'Despejado',
        icono: '01d'
      },
      pronostico: [],
      actualizado_en: new Date()
    } as IDatosClima;
  }

  private mapWeatherCondition(weatherCode: number): string {
    // Códigos de clima de Tomorrow.io
    const conditionMap: { [key: number]: string } = {
      1000: 'Despejado',
      1001: 'Nublado',
      1100: 'Mayormente despejado',
      1101: 'Parcialmente nublado',
      1102: 'Mayormente nublado',
      2000: 'Niebla',
      2100: 'Niebla ligera',
      4000: 'Lluvia',
      4001: 'Lluvia ligera',
      4200: 'Lluvia ligera',
      4201: 'Lluvia fuerte',
      5000: 'Nieve',
      5001: 'Nieve ligera',
      5100: 'Nieve ligera',
      5101: 'Nieve fuerte',
      6000: 'Llovizna helada',
      6200: 'Llovizna helada ligera',
      6201: 'Llovizna helada fuerte',
      7000: 'Granizo',
      7101: 'Granizo ligero',
      7102: 'Granizo fuerte',
      8000: 'Tormenta'
    };
    
    return conditionMap[weatherCode] || 'Despejado';
  }

  private getWeatherIcon(weatherCode: number): string {
    // Mapear códigos de clima a iconos
    const iconMap: { [key: number]: string } = {
      1000: '☀️', // Despejado
      1001: '☁️', // Nublado
      1100: '🌤️', // Mayormente despejado
      1101: '⛅', // Parcialmente nublado
      1102: '🌥️', // Mayormente nublado
      2000: '🌫️', // Niebla
      2100: '🌫️', // Niebla ligera
      4000: '🌧️', // Lluvia
      4001: '🌦️', // Lluvia ligera
      4200: '🌦️', // Lluvia ligera
      4201: '🌧️', // Lluvia fuerte
      5000: '❄️', // Nieve
      5001: '🌨️', // Nieve ligera
      5100: '🌨️', // Nieve ligera
      5101: '❄️', // Nieve fuerte
      6000: '🌨️', // Llovizna helada
      6200: '🌨️', // Llovizna helada ligera
      6201: '🌨️', // Llovizna helada fuerte
      7000: '🧊', // Granizo
      7101: '🧊', // Granizo ligero
      7102: '🧊', // Granizo fuerte
      8000: '⛈️'  // Tormenta
    };
    
    return iconMap[weatherCode] || '🌤️';
  }

  private getWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  private mapTomorrowForecast(dailyData: any[]): any[] {
    return dailyData.slice(0, 5).map(day => ({
      fecha: new Date(day.time),
      temperatura: {
        minima: day.temperatureMin || 0,
        maxima: day.temperatureMax || 0
      },
      humedad: day.humidity || 0,
      precipitacion: {
        probabilidad: (day.precipitationProbability || 0) * 100,
        cantidad: day.precipitationIntensity || 0
      },
      velocidad_viento: day.windSpeed || 0,
      condicion: this.mapWeatherCondition(day.weatherCode),
      icono: this.getWeatherIcon(day.weatherCode)
    }));
  }

  private isCacheValid(regionId: string): boolean {
    const cached = this.climaCache.get(regionId);
    if (!cached) return false;
    
    return (Date.now() - cached.timestamp) < this.CACHE_DURATION;
  }

  // Limpiar cache
  clearCache(): void {
    this.climaCache.clear();
  }

  // Obtener estadísticas del cache
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.climaCache.size,
      entries: Array.from(this.climaCache.keys())
    };
  }
}