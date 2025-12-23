import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithCustomToken 
} from 'firebase/auth';
import { 
  PlusCircle, 
  Trash2, 
  Newspaper, 
  MessageCircle, 
  PenTool, 
  Mic, 
  LogOut, 
  Layout, 
  Image as ImageIcon,
  Menu,
  X,
  User,
  MapPin,
  Target,
  Users,
  ChevronLeft,
  Calendar
} from 'lucide-react';

// --- CONFIGURACIÓN FIREBASE (NO EDITAR) ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- DATOS DE EJEMPLO (TU LISTA) ---
const INITIAL_DATA = [
	{
        id: 23,
        title: `ANOET estudia los festejos de los últimos 15 años en Castilla-La Mancha`,
        imageUrl: "", // Simulamos imagen vacia o placeholder si la ruta es local
        image: "/images/ANOET1nueva.jpg",
        footerImage1: "/images/ANOET2.jpg",
        footerImage2: "/images/ANOET3.jpg",
        footerImage3: "/images/ANOET4.jpg",
        category: "Actualidad",
        dateString: "14 de Diciembre de 2025",
        excerpt: "Completo informe estadístico sobre la presencia taurina en esta comunidad entre 2010 y 2024",
        fullContent: `La Asociación Nacional de Organizadores de Espectáculos Taurinos (ANOET) sigue trabajando en el estudio estadístico de la Tauromaquia por comunidades y en esta ocasión centra su atención en Castilla-La Mancha para constatar la amplia presencia del hecho taurino en esta zona de España.\n\nEl estudio abarca un periodo de 15 años (de 2010 a 2024), lo que permite comprobar la evolución de los festejos celebrados en esta comunidad, además de conocer el número de asistentes y de reses lidiadas en los mismos. Este informe se une a los ya publicados de Andalucía, la Comunidad Foral de Navarra, Madrid y Extremadura.\n\nCon este nuevo estudio, realizado en colaboración con la Junta de Comunidades de Castilla-La Mancha, ANOET aporta numerosos datos sobre la celebración de festejos en esta comunidad. Este informe se presenta en un formato digital interactivo que permite introducir numerosas variables en las búsquedas. A través de este trabajo, el usuario puede acceder al número de festejos que se celebraron en un año determinado, segmentarlos por localidades y dividirlos por tipología. También aporta tablas comparativas que permiten una visión por años, provincias, categoría de plazas, etc.\n\n**Mapa**\n\nEste informe sobre los toros en Castilla-La Mancha comienza con un mapa que permite visualizar la actividad taurina en esta comunidad, pudiéndose apreciar una amplia presencia. La cifra total de festejos celebrados en los 15 años objeto de análisis es de 22.221, de los cuales 883 son corridas de toros, 592 novilladas picadas y 553 festejos de rejones. Las novilladas sin picar ascienden a 1.066, predominando muy por encima de todos ellos los festejos populares, de los que se celebraron 16.750 en total.\n\nDe los festejos en plaza, fueron mayoría los celebrados en cosos de tercera, 7.536, seguidos de los de plazas portátiles con 4.800 y segunda con 656. En otros recintos se celebraron más de 9.229 festejos.\n\n**Por años**\n\nEste trabajo estadístico muestra la evolución de los festejos a través de los años, en la que se observa el pico más alto en 2011 con 2.059 festejos, produciéndose un descenso en los años siguientes, en los que se mantiene entre 1.600 y 1.700 festejos hasta la pandemia. Después de esta vuelve a superar los 1.600 en 2022 y baja ligeramente en 2023 y 2024, pero manteniéndose en esos dos años por encima de los 1.500.\n\nPor tipo de festejo, el año que más corridas de toros presenta es 2010, seguido de 2018 y 2022. Si atendemos a las novilladas, el año que más es 2010 seguido de 2011, bajando desde 2012 a la mitad y manteniendo a partir de ahí esa misma línea. El informe demuestra que septiembre es el mes más taurino en Castilla-La Mancha.`,
        author: "Manolo Herrera",
        authorLogo: "/images/manoloherrera.jpg",
        showAuthorHeader: true
   },
   {
        id: 24,
        title: `Borja Jiménez, protagonista en la II Gala de Premios de la Asociación Cultural Taurina ‘Chenel y Oro’ en Las Ventas`,
        image: "/images/protagonista1.jpg",
        category: "Actualidad",
        dateString: "14 de Diciembre de 2025",
        fullContent: `**La Asociación Cultural Taurina ‘Chenel y Oro’** celebró el pasado sábado 13 de diciembre la segunda edición de su Gala de Premios, un acto que tuvo lugar a partir de las 12:00 horas en la Sala Antonio Bienvenida de la Plaza de Toros de **Las Ventas**.\n\nEl momento más destacado de la jornada fue la entrega del premio a la mejor faena de la temporada, que recayó en **Borja Jiménez** por su histórica actuación frente al toro ‘**Milhijas**’, de la ganadería de **Victorino Martín**, lidiado el pasado mes de junio en el coso venteño.\n\nDurante la gala también se procedió a la entrega de los reconocimientos correspondientes al **II Premio Internacional ‘Joven por la Tauromaquia’**, distinguiendo a jóvenes premiados por su compromiso y defensa de la Fiesta, así como a distintos profesionales que han sobresalido a lo largo de la temporada 2025 en Las Ventas, en un acto que puso en valor a todos los estamentos del toreo.`,
        author: "Eduardo Elvira",
        authorLogo: "/images/edu4.jpg",
        showAuthorHeader: true
   },
   {
        id: 45,
        title: `Triunfo de la terna y Manuel de María que deslumbra en su debut en Alcaudete de la Jara`,
        image: "/images/triunfo.jpg",
        category: "Crónicas",
        dateString: "7 de Diciembre de 2025",
        footerImage1: "/images/foto1.jpg",
        footerImage1Caption: "Fotos de Luis Muñoz",
        footerImage2: "/images/foto2.jpg",
        plaza: "Plaza de toros de Alcaudete de La Jara (Toledo).",
        ganaderia: "Alcurrucen",
        torerosRaw: `Jesús Navalucillos (Escuela Taurina Domingo Ortega de Toledo) Dos Orejas\nPablo Méndez (Escuela Taurina de Guadalajara)*Dos Orejas\nÁlvaro Sánchez (Escuela Taurina Domingo Ortega de Toledo) Dos orejas y rabo\nManuel de María (Escuela Taurina José Cubero Yiyo de Madrid) Dos orejas y rabo.`,
        fullContent: `En conjunto, los jóvenes alumnos mostraron su progreso, dejando patente su ilusión, entrega y buenas maneras ante los novillos de Alcurrucén. Cada uno, desde su propio momento de aprendizaje, logró conectar con los tendidos y ofrecer una tarde llena de espontaneidad y torería en formación.\n\nCerró el festejo **Manuel de María**, convirtiéndose en la sorpresa de la tarde en su debut. Con desparpajo, naturalidad y una serenidad impropia de su edad, conectó rápidamente con el público y dejó instantes de gran emoción.\n\n**Su actuación fue una de las más celebradas del festejo y abrió un horizonte ilusionante.**\n\n**Plaza de toros de Alcaudete de La Jara (Toledo)**. Clase práctica.\n**Novillos de Alcurrucén**, de buen juego en su conjunto. Lleno en los tendidos.`,
        author: "Eduardo Elvira",
        authorLogo: "/images/edu4.jpg",
        showAuthorHeader: true
   },
   {
    id: 40,
    title: `Nicolás Grande, el joven que reivindica la tauromaquia desde las redes: “Mi generación es el futuro de este arte”`,
    image: "/images/nicolas.jpg",
    category: "Entrevistas",
    dateString: "9 de Diciembre de 2025",
    fullContent: `Con apenas unos años de presencia en redes sociales, **Nicolás Grande** se ha convertido en una de las voces jóvenes más visibles en defensa de la tauromaquia. Estudiante de veterinaria y apasionado del toro, su discurso rompe clichés: no viene de una familia taurina ni creció rodeado de corridas, pero encontró en los sanfermines el inicio de una fascinación que marcaría su camino.\n\nPor eso, desde Portal Tendido Digital hemos querido entrevistarle para conocerle algo más.\n\n**Nicolás, estudias veterinaria. ¿Qué te llevó a interesarte por la tauromaquia, y cómo concilias ese amor por los animales con la defensa del espectáculo taurino?**\n\nMi verdadera pasión son los animales. El toro de lidia fue, desde el principio, lo que despertó mi interés por este espectáculo. Yo no vengo de una familia especialmente taurina, pero ver cada 7 de julio en las calles de Pamplona a esos animales majestuosos correr fue lo que me generó una fascinación enorme.`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   }
];


// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('public'); // 'public', 'admin', 'detail'
  const [activeArticle, setActiveArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Autenticación y Carga de Datos
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Escuchar cambios y Autocarga de datos (Seed)
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'taurine_news'));
    
    const unsubscribeData = onSnapshot(q, async (snapshot) => {
      // Si está vacía, cargamos los datos de ejemplo (SOLO UNA VEZ)
      if (snapshot.empty && !localStorage.getItem('dataSeeded')) {
        console.log("Cargando datos de ejemplo...");
        const batch = writeBatch(db);
        INITIAL_DATA.forEach((item) => {
           const docRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'taurine_news'));
           batch.set(docRef, { ...item, createdAt: serverTimestamp() });
        });
        await batch.commit();
        localStorage.setItem('dataSeeded', 'true');
      }

      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Orden personalizado si tienen fecha real o createdAt
      const sortedDocs = docs.sort((a, b) => {
        // Priorizar createdAt de firebase, fallback a id para el ejemplo
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setArticles(sortedDocs);
      setLoading(false);
    }, (error) => {
      console.error("Error al leer noticias:", error);
      setLoading(false);
    });

    return () => unsubscribeData();
  }, [user]);

  const handleReadMore = (article) => {
    setActiveArticle(article);
    setView('detail');
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setActiveArticle(null);
    setView('public');
  };

  // --- RENDERIZADO ---
  if (loading && !user) return <div className="flex items-center justify-center h-screen bg-stone-100 text-stone-600 animate-pulse">Cargando plaza y enlotando reses...</div>;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      {/* Navegación Superior */}
      <nav className="bg-red-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => setView('public')}>
              <div className="bg-yellow-500 p-2 rounded-full mr-3 border-2 border-yellow-200 shadow-md">
                <Newspaper className="h-6 w-6 text-red-900" />
              </div>
              <span className="font-bold text-xl tracking-wider uppercase font-serif">Mundo Taurino</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView(view === 'admin' ? 'public' : 'admin')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                  view === 'admin' 
                    ? 'bg-yellow-500 text-red-900 border-yellow-600 hover:bg-yellow-400' 
                    : 'bg-transparent text-white border-white/30 hover:bg-red-800'
                }`}
              >
                {view === 'admin' ? 'Volver a la Web' : 'Administración'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 min-h-[80vh]">
        {view === 'admin' ? (
          <AdminPanel user={user} articles={articles} />
        ) : view === 'detail' && activeArticle ? (
          <ArticleDetail article={activeArticle} onBack={handleBack} />
        ) : (
          <PublicSite articles={articles} onReadMore={handleReadMore} />
        )}
      </main>
      
      <footer className="bg-stone-900 text-stone-400 py-10 mt-12 border-t-4 border-yellow-600">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Newspaper className="h-8 w-8 mx-auto text-stone-600 mb-4" />
          <p className="mb-2">© 2025 Mundo Taurino. Todos los derechos reservados.</p>
          <p className="text-xs text-stone-600">Pasión, Arte y Cultura.</p>
        </div>
      </footer>
    </div>
  );
}

// --- COMPONENTE: DETALLE DE NOTICIA (COMPLETO) ---
function ArticleDetail({ article, onBack }) {
  // Función para procesar texto con negritas **texto** y saltos de línea
  const renderContent = (text) => {
    if (!text) return null;
    return text.split('\n').map((paragraph, idx) => {
      // Reemplazo simple de **texto** por <b>texto</b>
      const parts = paragraph.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="mb-4 leading-relaxed text-stone-800 text-lg">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-bold text-stone-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="animate-fade-in pb-10">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-red-800 font-semibold hover:underline"
      >
        <ChevronLeft className="w-5 h-5 mr-1" /> Volver a portada
      </button>

      <article className="bg-white rounded-xl shadow-xl overflow-hidden border border-stone-200">
        {/* Cabecera Noticia */}
        <div className="relative h-64 md:h-96 bg-stone-900">
          <img 
            src={article.imageUrl || article.image} 
            onError={(e) => {e.target.onerror = null; e.target.src = "https://placehold.co/800x400?text=Imagen+No+Disponible"}}
            className="w-full h-full object-cover opacity-90"
            alt={article.title} 
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-10">
            <span className="inline-block px-3 py-1 bg-yellow-500 text-red-900 text-xs font-bold uppercase rounded mb-3">
              {article.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight shadow-black drop-shadow-md">
              {article.title}
            </h1>
            <div className="flex items-center mt-4 text-stone-300 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              {article.dateString || article.date}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-10">
          {/* Columna Izquierda: Contenido */}
          <div className="lg:col-span-8">
            
            {/* Ficha Técnica (Solo si es Crónica) */}
            {(article.plaza || article.ganaderia || article.torerosRaw) && (
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-6 mb-8 shadow-sm">
                <h3 className="text-red-900 font-bold uppercase tracking-widest text-sm mb-4 border-b border-red-200 pb-2">Ficha del Festejo</h3>
                <div className="grid grid-cols-1 gap-4">
                  {article.plaza && (
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-stone-400 mr-3 mt-0.5" />
                      <div>
                        <span className="font-bold text-stone-700 block">Plaza</span>
                        <span className="text-stone-600">{article.plaza}</span>
                      </div>
                    </div>
                  )}
                  {article.ganaderia && (
                    <div className="flex items-start">
                      <Target className="w-5 h-5 text-stone-400 mr-3 mt-0.5" />
                      <div>
                        <span className="font-bold text-stone-700 block">Ganadería</span>
                        <span className="text-stone-600">{article.ganaderia}</span>
                      </div>
                    </div>
                  )}
                  {article.torerosRaw && (
                    <div className="flex items-start">
                      <Users className="w-5 h-5 text-stone-400 mr-3 mt-0.5" />
                      <div className="w-full">
                        <span className="font-bold text-stone-700 block">Ficha Artística</span>
                        <div className="text-stone-600 whitespace-pre-line mt-1 bg-white p-3 rounded border border-stone-100 text-sm">
                          {article.torerosRaw}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Texto Principal */}
            <div className="prose prose-stone max-w-none mb-8 font-serif">
              {article.excerpt && (
                <p className="text-xl font-medium text-stone-600 mb-6 italic border-l-4 border-red-800 pl-4">
                  {article.excerpt}
                </p>
              )}
              {renderContent(article.fullContent || article.body)}
            </div>

            {/* Galería Footer */}
            {(article.footerImage1 || article.footerImage2 || article.footerImage3) && (
              <div className="mt-10 pt-10 border-t border-stone-200">
                <h3 className="text-xl font-serif font-bold mb-4">Galería Gráfica</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {article.footerImage1 && <img src={article.footerImage1} onError={(e) => e.target.style.display='none'} className="rounded-lg shadow-md hover:shadow-xl transition-shadow w-full h-48 object-cover" alt="Galería 1" />}
                  {article.footerImage2 && <img src={article.footerImage2} onError={(e) => e.target.style.display='none'} className="rounded-lg shadow-md hover:shadow-xl transition-shadow w-full h-48 object-cover" alt="Galería 2" />}
                  {article.footerImage3 && <img src={article.footerImage3} onError={(e) => e.target.style.display='none'} className="rounded-lg shadow-md hover:shadow-xl transition-shadow w-full h-48 object-cover" alt="Galería 3" />}
                  {article.footerImage4 && <img src={article.footerImage4} onError={(e) => e.target.style.display='none'} className="rounded-lg shadow-md hover:shadow-xl transition-shadow w-full h-48 object-cover" alt="Galería 4" />}
                </div>
                {article.footerImage1Caption && <p className="text-xs text-stone-500 mt-2 text-center">{article.footerImage1Caption}</p>}
              </div>
            )}
          </div>

          {/* Columna Derecha: Autor e Info Extra */}
          <div className="lg:col-span-4 space-y-6">
            {article.showAuthorHeader && article.author && (
              <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 shadow-sm sticky top-24">
                <h4 className="text-xs font-bold uppercase text-stone-400 mb-4 tracking-wider">Escrito por</h4>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-stone-300">
                    {article.authorLogo ? (
                       <img src={article.authorLogo} onError={(e) => e.target.src="https://via.placeholder.com/64?text=Autor"} className="w-full h-full object-cover" alt={article.author} />
                    ) : (
                       <User className="w-full h-full p-3 text-stone-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 text-lg">{article.author}</p>
                    <p className="text-xs text-stone-500">Redactor Mundo Taurino</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-red-900 text-white p-6 rounded-lg shadow-lg">
              <h3 className="font-serif font-bold text-xl mb-2">¿Te ha gustado?</h3>
              <p className="text-red-100 text-sm mb-4">Comparte la pasión taurina con tus amigos y en redes sociales.</p>
              <button className="w-full py-2 bg-yellow-500 text-red-900 font-bold rounded hover:bg-yellow-400 transition-colors">
                Compartir Noticia
              </button>
            </div>
          </div>

        </div>
      </article>
    </div>
  );
}

// --- COMPONENTE: SITIO PÚBLICO (LISTADO) ---
function PublicSite({ articles, onReadMore }) {
  const [filter, setFilter] = useState('Todas');
  
  const filteredArticles = filter === 'Todas' 
    ? articles 
    : articles.filter(art => art.category === filter);

  return (
    <div className="animate-fade-in">
      {/* Hero Section Simplificado */}
      <div className="mb-8 text-center bg-white rounded-xl p-8 shadow-sm border border-stone-100">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-2">Actualidad Taurina</h1>
        <div className="w-24 h-1 bg-red-800 mx-auto rounded-full mb-4"></div>
        <p className="text-stone-500">La información más veraz y completa del mundo del toro.</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 sticky top-20 z-40 bg-stone-50/95 p-2 rounded-lg backdrop-blur-sm">
        {['Todas', 'Actualidad', 'Crónicas', 'Entrevistas', 'Opinión'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              filter === cat
                ? 'bg-red-900 text-white shadow-md transform scale-105'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-red-300 hover:text-red-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-stone-200">
          <Newspaper className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-xl text-stone-500 font-serif">No hay publicaciones en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} onReadMore={() => onReadMore(article)} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- COMPONENTE: TARJETA DE NOTICIA ---
function ArticleCard({ article, onReadMore }) {
  const getIcon = (cat) => {
    switch(cat) {
      case 'Entrevistas': return <Mic className="w-3 h-3" />;
      case 'Crónicas': return <PenTool className="w-3 h-3" />;
      case 'Opinión': return <MessageCircle className="w-3 h-3" />;
      default: return <Newspaper className="w-3 h-3" />;
    }
  };

  // Usar imageUrl (subida) o image (ruta estática)
  const displayImage = article.imageUrl || article.image;

  return (
    <article className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-stone-100 flex flex-col h-full transform hover:-translate-y-1">
      <div className="h-56 overflow-hidden bg-stone-200 relative cursor-pointer" onClick={onReadMore}>
        {displayImage ? (
          <img 
            src={displayImage} 
            onError={(e) => {e.target.onerror = null; e.target.src = "https://placehold.co/600x400?text=Sin+Imagen"}}
            alt={article.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
            <ImageIcon className="w-10 h-10" />
          </div>
        )}
        <div className="absolute top-4 left-4">
           <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-stone-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
             {getIcon(article.category)} {article.category}
           </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between text-stone-400 text-xs mb-3 font-medium">
           <span className="uppercase tracking-wider">{article.dateString || article.date || 'Fecha desconocida'}</span>
        </div>
        
        <h3 
          onClick={onReadMore}
          className="text-xl font-bold text-stone-900 mb-3 leading-tight font-serif group-hover:text-red-800 transition-colors cursor-pointer"
        >
          {article.title}
        </h3>
        
        <p className="text-stone-600 text-sm line-clamp-3 mb-4 flex-grow">
          {article.excerpt || article.fullContent || article.body}
        </p>

        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
           {article.author ? (
             <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded-full bg-stone-200 overflow-hidden">
                 {article.authorLogo && <img src={article.authorLogo} className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />}
               </div>
               <span className="text-xs font-bold text-stone-600">{article.author}</span>
             </div>
           ) : <span></span>}
           
           <button 
             onClick={onReadMore}
             className="text-red-700 font-bold text-sm hover:text-red-900 flex items-center gap-1 group/btn"
           >
             Leer más <span className="group-hover/btn:translate-x-1 transition-transform">&rarr;</span>
           </button>
        </div>
      </div>
    </article>
  );
}

// --- COMPONENTE: PANEL DE ADMINISTRACIÓN ---
function AdminPanel({ user, articles }) {
  // Formulario Extendido
  const [formData, setFormData] = useState({
    title: '',
    category: 'Actualidad',
    dateString: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
    excerpt: '',
    fullContent: '',
    imageUrl: '',
    // Campos extra
    author: 'Redacción',
    authorLogo: '',
    showAuthorHeader: true,
    // Crónicas
    plaza: '',
    ganaderia: '',
    torerosRaw: '',
    // Galerías
    footerImage1: '',
    footerImage2: '',
    footerImage3: '',
  });

  const [activeTab, setActiveTab] = useState('contenido'); // contenido, media, tecnica
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800000) { 
        alert("Imagen muy grande para la demo. (< 800kb)"); return; 
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.fullContent) {
        alert("Faltan campos obligatorios (Título o Contenido)");
        return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'taurine_news'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      
      // Reset (manteniendo autor por comodidad)
      setFormData(prev => ({ 
        title: '', 
        category: 'Actualidad', 
        dateString: prev.dateString,
        excerpt: '', 
        fullContent: '', 
        imageUrl: '',
        author: prev.author,
        authorLogo: prev.authorLogo,
        showAuthorHeader: true,
        plaza: '',
        ganaderia: '',
        torerosRaw: '',
        footerImage1: '',
        footerImage2: '',
        footerImage3: ''
      }));

      setNotification({ type: 'success', message: '¡Publicado con éxito!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error posting:", error);
      setNotification({ type: 'error', message: 'Error al publicar.' });
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if(!confirm("¿Borrar permanentemente?")) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'taurine_news', id)); } catch (e) { console.error(e); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Columna Izquierda: Editor */}
      <div className="lg:col-span-5 xl:col-span-4">
        <div className="bg-white rounded-xl shadow-lg border-t-4 border-red-900 sticky top-24 overflow-hidden">
          <div className="p-6 bg-red-900 text-white">
             <h2 className="text-xl font-bold flex items-center font-serif">
                <PlusCircle className="mr-2" /> Editor de Noticias
             </h2>
             <p className="text-red-200 text-sm">Completa los datos para publicar</p>
          </div>
          
          {/* Tabs del Editor */}
          <div className="flex border-b border-stone-200">
            <button 
                onClick={() => setActiveTab('contenido')}
                className={`flex-1 py-3 text-sm font-bold ${activeTab === 'contenido' ? 'text-red-900 border-b-2 border-red-900 bg-red-50' : 'text-stone-500'}`}
            >Contenido</button>
            <button 
                onClick={() => setActiveTab('media')}
                className={`flex-1 py-3 text-sm font-bold ${activeTab === 'media' ? 'text-red-900 border-b-2 border-red-900 bg-red-50' : 'text-stone-500'}`}
            >Imágenes</button>
            <button 
                onClick={() => setActiveTab('tecnica')}
                className={`flex-1 py-3 text-sm font-bold ${activeTab === 'tecnica' ? 'text-red-900 border-b-2 border-red-900 bg-red-50' : 'text-stone-500'}`}
            >Ficha</button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            
            {/* --- TAB CONTENIDO --- */}
            {activeTab === 'contenido' && (
                <>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Título</label>
                        <input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded focus:border-red-500 outline-none" placeholder="Titular de la noticia..." required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Categoría</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded focus:border-red-500 outline-none bg-white">
                                <option>Actualidad</option>
                                <option>Crónicas</option>
                                <option>Entrevistas</option>
                                <option>Opinión</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Fecha (Texto)</label>
                            <input name="dateString" value={formData.dateString} onChange={handleChange} className="w-full p-2 border rounded focus:border-red-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Entradilla (Resumen corto)</label>
                        <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} className="w-full p-2 border rounded h-20 text-sm" placeholder="Breve resumen que aparece en negrita..." />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Cuerpo Completo</label>
                        <textarea name="fullContent" value={formData.fullContent} onChange={handleChange} className="w-full p-2 border rounded h-64 text-sm font-mono" placeholder="Usa **texto** para negritas. Escribe todo el artículo aquí..." required />
                        <p className="text-xs text-stone-400 mt-1">Tip: Usa doble salto de línea para párrafos.</p>
                    </div>
                </>
            )}

            {/* --- TAB MEDIA --- */}
            {activeTab === 'media' && (
                <>
                    <div className="space-y-4">
                         <div className="border-2 border-dashed border-stone-300 rounded p-4 text-center">
                            <p className="text-sm font-bold text-stone-600 mb-2">Imagen de Portada (Principal)</p>
                            <input type="file" onChange={(e) => handleImageUpload(e, 'imageUrl')} className="block w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"/>
                            {formData.imageUrl && <img src={formData.imageUrl} className="h-20 mx-auto mt-2 rounded object-cover" />}
                         </div>

                         <div className="border-t pt-4">
                            <p className="text-sm font-bold text-stone-600 mb-2">Galería Inferior (Opcional)</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[1, 2, 3].map(num => (
                                    <div key={num} className="bg-stone-50 p-2 rounded text-center">
                                        <span className="text-xs text-stone-400 block mb-1">Img {num}</span>
                                        <input type="file" onChange={(e) => handleImageUpload(e, `footerImage${num}`)} className="w-full text-[10px]" />
                                        {formData[`footerImage${num}`] && <img src={formData[`footerImage${num}`]} className="h-10 mx-auto mt-1 rounded" />}
                                    </div>
                                ))}
                            </div>
                         </div>

                         <div className="border-t pt-4">
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Nombre Autor</label>
                            <input name="author" value={formData.author} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
                            
                            <label className="block text-xs font-bold text-stone-500 uppercase mt-2 mb-1">Logo Autor (Opcional)</label>
                            <input type="file" onChange={(e) => handleImageUpload(e, 'authorLogo')} className="text-xs w-full" />
                            {formData.authorLogo && <img src={formData.authorLogo} className="w-10 h-10 rounded-full mt-2" />}
                         </div>
                    </div>
                </>
            )}

            {/* --- TAB TECNICA --- */}
            {activeTab === 'tecnica' && (
                <div className="space-y-4">
                    <div className="bg-yellow-50 p-3 rounded text-yellow-800 text-xs mb-2">
                        Estos campos son útiles para las <strong>Crónicas</strong>. Aparecerán en un cuadro de "Ficha del Festejo".
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Plaza</label>
                        <input name="plaza" value={formData.plaza} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Ej: Las Ventas (Madrid)" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Ganadería</label>
                        <input name="ganaderia" value={formData.ganaderia} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Ej: Victorino Martín" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Ficha Artística (Toreros)</label>
                        <textarea name="torerosRaw" value={formData.torerosRaw} onChange={handleChange} className="w-full p-2 border rounded h-32" placeholder={`Ej:\nMorante: Oreja y ovación\nRoca Rey: Dos orejas`} />
                    </div>
                </div>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-red-900 text-white font-bold rounded shadow hover:bg-red-800 transition-colors">
              {isSubmitting ? 'Publicando...' : 'PUBLICAR AHORA'}
            </button>
            
            {notification && (
                <div className={`text-center text-sm font-bold p-2 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {notification.message}
                </div>
            )}
          </form>
        </div>
      </div>

      {/* Columna Derecha: Listado */}
      <div className="lg:col-span-7 xl:col-span-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-stone-800 font-serif">Noticias Publicadas ({articles.length})</h2>
            <div className="text-sm text-stone-500">Ordenado por fecha (más reciente)</div>
        </div>
        
        <div className="bg-white rounded-xl shadow border border-stone-200 overflow-hidden">
            {articles.length === 0 ? (
                <div className="p-10 text-center text-stone-400">No hay noticias.</div>
            ) : (
                <ul className="divide-y divide-stone-100">
                    {articles.map((art) => (
                        <li key={art.id} className="p-4 hover:bg-stone-50 flex gap-4 items-start group">
                            <div className="w-20 h-20 bg-stone-200 rounded flex-shrink-0 overflow-hidden">
                                <img src={art.imageUrl || art.image} onError={(e)=>e.target.style.display='none'} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold uppercase bg-stone-100 px-2 py-0.5 rounded text-stone-600">{art.category}</span>
                                    <span className="text-xs text-stone-400">{art.dateString}</span>
                                </div>
                                <h4 className="font-bold text-stone-900 line-clamp-1">{art.title}</h4>
                                <p className="text-xs text-stone-500 line-clamp-2 mt-1">{art.excerpt || art.fullContent}</p>
                            </div>
                            <button onClick={() => handleDelete(art.id)} className="p-2 text-stone-300 hover:text-red-600 transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
    </div>
  );
}