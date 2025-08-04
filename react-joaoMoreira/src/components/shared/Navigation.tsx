import { useState } from 'react';

interface NavigationProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export function Navigation({ activeModule, onModuleChange }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const modules = [
    {
      id: 'catalogo',
      name: 'Catálogo',
      icon: '☕',
      description: 'Cafés Premium',
      color: 'from-amber-500 to-yellow-500'
    },
    {
      id: 'recomendacion',
      name: 'IA Personalizada',
      icon: '🧠',
      description: 'Tu café ideal',
      color: 'from-emerald-500 to-green-500'
    },
    {
      id: 'experiencias',
      name: 'Experiencias',
      icon: '🌄',
      description: 'Tours exclusivos',
      color: 'from-stone-500 to-slate-500'
    }
  ];

  return (
    <nav className="relative">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Brand Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg transform rotate-6">
                ☕
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400">
                CoffeCraft
              </h1>
              <p className="text-stone-400 text-sm font-medium">Ecuador Premium</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {modules.map((module) => (
              <button
                key={module.id}
                className={`relative group px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  activeModule === module.id
                    ? `bg-gradient-to-r ${module.color} text-white shadow-lg shadow-amber-500/25`
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/50'
                }`}
                onClick={() => onModuleChange(module.id)}
              >
                <div className="flex items-center space-x-3">
                  <span className={`text-xl transition-transform duration-300 ${
                    activeModule === module.id ? 'scale-110' : 'group-hover:scale-110'
                  }`}>
                    {module.icon}
                  </span>
                  <div className="text-left">
                    <div className="font-bold text-sm leading-tight">{module.name}</div>
                    <div className={`text-xs leading-tight ${
                      activeModule === module.id ? 'text-white/80' : 'text-stone-400'
                    }`}>
                      {module.description}
                    </div>
                  </div>
                </div>
                
                {/* Active indicator */}
                {activeModule === module.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden relative p-3 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800/50 transition-all duration-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`bg-current block transition-all duration-300 h-0.5 w-6 rounded-sm ${
                mobileMenuOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-0.5'
              }`}></span>
              <span className={`bg-current block transition-all duration-300 h-0.5 w-6 rounded-sm my-0.5 ${
                mobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}></span>
              <span className={`bg-current block transition-all duration-300 h-0.5 w-6 rounded-sm ${
                mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-0.5'
              }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-96 pb-6' : 'max-h-0'
        }`}>
          <div className="bg-stone-800/50 backdrop-blur-sm rounded-2xl p-4 mt-4 space-y-2">
            {modules.map((module) => (
              <button
                key={module.id}
                className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                  activeModule === module.id
                    ? `bg-gradient-to-r ${module.color} text-white shadow-lg`
                    : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
                }`}
                onClick={() => {
                  onModuleChange(module.id);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="text-2xl">{module.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-bold">{module.name}</div>
                  <div className={`text-sm ${
                    activeModule === module.id ? 'text-white/80' : 'text-stone-400'
                  }`}>
                    {module.description}
                  </div>
                </div>
                {activeModule === module.id && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
} 