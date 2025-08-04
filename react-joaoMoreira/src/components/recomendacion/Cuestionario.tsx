import { useState } from 'react';
import { RecomendacionService } from '../../services/recomendacionService';
import type { Cuestionario as CuestionarioType, RespuestasUsuario } from '../../types';
import { PreguntaCuestionario } from './PreguntaCuestionario';
import { authService } from '../../services/authService';

interface CuestionarioProps {
  onCompletado: (respuestas: RespuestasUsuario) => void;
  onCargando?: (cargando: boolean) => void;
}

export function Cuestionario({ onCompletado, onCargando }: CuestionarioProps) {
  const [cuestionario, setCuestionario] = useState<CuestionarioType | null>(null);
  const [respuestasSimples, setRespuestasSimples] = useState<{ [key: string]: string }>({});
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string>('');
  const [iniciado, setIniciado] = useState(false);

  const iniciarCuestionario = async () => {
    try {
      setCargando(true);
      onCargando?.(true);
      setError('');
      
      const cuestionarioData = await RecomendacionService.obtenerCuestionario();
      setCuestionario(cuestionarioData);
      setIniciado(true);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el cuestionario');
      console.error('Error:', err);
    } finally {
      setCargando(false);
      onCargando?.(false);
    }
  };

  const manejarRespuesta = (idPregunta: string, respuesta: string) => {
    setRespuestasSimples(prev => ({
      ...prev,
      [idPregunta]: respuesta
    }));
  };

  const siguientePregunta = () => {
    if (cuestionario && preguntaActual < cuestionario.preguntas.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    }
  };

  const preguntaAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
    }
  };

  const finalizarCuestionario = async () => {
    try {
      console.log('📝 Iniciando finalización del cuestionario...');
      console.log('📊 Respuestas simples:', respuestasSimples);
      
      setCargando(true);
      onCargando?.(true);
      
      // Obtener usuario autenticado
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No hay usuario autenticado');
      }
      
      // Convertir respuestas al formato correcto
      const respuestasCompletas: RespuestasUsuario = {
        idUsuario: currentUser.id,
        respuestas: Object.entries(respuestasSimples).map(([idPregunta, idOpcion]) => ({
          idPregunta,
          idOpcion
        })),
        fechaCompletado: new Date()
      };
      
      console.log('✅ Respuestas completas formateadas:', respuestasCompletas);
      
      if (!cuestionario) throw new Error('No se encontró el cuestionario');
      
      await RecomendacionService.guardarRespuestas(respuestasCompletas, cuestionario.id);
      console.log('💾 Respuestas guardadas exitosamente');
      
      console.log('🚀 Llamando a onCompletado...');
      onCompletado(respuestasCompletas);
    } catch (err: any) {
      console.error('❌ Error en finalizarCuestionario:', err);
      setError(err.message || 'Error al procesar respuestas');
    } finally {
      setCargando(false);
      onCargando?.(false);
    }
  };

  const calcularProgreso = () => {
    if (!cuestionario) return 0;
    return ((preguntaActual + 1) / cuestionario.preguntas.length) * 100;
  };

  const esUltimaPregunta = () => {
    return cuestionario && preguntaActual === cuestionario.preguntas.length - 1;
  };

  const puedeAvanzar = () => {
    if (!cuestionario) return false;
    const preguntaId = cuestionario.preguntas[preguntaActual].id;
    return respuestasSimples[preguntaId] !== undefined;
  };

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-16">
        <div className="bg-white/90 backdrop-blur-sm border border-red-200/50 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
            ❌
          </div>
          <h3 className="text-2xl font-bold text-stone-800 mb-4">Algo salió mal</h3>
          <p className="text-stone-600 mb-8 leading-relaxed">{error}</p>
          <button 
            onClick={iniciarCuestionario}
            className="bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-600 hover:to-amber-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!iniciado) {
    return (
      <div className="max-w-4xl mx-auto mt-16">
        <div className="relative overflow-hidden">
          {/* Background decorativo */}
          <div className="absolute inset-0 bg-gradient-to-br from-stone-900/5 via-emerald-900/5 to-amber-900/5 rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-emerald-200/30 to-stone-200/30 rounded-full blur-2xl"></div>
          
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-stone-200/50 p-12 text-center">
            <div className="mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl transform rotate-6">
                🧠
              </div>
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-stone-800 via-emerald-800 to-amber-800 mb-6">
                Descubre tu Café Perfecto
              </h2>
              <p className="text-xl text-stone-600 leading-relaxed max-w-3xl mx-auto">
                Nuestro algoritmo inteligente analizará tus preferencias para recomendarte 
                el café ecuatoriano que mejor se adapte a tu paladar único.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/60 backdrop-blur-sm border border-emerald-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
                  ⏱️
                </div>
                <h3 className="font-bold text-stone-800 mb-2">Solo 2-3 minutos</h3>
                <p className="text-stone-600 text-sm">Proceso rápido y sencillo</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm border border-amber-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
                  🎯
                </div>
                <h3 className="font-bold text-stone-800 mb-2">100% Personalizado</h3>
                <p className="text-stone-600 text-sm">Recomendaciones únicas para ti</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-stone-500 to-slate-500 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
                  ☕
                </div>
                <h3 className="font-bold text-stone-800 mb-2">Cafés Premium</h3>
                <p className="text-stone-600 text-sm">Solo lo mejor de Ecuador</p>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                className={`group relative bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                  cargando ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                onClick={iniciarCuestionario}
                disabled={cargando}
              >
                <div className="flex items-center space-x-3">
                  {cargando ? (
                    <>
                      <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Preparando análisis...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🚀</span>
                      <span>Comenzar Análisis</span>
                    </>
                  )}
                </div>
                
                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
              </button>
              
              <p className="text-stone-500 text-sm">
                🔒 Tus datos están seguros • 📊 Análisis gratuito • ⭐ Resultados instantáneos
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cuestionario) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center space-x-4 text-stone-700">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full"></div>
            <span className="text-lg font-medium">Preparando tu cuestionario personalizado...</span>
          </div>
        </div>
      </div>
    );
  }

  const preguntaActualData = cuestionario.preguntas[preguntaActual];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header con progreso elegante */}
      <div className="bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-3xl p-8 shadow-xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                🧠
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-800">Análisis de Preferencias</h3>
                <p className="text-stone-600 text-sm">Estamos conociendo tu paladar</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-stone-600 mb-1">
                Pregunta {preguntaActual + 1} de {cuestionario.preguntas.length}
              </div>
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">
                {Math.round(calcularProgreso())}%
              </div>
            </div>
          </div>
          
          {/* Barra de progreso moderna */}
          <div className="relative">
            <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ width: `${calcularProgreso()}%` }}
              />
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Contenido de la pregunta con diseño premium */}
      <div className="bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-3xl shadow-2xl overflow-hidden">
        <PreguntaCuestionario
          pregunta={preguntaActualData}
          respuesta={respuestasSimples[preguntaActualData.id]}
          onRespuesta={(respuesta: string) => manejarRespuesta(preguntaActualData.id, respuesta)}
        />
      </div>

      {/* Controles de navegación elegantes */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={preguntaAnterior}
          disabled={preguntaActual === 0}
          className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
            preguntaActual === 0
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-white/80 text-stone-700 hover:bg-white border border-stone-200/50 hover:shadow-xl'
          }`}
        >
          <span>←</span>
          <span>Anterior</span>
        </button>

        <div className="flex items-center space-x-2 text-stone-500 text-sm">
          {Array.from({ length: cuestionario.preguntas.length }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i <= preguntaActual 
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-500' 
                  : 'bg-stone-200'
              }`}
            />
          ))}
        </div>

        {esUltimaPregunta() ? (
          <button
            onClick={finalizarCuestionario}
            disabled={!puedeAvanzar() || cargando}
            className={`group relative px-8 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
              !puedeAvanzar() || cargando
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 text-white shadow-emerald-500/25'
            }`}
          >
            <div className="flex items-center space-x-2">
              {cargando ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Analizando...</span>
                </>
              ) : (
                <>
                  <span>Finalizar</span>
                  <span className="text-lg group-hover:scale-110 transition-transform duration-300">🎯</span>
                </>
              )}
            </div>
            
            {/* Efecto de brillo */}
            {!cargando && puedeAvanzar() && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
            )}
          </button>
        ) : (
          <button
            onClick={siguientePregunta}
            disabled={!puedeAvanzar()}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
              !puedeAvanzar()
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-600 hover:to-amber-600 text-white shadow-emerald-500/25'
            }`}
          >
            <span>Siguiente</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
} 