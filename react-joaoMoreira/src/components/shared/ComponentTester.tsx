import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ComponentTesterProps {
  onClose: () => void;
}

export function ComponentTester({ onClose }: ComponentTesterProps) {
  const [componenteActivo, setComponenteActivo] = useState<string>('loadingSpinner');

  const componentes = [
    {
      id: 'loadingSpinner',
      nombre: 'Loading Spinner',
      descripcion: 'Spinners de carga con diferentes variantes',
      icono: '⚡'
    },
    {
      id: 'colores',
      nombre: 'Paleta de Colores',
      descripcion: 'Nueva paleta de colores del sistema',
      icono: '🎨'
    },
    {
      id: 'tipografia',
      nombre: 'Tipografía',
      descripcion: 'Estilos de texto y gradientes',
      icono: '📝'
    },
    {
      id: 'botones',
      nombre: 'Botones',
      descripcion: 'Variantes de botones y estados',
      icono: '🔘'
    }
  ];

  const renderComponenteActivo = () => {
    switch (componenteActivo) {
      case 'loadingSpinner':
        return (
          <div className="space-y-8">
            <h3 className="text-xl font-bold text-stone-800 mb-6">Variantes de Loading Spinner</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6">
                <h4 className="font-bold text-stone-700 mb-4">☕ Coffee Variant</h4>
                <LoadingSpinner variant="coffee" size="md" message="Preparando café..." />
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6">
                <h4 className="font-bold text-stone-700 mb-4">⚡ Primary Variant</h4>
                <LoadingSpinner variant="primary" size="md" message="Cargando datos..." />
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6">
                <h4 className="font-bold text-stone-700 mb-4">📱 Minimal Variant</h4>
                <LoadingSpinner variant="minimal" size="md" message="Procesando..." />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-stone-700">Diferentes Tamaños</h4>
              <div className="flex items-center justify-around bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6">
                <LoadingSpinner variant="coffee" size="sm" />
                <LoadingSpinner variant="coffee" size="md" />
                <LoadingSpinner variant="coffee" size="lg" />
                <LoadingSpinner variant="coffee" size="xl" />
              </div>
            </div>
          </div>
        );

      case 'colores':
        return (
          <div className="space-y-8">
            <h3 className="text-xl font-bold text-stone-800 mb-6">Paleta de Colores CoffeCraft</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6">
                <h4 className="font-bold text-stone-700 mb-4">🪨 Stone (Principal)</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-stone-50 rounded-lg border"></div>
                    <span className="text-sm font-mono">stone-50</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-stone-200 rounded-lg"></div>
                    <span className="text-sm font-mono">stone-200</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-stone-600 rounded-lg"></div>
                    <span className="text-sm font-mono">stone-600</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-stone-800 rounded-lg"></div>
                    <span className="text-sm font-mono">stone-800</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6">
                <h4 className="font-bold text-stone-700 mb-4">💚 Emerald (Acento)</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg"></div>
                    <span className="text-sm font-mono">emerald-100</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg"></div>
                    <span className="text-sm font-mono">emerald-500</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg"></div>
                    <span className="text-sm font-mono">emerald-600</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-800 rounded-lg"></div>
                    <span className="text-sm font-mono">emerald-800</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6">
                <h4 className="font-bold text-stone-700 mb-4">🟡 Amber (Dorado)</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg"></div>
                    <span className="text-sm font-mono">amber-100</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg"></div>
                    <span className="text-sm font-mono">amber-500</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-amber-600 rounded-lg"></div>
                    <span className="text-sm font-mono">amber-600</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg"></div>
                    <span className="text-sm font-mono">yellow-500</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-stone-700">Gradientes Principales</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-16 bg-gradient-to-r from-emerald-600 to-amber-600 rounded-2xl flex items-center justify-center text-white font-bold">
                  Emerald → Amber
                </div>
                <div className="h-16 bg-gradient-to-r from-stone-800 via-emerald-800 to-amber-800 rounded-2xl flex items-center justify-center text-white font-bold">
                  Stone → Emerald → Amber
                </div>
              </div>
            </div>
          </div>
        );

      case 'tipografia':
        return (
          <div className="space-y-8">
            <h3 className="text-xl font-bold text-stone-800 mb-6">Tipografía y Estilos de Texto</h3>
            
            <div className="space-y-6">
              <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6">
                <h4 className="font-bold text-stone-700 mb-4">Títulos con Gradientes</h4>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-stone-800 via-emerald-800 to-amber-800">
                    Título Principal H1
                  </h1>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">
                    Subtítulo H2
                  </h2>
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-emerald-600 to-stone-600">
                    Encabezado H3
                  </h3>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6">
                <h4 className="font-bold text-stone-700 mb-4">Texto Corporal</h4>
                <div className="space-y-3">
                  <p className="text-stone-800 font-bold">Texto en negrita</p>
                  <p className="text-stone-700 font-medium">Texto medio</p>
                  <p className="text-stone-600">Texto regular</p>
                  <p className="text-stone-500 text-sm">Texto secundario pequeño</p>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6">
                <h4 className="font-bold text-stone-700 mb-4">Badges y Etiquetas</h4>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-gradient-to-r from-emerald-100 to-amber-100 text-stone-800 px-3 py-1 rounded-full text-sm font-medium">
                    Badge Principal
                  </span>
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                    Estado Activo
                  </span>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold">
                    Promoción
                  </span>
                  <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-sm font-medium">
                    Neutral
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'botones':
        return (
          <div className="space-y-8">
            <h3 className="text-xl font-bold text-stone-800 mb-6">Variantes de Botones</h3>
            
            <div className="space-y-6">
              <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6">
                <h4 className="font-bold text-stone-700 mb-4">Botones Principales</h4>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all duration-300 transform hover:scale-105">
                    Botón Principal
                  </button>
                  <button className="bg-white/80 text-stone-700 hover:bg-white border border-stone-200/50 px-6 py-3 rounded-2xl font-medium shadow-lg transition-all duration-300 transform hover:scale-105">
                    Botón Secundario
                  </button>
                  <button className="bg-stone-200 text-stone-400 px-6 py-3 rounded-2xl font-medium cursor-not-allowed">
                    Botón Deshabilitado
                  </button>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6">
                <h4 className="font-bold text-stone-700 mb-4">Tamaños de Botones</h4>
                <div className="flex items-center flex-wrap gap-4">
                  <button className="bg-gradient-to-r from-emerald-500 to-amber-500 text-white px-3 py-1 rounded-xl text-sm font-medium">
                    Pequeño
                  </button>
                  <button className="bg-gradient-to-r from-emerald-500 to-amber-500 text-white px-4 py-2 rounded-xl font-medium">
                    Mediano
                  </button>
                  <button className="bg-gradient-to-r from-emerald-500 to-amber-500 text-white px-6 py-3 rounded-2xl font-bold">
                    Grande
                  </button>
                  <button className="bg-gradient-to-r from-emerald-500 to-amber-500 text-white px-8 py-4 rounded-2xl font-bold text-lg">
                    Extra Grande
                  </button>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6">
                <h4 className="font-bold text-stone-700 mb-4">Botones con Iconos</h4>
                <div className="flex flex-wrap gap-4">
                  <button className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-amber-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all duration-300 transform hover:scale-105">
                    <span>🚀</span>
                    <span>Comenzar</span>
                  </button>
                  <button className="flex items-center space-x-2 bg-white/80 text-stone-700 hover:bg-white border border-stone-200/50 px-6 py-3 rounded-2xl font-medium shadow-lg transition-all duration-300">
                    <span>📱</span>
                    <span>Contactar</span>
                  </button>
                  <button className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 text-white rounded-2xl font-bold shadow-lg transition-all duration-300 transform hover:scale-110 hover:rotate-12">
                    ☕
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Componente no encontrado</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-stone-200/50 w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-80 bg-gradient-to-b from-stone-800 via-emerald-800 to-amber-800 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-2xl">
                  🧪
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Laboratorio de Componentes</h2>
                <p className="text-stone-300 text-sm">Sistema de diseño CoffeCraft</p>
              </div>

              {/* Navegación */}
              <nav className="space-y-2">
                {componentes.map((componente) => (
                  <button
                    key={componente.id}
                    onClick={() => setComponenteActivo(componente.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 ${
                      componenteActivo === componente.id
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                        : 'text-stone-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{componente.icono}</span>
                      <div>
                        <div className="font-bold">{componente.nombre}</div>
                        <div className="text-xs opacity-80">{componente.descripcion}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>

              {/* Footer */}
              <div className="pt-6 border-t border-white/20">
                <button
                  onClick={onClose}
                  className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-2xl font-bold transition-all duration-300 backdrop-blur-sm"
                >
                  ✕ Cerrar Laboratorio
                </button>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 p-8 overflow-y-auto">
            {renderComponenteActivo()}
          </div>
        </div>
      </div>
    </div>
  );
} 