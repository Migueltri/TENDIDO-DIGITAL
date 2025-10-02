import { useState, useEffect } from 'react';
  // Función para abrir modal de noticia
import { Link } from "react-router-dom";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);

  // Schema.org JSON-LD para la página principal
  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "NewsMediaOrganization",
      "name": "TENDIDO DIGITAL",
      "url": process.env.VITE_SITE_URL || "https://example.com",
      "logo": {
      "@type": "ImageObject",
      "url": `${process.env.VITE_SITE_URL || "https://example.com"}/logo.png`
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
        "url": process.env.VITE_SITE_URL || "https://example.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${process.env.VITE_SITE_URL || "https://example.com"}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const featuredNews = [
    {
      id: 1,
      title: "Morante de la Puebla triunfa en Las Ventas con una faena histórica",
      image: "/images/morante.jpg",
      category: "Actualidad",
      date: "15 Enero 2025",
      excerpt: "Una tarde inolvidable en la catedral del toreo donde Morante demostró su maestría",
      fullContent: "El maestro Morante de la Puebla protagonizó una tarde histórica en Las Ventas, demostrando una vez más por qué es considerado uno de los toreros más importantes de la actualidad. Con una faena llena de temple y arte, el diestro de La Puebla del Río logró conectar con el público madrileño de una manera extraordinaria. La corrida, que contó con toros de la ganadería de Victorino Martín, fue el escenario perfecto para que Morante desplegara todo su repertorio artístico. Desde los primeros pases con el capote hasta la faena de muleta, el torero demostró una técnica depurada y una comprensión profunda del arte del toreo. El público, entregado desde el primer momento, premió su actuación con una ovación que se prolongó durante varios minutos."
    },
    {
      id: 2,
      title: "Temporada 2025: Las figuras del toreo se preparan para la Feria de San Isidro",
      image: "/images/temporada.jpg",
      category: "Agenda",
      date: "14 Enero 2025",
      excerpt: "Los mejores toreros del mundo confirman su presencia en la feria más importante",
      fullContent: "La Feria de San Isidro 2025 promete ser una de las más emocionantes de los últimos años. Las principales figuras del toreo han confirmado ya su participación en la cita más importante del calendario taurino español. Entre los nombres confirmados destacan Morante de la Puebla, El Juli, José María Manzanares, Roca Rey y Cayetano Rivera, quienes se alternarán en los carteles más esperados. La empresa Las Ventas ha trabajado intensamente para ofrecer una programación variada que incluye corridas de toros, novilladas picadas y festivales benéficos. Los aficionados ya pueden adquirir sus localidades a través de la página web oficial, donde se espera una gran demanda como cada año."
    },
    {
      id: 3,
      title: "Entrevista exclusiva: José Tomás habla sobre su regreso a los ruedos",
      image: "/images/josetomas.jpeg",
      category: "Entrevistas",
      date: "13 Enero 2025",
      excerpt: "El torero de Galapagar revela sus planes para esta temporada",
      fullContent: "En una entrevista exclusiva para Tendido Digital, José Tomás ha revelado sus planes para la temporada 2025. El torero de Galapagar, conocido por su estilo único y su capacidad para emocionar al público, ha confirmado que está preparando su regreso a los ruedos después de un período de reflexión. 'El toreo es mi vida y siento que aún tengo mucho que dar', declaró el diestro durante la conversación. José Tomás también habló sobre la importancia de mantener viva la tradición taurina y su compromiso con las nuevas generaciones de aficionados. Sus apariciones serán limitadas pero prometedoras, con especial atención a las plazas más importantes de España y América."
    }
  ];

  const latestNews = [
    {
      id: 4,
      title: "El Cid corta dos orejas en la plaza de toros de Sevilla",
       image: "/images/elcid.jpg",
      category: "Crónicas",
      date: "15 Enero 2025",
      excerpt: "Una tarde memorable en la Maestranza sevillana donde El Cid demostró su arte y valentía ante un público entregado.",
      fullContent: "El Cid protagonizó una tarde triunfal en la Real Maestranza de Caballería de Sevilla, cortando dos orejas en una actuación que quedará grabada en la memoria de los aficionados. El diestro demostró una vez más su capacidad para emocionar y su dominio técnico ante toros de la ganadería de Miura. La faena al quinto toro fue especialmente brillante, con una serie de naturales que arrancaron los olés del respetable sevillano. El público, conocedor y exigente, premió su actuación con una ovación cerrada que se prolongó durante varios minutos. Esta actuación consolida a El Cid como una de las figuras más sólidas del panorama taurino actual."
    },
    {
      id: 5,
      title: "Análisis: Las claves del éxito en la temporada taurina 2025",
      image: "/images/analisis.jpg",
      category: "Opinión",
      date: "14 Enero 2025",
      excerpt: "Expertos analizan las tendencias y figuras que marcarán el año taurino en España y América.",
      fullContent: "La temporada taurina 2025 se presenta con grandes expectativas y varios factores que determinarán su éxito. Según los expertos consultados, la renovación generacional será uno de los aspectos más destacados, con jóvenes figuras que buscan consolidarse junto a los maestros consagrados. La programación de las principales plazas muestra una apuesta decidida por la calidad, tanto en los carteles como en las ganaderías seleccionadas. América Latina también jugará un papel importante, con un creciente interés por el toreo español y la organización de eventos de gran nivel. Los aficionados esperan una temporada rica en emociones y momentos memorables."
    },
    {
      id: 6,
      title: "Novillada en Madrid: Triunfo de los jóvenes valores",
      image: "/images/novilladaenmadrid.jpg",
      category: "Novilladas",
      date: "13 Enero 2025",
      excerpt: "La cantera taurina española demuestra su calidad en una tarde llena de emoción y arte.",
      fullContent: "La plaza de Las Ventas fue testigo de una extraordinaria novillada que puso de manifiesto la excelente salud de la cantera taurina española. Los tres novilleros que actuaron demostraron técnica, valor y arte, ingredientes fundamentales para el futuro del toreo. La tarde comenzó con gran expectación y se desarrolló con un nivel artístico muy alto. Los jóvenes diestros supieron aprovechar las oportunidades que les brindaron los novillos, ofreciendo faenas llenas de emoción y momentos de gran belleza. El público madrileño, siempre exigente, supo reconocer la calidad de lo visto y premió con generosidad a estos valores emergentes del toreo."
    },
    {
      id: 7,
      title: "Feria de Sevilla 2025: Confirmados los primeros carteles",
      image: "/images/feriadesevilla.jpg",
      category: "Ferias",
      date: "12 Enero 2025",
      excerpt: "Los aficionados ya pueden conocer los primeros nombres que pisarán el albero de la Maestranza.",
      fullContent: "La Real Maestranza de Caballería de Sevilla ha hecho públicos los primeros carteles de la Feria de Abril 2025, generando gran expectación entre los aficionados. Los nombres confirmados incluyen a las principales figuras del toreo actual, garantizando tardes de gran nivel artístico. La programación combina experiencia y juventud, con carteles que prometen emociones fuertes y momentos memorables. Las ganaderías seleccionadas son de reconocido prestigio, lo que augura corridas de gran calidad. Los abonos ya están disponibles y la demanda está siendo muy alta, como es habitual en una de las ferias más importantes del calendario taurino mundial."
    },
    {
      id: 8,
      title: "Ganadería de Miura: Tradición y bravura en 2025",
      image: "/images/ganaderiademiura.jpeg",
      category: "Ganaderías",
      date: "11 Enero 2025",
      excerpt: "Un recorrido por una de las ganaderías más prestigiosas del panorama taurino español.",
      fullContent: "La ganadería de Miura continúa siendo una referencia en el mundo taurino, manteniendo la tradición y la bravura que la han caracterizado durante generaciones. En 2025, la divisa sevillana seguirá presente en las principales plazas de España, ofreciendo toros de gran calidad y trapío. Los responsables de la ganadería han trabajado intensamente en la selección y mejora del ganado, manteniendo las características que han hecho famosos a los toros de Miura en todo el mundo. Su presencia en los carteles siempre genera expectación, tanto entre los toreros como entre los aficionados, que saben que se enfrentarán a reses de gran nobleza y bravura."
    },
    {
      id: 9,
      title: "Escuela Taurina de Madrid: Formando a las futuras figuras",
      image: "/images/escuelataurinademadrid.jpg",
      category: "Formación",
      date: "10 Enero 2025",
      excerpt: "La cantera madrileña trabaja intensamente para preparar a los toreros del futuro.",
      fullContent: "La Escuela Taurina de Madrid continúa su labor formativa, preparando a las futuras figuras del toreo con un programa integral que combina técnica, teoría y práctica. Los jóvenes aspirantes reciben formación de maestros experimentados que transmiten los conocimientos fundamentales del arte del toreo. Las instalaciones de la escuela permiten un aprendizaje progresivo y seguro, con especial atención a los aspectos técnicos y de seguridad. Muchos de los toreros que actualmente triunfan en las principales plazas han pasado por esta institución, que se ha convertido en un referente en la formación taurina. El compromiso con la excelencia y la tradición garantiza la continuidad del arte del toreo."
    },
    {
      id: 10,
      title: "Temporada americana: El toreo español conquista México",
      image: "/images/temporadaamericana.jpg",
      category: "Internacional",
      date: "9 Enero 2025",
      excerpt: "Las principales figuras españolas confirman su participación en la temporada mexicana.",
      fullContent: "La temporada taurina mexicana 2025 contará con la presencia de las principales figuras del toreo español, consolidando los lazos entre ambos países en el arte del toreo. Plazas emblemáticas como la México y la Monumental de Aguascalientes recibirán a toreros de la talla de Morante de la Puebla, El Juli y José María Manzanares. Esta colaboración internacional fortalece la tradición taurina y permite el intercambio cultural entre España y México. Los aficionados mexicanos podrán disfrutar del más alto nivel artístico, mientras que los toreros españoles tendrán la oportunidad de demostrar su arte ante públicos conocedores y exigentes."
    },
    {
      id: 11,
      title: "Revolución en Las Ventas: Nuevas medidas de seguridad",
      image: "/images/revolucionenlasventas.jpg",
      category: "Actualidad",
      date: "8 Enero 2025",
      excerpt: "La plaza madrileña implementa innovadores sistemas para garantizar la seguridad de toreros y público.",
      fullContent: "La plaza de toros de Las Ventas ha anunciado la implementación de nuevas medidas de seguridad que revolucionarán la experiencia taurina sin comprometer la esencia del espectáculo. Estas innovaciones incluyen sistemas de monitoreo avanzado, protocolos de emergencia mejorados y tecnología de última generación para garantizar la seguridad tanto de los toreros como del público asistente. La dirección de la plaza ha trabajado en colaboración con expertos en seguridad y veterinarios especializados para desarrollar estos protocolos. Estas medidas sitúan a Las Ventas a la vanguardia en materia de seguridad taurina a nivel mundial."
    },
    {
      id: 12,
      title: "El arte del capote: Masterclass con figuras consagradas",
      image: "/images/elartedelcapote.jpeg",
      category: "Formación",
      date: "7 Enero 2025",
      excerpt: "Maestros del toreo comparten sus secretos en una jornada única de enseñanza.",
      fullContent: "Una jornada excepcional reunió a algunas de las figuras más respetadas del toreo para compartir sus conocimientos sobre el arte del capote. Esta masterclass, dirigida tanto a jóvenes aspirantes como a aficionados, abordó desde los fundamentos básicos hasta las técnicas más avanzadas del manejo del capote. Los maestros explicaron la importancia del temple, la colocación y el timing en cada lance, transmitiendo décadas de experiencia acumulada en los ruedos más importantes del mundo. Esta iniciativa forma parte de un programa más amplio destinado a preservar y transmitir los conocimientos tradicionales del arte del toreo."
    }
  ];

  // Función para hacer scroll suave a las secciones
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMenuOpen(false); // Cerrar menú móvil si está abierto
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
              <span className="ml-2 md:ml-4 text-xl md:text-3xl font-bold bg-gradient-to-r from-red-700 to-yellow-600 bg-clip-text text-transparent tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '800', letterSpacing: '-0.02em'}}>
                TENDIDO DIGITAL
              </span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-4 lg:space-x-8">
              <button onClick={() => scrollToSection('inicio')} className="relative text-gray-900 hover:text-red-600 font-semibold transition-all duration-300 cursor-pointer group text-sm lg:text-base tracking-wide">
                Inicio
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollToSection('actualidad')} className="relative text-gray-900 hover:text-red-600 font-semibold transition-all duration-300 cursor-pointer group text-sm lg:text-base tracking-wide">
                Actualidad
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollToSection('opinion')} className="relative text-gray-900 hover:text-red-600 font-semibold transition-all duration-300 cursor-pointer group text-sm lg:text-base tracking-wide">
                Opinión
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollToSection('multimedia')} className="relative text-gray-900 hover:text-red-600 font-semibold transition-all duration-300 cursor-pointer group text-sm lg:text-base tracking-wide">
                Multimedia
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollToSection('contacto')} className="relative text-gray-900 hover:text-red-600 font-semibold transition-all duration-300 cursor-pointer group text-sm lg:text-base tracking-wide">
                Contacto
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
            </nav>

            <button 
              className="md:hidden p-3 rounded-xl text-gray-900 hover:bg-red-50 hover:text-red-600 transition-all duration-300 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i className={`text-2xl transition-transform duration-300 ${isMenuOpen ? 'ri-close-line rotate-180' : 'ri-menu-line'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/98 backdrop-blur-md border-t border-gray-100 animate-fade-in shadow-lg">
            <div className="px-4 pt-4 pb-6 space-y-2">
              <button onClick={() => scrollToSection('inicio')} className="block w-full text-left px-4 py-3 text-gray-900 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 cursor-pointer font-medium">
                Inicio
              </button>
              <button onClick={() => scrollToSection('actualidad')} className="block w-full text-left px-4 py-3 text-gray-900 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 cursor-pointer font-medium">
                Actualidad
              </button>
              <button onClick={() => scrollToSection('opinion')} className="block w-full text-left px-4 py-3 text-gray-900 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 cursor-pointer font-medium">
                Opinión
              </button>
              <button onClick={() => scrollToSection('multimedia')} className="block w-full text-left px-4 py-3 text-gray-900 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 cursor-pointer font-medium">
                Multimedia
              </button>
              <button onClick={() => scrollToSection('contacto')} className="block w-full text-left px-4 py-3 text-gray-900 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 cursor-pointer font-medium">
                Contacto
              </button>
            </div>
          </div>
        )}
      </header>

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
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-3xl animate-slide-up">
                  <div className="flex items-center mb-4">
                    <span className="inline-flex items-center bg-gradient-to-r from-red-600 to-red-500 text-white px-4 md:px-5 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold shadow-lg backdrop-blur-sm">
                      <i className="ri-fire-line mr-2"></i>
                      {news.category}
                    </span>
                    <span className="ml-4 text-white/90 text-xs md:text-sm font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">{news.date}</span>
                  </div>
                  <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                    {news.title}
                  </h1>
                  <p className="text-sm md:text-xl text-gray-200 mb-8 leading-relaxed">{news.excerpt}</p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => openNewsModal(news)}
                      className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold hover:from-red-700 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-xl cursor-pointer whitespace-nowrap text-sm md:text-base border border-red-400/20"
                    >
                      Leer noticia completa
                    </button>
                    <button className="bg-white/20 backdrop-blur-sm text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold hover:bg-white/30 transition-all duration-300 cursor-pointer whitespace-nowrap text-sm md:text-base border border-white/20">
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
            />
          ))}
        </div>

        {/* Navigation arrows */}
        <button 
          className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 md:p-4 rounded-full hover:bg-white/30 transition-all duration-300 cursor-pointer border border-white/20"
          onClick={() => setCurrentSlide(currentSlide === 0 ? featuredNews.length - 1 : currentSlide - 1)}
        >
          <i className="ri-arrow-left-line text-xl md:text-2xl"></i>
        </button>
        <button 
          className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 md:p-4 rounded-full hover:bg-white/30 transition-all duration-300 cursor-pointer border border-white/20"
          onClick={() => setCurrentSlide((currentSlide + 1) % featuredNews.length)}
        >
          <i className="ri-arrow-right-line text-xl md:text-2xl"></i>
        </button>
      </section>

