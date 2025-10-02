import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

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
      ]
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
    },
    {
      id: 2,
      title: "Temporada 2025: Las figuras del toreo se preparan para la Feria de San Isidro",
      image: "/images/temporada.jpg",
      category: "Agenda",
      date: "14 Enero 2025",
      excerpt: "Los mejores toreros del mundo confirman su presencia en la feria más importante",
    },
    {
      id: 3,
      title: "Entrevista exclusiva: José Tomás habla sobre su regreso a los ruedos",
      image: "/images/josetomas.jpeg",
      category: "Entrevistas",
      date: "13 Enero 2025",
      excerpt: "El torero de Galapagar revela sus planes para esta temporada",
    }
  ];

  const latestNews = [
    {
      id: 4,
      title: "El Cid corta dos orejas en la plaza de toros de Sevilla",
      image: "/images/elcid.jpg",
      category: "Crónicas",
      date: "15 Enero 2025",
      excerpt: "Una tarde memorable en la Maestranza sevillana donde El Cid demostró su arte.",
    },
    {
      id: 5,
      title: "Análisis: Las claves del éxito en la temporada taurina 2025",
      image: "/images/analisis.jpg",
      category: "Opinión",
      date: "14 Enero 2025",
      excerpt: "Expertos analizan las tendencias y figuras que marcarán el año taurino.",
    },
    {
      id: 6,
      title: "Novillada en Madrid: Triunfo de los jóvenes valores",
      image: "/images/novilladaenmadrid.jpg",
      category: "Novilladas",
      date: "13 Enero 2025",
      excerpt: "La cantera taurina española demuestra su calidad en una tarde llena de emoción y arte.",
    }
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      {/* Header */}
      <header className={`bg-white/98 backdrop-blur-md shadow-lg sticky top-0 z-50 transition-all duration-300 border-b border-gray-100 ${scrollY > 50 ? 'shadow-xl bg-white' : ''}`}>
        {/* ... tu header igual ... */}
      </header>

      {/* Hero Carousel con Featured News */}
      <section id="inicio" className="relative h-[400px] md:h-[600px] overflow-hidden">
        {featuredNews.map((news, index) => (
          <Link to={`/noticia/${news.id}`} key={news.id}>
            <div
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
                <div className="max-w-7xl mx-auto px-4">
                  <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white">{news.title}</h1>
                  <p className="text-sm md:text-xl text-gray-200 mt-4">{news.excerpt}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Últimas Noticias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {latestNews.map((news) => (
            <Link to={`/noticia/${news.id}`} key={news.id}>
              <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <span className="text-gray-500 text-sm">{news.date}</span>
                  <h3 className="text-lg font-bold mt-2">{news.title}</h3>
                  <p className="text-gray-600 text-sm mt-2">{news.excerpt}</p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      {/* Quitar Stats Section → eliminado ✅ */}
      {/* Quitar Modal → eliminado ✅ */}
      {/* Quitar likes y visitas → eliminado ✅ */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 text-center">
        © 2025 TENDIDO DIGITAL - Todos los derechos reservados.
      </footer>
    </div>
  );
}
