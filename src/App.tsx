import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from './pages/admin/gestor'; 
import Home from './pages/home/page';

// IMPORTANTE: Esta ruta tiene que coincidir exactamente con la estructura en GitHub.
// Debes tener el archivo guardado físicamente en: src/pages/noticia/page.tsx
import Noticia from './pages/noticia/page'; 

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