{/* Stats Section */}
<section className="py-12 md:py-20 bg-gradient-to-r from-red-600 via-red-700 to-yellow-500 relative overflow-hidden">
   ...
</section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Main News Section */}
          <div id="actualidad" className="lg:col-span-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 md:mb-12">
              <div className="mb-6 md:mb-0">
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mb-3 tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                  Últimas Noticias
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full"></div>
                <p className="text-gray-600 mt-3 text-lg">Mantente al día con la actualidad taurina</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full hover:from-red-700 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer whitespace-nowrap font-semibold text-sm md:text-base border border-red-400/20">
                  Todas
                </button>
                <button className="px-6 md:px-8 py-3 md:py-4 text-gray-700 border-2 border-gray-300 rounded-full hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 cursor-pointer whitespace-nowrap font-semibold text-sm md:text-base">
                  Crónicas
                </button>
                <button className="px-6 md:px-8 py-3 md:py-4 text-gray-700 border-2 border-gray-300 rounded-full hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 cursor-pointer whitespace-nowrap font-semibold text-sm md:text-base">
                  Opinión
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {latestNews.map((news, index) => (
                <article 
                  key={news.id} 
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer group border border-gray-100"
                  onClick={() => openNewsModal(news)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-48 md:h-56 object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg backdrop-blur-sm">
                        {news.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <span className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs flex items-center border border-white/20">
                        <i className="ri-eye-line mr-1"></i>
                        {news.views}
                      </span>
                      <span className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs flex items-center border border-white/20">
                        <i className="ri-heart-line mr-1"></i>
                        {news.likes}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-500 text-sm font-medium">{news.date}</span>
                      <div className="flex items-center text-gray-400">
                        <i className="ri-time-line mr-1"></i>
                        <span className="text-xs">3 min</span>
                      </div>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300 leading-tight tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                      {news.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{news.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <button className="text-red-600 hover:text-red-700 font-bold text-sm cursor-pointer whitespace-nowrap flex items-center group">
                        Leer más 
                        <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform duration-300"></i>
                      </button>
                      <div className="flex space-x-3">
                        <button className="text-gray-400 hover:text-red-600 transition-colors duration-300 cursor-pointer p-2 rounded-full hover:bg-red-50">
                          <i className="ri-share-line text-lg"></i>
                        </button>
                        <button className="text-gray-400 hover:text-red-600 transition-colors duration-300 cursor-pointer p-2 rounded-full hover:bg-red-50">
                          <i className="ri-bookmark-line text-lg"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="bg-gradient-to-r from-red-600 to-red-5 text-white px-8 md:px-10 py-4 md:py-5 rounded-full font-bold hover:from-red-700 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-xl cursor-pointer whitespace-nowrap text-sm md:text-base border border-red-400/20">
                Cargar más noticias
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Newsletter */}
            <div className="bg-gradient-to-br from-yellow-50 to-red-50 rounded-2xl p-8 shadow-lg border border-yellow-200/50">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-yellow-500 to-red-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <i className="ri-mail-line text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>Boletín Taurino</h3>
                <p className="text-gray-600 text-sm">
                  Únete a más de <span className="font-bold text-red-600">10,000 aficionados</span> y recibe las mejores noticias
                </p>
              </div>
              <form className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-300 pl-12 shadow-sm"
                  />
                  <i className="ri-mail-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-4 rounded-xl hover:from-red-700 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer whitespace-nowrap font-bold border border-red-400/20"
                >
                  Suscribirse gratis
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Sin spam. Cancela cuando quieras.
                </p>
              </form>
            </div>

            {/* Multimedia destacado */}
            <div id="multimedia" className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-100">
              <div className="relative">
                <img
                  src="/images/galeriataurina.jpeg"
                  alt="Galería multimedia"
                  className="w-full h-40 object-cover object-center group-hover:scale-110 transition-transform duration-500"
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
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300 tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
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
              <h3 className="text-xl font-bold mb-6 text-center tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>Síguenos</h3>
              <div className="grid grid-cols-2 gap-4">
                <a href="#" className="bg-blue-600 hover:bg-blue-700 p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 cursor-pointer border border-blue-500/20">
                  <i className="ri-facebook-fill text-2xl mb-2 block"></i>
                  <span className="text-sm font-medium">Facebook</span>
                </a>
                <a href="#" className="bg-sky-500 hover:bg-sky-600 p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 cursor-pointer border border-sky-400/20">
                  <i className="ri-twitter-fill text-2xl mb-2 block"></i>
                  <span className="text-sm font-medium">Twitter</span>
                </a>
                <a href="#" className="bg-pink-600 hover:bg-pink-700 p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 cursor-pointer border border-pink-500/20">
                  <i className="ri-instagram-fill text-2xl mb-2 block"></i>
                  <span className="text-sm font-medium">Instagram</span>
                </a>
                <a href="#" className="bg-red-600 hover:bg-red-700 p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 cursor-pointer border border-red-500/20">
                  <i className="ri-youtube-fill text-2xl mb-2 block"></i>
                  <span className="text-sm font-medium">YouTube</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Opinión */}
      <section id="opinion" className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mb-4 tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
              Opinión Taurina
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Las mejores columnas y análisis de los expertos más reconocidos del mundo taurino
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "El futuro de la tauromaquia en el siglo XXI",
                author: "Carlos Mendoza",
                excerpt: "Un análisis profundo sobre los retos y oportunidades que enfrenta el mundo del toro en la actualidad.",
                date: "14 Enero 2025",
                image: "/images/elfuturodelatauromaquia.jpg",
                fullContent: "El siglo XXI presenta desafíos únicos pero también oportunidades extraordinarias para la tauromaquia. En este análisis profundo, exploramos cómo la tradición taurina puede adaptarse a los tiempos modernos sin perder su esencia. La globalización, las nuevas tecnologías y los cambios sociales exigen una reflexión seria sobre el futuro de este arte milenario. Es fundamental encontrar el equilibrio entre la preservación de la tradición y la necesaria adaptación a los nuevos tiempos."
              },
              {
                title: "La importancia de las escuelas taurinas",
                author: "María González",
                excerpt: "Reflexiones sobre la formación de nuevos toreros y la preservación de la tradición.",
                date: "13 Enero 2025",
                 image: "/images/escuelastaurinas.jpg",
                fullContent: "Las escuelas taurinas son el corazón de la formación de las futuras figuras del toreo. Su papel va más allá de la enseñanza técnica, abarcando la transmisión de valores, tradiciones y el respeto por el arte del toreo. En estas instituciones se forman no solo los toreros del mañana, sino también los guardianes de una tradición centenaria. La calidad de la enseñanza y el compromiso de los maestros son fundamentales para garantizar la continuidad y excelencia del toreo."
              },
              {
                title: "Las plazas históricas y su legado",
                author: "Antonio Ruiz",
                excerpt: "Un recorrido por las catedrales del toreo y su importancia cultural.",
                date: "12 Enero 2025",
                image: "/images/lasplazashistoricas.jpg",
                fullContent: "Las plazas de toros históricas son mucho más que simples edificios; son catedrales del toreo que albergan siglos de historia, tradición y arte. Cada una tiene su propia personalidad y ha sido testigo de momentos inolvidables que han marcado la historia de la tauromaquia. Desde Las Ventas en Madrid hasta la Maestranza de Sevilla, estas plazas representan el alma del toreo y constituyen un patrimonio cultural invaluable que debe ser preservado para las futuras generaciones."
              },
              {
                title: "La ganadería brava: Selección y crianza",
                author: "Fernando López",
                excerpt: "Los secretos detrás de la cría del toro bravo y su importancia en el espectáculo.",
                date: "11 Enero 2025",
                image: "/images/laganaderiabrava.jpeg",
                fullContent: "La ganadería brava es el pilar fundamental sobre el que se sustenta el espectáculo taurino. La selección, crianza y cuidado del toro bravo requieren conocimientos ancestrales transmitidos de generación en generación. Los ganaderos dedican años a perfeccionar sus reses, buscando el equilibrio perfecto entre bravura, nobleza y trapío. Este artículo explora los métodos tradicionales y las innovaciones modernas en la cría del toro bravo, así como su impacto en la calidad del espectáculo taurino."
              },
              {
                title: "El toreo femenino: Rompiendo barreras",
                author: "Isabel Martín",
                excerpt: "El papel de la mujer en la tauromaquia moderna y su evolución histórica.",
                date: "10 Enero 2025",
                image: "/images/eltoreofemenino.jpeg",
                fullContent: "El toreo femenino ha experimentado una evolución notable en las últimas décadas, rompiendo barreras tradicionales y ganando reconocimiento en el mundo taurino. Las toreras han demostrado que el arte del toreo no tiene género, aportando su propia sensibilidad y técnica al ruedo. Este análisis examina la trayectoria de las principales figuras femeninas del toreo, los desafíos que han enfrentado y su contribución al enriquecimiento del arte taurino. Su presencia ha abierto nuevos horizontes y ha demostrado que la pasión por el toreo trasciende cualquier barrera."
              },
              {
                title: "Tradición vs. Modernidad en el toreo",
                author: "Miguel Ángel Sánchez",
                excerpt: "El equilibrio entre mantener las tradiciones y adaptarse a los nuevos tiempos.",
                date: "9 Enero 2025",
                image: "/images/tradicionvsmodernidad.jpg",
                fullContent: "El mundo del toreo se encuentra en una encrucijada entre la preservación de sus tradiciones milenarias y la necesidad de adaptarse a los tiempos modernos. Este debate no es nuevo, pero cobra especial relevancia en el siglo XXI. ¿Cómo puede la tauromaquia mantener su esencia mientras evoluciona para conectar con las nuevas generaciones? Este artículo explora las diferentes perspectivas sobre esta cuestión fundamental, analizando tanto las voces que abogan por la tradición pura como aquellas que proponen una modernización respetuosa del arte del toreo."
                  ].map((article, index) => (
              <article 
                key={index} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group border border-gray-100"
                onClick={() => openNewsModal(article)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
                      Opinión
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-500 text-sm font-medium">{article.date}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-red-600 text-sm font-medium">{article.author}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300 leading-tight tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{article.excerpt}</p>
                  <button className="text-red-600 hover:text-red-700 font-bold text-sm cursor-pointer whitespace-nowrap flex items-center group">
                    Leer artículo completo
                    <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform duration-300"></i>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Contacto */}
      <section id="contacto" className="py-16 md:py-24 bg-gradient-to-br from-red-600 via-red-700 to-yellow-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
              Contacta con Nosotros
            </h2>
            <div className="w-24 h-1 bg-white/50 rounded-full mx-auto mb-6"></div>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              ¿Tienes alguna noticia, sugerencia o quieres colaborar con nosotros? Estamos aquí para escucharte
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-8 tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>Información de Contacto</h3>
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="bg-white/20 p-4 rounded-xl mr-4 border border-white/20">
                    <i className="ri-mail-line text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Email</p>
                    <p className="text-white/80">tendidodigital@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-white/20 p-4 rounded-xl mr-4 border border-white/20">
                    <i className="ri-phone-line text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Teléfono</p>
                    <p className="text-white/80">+34 91 123 45 67</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-8 tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>Envíanos un Mensaje</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Asunto"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                />
                <textarea
                  rows={4}
                  placeholder="Mensaje"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300 resize-none backdrop-blur-sm"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-white text-red-600 py-4 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer whitespace-nowrap font-bold"
                >
                  Enviar Mensaje
                </button>
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
                <span className="ml-4 text-2xl font-bold bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                  TENDIDO DIGITAL
                </span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                Portal taurino de referencia basado en la actualidad taurina, con pasión, tradición e información veraz. 
                Tu fuente confiable del mundo del toro.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: 'ri-facebook-fill', color: 'hover:text-blue-400' },
                  { icon: 'ri-twitter-fill', color: 'hover:text-sky-400' },
                  { icon: 'ri-instagram-fill', color: 'hover:text-pink-400' },
                  { icon: 'ri-youtube-fill', color: 'hover:text-red-400' }
                ].map((social, index) => (
                  <a
  key={index}
  href="#"
  className={`text-gray-400 ${social.color} transition-all duration-300 transform hover:scale-125 cursor-pointer p-2 rounded-full hover:bg-gray-800`}
>
  <i className={`${social.icon} text-2xl`}></i>
                </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6 text-white tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>Secciones</h4>
              <ul className="space-y-3">
                {['Actualidad', 'Opinión', 'Entrevistas', 'Multimedia'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-300 hover:text-red-400 transition-colors duration-300 cursor-pointer flex items-center group">
                      <i className="ri-arrow-right-s-line group-hover:translate-x-1 transition-transform duration-300"></i>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6 text-white tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>Información</h4>
              <ul className="space-y-3">
                {['Quiénes somos', 'Contacto', 'Aviso legal', 'Política de privacidad'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-300 hover:text-red-400 transition-colors duration-300 cursor-pointer flex items-center group">
                      <i className="ri-arrow-right-s-line group-hover:translate-x-1 transition-transform duration-300"></i>
                      {item}
                    </a>
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

      {/* Modal de Noticia */}
      {isNewsModalOpen && selectedNews && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="relative">
              <img
                src={selectedNews.image}
                alt={selectedNews.title}
                className="w-full h-48 md:h-64 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              <button
                onClick={closeNewsModal}
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/80 transition-all duration-300 border border-white/20"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
              <div className="absolute bottom-4 left-4">
                <span className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
                  {selectedNews.category}
                </span>
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-center mb-4">
                <span className="text-gray-500 text-sm font-medium">{selectedNews.date}</span>
                {selectedNews.author && (
                  <>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-red-600 text-sm font-medium">{selectedNews.author}</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                {selectedNews.title}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {selectedNews.excerpt}
              </p>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {selectedNews.fullContent}
                </p>
              </div>
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <div className="flex space-x-4">
                  <button className="flex items-center text-gray-600 hover:text-red-600 transition-colors duration-300 p-2 rounded-full hover:bg-red-50">
                    <i className="ri-heart-line mr-2"></i>
                    Me gusta
                  </button>
                  <button className="flex items-center text-gray-600 hover:text-red-600 transition-colors duration-300 p-2 rounded-full hover:bg-red-50">
                    <i className="ri-share-line mr-2"></i>
                    Compartir
                  </button>
                  <button className="flex items-center text-gray-600 hover:text-red-600 transition-colors duration-300 p-2 rounded-full hover:bg-red-50">
                    <i className="ri-bookmark-line mr-2"></i>
                    Guardar
                  </button>
                </div>
                <button
                  onClick={closeNewsModal}
                  className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-3 rounded-full font-bold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-lg"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
