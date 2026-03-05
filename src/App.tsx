import { BrowserRouter , Routes , Route } de "react-router-dom" ;       
import AdminPage desde './pages/admin/gestor' ;    
import Inicio desde './pages/home/page' ;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPage />} />
        {/* Ruta dinámica para capturar los enlaces de las noticias */}
        <Route path="/noticia/:id" element={<Noticia />} />
        
        {/* Ruta comodín para capturar enlaces rotos (404) */}
        <Route path="*" element={
          <div className="flex items-center justify-center min-h-screen text-xl font-bold text-gray-800">
            Error 404 - Página no encontrada
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
