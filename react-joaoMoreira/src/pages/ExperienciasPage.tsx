import { useState } from 'react'

interface Experiencia {
  id: string
  titulo: string
  descripcion: string
  imagen: string
  precio: number
  duracion: string
  ubicacion: string
  tipo: 'tour' | 'cata' | 'taller' | 'finca'
  disponible: boolean
  capacidad: number
  incluye: string[]
}

export function ExperienciasPage() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>('todos')

  const experiencias: Experiencia[] = [
    {
      id: '1',
      titulo: 'Tour de Finca Cafetera',
      descripcion: 'Descubre el proceso completo del café desde la semilla hasta la taza en una auténtica finca ecuatoriana.',
      imagen: '🌱',
      precio: 45,
      duracion: '4 horas',
      ubicacion: 'Mindo, Pichincha',
      tipo: 'finca',
      disponible: true,
      capacidad: 12,
      incluye: ['Transporte', 'Guía especializado', 'Almuerzo', 'Degustación']
    },
    {
      id: '2',
      titulo: 'Cata de Cafés Especiales',
      descripcion: 'Aprende a identificar las notas y características únicas de los mejores cafés ecuatorianos.',
      imagen: '👃',
      precio: 35,
      duracion: '2 horas',
      ubicacion: 'Centro de Quito',
      tipo: 'cata',
      disponible: true,
      capacidad: 8,
      incluye: ['5 variedades premium', 'Material didáctico', 'Certificado']
    },
    {
      id: '3',
      titulo: 'Taller de Barista',
      descripcion: 'Domina las técnicas profesionales para preparar el café perfecto como un verdadero barista.',
      imagen: '☕',
      precio: 65,
      duracion: '6 horas',
      ubicacion: 'Academia CoffeCraft',
      tipo: 'taller',
      disponible: true,
      capacidad: 6,
      incluye: ['Máquina profesional', 'Materiales', 'Certificación', 'Lunch']
    }
  ]

  const tipos = [
    { id: 'todos', nombre: 'Todas las Experiencias', icon: '🌟' },
    { id: 'tour', nombre: 'Tours', icon: '🚌' },
    { id: 'cata', nombre: 'Catas', icon: '👃' },
    { id: 'taller', nombre: 'Talleres', icon: '🎓' },
    { id: 'finca', nombre: 'Fincas', icon: '🌱' }
  ]

  const experienciasFiltradas = tipoSeleccionado === 'todos' 
    ? experiencias 
    : experiencias.filter(exp => exp.tipo === tipoSeleccionado)

  return (
    <div className="min-h-screen space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900/5 via-emerald-900/5 to-amber-900/5 rounded-3xl"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-200/20 to-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-emerald-200/20 to-stone-200/20 rounded-full blur-2xl"></div>
        
        <div className="relative text-center py-20 px-6">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-amber-100 text-stone-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              <span className="text-emerald-600">🌄</span>
              <span>Experiencias Únicas en Ecuador</span>
            </div>
            
            {/* Título principal */}
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-800 via-emerald-800 to-amber-800">
                Vive el Café
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-emerald-600 to-stone-600">
                Como Nunca Antes
              </span>
            </h1>
            
            {/* Descripción */}
            <p className="text-xl text-stone-600 leading-relaxed max-w-4xl mx-auto">
              Sumérgete en el fascinante mundo del café ecuatoriano con experiencias auténticas 
              que conectan la tradición centenaria con la innovación moderna.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-4xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-4xl mb-3">🌱</div>
                <div className="font-bold text-stone-800 mb-2">Del Grano a la Taza</div>
                <div className="text-stone-600 text-sm">Vive todo el proceso</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-4xl mb-3">👥</div>
                <div className="font-bold text-stone-800 mb-2">Expertos Locales</div>
                <div className="text-stone-600 text-sm">Guías especializados</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-4xl mb-3">🏆</div>
                <div className="font-bold text-stone-800 mb-2">Certificación</div>
                <div className="text-stone-600 text-sm">Reconocimiento oficial</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros de tipo */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
            🎯
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Nuestras Experiencias</h2>
            <p className="text-stone-600 text-sm">Elige la aventura perfecta para ti</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {tipos.map((tipo) => (
            <button
              key={tipo.id}
              onClick={() => setTipoSeleccionado(tipo.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
                tipoSeleccionado === tipo.id
                  ? 'bg-gradient-to-r from-emerald-600 to-amber-600 text-white shadow-emerald-500/25'
                  : 'bg-white/80 text-stone-700 hover:bg-white border border-stone-200/50'
              }`}
            >
              <span className="text-lg">{tipo.icon}</span>
              <span>{tipo.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid de experiencias */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {experienciasFiltradas.map((experiencia) => (
          <div 
            key={experiencia.id}
            className="group bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
          >
            {/* Header */}
            <div className="relative h-48 bg-gradient-to-br from-stone-800 via-emerald-800 to-amber-800 overflow-hidden">
              {/* Overlay decorativo */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent"></div>
              
              {/* Precio destacado */}
              <div className="absolute top-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm text-stone-800 px-4 py-2 rounded-2xl font-bold shadow-lg">
                  ${experiencia.precio}
                </div>
              </div>
              
              {/* Icono central */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-3xl flex items-center justify-center text-4xl shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  {experiencia.imagen}
                </div>
              </div>
              
              {/* Disponibilidad */}
              <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                <div className={`w-2 h-2 rounded-full ${experiencia.disponible ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-stone-800 font-medium text-sm">
                  {experiencia.disponible ? 'Disponible' : 'Completo'}
                </span>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4">
              {/* Título y ubicación */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-stone-800 leading-tight group-hover:text-emerald-800 transition-colors duration-300">
                  {experiencia.titulo}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {experiencia.descripcion}
                </p>
              </div>

              {/* Detalles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-stone-600 text-sm font-medium">📍 Ubicación</span>
                  <span className="text-stone-700 font-medium text-sm">{experiencia.ubicacion}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-stone-600 text-sm font-medium">⏰ Duración</span>
                  <span className="text-stone-700 font-medium text-sm">{experiencia.duracion}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-stone-600 text-sm font-medium">👥 Capacidad</span>
                  <span className="text-stone-700 font-medium text-sm">Hasta {experiencia.capacidad} personas</span>
                </div>
              </div>

              {/* Incluye */}
              <div className="space-y-2">
                <span className="text-stone-600 text-sm font-medium">✅ Incluye:</span>
                <div className="flex flex-wrap gap-1">
                  {experiencia.incluye.slice(0, 2).map((item, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-emerald-100 to-amber-100 text-stone-700 px-2 py-1 rounded-lg text-xs font-medium border border-emerald-200/50"
                    >
                      {item}
                    </span>
                  ))}
                  {experiencia.incluye.length > 2 && (
                    <span className="text-stone-500 text-xs font-medium px-2 py-1">
                      +{experiencia.incluye.length - 2} más
                    </span>
                  )}
                </div>
              </div>

              {/* Separador */}
              <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent"></div>

              {/* Botón de acción */}
              <button 
                className={`w-full py-3 rounded-2xl font-bold text-sm shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  experiencia.disponible
                    ? 'bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-600 hover:to-amber-600 text-white shadow-emerald-500/25'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
                disabled={!experiencia.disponible}
                onClick={() => {
                  if (experiencia.disponible) {
                    // Navegar directamente a la ruta de ubicación en el shell
                    if (window.parent && window.parent !== window) {
                      window.parent.postMessage({
                        type: 'NAVIGATE_TO',
                        route: '/ubicacion',
                        experiencia: experiencia
                      }, '*');
                    }
                  }
                }}
              >
                {experiencia.disponible ? '🔍 Ver detalles' : 'No Disponible'}
              </button>
            </div>

            {/* Efecto de brillo */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-white/80 to-stone-100/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-stone-200/50 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-stone-800 to-emerald-800">
            ¿Experiencia Personalizada?
          </h3>
          <p className="text-stone-600 leading-relaxed">
            Creamos experiencias únicas adaptadas a tus intereses. Desde tours privados hasta 
            talleres especializados para grupos corporativos.
          </p>
          <button className="bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-700 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 transform hover:scale-105">
            Contáctanos para más información
          </button>
        </div>
      </div>
    </div>
  )
} 