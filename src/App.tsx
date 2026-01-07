import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from './pages/admin/gestor'; 
import Home from './pages/home/page';
// IMPORTANTE: Asegúrate de importar Noticia si lo vas a usar en la línea 10
// import Noticia from './páginas/noticia/page'; 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPage />} />
        {/* Descomenta la siguiente línea cuando tengas el import de Noticia arriba */}
        {/* <Route path="/noticia/:id" element={<Noticia />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
