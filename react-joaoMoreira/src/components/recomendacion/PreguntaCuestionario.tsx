import type { PreguntaRecomendacion } from '../../types';

interface PreguntaCuestionarioProps {
  pregunta: PreguntaRecomendacion;
  respuesta?: string;
  onRespuesta: (respuesta: string) => void;
}

export function PreguntaCuestionario({ pregunta, respuesta, onRespuesta }: PreguntaCuestionarioProps) {
  
  return (
    <div className="p-8 space-y-8">
      {/* Header de la pregunta elegante */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-amber-100 text-stone-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          <span className="text-emerald-600">📋</span>
          <span className="uppercase tracking-wide">{pregunta.categoria}</span>
        </div>
        
        <h3 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-stone-800 via-emerald-800 to-amber-800 leading-tight max-w-4xl mx-auto">
          {pregunta.texto}
        </h3>
      </div>

      {/* Grid de opciones moderno */}
      <div className="grid gap-4 max-w-4xl mx-auto">
        {pregunta.opciones?.map((opcion, index) => (
          <button
            key={opcion.id}
            className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left transform hover:scale-[1.02] hover:-translate-y-1 ${
              respuesta === opcion.id
                ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-amber-50 shadow-2xl shadow-emerald-500/20'
                : 'border-stone-200 bg-white/60 backdrop-blur-sm hover:border-emerald-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-amber-50 hover:shadow-xl'
            }`}
            onClick={() => onRespuesta(opcion.id)}
          >
            <div className="flex items-center space-x-6">
              {/* Indicador de selección elegante */}
              <div className="relative">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  respuesta === opcion.id
                    ? 'border-emerald-500 bg-emerald-500 shadow-lg shadow-emerald-500/30'
                    : 'border-stone-300 group-hover:border-emerald-400'
                }`}>
                  {respuesta === opcion.id && (
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
                
                {/* Efecto de ondas cuando está seleccionado */}
                {respuesta === opcion.id && (
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-30"></div>
                )}
              </div>

              {/* Contenido de la opción */}
              <div className="flex-1 space-y-1">
                <div className={`text-lg font-bold transition-colors duration-300 ${
                  respuesta === opcion.id 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-amber-700' 
                    : 'text-stone-800 group-hover:text-emerald-800'
                }`}>
                  {opcion.texto}
                </div>
                {opcion.categoria && (
                  <div className={`text-sm font-medium transition-colors duration-300 ${
                    respuesta === opcion.id 
                      ? 'text-emerald-600' 
                      : 'text-stone-500 group-hover:text-emerald-600'
                  }`}>
                    {opcion.categoria}
                  </div>
                )}
              </div>

              {/* Número de opción con estilo */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-300 shadow-lg ${
                respuesta === opcion.id
                  ? 'bg-gradient-to-br from-emerald-500 to-amber-500 text-white shadow-emerald-500/30 transform rotate-6'
                  : 'bg-stone-100 text-stone-500 group-hover:bg-gradient-to-br group-hover:from-emerald-100 group-hover:to-amber-100 group-hover:text-emerald-700'
              }`}>
                {index + 1}
              </div>
            </div>

            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 pointer-events-none"></div>
            
            {/* Borde brillante cuando está seleccionado */}
            {respuesta === opcion.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-emerald-500/20 rounded-2xl animate-pulse pointer-events-none"></div>
            )}
          </button>
        ))}
      </div>

      {/* Mensaje de ayuda elegante */}
      {!respuesta && (
        <div className="text-center pt-4">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm border border-amber-200/50 text-amber-700 px-4 py-2 rounded-2xl text-sm font-medium shadow-lg">
            <span className="text-lg">💡</span>
            <span>Selecciona la opción que mejor describa tu preferencia</span>
          </div>
        </div>
      )}

      {/* Confirmación cuando hay respuesta */}
      {respuesta && (
        <div className="text-center pt-4">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-amber-100 text-emerald-700 px-4 py-2 rounded-2xl text-sm font-bold shadow-lg">
            <span className="text-lg animate-bounce">✅</span>
            <span>¡Perfecto! Respuesta guardada</span>
          </div>
        </div>
      )}
    </div>
  );
} 