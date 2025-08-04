import { CatalogoPage } from './pages/CatalogoPage';

function CatalogoApp() {
  console.log('🎯 CatalogoApp renderizado');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-emerald-50 to-amber-50">
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold text-stone-800 mb-4">
            🎉 ¡Microfrontend Funcionando!
          </h1>
          <p className="text-xl text-stone-600 mb-8">
            El módulo del catálogo se cargó correctamente
          </p>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
            <CatalogoPage />
          </div>
        </div>
      </main>
    </div>
  );
}

export default CatalogoApp; 