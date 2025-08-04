import { useEffect, useState } from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import { ComponentTester } from './components/shared/ComponentTester'
import { useAuth } from './hooks/useAuth'
import { CatalogoPage } from './pages/CatalogoPage'
import { ExperienciasPage } from './pages/ExperienciasPage'
import { RecomendacionPage } from './pages/RecomendacionPage'

function AppContent() {
  const [showTester, setShowTester] = useState<boolean>(false)
  const { isAuthenticated, user } = useAuth()

  // Enviar altura al shell padre solo una vez al cargar
  useEffect(() => {
    const sendHeight = () => {
      if (window.parent && window.parent !== window) {
        const height = document.documentElement.scrollHeight;
        window.parent.postMessage({
          type: 'IFRAME_HEIGHT',
          height: height
        }, '*');
      }
    };

    // Enviar altura después de que el contenido se cargue completamente
    setTimeout(sendHeight, 1000);
  }, []);

  return (
    <div className="bg-gradient-to-br from-stone-50 via-emerald-50 to-amber-50" style={{ minHeight: '100%' }}>
      {showTester && (
        <ComponentTester onClose={() => setShowTester(false)} />
      )}
      
      {/* Mostrar información de autenticación */}
      {isAuthenticated && user && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✅</span>
            <div>
              <p className="font-medium">Sesión iniciada como: {user.name}</p>
              <p className="text-sm">{user.email}</p>
            </div>
          </div>
        </div>
      )}
      
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <Routes>
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/catalogo" element={<CatalogoPage />} />
          <Route path="/experiencias" element={<ExperienciasPage />} />
          <Route path="/recomendacion" element={<RecomendacionPage />} />
          <Route path="*" element={<CatalogoPage />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
