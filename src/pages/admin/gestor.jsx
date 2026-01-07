import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase'; // Asegúrate de que la ruta sea correcta
import { 
  PlusCircle, Trash2, Newspaper, MessageCircle, PenTool, 
  Mic, LogOut, Layout, Image as ImageIcon, Menu, X, User, 
  MapPin, Target, Users, ChevronLeft, Calendar, Sparkles, 
  Wand2, FileText, PlayCircle 
} from 'lucide-react';

// --- CONFIGURACIÓN IA (PEGA TU CLAVE AQUÍ) ---
const GEMINI_API_KEY = "TU_API_KEY_DE_GOOGLE_AQUÍ";

// --- HELPERS IA ---
async function generateText(prompt) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar el texto.";
  } catch (error) {
    console.error("Error Gemini:", error);
    return "Error al conectar con la IA.";
  }
}

// Helper: Convertir PCM a WAV para Audio
function pcmToWav(pcmData, sampleRate) {
  const buffer = new ArrayBuffer(44 + pcmData.byteLength);
  const view = new DataView(buffer);
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  };
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmData.byteLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, pcmData.byteLength, true);
  new Uint8Array(buffer, 44).set(new Uint8Array(pcmData));
  return buffer;
}

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [view, setView] = useState('public'); 
  const [activeArticle, setActiveArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar noticias desde Supabase
  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error("Error Supabase:", error);
    else setArticles(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleReadMore = (article) => {
    setActiveArticle(article);
    setView('detail');
    window.scrollTo(0, 0);
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-stone-100 animate-pulse">Cargando noticias...</div>;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      <nav className="bg-red-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center cursor-pointer" onClick={() => setView('public')}>
            <Newspaper className="h-6 w-6 mr-2 text-yellow-500" />
            <span className="font-bold text-xl uppercase font-serif">Tendido Digital</span>
          </div>
          <button 
            onClick={() => setView(view === 'admin' ? 'public' : 'admin')}
            className="px-4 py-2 bg-yellow-500 text-red-900 rounded font-bold text-sm"
          >
            {view === 'admin' ? 'Volver a la Web' : 'Administración'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {view === 'admin' ? (
          <AdminPanel articles={articles} onRefresh={fetchArticles} />
        ) : view === 'detail' && activeArticle ? (
          <ArticleDetail article={activeArticle} onBack={() => setView('public')} />
        ) : (
          <PublicSite articles={articles} onReadMore={handleReadMore} />
        )}
      </main>
    </div>
  );
}

// --- PANEL DE ADMINISTRACIÓN (CORREGIDO PARA SUPABASE) ---
function AdminPanel({ articles, onRefresh }) {
  const [formData, setFormData] = useState({
    title: '', category: 'Actualidad', dateString: new Date().toLocaleDateString('es-ES'),
    excerpt: '', fullContent: '', imageUrl: '', author: 'Redacción',
    authorLogo: '', plaza: '', ganaderia: '', torerosRaw: '',
    footerImage1: '', footerImage2: '', footerImage3: ''
  });

  const [activeTab, setActiveTab] = useState('contenido');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.fullContent) return alert("Faltan campos.");
    
    setIsSubmitting(true);
    const { error } = await supabase.from('noticias').insert([formData]);
    
    if (error) alert("Error: " + error.message);
    else {
      alert("¡Publicado con éxito!");
      onRefresh(); // Recargar lista
      setFormData({...formData, title: '', fullContent: '', excerpt: '', imageUrl: ''});
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Borrar noticia?")) return;
    await supabase.from('noticias').delete().eq('id', id);
    onRefresh();
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // Acciones IA
  const handleAI = async (type) => {
    if (!formData.fullContent) return alert("Escribe el contenido primero");
    let prompt = "";
    if (type === 'title') prompt = "Genera un titular corto y serio para: " + formData.fullContent;
    if (type === 'excerpt') prompt = "Resume en 2 frases: " + formData.fullContent;
    if (type === 'improve') prompt = "Mejora este texto periodístico usando negritas markdown: " + formData.fullContent;

    const res = await generateText(prompt);
    if (type === 'title') setFormData(p => ({...p, title: res.replace(/"/g, '')}));
    if (type === 'excerpt') setFormData(p => ({...p, excerpt: res}));
    if (type === 'improve') setFormData(p => ({...p, fullContent: res}));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5">
        <div className="bg-white rounded-xl shadow-lg border-t-4 border-red-900 overflow-hidden">
          <div className="p-4 bg-red-900 text-white font-bold flex items-center">
            <PlusCircle className="mr-2" /> Editor Supabase
          </div>
          <div className="flex border-b">
            {['contenido', 'media', 'tecnica'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 p-3 text-xs font-bold uppercase ${activeTab === t ? 'bg-red-50 text-red-900 border-b-2 border-red-900' : 'text-stone-400'}`}>{t}</button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {activeTab === 'contenido' && (
              <>
                <div className="flex justify-between"><label className="text-xs font-bold">Título</label><button type="button" onClick={() => handleAI('title')} className="text-[10px] text-purple-600 font-bold">IA TÍTULO</button></div>
                <input name="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded" required />
                
                <div className="flex justify-between"><label className="text-xs font-bold">Cuerpo</label><button type="button" onClick={() => handleAI('improve')} className="text-[10px] text-purple-600 font-bold">IA MEJORAR</button></div>
                <textarea name="fullContent" value={formData.fullContent} onChange={e => setFormData({...formData, fullContent: e.target.value})} className="w-full p-2 border rounded h-40" required />
              </>
            )}
            {activeTab === 'media' && (
              <div className="space-y-4">
                <input type="file" onChange={e => handleImageUpload(e, 'imageUrl')} />
                {formData.imageUrl && <img src={formData.imageUrl} className="h-20" />}
              </div>
            )}
            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-red-900 text-white font-bold rounded">
              {isSubmitting ? 'Guardando...' : 'PUBLICAR EN SUPABASE'}
            </button>
          </form>
        </div>
      </div>
      
      <div className="lg:col-span-7">
        <h2 className="text-xl font-bold mb-4">Noticias en Base de Datos</h2>
        <div className="bg-white rounded-xl shadow divide-y">
          {articles.map(art => (
            <div key={art.id} className="p-4 flex justify-between items-center group">
              <div>
                <p className="font-bold text-sm">{art.title}</p>
                <p className="text-xs text-stone-400">{art.category} - {art.dateString}</p>
              </div>
              <button onClick={() => handleDelete(art.id)} className="text-stone-300 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- SITIO PÚBLICO Y DETALLE (RESUMIDOS) ---
function PublicSite({ articles, onReadMore }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {articles.map(art => (
        <div key={art.id} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer" onClick={() => onReadMore(art)}>
          <img src={art.imageUrl || art.image} className="w-full h-48 object-cover" />
          <div className="p-4">
            <span className="text-[10px] font-bold text-red-700 uppercase">{art.category}</span>
            <h3 className="font-bold text-lg leading-tight mt-1">{art.title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}

function ArticleDetail({ article, onBack }) {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
      <button onClick={onBack} className="text-red-900 font-bold mb-4 inline-block">← Volver</button>
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <img src={article.imageUrl || article.image} className="w-full rounded-lg mb-6" />
      <div className="prose lg:prose-xl whitespace-pre-wrap">{article.fullContent}</div>
    </div>
  );
}
