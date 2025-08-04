import { useState } from 'react';
import type { FiltrosCatalogo } from '../../types';
import { CategoriaCafe, NivelTostado } from '../../types';

interface FiltrosProductosProps {
  filtros: FiltrosCatalogo;
  onFiltrosChange: (filtros: FiltrosCatalogo) => void;
  onLimpiarFiltros: () => void;
}

export function FiltrosProductos({ filtros, onFiltrosChange, onLimpiarFiltros }: FiltrosProductosProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const handleFiltroChange = (campo: keyof FiltrosCatalogo, valor: any) => {
    const nuevosFiltros = { ...filtros, [campo]: valor };
    onFiltrosChange(nuevosFiltros);
  };

  const handlePrecioChange = (tipo: 'min' | 'max', valor: string) => {
    const precio = valor === '' ? undefined : parseFloat(valor);
    const nuevoRangoPrecio = { ...filtros.rangoPrecio };
    
    if (tipo === 'min') {
      nuevoRangoPrecio.min = precio;
    } else {
      nuevoRangoPrecio.max = precio;
    }
    
    handleFiltroChange('rangoPrecio', nuevoRangoPrecio);
  };

  const contarFiltrosActivos = () => {
    let count = 0;
    if (filtros.categoria) count++;
    if (filtros.nivelTostado) count++;
    if (filtros.region) count++;
    if (filtros.rangoPrecio?.min || filtros.rangoPrecio?.max) count++;
    if (filtros.soloDisponibles) count++;
    if (filtros.soloOfertas) count++;
    return count;
  };

  const filtrosActivos = contarFiltrosActivos();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 overflow-hidden">
      {/* Header elegante */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-800 via-emerald-800 to-amber-800"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <button 
              className="flex items-center space-x-3 text-white font-bold hover:text-amber-200 transition-colors duration-300 group"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                🔍
              </div>
              <div>
                <span className="text-lg">Filtros Avanzados</span>
                {filtrosActivos > 0 && (
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-800 px-2 py-1 rounded-full text-xs font-bold">
                      {filtrosActivos} activos
                    </div>
                  </div>
                )}
              </div>
              <span className={`text-2xl transition-transform duration-300 ${mostrarFiltros ? 'rotate-180' : ''}`}>
                ⌄
              </span>
            </button>
            
            {filtrosActivos > 0 && (
              <button 
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                onClick={onLimpiarFiltros}
              >
                <span>✕</span>
                <span>Limpiar Todo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      {mostrarFiltros && (
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Búsqueda por texto */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-bold text-stone-700">
                <span className="text-lg">🔍</span>
                <span>Buscar Café</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nombre, origen, notas..."
                  value={filtros.busqueda || ''}
                  onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 shadow-lg placeholder-stone-400"
                />
                {filtros.busqueda && (
                  <button
                    onClick={() => handleFiltroChange('busqueda', '')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors duration-200"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Categoría */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-bold text-stone-700">
                <span className="text-lg">☕</span>
                <span>Categoría</span>
              </label>
              <select 
                value={filtros.categoria || ''}
                onChange={(e) => handleFiltroChange('categoria', e.target.value || undefined)}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 shadow-lg appearance-none cursor-pointer"
              >
                <option value="">Todas las categorías</option>
                <option value={CategoriaCafe.ARABICA}>☕ Arábica Premium</option>
                <option value={CategoriaCafe.ROBUSTA}>💪 Robusta Intenso</option>
                <option value={CategoriaCafe.ESPECIAL}>⭐ Especial de Altura</option>
                <option value={CategoriaCafe.ORGANICO}>🌱 Orgánico Certificado</option>
                <option value={CategoriaCafe.COMERCIAL}>🏪 Comercial</option>
              </select>
            </div>

            {/* Nivel de Tostado */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-bold text-stone-700">
                <span className="text-lg">🔥</span>
                <span>Nivel de Tostado</span>
              </label>
              <select 
                value={filtros.nivelTostado || ''}
                onChange={(e) => handleFiltroChange('nivelTostado', e.target.value || undefined)}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 shadow-lg appearance-none cursor-pointer"
              >
                <option value="">Todos los tostados</option>
                <option value={NivelTostado.LIGERO}>🤎 Ligero (Suave)</option>
                <option value={NivelTostado.MEDIO}>🍫 Medio (Balanceado)</option>
                <option value={NivelTostado.OSCURO}>⚫ Oscuro (Intenso)</option>
              </select>
            </div>

            {/* Región */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-bold text-stone-700">
                <span className="text-lg">🌄</span>
                <span>Región de Origen</span>
              </label>
              <select 
                value={filtros.region || ''}
                onChange={(e) => handleFiltroChange('region', e.target.value || undefined)}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 shadow-lg appearance-none cursor-pointer"
              >
                <option value="">Todas las regiones</option>
                <option value="Manabí">🏖️ Manabí (Costa)</option>
                <option value="Loja">🏔️ Loja (Sierra Sur)</option>
                <option value="Pichincha">🌋 Pichincha (Sierra Norte)</option>
                <option value="El Oro">🥇 El Oro (Andino)</option>
                <option value="Zamora Chinchipe">🌿 Zamora Chinchipe (Amazónico)</option>
              </select>
            </div>

                         {/* Rango de Precio Premium */}
             <div className="space-y-4">
               <label className="flex items-center space-x-2 text-sm font-bold text-stone-700">
                 <span className="text-xl">💰</span>
                 <span>Rango de Precio Premium</span>
               </label>
               
               {/* Inputs de precio con diseño elegante */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="relative">
                   <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wide">Precio Mínimo</label>
                   <div className="relative group">
                     <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600 font-bold text-lg">$</span>
                     <input
                       type="number"
                       placeholder="0.00"
                       value={filtros.rangoPrecio?.min || ''}
                       onChange={(e) => handlePrecioChange('min', e.target.value)}
                       className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 shadow-lg placeholder-stone-400 group-hover:shadow-xl group-hover:bg-white/90"
                       min="0"
                       step="0.50"
                     />
                     {filtros.rangoPrecio?.min && (
                       <button
                         onClick={() => handlePrecioChange('min', '')}
                         className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-stone-400 hover:bg-stone-600 text-white rounded-full flex items-center justify-center text-xs transition-all duration-200"
                       >
                         ✕
                       </button>
                     )}
                   </div>
                 </div>
                 
                 <div className="relative">
                   <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wide">Precio Máximo</label>
                   <div className="relative group">
                     <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 font-bold text-lg">$</span>
                     <input
                       type="number"
                       placeholder="50.00"
                       value={filtros.rangoPrecio?.max || ''}
                       onChange={(e) => handlePrecioChange('max', e.target.value)}
                       className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 shadow-lg placeholder-stone-400 group-hover:shadow-xl group-hover:bg-white/90"
                       min="0"
                       step="0.50"
                     />
                     {filtros.rangoPrecio?.max && (
                       <button
                         onClick={() => handlePrecioChange('max', '')}
                         className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-stone-400 hover:bg-stone-600 text-white rounded-full flex items-center justify-center text-xs transition-all duration-200"
                       >
                         ✕
                       </button>
                     )}
                   </div>
                 </div>
               </div>

               {/* Separador visual elegante */}
               <div className="flex items-center justify-center py-2">
                 <div className="flex items-center space-x-2">
                   <div className="h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent flex-1 w-16"></div>
                   <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                     ↔
                   </div>
                   <div className="h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent flex-1 w-16"></div>
                 </div>
               </div>

               {/* Rangos de precio sugeridos */}
               

               {/* Indicador de rango actual */}
               {(filtros.rangoPrecio?.min || filtros.rangoPrecio?.max) && (
                 <div className="bg-gradient-to-r from-emerald-50 via-amber-50 to-emerald-50 border border-emerald-200/50 rounded-xl p-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-3">
                       <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                         💎
                       </div>
                       <div>
                         <div className="font-bold text-stone-800 text-sm">
                           Rango Seleccionado
                         </div>
                         <div className="text-stone-600 text-xs">
                           {filtros.rangoPrecio?.min ? `$${filtros.rangoPrecio.min}` : 'Sin mínimo'} 
                           {' → '} 
                           {filtros.rangoPrecio?.max ? `$${filtros.rangoPrecio.max}` : 'Sin máximo'}
                         </div>
                       </div>
                     </div>
                     <button
                       onClick={() => handleFiltroChange('rangoPrecio', { min: undefined, max: undefined })}
                       className="text-stone-500 hover:text-stone-700 transition-colors duration-200 p-1"
                     >
                       <span className="text-sm">✕</span>
                     </button>
                   </div>
                 </div>
               )}
             </div>

            {/* Filtros adicionales */}
            <div className="space-y-4">
              <label className="flex items-center space-x-2 text-sm font-bold text-stone-700">
                <span className="text-lg">⚙️</span>
                <span>Opciones Especiales</span>
              </label>
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={filtros.soloDisponibles || false}
                      onChange={(e) => handleFiltroChange('soloDisponibles', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                      filtros.soloDisponibles 
                        ? 'bg-gradient-to-br from-emerald-500 to-green-500 border-emerald-500 shadow-lg shadow-emerald-500/30' 
                        : 'border-stone-300 group-hover:border-emerald-400'
                    }`}>
                      {filtros.soloDisponibles && (
                        <span className="text-white text-sm font-bold">✓</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">✅</span>
                    <span className="text-stone-700 font-medium group-hover:text-emerald-700 transition-colors duration-200">
                      Solo disponibles
                    </span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={filtros.soloOfertas || false}
                      onChange={(e) => handleFiltroChange('soloOfertas', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                      filtros.soloOfertas 
                        ? 'bg-gradient-to-br from-amber-500 to-yellow-500 border-amber-500 shadow-lg shadow-amber-500/30' 
                        : 'border-stone-300 group-hover:border-amber-400'
                    }`}>
                      {filtros.soloOfertas && (
                        <span className="text-white text-sm font-bold">✓</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🏷️</span>
                    <span className="text-stone-700 font-medium group-hover:text-amber-700 transition-colors duration-200">
                      Solo ofertas especiales
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Resumen de filtros activos */}
          {filtrosActivos > 0 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-200/50 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                    {filtrosActivos}
                  </div>
                  <div>
                    <div className="font-bold text-stone-800">Filtros Aplicados</div>
                    <div className="text-stone-600 text-sm">Mostrando resultados personalizados</div>
                  </div>
                </div>
                <button 
                  onClick={onLimpiarFiltros}
                  className="bg-gradient-to-r from-stone-500 to-slate-500 hover:from-stone-600 hover:to-slate-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Limpiar Todo
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 