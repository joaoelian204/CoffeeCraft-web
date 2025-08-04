import type { Producto } from '../../types';

interface TarjetaProductoProps {
  producto: Producto;
  onClick?: () => void;
}

export function TarjetaProducto({ producto, onClick }: TarjetaProductoProps) {
  const {
    nombre,
    descripcion,
    precio,
    precioOriginal,
    descuento,
    categoria,
    nivelTostado,
    region,
    imagenUrl,
    calificacion,
    cantidadReseñas,
    notasSabor,
    stock,
    activo
  } = producto;

  const precioFinal = precioOriginal && descuento ? precioOriginal : precio;
  const porcentajeDescuento = descuento || 0;

  const renderEstrellas = (puntuacion: number) => {
    const estrellas = [];
    const puntuacionRedondeada = Math.round(puntuacion * 2) / 2;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= puntuacionRedondeada) {
        estrellas.push(<span key={i} className="text-amber-400">★</span>);
      } else if (i - 0.5 <= puntuacionRedondeada) {
        estrellas.push(<span key={i} className="text-amber-400">☆</span>);
      } else {
        estrellas.push(<span key={i} className="text-stone-300">☆</span>);
      }
    }
    return estrellas;
  };

  const getBadgeCategoria = (cat: string) => {
    const badges: Record<string, { emoji: string; bg: string; text: string }> = {
      'arabica': { emoji: '☕', bg: 'bg-emerald-100', text: 'text-emerald-700' },
      'robusta': { emoji: '💪', bg: 'bg-stone-100', text: 'text-stone-700' },
      'especial': { emoji: '⭐', bg: 'bg-amber-100', text: 'text-amber-700' },
      'organico': { emoji: '🌱', bg: 'bg-green-100', text: 'text-green-700' },
      'comercial': { emoji: '🏪', bg: 'bg-blue-100', text: 'text-blue-700' },
      'origen-unico': { emoji: '🌟', bg: 'bg-purple-100', text: 'text-purple-700' },
      'mezcla': { emoji: '🔄', bg: 'bg-orange-100', text: 'text-orange-700' }
    };
    
    return badges[cat] || { emoji: '☕', bg: 'bg-stone-100', text: 'text-stone-700' };
  };

  const getNivelTostadoBadge = (nivel: string) => {
    const badges: Record<string, { emoji: string; bg: string; text: string }> = {
      'ligero': { emoji: '🤎', bg: 'bg-amber-50', text: 'text-amber-600' },
      'medio': { emoji: '🍫', bg: 'bg-amber-100', text: 'text-amber-700' },
      'oscuro': { emoji: '⚫', bg: 'bg-stone-100', text: 'text-stone-700' }
    };
    
    return badges[nivel] || { emoji: '☕', bg: 'bg-stone-100', text: 'text-stone-700' };
  };

  const badge = getBadgeCategoria(categoria);
  const tostadoBadge = getNivelTostadoBadge(nivelTostado);

  const disponible = activo && stock > 0;

  return (
    <div 
      className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 overflow-hidden transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:-translate-y-2 ${
        onClick ? 'cursor-pointer' : ''
      } ${!disponible ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      {/* Indicadores especiales */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        {precioOriginal && descuento && (
          <div className="bg-gradient-to-r from-emerald-500 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
            ⭐ ESPECIAL
          </div>
        )}
        {porcentajeDescuento > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            🔥 -{porcentajeDescuento}%
          </div>
        )}
        {stock === 0 && (
          <div className="bg-stone-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            AGOTADO
          </div>
        )}
      </div>

      {/* Imagen con overlay elegante */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
        
        {imagenUrl ? (
          <img 
            src={imagenUrl} 
            alt={nombre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/300x200/D4AF37/FFFFFF?text=${encodeURIComponent(nombre)}`;
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-200 to-amber-100 flex items-center justify-center">
            <div className="text-center text-stone-600">
              <div className="text-4xl mb-2">☕</div>
              <div className="text-sm font-medium">{nombre}</div>
            </div>
          </div>
        )}

        {/* Badges flotantes en la imagen */}
        <div className="absolute top-4 right-4 flex flex-col space-y-1">
          <div className={`${badge.bg} ${badge.text} px-2 py-1 rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm`}>
            {badge.emoji} {categoria.replace('-', ' ').toUpperCase()}
          </div>
          <div className={`${tostadoBadge.bg} ${tostadoBadge.text} px-2 py-1 rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm`}>
            {tostadoBadge.emoji} {nivelTostado.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6 space-y-4">
        {/* Título y región */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-stone-800 to-emerald-800 line-clamp-2 group-hover:from-emerald-700 group-hover:to-amber-700 transition-all duration-300">
            {nombre}
          </h3>
          {region && (
            <div className="flex items-center space-x-1 text-stone-600">
              <span className="text-sm">🌄</span>
              <span className="text-sm font-medium">{region}</span>
            </div>
          )}
        </div>

        {/* Descripción */}
        {descripcion && (
          <p className="text-stone-600 text-sm leading-relaxed line-clamp-2">
            {descripcion}
          </p>
        )}

        {/* Notas de sabor */}
        {notasSabor && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-stone-700 uppercase tracking-wide">Notas de Sabor</div>
            <div className="flex flex-wrap gap-1">
              {Array.isArray(notasSabor) ? (
                // Si es un array, mostrar las primeras 3 notas
                <>
                  {notasSabor.slice(0, 3).map((nota: string, index: number) => (
                    <span 
                      key={index}
                      className="bg-gradient-to-r from-emerald-50 to-amber-50 text-stone-700 px-2 py-1 rounded-full text-xs font-medium border border-emerald-200/50"
                    >
                      {nota}
                    </span>
                  ))}
                  {notasSabor.length > 3 && (
                    <span className="text-stone-500 text-xs font-medium">+{notasSabor.length - 3} más</span>
                  )}
                </>
              ) : (
                // Si es un string, mostrarlo como una sola nota
                <span className="bg-gradient-to-r from-emerald-50 to-amber-50 text-stone-700 px-2 py-1 rounded-full text-xs font-medium border border-emerald-200/50">
                  {notasSabor}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Calificación */}
        {calificacion && calificacion > 0 && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {renderEstrellas(calificacion)}
            </div>
            <span className="text-sm font-bold text-stone-700">
              {calificacion.toFixed(1)}
            </span>
            {cantidadReseñas && cantidadReseñas > 0 && (
              <span className="text-xs text-stone-500">
                ({cantidadReseñas} {cantidadReseñas === 1 ? 'reseña' : 'reseñas'})
              </span>
            )}
          </div>
        )}

        {/* Stock */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'
          }`}></div>
          <span className={`text-xs font-medium ${
            stock > 0 ? 'text-emerald-700' : 'text-red-600'
          }`}>
            {stock > 0 ? `Stock: ${stock} unidades` : 'Sin stock'}
          </span>
        </div>

        {/* Precio */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-200/50">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">
                ${precioFinal.toFixed(2)}
              </span>
              {precioOriginal && descuento && (
                <span className="text-sm text-stone-500 line-through">
                  ${precio.toFixed(2)}
                </span>
              )}
            </div>
            <div className="text-xs text-stone-500">por 250g</div>
          </div>

          {disponible ? (
            <button className="bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-lg transition-all duration-300 transform hover:scale-105">
              Ver Más
            </button>
          ) : (
            <div className="text-stone-500 text-sm font-medium">
              No disponible
            </div>
          )}
        </div>
      </div>

      {/* Efecto de hover brillante */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-amber-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:via-amber-500/5 group-hover:to-emerald-500/5 rounded-3xl transition-all duration-500 pointer-events-none"></div>
      
      {/* Borde brillante en hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-emerald-400/30 group-hover:to-amber-400/30 rounded-3xl transition-all duration-500 pointer-events-none"></div>
    </div>
  );
} 