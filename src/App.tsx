import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from './pages/admin/page';
import Home from './pages/home/page';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/noticia/:id" element={<Noticia />} />
      </Routes>
    </BrowserRouter>
  );
}
