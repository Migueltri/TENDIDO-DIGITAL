import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/page";
import NoticiaPage from "./pages/NoticiaPage";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/noticia/:id" element={<NoticiaPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
