import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home/page";
import NoticiaPage from "./pages/NoticiaPage";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/noticia/:id" element={<NoticiaPage />} />
    </Routes>
  </Router>
);
