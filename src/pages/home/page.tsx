import { useState, useEffect } from 'react';

// Interfaces para tipado seguro
interface NewsItem {
  id: number;
  title: string;
  image: string;
  category: string;
  date: string;
  excerpt: string;
  fullContent: string;
  author?: string;
}

interface OpinionArticle {
  title: string;
  author: string;
  excerpt: string;
  date: string;
  image: string;
  fullContent: string;
}

interface Chronicle {
  id: number;
  title: string;
  plaza: string;
  date: string;
  toreros: string[];
  ganaderia: string;
  resultado: string[];
  image: string;
  resumen: string;
  detalles: string;
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [selectedNews, setSelectedNews] = useState<NewsItem | OpinionArticle | null>(null);
  const [selectedChronicle, setSelectedChronicle] = useState<Chronicle | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isChronicleModalOpen, setIsChronicleModalOpen] = useState(false);
  const [visibleNewsCount, setVisibleNewsCount] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');
  const [newsFilter, setNewsFilter] = useState('todas');
  
  // Estados para interacciones sociales (sin contadores de likes)
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharePost, setSharePost] = useState<NewsItem | OpinionArticle | Chronicle | null>(null);
  
  // Estados para formularios
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');
  
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  // Schema.org JSON-LD para SEO
  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "NewsMediaOrganization",
      "name": "TENDIDO DIGITAL",
      "url": typeof window !== 'undefined' ? window.location.origin : "https://tendidodigital.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://static.readdy.ai/image/5110ce3ba25b092cb363e0b1bb235016/55c94eda702705e59cc93222640b4a72.jfif"
      },
      "description": "Portal taurino de referencia en España. Noticias, crónicas, entrevistas y toda la actualidad del mundo del toro con más de 15 años de experiencia.",
      "foundingDate": "2010",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "ES"
      },
      "sameAs": [
        "https://facebook.com/tendidodigital",
        "https://twitter.com/tendidodigital",
        "https://instagram.com/tendidodigital",
        "https://youtube.com/tendidodigital"
      ],
      "mainEntity": {
        "@type": "WebSite",
        "url": typeof window !== 'undefined' ? window.location.origin : "https://tendidodigital.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${typeof window !== 'undefined' ? window.location.origin : "https://tendidodigital.com"}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    };

    const scriptId = 'tendido-schema-org';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = scriptId;
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  // Función para manejar suscripción al newsletter
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setIsNewsletterSubmitting(true);
    setNewsletterMessage('');

    try {
      const formData = new FormData();
      formData.append('email', newsletterEmail);

      const response = await fetch('https://readdy.ai/api/form/d3fehu1rrun81ijtot9g', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setNewsletterMessage('¡Gracias por suscribirte! Recibirás nuestras mejores noticias taurinas.');
        setNewsletterEmail('');
      } else {
        setNewsletterMessage('Error al procesar la suscripción. Inténtalo de nuevo.');
      }
    } catch (error) {
      setNewsletterMessage('Error de conexión. Verifica tu conexión a internet.');
    } finally {
      setIsNewsletterSubmitting(false);
    }
  };

  // Función para manejar formulario de contacto
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      setContactMessage('Por favor, completa todos los campos obligatorios.');
      return;
    }

    setIsContactSubmitting(true);
    setContactMessage('');

    try {
      const formData = new FormData();
      formData.append('name', contactForm.name);
      formData.append('email', contactForm.email);
      formData.append('subject', contactForm.subject);
      formData.append('message', contactForm.message);

      const response = await fetch('https://readdy.ai/api/form/d3fehu1rrun81ijtota0', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setContactMessage('¡Mensaje enviado correctamente! Te responderemos pronto');
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setContactMessage('Error al enviar el mensaje. Inténtalo de nuevo.');
      }
    } catch (error) {
      setContactMessage('Error de conexión. Verifica tu conexión a internet.');
    } finally {
      setIsContactSubmitting(false);
    }
  };

  // Funciones para interacciones sociales (sin likes)
  const toggleSave = (postId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    setSavedPosts(prev => {
      const newSaved = new Set(prev);
      if (newSaved.has(postId)) {
        newSaved.delete(postId);
      } else {
        newSaved.add(postId);
      }
      return newSaved;
    });
  };

  const openShareModal = (post: NewsItem | OpinionArticle | Chronicle, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSharePost(post);
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setSharePost(null);
  };

  const shareToWhatsApp = () => {
    if (sharePost) {
      const text = `¡Mira esta noticia taurina! ${sharePost.title} - ${window.location.origin}`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      closeShareModal();
    }
  };

  const shareToTwitter = () => {
    if (sharePost) {
      const text = `${sharePost.title} - vía @tendidodigital`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      closeShareModal();
    }
  };

  const shareToFacebook = () => {
    if (sharePost) {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      closeShareModal();
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setContactMessage('¡Enlace copiado al portapapeles!');
      closeShareModal();
      setTimeout(() => setContactMessage(''), 3000);
    } catch (error) {
      console.error('Error al copiar enlace:', error);
    }
  };

  // Obtener posts filtrados según la pestaña activa
  const getFilteredPosts = () => {
    const allPosts = [...featuredNews, ...latestNews];
    
    switch (activeTab) {
      case 'guardados':
        return allPosts.filter(post => savedPosts.has(post.id));
      case 'cronicas':
        return chronicles;
      default:
        return allPosts;
    }
  };

  // Obtener noticias filtradas por categoría
  const getFilteredNews = () => {
    if (newsFilter === 'todas') {
      return latestNews;
    }
    if (newsFilter === 'cronicas') {
      return latestNews.filter(news => news.category === 'Crónicas');
    }
    if (newsFilter === 'opinion') {
      return latestNews.filter(news => news.category === 'Opinión');
    }
    if (newsFilter === 'redaccion') {
      return latestNews.filter(news => news.category === 'Actualidad');
    }
    return latestNews.filter(news => 
      news.category.toLowerCase() === newsFilter
    );
  };

  const featuredNews: NewsItem[] = [
    {
      id: 1,
      title: "",
      image: "",
      category: "",
      date: "",
      excerpt: "",
      fullContent: ""
    },
    {
      id: 2,
      title: "",
      image: "",
      category: "",
      date: "",
      excerpt: "",
      fullContent: ""
    },
    {
      id: 3,
      title: "",
      image: "",
      category: "",
      date: "",
      excerpt: "",
      fullContent: ""
    }
  ];

  const latestNews: NewsItem[] = [
    {
      id: 4,
      title: "Toro a Toro: Novillada Madrid",
      plaza: "Plaza de Toros Madrid",
      date: "10 de Octubre de 2025",
      toreros: ["Bruno Aloi","El Mene","Pedro Luis"],
      ganaderia: "Fuente Ymbro",
      resultado: [ "Salía el primer NOVILLO de fuente justo de fuerzas, en el caballo dejo toda la fuerza tras dos puyazos y largos, a lo largo de la corta faena, el novillo estuvo más en el la tierra que de pie, estocada entera y en buen sitio" 
      ],
      image: "images/lasventascronica.jpg",
      resumen: "NOVILLOS",
      detalles: "PRIMER NOVILLO: Salía el primer NOVILLO de fuente justo de fuerzas, en el caballo dejo toda la fuerza tras dos puyazos y largos, a lo largo de la corta faena, el novillo estuvo más en el la tierra que de pie, estocada entera y en buen sitio."
                "SEGUNDO NOVILLO: Sale el segundo de Fuente Ymbro para el mene, quien recibo con unas pocas verónicas bien dadas, complicado para colocarlo en el caballo. (Quite de Pedro Luis por unas muy buenas chicuelinas ajustadas)Con la muleta dejo algunos pases por ambos pitones, tendia a meterse por los adentros, algunas tandas llenas de enganchones. Mato al Volapié con una estocada entera y en muy buen sitio.1 AvisoPalmas."
                "TERCER NOVILLO: Sale el tercero de la tarde, sin llegar a estar fijo en el capote del joven Pedro Luis, le costó coger celo en el peto, dos puyazos buenos en buen sitio.Brindis al público, recibe en largo al novillo por el derecho, difícil en el quite, pero con algún pase bueno por ambos pitones. Espadazo en buen sitio. 2 Avisos. Palmas en el arrastre Silencio.",
    },
    {
      id: 5,
      title: "",
      image: "",
      category: "",
      date: "",
      excerpt: "",
      fullContent: ""
    },
    {
      id: 6,
      title: "",
      image: "",
      category: "",
      date: "",
      excerpt: "",
      fullContent: ""
    }
  ];

  // Crónicas taurinas
  const chronicles: Chronicle[] = [
    {
      id: 101,
      title: "Toro a Toro: Novillada Madrid",
      plaza: "Plaza de Toros Madrid",
      date: "10 de Octubre de 2025",
      toreros: ["Bruno Aloi","El Mene","Pedro Luis"],
      ganaderia: "Fuente Ymbro",
      resultado: [ "Silencio"],
      image: "images/lasventascronica.jpg",
      resumen: "NOVILLOS",
      detalles: "PRIMER NOVILLO: Salía el primer NOVILLO de fuente justo de fuerzas, en el caballo dejo toda la fuerza tras dos puyazos y largos, a lo largo de la corta faena, el novillo estuvo más en el la tierra que de pie, estocada entera y en buen sitio.",
                "SEGUNDO NOVILLO: Sale el segundo de Fuente Ymbro para el mene, quien recibo con unas pocas verónicas bien dadas, complicado para colocarlo en el caballo. (Quite de Pedro Luis por unas muy buenas chicuelinas ajustadas)Con la muleta dejo algunos pases por ambos pitones, tendia a meterse por los adentros, algunas tandas llenas de enganchones. Mato al Volapié con una estocada entera y en muy buen sitio.1 AvisoPalmas",
                "TERCER NOVILLO: Sale el tercero de la tarde, sin llegar a estar fijo en el capote del joven Pedro Luis, le costó coger celo en el peto, dos puyazos buenos en buen sitio.Brindis al público, recibe en largo al novillo por el derecho, difícil en el quite, pero con algún pase bueno por ambos pitones. Espadazo en buen sitio. 2 Avisos. Palmas en el arrastre Silencio",  
     },
    {
      id: 102,
      title: "",
      plaza: "",
      date: "",
      toreros: [""],
      ganaderia: "",
      resultado: [
        ""
      ],
      image: "",
      resumen: "",
      detalles: ""
    }
  ];

  // Función para cargar más noticias
  const loadMoreNews = () => {
    setIsLoadingMore(true);
    
    setTimeout(() => {
      setVisibleNewsCount(prev => Math.min(prev + 6, getFilteredNews().length));
      setIsLoadingMore(false);
    }, 800);
  };

  // Función para hacer scroll suave a las secciones
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMenuOpen(false);
  };

  // Función para abrir modal de noticia
  const openNewsModal = (news: NewsItem | OpinionArticle) => {
    setSelectedNews(news);
    setIsNewsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Función para cerrar modal de noticia
  const closeNewsModal = () => {
    setIsNewsModalOpen(false);
    setSelectedNews(null);
    document.body.style.overflow = 'unset';
  };

  // Función para abrir modal de crónica
  const openChronicleModal = (chronicle: Chronicle) => {
    setSelectedChronicle(chronicle);
    setIsChronicleModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Función para cerrar modal de crónica
  const closeChronicleModal = () => {
    setIsChronicleModalOpen(false);
    setSelectedChronicle(null);
    document.body.style.overflow = 'unset';
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredNews.length]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (isNewsModalOpen || isChronicleModalOpen) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isNewsModalOpen, isChronicleModalOpen]);

  const renderContent = () => {
    if (activeTab === 'guardados') {
      const savedPostsList = getFilteredPosts();
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mb-4 tracking-tight">
              Noticias Guardadas
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg">
              {savedPostsList.length > 0 ? `Tienes ${savedPostsList.length} noticias guardadas` : 'No tienes noticias guardadas aún'}
            </p>
          </div>
          
          {savedPostsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedPostsList.map((post) => (
                <article 
                  key={post.id} 
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer group border border-gray-100"
                  onClick={() => openNewsModal(post)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover object-top group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg backdrop-blur-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-500 text-sm">{post.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{post.excerpt}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={(e) => toggleSave(post.id, e)}
                          className={`transition-all duration-300 ${
                            savedPosts.has(post.id) 
                              ? 'text-yellow-600' 
                              : 'text-gray-500 hover:text-yellow-600'
                          }`}
                          aria-label={savedPosts.has(post.id) ? 'Quitar de guardados' : 'Guardar noticia'}
                        >
                          <i className={`${savedPosts.has(post.id) ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-lg`}></i>
                        </button>
                        
                        <button 
                          onClick={(e) => openShareModal(post, e)}
                          className="text-gray-500 hover:text-blue-600 transition-colors duration-300"
                          aria-label="Compartir noticia"
                        >
                          <i className="ri-share-line text-lg"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
                <i className="ri-bookmark-line text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No hay noticias guardadas</h3>
                <p className="text-gray-600 mb-6">Guarda tus noticias favoritas para leerlas más tarde</p>
                <button 
                  onClick={() => setActiveTab('inicio')}
                  className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-full font-bold hover:from-red-700 hover:to-red-600 transition-all duration-300"
                >
                  Explorar noticias
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'cronicas') {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mb-4 tracking-tight">
              Crónicas Taurinas
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg">
              Las reseñas completas de los festejos taurinos
            </p>
          </div>
          
          <div className="space-y-6">
            {chronicles.map((chronicle) => (
              <article 
                key={chronicle.id} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 cursor-pointer group border border-gray-100"
                onClick={() => openChronicleModal(chronicle)}
              >
                <div className="p-6">
                  {/* Header con categoría */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm uppercase tracking-wide">
                      {chronicle.plaza.split('(')[0].trim()}
                    </span>
                    <span className="text-gray-500 text-sm font-medium">{chronicle.date}</span>
                  </div>
                  
                  {/* Título principal */}
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 group-hover:text-red-600 transition-colors duration-300 leading-tight">
                    {chronicle.title.split('||')[1]?.trim() || chronicle.title}
                  </h3>
                  
                  {/* Grid con imagen y contenido */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Imagen */}
                    <div className="lg:col-span-1">
                      <div className="relative overflow-hidden rounded-xl aspect-[4/3]">
                        <img
                          src={chronicle.image}
                          alt={chronicle.title}
                          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>
                    
                    {/* Contenido de la crónica */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Información básica */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-semibold text-gray-900">Plaza:</span>
                            <span className="ml-2 text-gray-700">{chronicle.plaza}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">Ganadería:</span>
                            <span className="ml-2 text-red-600 font-medium">{chronicle.ganaderia}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Resultados de los toreros */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-gray-900 text-lg mb-3">Resultados:</h4>
                        {chronicle.toreros.map((torero, index) => (
                          <div key={index} className="flex items-start bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                            <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-lg mb-1">{torero}</p>
                              <p className="text-gray-700 text-sm">{chronicle.resultado[index]}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Resumen */}
                      <div className="bg-red-50 rounded-xl p-4 border-l-4 border-red-500">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <i className="ri-file-text-line mr-2 text-red-600"></i>
                          Resumen de la corrida
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {chronicle.detalles}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer con acciones */}
                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={(e) => toggleSave(chronicle.id, e)}
                        className={`transition-all duration-300 p-2 rounded-full ${
                          savedPosts.has(chronicle.id) 
                            ? 'text-yellow-600 bg-yellow-50' 
                            : 'text-gray-500 hover:text-yellow-600 hover:bg-yellow-50'
                        }`}
                        aria-label={savedPosts.has(chronicle.id) ? 'Quitar de guardados' : 'Guardar crónica'}
                      >
                        <i className={`${savedPosts.has(chronicle.id) ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-xl`}></i>
                      </button>
                      
                      <button 
                        onClick={(e) => openShareModal(chronicle, e)}
                        className="text-gray-500 hover:text-blue-600 transition-colors duration-300 p-2 rounded-full hover:bg-blue-50"
                        aria-label="Compartir crónica"
                      >
                        <i className="ri-share-line text-xl"></i>
                      </button>
                    </div>
                    
                    <button className="text-red-600 hover:text-red-700 font-bold text-sm cursor-pointer whitespace-nowrap flex items-center group bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition-all duration-300">
                      Leer crónica completa
                      <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform duration-300"></i>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      );
    }

    // Contenido principal (inicio)
    return (
      <>
        {/* Hero Carousel */}
        <section id="inicio" className="relative h-[400px] md:h-[600px] overflow-hidden">
          {featuredNews.map((news, index) => (
            <div
              key={news.id}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            >
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-full object-cover object-top"
                loading={index === 0 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-3xl">
                    <div className="flex items-center mb-4">
                      <span className="inline-flex items-center bg-gradient-to-r from-red-600 to-red-500 text-white px-4 md:px-5 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold shadow-lg backdrop-blur-sm">
                        <i className="ri-fire-line mr-2"></i>
                        {news.category}
                      </span>
                      <span className="ml-4 text-white/90 text-xs md:text-sm font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">{news.date}</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">{news.title}</h1>
                    <p className="text-sm md:text-xl text-gray-200 mb-8 leading-relaxed">{news.excerpt}</p>
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => openNewsModal(news)}
                        className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold hover:from-red-700 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-xl cursor-pointer whitespace-nowrap text-sm md:text-base border border-red-400/20"
                      >
                        Leer noticia completa
                      </button>
                      <button
                        onClick={() => scrollToSection('actualidad')}
                        className="bg-white/20 backdrop-blur-sm text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold hover:bg-white/30 transition-all duration-300 cursor-pointer whitespace-nowrap text-sm md:text-base border border-white/20"
                      >
                        Ver más noticias
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Carousel controls */}
          <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 bg-black/30 p-3 rounded-full backdrop-blur-sm">
            {featuredNews.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentSlide 
                    ? 'bg-white scale-125 shadow-lg' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Ir a noticia ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation arrows */}
          <button 
            className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 md:p-4 rounded-full hover:bg-white/30 transition-all duration-300 cursor-pointer border border-white/20"
            onClick={() => setCurrentSlide(currentSlide === 0 ? featuredNews.length - 1 : currentSlide - 1)}
            aria-label="Noticia anterior"
          >
            <i className="ri-arrow-left-line text-xl md:text-2xl"></i>
          </button>
          <button 
            className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 md:p-4 rounded-full hover:bg-white/30 transition-all duration-300 cursor-pointer border border-white/20"
            onClick={() => setCurrentSlide((currentSlide + 1) % featuredNews.length)}
            aria-label="Siguiente noticia"
          >
            <i className="ri-arrow-right-line text-xl md:text-2xl"></i>
          </button>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            {/* Main News Section */}
            <div id="actualidad" className="lg:col-span-2">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 md:mb-12">
                <div className="mb-6 md:mb-0">
                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mb-3 tracking-tight">
                    Últimas Noticias
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full"></div>
                  <p className="text-gray-600 mt-3 text-lg">Mantente al día con la actualidad taurina</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => setNewsFilter('todas')}
                    className={`px-6 md:px-8 py-3 md:py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer whitespace-nowrap font-semibold text-sm md:text-base ${
                      newsFilter === 'todas' 
                        ? 'bg-gradient-to-r from-red-600 to-red-500 text-white border border-red-400/20' 
                        : 'text-gray-700 border-2 border-gray-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    Todas
                  </button>
                  <button 
                    onClick={() => setNewsFilter('redaccion')}
                    className={`px-6 md:px-8 py-3 md:py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer whitespace-nowrap font-semibold text-sm md:text-base ${
                      newsFilter === 'redaccion' 
                        ? 'bg-gradient-to-r from-red-600 to-red-500 text-white border border-red-400/20' 
                        : 'text-gray-700 border-2 border-gray-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    Redacción
                  </button>
                  <button 
                    onClick={() => setNewsFilter('cronicas')}
                    className={`px-6 md:px-8 py-3 md:py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer whitespace-nowrap font-semibold text-sm md:text-base ${
                      newsFilter === 'cronicas' 
                        ? 'bg-gradient-to-r from-red-600 to-red-500 text-white border border-red-400/20' 
                        : 'text-gray-700 border-2 border-gray-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    Crónicas
                  </button>
                  <button 
                    onClick={() => setNewsFilter('opinion')}
                    className={`px-6 md:px-8 py-3 md:py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer whitespace-nowrap font-semibold text-sm md:text-base ${
                      newsFilter === 'opinion' 
                        ? 'bg-gradient-to-r from-red-600 to-red-500 text-white border border-red-400/20' 
                        : 'text-gray-700 border-2 border-gray-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    Opinión
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {getFilteredNews().slice(0, visibleNewsCount).map((news) => (
                  <article 
                    key={news.id} 
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer group border border-gray-100"
                    onClick={() => openNewsModal(news)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={news.image}
                        alt={news.title}
                        className="w-full h-48 md:h-56 object-cover object-top group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 left-4">
                        <span className="bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg backdrop-blur-sm">
                          {news.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500 text-sm">{news.date}</span>
                        <div className="flex items-center text-gray-400">
                          <i className="ri-time-line mr-1"></i>
                          <span className="text-xs">3 min</span>
                        </div>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300 leading-tight tracking-tight">
                        {news.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">{news.excerpt}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={(e) => toggleSave(news.id, e)}
                            className={`transition-all duration-300 ${
                              savedPosts.has(news.id) 
                                ? 'text-yellow-600' 
                                : 'text-gray-500 hover:text-yellow-600'
                            }`}
                            aria-label={savedPosts.has(news.id) ? 'Quitar de guardados' : 'Guardar noticia'}
                          >
                            <i className={`${savedPosts.has(news.id) ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-lg`}></i>
                          </button>
                          
                          <button 
                            onClick={(e) => openShareModal(news, e)}
                            className="text-gray-500 hover:text-blue-600 transition-colors duration-300"
                            aria-label="Compartir noticia"
                          >
                            <i className="ri-share-line text-lg"></i>
                          </button>
                        </div>
                        
                        <button className="text-red-600 hover:text-red-700 font-bold text-sm cursor-pointer whitespace-nowrap flex items-center group">
                          Leer más 
                          <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform duration-300"></i>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Load More Button */}
              {visibleNewsCount < getFilteredNews().length && (
                <div className="text-center mt-12">
                  <button 
                    onClick={loadMoreNews}
                    disabled={isLoadingMore}
                    className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 md:px-10 py-4 md:py-5 rounded-full font-bold hover:from-red-700 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-xl cursor-pointer whitespace-nowrap text-sm md:text-base border border-red-400/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center">
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Cargando...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <i className="ri-add-line mr-2"></i>
                        Cargar más noticias ({getFilteredNews().length - visibleNewsCount} restantes)
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* All loaded message */}
              {visibleNewsCount >= getFilteredNews().length && (
                <div className="text-center mt-12">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200/50">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full">
                        <i className="ri-check-line text-white text-2xl"></i>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">¡Has visto todas las noticias!</h3>
                    <p className="text-gray-600 mb-6">
                      Te has puesto al día con toda la actualidad taurina. Vuelve pronto para más noticias.
                    </p>
                    <button 
                      onClick={() => scrollToSection('inicio')}
                      className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-full font-bold hover:from-blue-700 hover:to-blue-600 transition-all duration-300 cursor-pointer"
                    >
                      Volver al inicio
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Newsletter */}
              <div className="bg-gradient-to-br from-yellow-50 to-red-50 rounded-2xl p-8 shadow-lg border border-yellow-200/50">
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-yellow-500 to-red-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <i className="ri-mail-line text-white text-2xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Boletín Taurino</h3>
                  <p className="text-gray-600 text-sm">
                    Únete a más de <span className="font-bold text-red-600">10,000 aficionados</span> y recibe las mejores noticias
                  </p>
                </div>
                <form onSubmit={handleNewsletterSubmit} className="space-y-4" data-readdy-form id="newsletter-form">
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      placeholder="tu@email.com"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-300 pl-12 shadow-sm"
                      required
                    />
                    <i className="ri-mail-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                  <button
                    type="submit"
                    disabled={isNewsletterSubmitting}
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-4 rounded-xl hover:from-red-700 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer whitespace-nowrap font-bold border border-red-400/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isNewsletterSubmitting ? 'Suscribiendo...' : 'Suscribirse gratis'}
                  </button>
                  {newsletterMessage && (
                    <p className={`text-xs text-center ${newsletterMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                      {newsletterMessage}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 text-center">
                    Sin spam. Cancela cuando quieras.
                  </p>
                </form>
              </div>

              {/* Multimedia destacado */}
              <div id="multimedia" className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-100">
                <div className="relative">
                  <img
                    src="https://readdy.ai/api/search-image?query=Spanish%20bullfighting%20multimedia%20gallery%2C%20professional%20photography%20collection%2C%20traditional%20bullring%20scenes%2C%20artistic%20composition%2C%20high%20quality%20images%2C%20clean%20background&width=400&height=200&seq=7&orientation=landscape"
                    alt="Galería multimedia"
                    className="w-full h-40 object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-full text-xs font-bold border border-white/20">
                    +500 fotos
                  </div>
                  <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-sm text-white p-4 rounded-full border border-white/20">
                      <i className="ri-play-fill text-2xl"></i>
                    </div>
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300 tracking-tight">
                    Galería Multimedia
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Las mejores imágenes y vídeos de la actualidad taurina en alta calidad.
                  </p>
                  <button className="text-red-600 hover:text-red-700 font-bold text-sm cursor-pointer flex items-center group">
                    Explorar galería 
                    <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform duration-300"></i>
                  </button>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-lg border border-gray-700">
                <h3 className="text-xl font-bold mb-6 text-center tracking-tight">Síguenos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <a href="https://facebook.com/tendidodigital" target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 cursor-pointer border border-blue-500/20">
                    <i className="ri-facebook-fill text-2xl mb-2 block"></i>
                    <span className="text-sm font-medium">Facebook</span>
                  </a>
                  <a href="https://twitter.com/tendidodigital" target="_blank" rel="noopener noreferrer" className="bg-sky-500 hover:bg-sky-600 p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 cursor-pointer border border-sky-400/20">
                    <i className="ri-twitter-fill text-2xl mb-2 block"></i>
                    <span className="text-sm font-medium">Twitter</span>
                  </a>
                  <a href="https://instagram.com/tendidodigital" target="_blank" rel="noopener noreferrer" className="bg-pink-600 hover:bg-pink-700 p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 cursor-pointer border border-pink-500/20">
                    <i className="ri-instagram-fill text-2xl mb-2 block"></i>
                    <span className="text-sm font-medium">Instagram</span>
                  </a>
                  <a href="https://youtube.com/tendidodigital" target="_blank" rel="noopener noreferrer" className="bg-red-600 hover:bg-red-700 p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 cursor-pointer border border-red-500/20">
                    <i className="ri-youtube-fill text-2xl mb-2 block"></i>
                    <span className="text-sm font-medium">YouTube</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Contacto */}
        <section id="contacto" className="py-16 md:py-24 bg-gradient-to-br from-red-600 via-red-700 to-yellow-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                Contacta con Nosotros
              </h2>
              <div className="w-24 h-1 bg-white/50 rounded-full mx-auto mb-6"></div>
              <p className="text-white/90 text-lg max-w-2xl mx-auto">
                ¿Tienes alguna noticia, sugerencia o quieres colaborar con nosotros? Estamos aquí para escucharte
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">Información de Contacto</h3>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="bg-white/20 p-4 rounded-xl mr-4 border border-white/20">
                      <i className="ri-mail-line text-white text-xl"></i>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Email</p>
                      <p className="text-white/80">tendidodigitall@gmail.com</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-white/20">
                  <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                    <div className="flex items-center mb-3">
                      <i className="ri-information-line text-white text-xl mr-3"></i>
                      <h4 className="text-lg font-bold text-white">¿Sabías que...?</h4>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed">
                      Tendido Digital es el portal taurino de referencia en España, con más de 10,000 lectores mensuales y presencia en las principales plazas del país.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">Envíanos un Mensaje</h3>
                <form onSubmit={handleContactSubmit} className="space-y-4" data-readdy-form id="contact-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="Nombre *"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email *"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Asunto"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  />
                  <textarea
                    rows={4}
                    name="message"
                    placeholder="Mensaje *"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300 resize-none backdrop-blur-sm"
                    maxLength={500}
                    required
                  ></textarea>
                  <button
                    type="submit"
                    disabled={isContactSubmitting}
                    className="w-full bg-white text-red-600 py-4 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer whitespace-nowrap font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isContactSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                  </button>
                  {contactMessage && (
                    <p className={`text-sm text-center ${contactMessage.includes('Error') ? 'text-red-200' : 'text-green-200'}`}>
                      {contactMessage}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-yellow-500/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center mb-6 group">
                  <img 
                    src="https://static.readdy.ai/image/5110ce3ba25b092cb363e0b1bb235016/55c94eda702705e59cc93222640b4a72.jfif" 
                    alt="Tendido Digital" 
                    className="h-12 w-auto group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
                  />
                  <span className="ml-4 text-2xl font-bold bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent tracking-tight">
                    TENDIDO DIGITAL
                  </span>
                </div>
                <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                  Portal taurino de referencia en España. Noticias, crónicas, entrevistas y toda la actualidad del mundo del toro con rigor periodístico y pasión por la tradición.
                </p>
                <div className="flex space-x-4">
                  {[
                    { icon: 'ri-facebook-fill', color: 'hover:text-blue-400', url: 'https://facebook.com/tendidodigital' },
                    { icon: 'ri-twitter-fill', color: 'hover:text-sky-400', url: 'https://twitter.com/tendidodigital' },
                    { icon: 'ri-instagram-fill', color: 'hover:text-pink-400', url: 'https://instagram.com/tendidodigital' },
                    { icon: 'ri-youtube-fill', color: 'hover:text-red-400', url: 'https://youtube.com/tendidodigital' }
                  ].map((social, index) => (
                    <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className={`text-gray-400 ${social.color} transition-all duration-300 transform hover:scale-125 cursor-pointer p-2 rounded-full hover:bg-gray-800`}>
                      <i className={`${social.icon} text-2xl`}></i>
                    </a>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-bold mb-6 text-white">Secciones</h4>
                <ul className="space-y-3">
                  {[
                    { name: 'Actualidad', action: () => scrollToSection('actualidad') },
                    { name: 'Crónicas', action: () => setActiveTab('cronicas') },
                    { name: 'Entrevistas', action: () => scrollToSection('actualidad') },
                    { name: 'Multimedia', action: () => scrollToSection('multimedia') }
                  ].map((item) => (
                    <li key={item.name}>
                      <button onClick={item.action} className="text-gray-300 hover:text-red-400 transition-colors duration-300 cursor-pointer flex items-center group">
                        <i className="ri-arrow-right-s-line group-hover:translate-x-1 transition-transform duration-300"></i>
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-bold mb-6 text-white">Información</h4>
                <ul className="space-y-3">
                  {[
                    { name: 'Quiénes somos', action: () => scrollToSection('contacto') },
                    { name: 'Contacto', action: () => scrollToSection('contacto') },
                    { name: 'Aviso legal', action: () => scrollToSection('contacto') },
                    { name: 'Política de privacidad', action: () => scrollToSection('contacto') }
                  ].map((item) => (
                    <li key={item.name}>
                      <button onClick={item.action} className="text-gray-300 hover:text-red-400 transition-colors duration-300 cursor-pointer flex items-center group">
                        <i className="ri-arrow-right-s-line group-hover:translate-x-1 transition-transform duration-300"></i>
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-12 pt-8 text-center">
              <p className="text-gray-400 text-sm">
                © 2025 TENDIDO DIGITAL. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      {/* Header */}
      <header className={`bg-white/98 backdrop-blur-md shadow-lg sticky top-0 z-50 transition-all duration-300 border-b border-gray-100 ${scrollY > 50 ? 'shadow-xl bg-white' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center group">
              <div className="relative">
                <img 
                  src="https://static.readdy.ai/image/5110ce3ba25b092cb363e0b1bb235016/55c94eda702705e59cc93222640b4a72.jfif" 
                  alt="Tendido Digital" 
                  className="h-10 md:h-14 w-auto transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
                />
                <div className="absolute -inset-2 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <span className="ml-2 md:ml-4 text-xl md:text-3xl font-bold bg-gradient-to-r from-red-700 to-yellow-600 bg-clip-text text-transparent tracking-tight">
                TENDIDO DIGITAL
              </span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-4 lg:space-x-8">
              <button 
                onClick={() => {setActiveTab('inicio'); scrollToSection('inicio');}} 
                className={`relative font-semibold transition-all duration-300 cursor-pointer group text-sm lg:text-base tracking-wide ${
                  activeTab === 'inicio' ? 'text-red-600' : 'text-gray-900 hover:text-red-600'
                }`}
              >
                Inicio
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-300 ${
                  activeTab === 'inicio' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </button>
              <button 
                onClick={() => {setActiveTab('inicio'); scrollToSection('actualidad');}} 
                className={`relative font-semibold transition-all duration-300 cursor-pointer group text-sm lg:text-base tracking-wide ${
                  activeTab === 'actualidad' ? 'text-red-600' : 'text-gray-900 hover:text-red-600'
                }`}
              >
                Actualidad
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-300 ${
                  activeTab === 'actualidad' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </button>
              <button 
                onClick={() => setActiveTab('cronicas')} 
                className={`relative font-semibold transition-all duration-300 cursor-pointer group text-sm lg:text-base tracking-wide ${
                  activeTab === 'cronicas' ? 'text-red-600' : 'text-gray-900 hover:text-red-600'
                }`}
              >
                Crónicas
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-300 ${
                  activeTab === 'cronicas' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </button>
              <button 
                onClick={() => {setActiveTab('inicio'); scrollToSection('contacto');}} 
                className={`relative font-semibold transition-all duration-300 cursor-pointer group text-sm lg:text-base tracking-wide ${
                  activeTab === 'contacto' ? 'text-red-600' : 'text-gray-900 hover:text-red-600'
                }`}
              >
                Contacto
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-300 ${
                  activeTab === 'contacto' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </button>
            </nav>

            <button 
              className="md:hidden p-3 rounded-xl text-gray-900 hover:bg-red-50 hover:text-red-600 transition-all duration-300 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Abrir menú"
            >
              <i className={`text-2xl transition-transform duration-300 ${isMenuOpen ? 'ri-close-line rotate-180' : 'ri-menu-line'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/98 backdrop-blur-md border-t border-gray-100 shadow-lg">
            <div className="px-4 pt-4 pb-6 space-y-2">
              <button 
                onClick={() => {setActiveTab('inicio'); scrollToSection('inicio');}} 
                className="block w-full text-left px-4 py-3 text-gray-900 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 cursor-pointer font-medium"
              >
                Inicio
              </button>
              <button 
                onClick={() => {setActiveTab('inicio'); scrollToSection('actualidad');}} 
                className="block w-full text-left px-4 py-3 text-gray-900 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 cursor-pointer font-medium"
              >
                Actualidad
              </button>
              <button 
                onClick={() => setActiveTab('cronicas')} 
                className="block w-full text-left px-4 py-3 text-gray-900 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 cursor-pointer font-medium"
              >
                Crónicas
              </button>
              <button 
                onClick={() => {setActiveTab('inicio'); scrollToSection('contacto');}} 
                className="block w-full text-left px-4 py-3 text-gray-900 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 cursor-pointer font-medium"
              >
                Contacto
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Contenido principal */}
      {renderContent()}

      {/* Modal de Noticia - Pantalla Completa */}
      {isNewsModalOpen && selectedNews && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
          <div className="min-h-screen">
            {/* Header del modal */}
            <div className="sticky top-0 bg-black/90 backdrop-blur-md z-10 border-b border-gray-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <img 
                      src="https://static.readdy.ai/image/5110ce3ba25b092cb363e0b1bb235016/55c94eda702705e59cc93222640b4a72.jfif" 
                      alt="Tendido Digital" 
                      className="h-8 w-auto"
                    />
                    <span className="ml-3 text-lg font-bold bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
                      TENDIDO DIGITAL
                    </span>
                  </div>
                  <button
                    onClick={closeNewsModal}
                    className="text-white hover:text-red-400 p-2 rounded-full hover:bg-gray-800 transition-all duration-300"
                    aria-label="Cerrar modal"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Imagen principal */}
            <div className="relative h-[40vh] md:h-[60vh] overflow-hidden">
              <img
                src={selectedNews.image}
                alt={selectedNews.title}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                <span className="bg-gradient-to-r from-red-600 to-red-5 0 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
                  {'category' in selectedNews ? selectedNews.category : 'Opinión'}
                </span>
              </div>
            </div>

            {/* Contenido del artículo */}
            <div className="bg-white">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center mb-6">
                  <span className="text-gray-500 text-sm font-medium">{selectedNews.date}</span>
                  {selectedNews.author && (
                    <>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-red-600 text-sm font-medium">{selectedNews.author}</span>
                    </>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">{selectedNews.title}</h1>
                
                <p className="text-xl text-gray-600 leading-relaxed mb-12 font-medium">{selectedNews.excerpt}</p>
                
                <div className="prose prose-xl max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">{selectedNews.fullContent}</p>
                </div>

                {/* Acciones del artículo */}
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-center space-x-6">
                    {'id' in selectedNews && (
                      <button 
                        onClick={() => toggleSave(selectedNews.id)}
                        className={`flex items-center space-x-2 transition-all duration-300 p-3 rounded-full ${
                          savedPosts.has(selectedNews.id) 
                            ? 'text-yellow-600 bg-yellow-50' 
                            : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                        }`}
                        aria-label={savedPosts.has(selectedNews.id) ? 'Quitar de guardados' : 'Guardar noticia'}
                      >
                        <i className={`${savedPosts.has(selectedNews.id) ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-xl`}></i>
                        <span className="font-medium">{savedPosts.has(selectedNews.id) ? 'Guardado' : 'Guardar'}</span>
                      </button>
                    )}
                    
                    <button 
                      onClick={() => openShareModal(selectedNews)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 p-3 rounded-full hover:bg-blue-50"
                      aria-label="Compartir noticia"
                    >
                      <i className="ri-share-line text-xl"></i>
                      <span className="font-medium">Compartir</span>
                    </button>
                  </div>
                  <button
                    onClick={closeNewsModal}
                    className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-full font-bold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-xl cursor-pointer whitespace-nowrap text-sm md:text-base border border-red-400/20"
                  >
                    Volver a noticias
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crónica - Pantalla Completa */}
      {isChronicleModalOpen && selectedChronicle && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
          <div className="min-h-screen">
            {/* Header del modal */}
            <div className="sticky top-0 bg-black/90 backdrop-blur-md z-10 border-b border-gray-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <img 
                      src="https://static.readdy.ai/image/5110ce3ba25b092cb363e0b1bb235016/55c94eda702705e59cc93222640b4a72.jfif" 
                      alt="Tendido Digital" 
                      className="h-8 w-auto"
                    />
                    <span className="ml-3 text-lg font-bold bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
                      TENDIDO DIGITAL
                    </span>
                  </div>
                  <button
                    onClick={closeChronicleModal}
                    className="text-white hover:text-red-400 p-2 rounded-full hover:bg-gray-800 transition-all duration-300"
                    aria-label="Cerrar modal"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Imagen principal */}
            <div className="relative h-[40vh] md:h-[60vh] overflow-hidden">
              <img
                src={selectedChronicle.image}
                alt={selectedChronicle.title}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                <span className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
                  LA RESEÑA
                </span>
              </div>
            </div>

            {/* Contenido de la crónica */}
            <div className="bg-white">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center mb-6">
                  <span className="text-gray-500 text-sm font-medium">{selectedChronicle.date}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-red-600 text-sm font-medium">{selectedChronicle.plaza}</span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
                  {selectedChronicle.title}
                </h1>
                
                <div className="bg-gray-50 rounded-2xl p-8 mb-8">
                  <h2 className="font-semibold text-gray-900 mb-2">Detalles:</h2>
                  <p className="text-gray-700">{selectedChronicle.detalles}</p>
                </div>

                {/* Acciones de la crónica */}
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-center space-x-6">
                    <button 
                      onClick={() => toggleSave(selectedChronicle.id)}
                      className={`flex items-center space-x-2 transition-all duration-300 p-3 rounded-full ${
                        savedPosts.has(selectedChronicle.id) 
                          ? 'text-yellow-600 bg-yellow-50' 
                          : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                      }`}
                      aria-label={savedPosts.has(selectedChronicle.id) ? 'Quitar de guardados' : 'Guardar crónica'}
                    >
                      <i className={`${savedPosts.has(selectedChronicle.id) ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-xl`}></i>
                      <span className="font-medium">{savedPosts.has(selectedChronicle.id) ? 'Guardado' : 'Guardar'}</span>
                    </button>
                    
                    <button 
                      onClick={() => openShareModal(selectedChronicle)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 p-3 rounded-full hover:bg-blue-50"
                      aria-label="Compartir crónica"
                    >
                      <i className="ri-share-line text-xl"></i>
                      <span className="font-medium">Compartir</span>
                    </button>
                  </div>
                  <button
                    onClick={closeChronicleModal}
                    className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-full font-bold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-xl cursor-pointer whitespace-nowrap text-sm md:text-base border border-red-400/20"
                  >
                    Volver a crónicas
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Compartir */}
      {isShareModalOpen && sharePost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="ri-share-line text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Compartir Noticia</h3>
              <p className="text-gray-600 text-sm">Comparte esta noticia con tus amigos</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={shareToWhatsApp}
                className="w-full flex items-center justify-center space-x-3 bg-green-500 hover:bg-green-600 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <i className="ri-whatsapp-line text-xl"></i>
                <span className="font-medium">Compartir en WhatsApp</span>
              </button>
              
              <button
                onClick={shareToTwitter}
                className="w-full flex items-center justify-center space-x-3 bg-sky-500 hover:bg-sky-600 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <i className="ri-twitter-fill text-xl"></i>
                <span className="font-medium">Compartir en Twitter</span>
              </button>
              
              <button
                onClick={shareToFacebook}
                className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <i className="ri-facebook-fill text-xl"></i>
                <span className="font-medium">Compartir en Facebook</span>
              </button>
              
              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center space-x-3 bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <i className="ri-link text-xl"></i>
                <span className="font-medium">Copiar enlace</span>
              </button>
            </div>
            
            <button
              onClick={closeShareModal}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-medium transition-all duration-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
