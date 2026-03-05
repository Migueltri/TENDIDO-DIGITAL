import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from './pages/admin/gestor'; 
import Home from './pages/home/page';
import Noticia from './pages/noticia/page'; 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPage />} />
        
        {/* Al estar importado arriba, esto ya no dará ReferenceError */}
        <Route path="/noticia/:id" element={<Noticia />} />
        
        <Route path="*" element={
          <div className="flex items-center justify-center min-h-screen text-xl font-bold text-gray-800">
            Error 404 - Página no encontrada
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
