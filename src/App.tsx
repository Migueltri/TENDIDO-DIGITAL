import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/page";
import Noticia from "./pages/noticia/Noticia";

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
