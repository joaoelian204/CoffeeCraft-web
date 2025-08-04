import { useEffect, useState } from 'react';
import { Cuestionario } from '../components/recomendacion/Cuestionario';
import { RecomendacionService } from '../services/recomendacionService';
import type { RecomendacionIA, RespuestasUsuario } from '../types';

export function RecomendacionPage() {
  const [fase, setFase] = useState<'inicio' | 'cuestionario' | 'procesando' | 'resultados' | 'error'>('inicio');
  const [recomendaciones, setRecomendaciones] = useState<RecomendacionIA | null>(null);
  const [error, setError] = useState<string>('');

  // Debug: Loguear cambios de estado
  useEffect(() => {
    console.log('📊 Estado RecomendacionPage cambió:');
    console.log('- Fase:', fase);
    console.log('- Recomendaciones:', recomendaciones);
    console.log('- Error:', error);
  }, [fase, recomendaciones, error]);

  const manejarCuestionarioCompletado = async (respuestasUsuario: RespuestasUsuario) => {
    try {
      console.log('🎯 RecomendacionPage: Cuestionario completado!');
      console.log('📝 Respuestas recibidas:', respuestasUsuario);
      
      setFase('procesando');
      console.log('⏳ Cambiando a fase: procesando');
      
      // Primero generar el perfil de sabor, luego las recomendaciones
      console.log('🧠 Generando perfil de sabor...');
      await RecomendacionService.generarPerfilSabor(respuestasUsuario);
      
      console.log('🤖 Generando recomendaciones IA...');
      const recomendacionesIA = await RecomendacionService.generarRecomendaciones(respuestasUsuario.idUsuario);
      
      console.log('✅ Recomendaciones recibidas:', recomendacionesIA);
      setRecomendaciones(recomendacionesIA);
      
      console.log('🎉 Cambiando a fase: resultados');
      setFase('resultados');
    } catch (error: any) {
      console.error('❌ Error en manejarCuestionarioCompletado:', error);
      setError(error.message || 'Error al generar recomendaciones');
      setFase('error');
    }
  };

  const reiniciarProceso = () => {
    setFase('inicio');
    setRecomendaciones(null);
    setError('');
  };

  const navegarAProducto = (productoId: string) => {
    console.log('🔄 Navegando al producto:', productoId);
    
    // Enviar mensaje al shell para navegar al catálogo con el producto específico
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'NAVIGATE_TO_PRODUCT',
        route: '/catalogo',
        productoId: productoId
      }, '*');
    } else {
      // Fallback: navegar directamente al catálogo
      console.log('⚠️ No se puede comunicar con el shell, navegando al catálogo');
      window.location.href = '/catalogo';
    }
  };

  if (fase === 'procesando') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg">
            <div className="animate-spin text-4xl">🧠</div>
            <p className="text-lg font-medium text-stone-700">Analizando tus preferencias...</p>
          </div>
        </div>
      </div>
    );
  }

  if (fase === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6 p-8 bg-white rounded-2xl shadow-lg max-w-md">
            <div className="text-6xl">❌</div>
            <h2 className="text-2xl font-bold text-red-800">Error al generar recomendaciones</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={reiniciarProceso}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (fase === 'resultados' && recomendaciones) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-amber-800 mb-4">🎯 ¡Tus Cafés Recomendados!</h1>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              Basado en tus preferencias, estos son los cafés perfectos para ti:
            </p>
          </div>

          <div className="grid gap-8 max-w-4xl mx-auto">
            {recomendaciones.productosRecomendados.map((recomendacion, index) => (
              <div key={recomendacion.producto.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col lg:flex-row">
                  {/* Ranking Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                      #{index + 1}
                    </div>
                  </div>
                  
                  {/* Imagen del producto */}
                  <div className="lg:w-1/3 h-64 lg:h-auto">
                    <img 
                      src={recomendacion.producto.imagenUrl}
                      alt={recomendacion.producto.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/92400e/ffffff?text=Café';
                      }}
                    />
                  </div>

                  {/* Información del producto */}
                  <div className="lg:w-2/3 p-8 pt-16 lg:pt-8">
                    <h3 className="text-2xl font-bold text-amber-800 mb-2">{recomendacion.producto.nombre}</h3>
                    <p className="text-amber-600 mb-4 flex items-center">
                      <span className="mr-2">📍</span>
                      {recomendacion.producto.origen}, {recomendacion.producto.region}
                    </p>
                    
                    {/* Barra de puntuación */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-amber-700">Compatibilidad</span>
                        <span className="text-lg font-bold text-amber-800">{recomendacion.puntuacion}%</span>
                      </div>
                      <div className="w-full bg-amber-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out"/>
                      </div>
                    </div>

                    {/* Razón de recomendación */}
                    <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <h4 className="font-bold text-amber-800 mb-2">¿Por qué te recomendamos este café?</h4>
                      <p className="text-amber-700 leading-relaxed">{recomendacion.razon}</p>
                    </div>

                    {/* Nivel de confianza y botón */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-amber-600">
                        Nivel de confianza: <span className="font-medium">{Math.round(recomendacion.nivelConfianza * 100)}%</span>
                      </span>
                      <button 
                        onClick={() => navegarAProducto(recomendacion.producto.id)}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
                      >
                        Ver producto completo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button 
              onClick={reiniciarProceso} 
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
            >
              <span>🔄</span>
              Hacer nuevo cuestionario
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (fase === 'cuestionario') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        {error && (
          <div className="mb-6 mx-auto max-w-2xl">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2">❌</span>
                <span>{error}</span>
              </div>
              <button 
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-700 font-bold text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        <Cuestionario onCompletado={manejarCuestionarioCompletado} />
      </div>
    );
  }

  // Fase inicial
  return (
    <div className="min-h-screen">
      {/* Hero Section Rediseñado */}
        <div className="relative overflow-hidden">
          {/* Background decorativo */}
          <div className="absolute inset-0 bg-gradient-to-br from-stone-900/5 via-emerald-900/5 to-amber-900/5 rounded-3xl"></div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-amber-200/20 to-emerald-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-br from-emerald-200/20 to-stone-200/20 rounded-full blur-2xl"></div>
          
          <div className="relative max-w-6xl mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Contenido Principal */}
              <div className="space-y-8 text-center lg:text-left">
                <div className="space-y-4">
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-amber-100 text-stone-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    <span className="text-emerald-600">🤖</span>
                    <span>Inteligencia Artificial Especializada</span>
                  </div>
                  
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-800 via-emerald-800 to-amber-800">
                      Descubre Tu
                    </span>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-emerald-600 to-stone-600">
                      Café Perfecto
                    </span>
                  </h1>
                  
                  <p className="text-xl text-stone-600 leading-relaxed max-w-2xl">
                    Nuestra IA analiza tus preferencias personales para recomendarte el 
                    café ecuatoriano ideal que se adapte perfectamente a tu paladar único.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Features destacados */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="text-3xl mb-2">🧠</div>
                      <div className="font-bold text-stone-800 text-sm">IA Avanzada</div>
                      <div className="text-stone-600 text-xs">Análisis inteligente</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="text-3xl mb-2">🎯</div>
                      <div className="font-bold text-stone-800 text-sm">Personalizado</div>
                      <div className="text-stone-600 text-xs">Solo para ti</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="text-3xl mb-2">⚡</div>
                      <div className="font-bold text-stone-800 text-sm">Instantáneo</div>
                      <div className="text-stone-600 text-xs">Resultados rápidos</div>
                    </div>
                  </div>

                  {/* CTA Principal */}
                  <button
                    onClick={() => {
                      console.log('🎯 Botón "Comenzar Análisis" clickeado');
                      setFase('cuestionario');
                    }}
                    className="group relative bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 text-white px-12 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                  >
                    <div className="flex items-center space-x-3">
                      <span>Comenzar Análisis</span>
                      <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🚀</span>
                    </div>
                    
                    {/* Efecto de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
                  </button>

                  <p className="text-stone-500 text-sm">
                    ⏱️ Solo toma 2-3 minutos • 📊 Análisis gratuito • 🔒 Datos seguros
                  </p>
                </div>
              </div>

              {/* Visualización Interactiva */}
              <div className="relative">
                <div className="bg-gradient-to-br from-white/80 to-stone-100/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-stone-200/50">
                  <div className="text-center space-y-6">
                    <div className="text-6xl animate-bounce">☕</div>
                    <h3 className="text-2xl font-bold text-stone-800">Tu Café Ideal Te Espera</h3>
                    
                    {/* Steps preview */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 bg-emerald-50 p-4 rounded-xl">
                        <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                        <div className="text-left">
                          <div className="font-medium text-stone-800">Preferencias de Sabor</div>
                          <div className="text-stone-600 text-sm">Dulce, amargo, ácido...</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 bg-amber-50 p-4 rounded-xl">
                        <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                        <div className="text-left">
                          <div className="font-medium text-stone-800">Método de Preparación</div>
                          <div className="text-stone-600 text-sm">Espresso, filtrado, prensa...</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 bg-stone-50 p-4 rounded-xl">
                        <div className="w-8 h-8 bg-stone-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                        <div className="text-left">
                          <div className="font-medium text-stone-800">Ocasión de Consumo</div>
                          <div className="text-stone-600 text-sm">Mañana, tarde, trabajo...</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-500/10 to-amber-500/10 p-4 rounded-xl border border-emerald-200/50">
                      <div className="text-stone-700 font-medium">🎯 Precisión del 94%</div>
                      <div className="text-stone-600 text-sm">Basado en análisis de 1,000+ perfiles</div>
                    </div>
                  </div>
                </div>

                {/* Elementos decorativos flotantes */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-2xl flex items-center justify-center text-xl shadow-lg animate-pulse">
                  🌟
                </div>
                <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-400 rounded-xl flex items-center justify-center text-lg shadow-lg animate-pulse delay-1000">
                  ✨
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">1,250+</div>
                <div className="text-stone-600 font-medium">Cafés Analizados</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">94%</div>
                <div className="text-stone-600 font-medium">Satisfacción</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">15</div>
                <div className="text-stone-600 font-medium">Regiones</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">2.5min</div>
                <div className="text-stone-600 font-medium">Tiempo Promedio</div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
} 