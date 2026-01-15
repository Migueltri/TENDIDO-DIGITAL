  import React, { useState, useEffect } from "react";
  interface BaseArticle {
  id: number;
  title: string;
  plaza?: string;
  date: string;
  category?: string;
  toreros?: string[];
  ganaderia?: string;
  resultado?: string[];
  torerosRaw?: string[];
  image: string;
  imageCaption?: string;
  video?: string;
  resumen?: string;
  detalles?: string;
  fullContent?: string;
  excerpt?: string;
  footerImage1?: string;
  footerImage1Caption?: string;
  footerImage2?: string;
  footerImage2Caption?: string;
  footerImage3?: string;
  footerImage3Caption?: string;
  footerImage4?: string;
  footerImage4Caption?: string;
  boldContent?: boolean;
  author?: string;
  authorLogo?: string;
  showAuthorHeader?: boolean;
}

type NewsItem = BaseArticle;
type OpinionArticle = BaseArticle;
type Chronicle = BaseArticle;

// Muestra la hora tal como la escribiste en tus datos
function formatExactDate(dateString: string): string {
  // Si es un formato tiktokISO, conviértelo; si no, devuélvelo limpio
  const parsed = new Date(dateString);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  // No intentamos parsear los textos en español, sólo los devolvemos sin el “Invalid Date”
  return dateString;
}

function formatTimeAgo(dateString: string): string {
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) return ""; // no mostrar “Invalid Date”

  const now = new Date();
  const diff = Math.floor((now.getTime() - parsed.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

  if (diff < 60) return "hace unos segundos";
  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), "minute");
  if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), "hour");
  if (diff < 2592000) return rtf.format(-Math.floor(diff / 86400), "day");
  if (diff < 31536000) return rtf.format(-Math.floor(diff / 2592000), "month");
  return rtf.format(-Math.floor(diff / 31536000), "year");
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
// Estado para actualizar automáticamente el tiempo relativo
const [currentTime, setCurrentTime] = useState(new Date());

useEffect(() => {
  const interval = setInterval(() => setCurrentTime(new Date()), 60000); // cada minuto
  return () => clearInterval(interval);
}, []);

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
"url": "images/tendidodigitallogosimple.jpg"
},
"description": "Portal taurino de referencia en España. Noticias, crónicas, entrevistas y toda la actualidad del mundo del toro con más de 15 años de experiencia.",
"foundingDate": "2010",
"address": {
"@type": "PostalAddress",
"addressCountry": "ES"
},
"sameAs": [
"https://www.instagram.com/portaltendidodigital?igsh=MWZrYWZkN2dnc2dzMg=="
],
    "mainEntity": {
      "@type": "WebSite",
      "url": typeof window !== 'undefined' ? window.location.origin : "https://tendidodigital.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${typeof window !== 'undefined' ? window.location.origin : "https://tendidodigital.com"}/search?q={search_term_string}`
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
    if (sharePost) {
      // Creamos un enlace único por ID
      const encoded = btoa(`news-${sharePost.id}`); // Cada id produce un string único
      const link = `${window.location.origin}/?p=${encoded}&utm_source=ig_web_copy_link`;

      await navigator.clipboard.writeText(link);
      setContactMessage("¡Enlace copiado al portapapeles!");
      closeShareModal();

      setTimeout(() => setContactMessage(""), 3000);
    }
  } catch (error) {
    console.error("Error al copiar enlace:", error);
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
  if (newsFilter === 'todas') return latestNews;

  return latestNews.filter(news => {
    const cat = news.category?.toLowerCase() || '';
    switch (newsFilter) {
      case 'cronicas':
        return cat.includes('crónica');
      case 'entrevistas':
        return cat.includes('entrevista');
      case 'opinion':
        return cat.includes('opinión');
      case 'actualidad':
        return cat.includes('actualidad');
      default:
        return true;
    }
  });
};

// convierte el contenido en párrafos y transforma **bold** a <strong>
// mantiene cualquier HTML ya presente (p. ej. <a ...>) usando dangerouslySetInnerHTML
const renderArticleContent = (text?: string | null) => {
  if (!text) return null;

  // Normaliza saltos y recorta
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // 1) Intento normal: dividir por dobles saltos de línea
  let paragraphs = normalized.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  // 2) Si no hay dobles saltos y el texto es largo, dividir por párrafos cada 2-3 oraciones
  if (paragraphs.length === 1 && normalized.length > 200) {
    // separación por oraciones (aprox usando punto+símbolo)
    const sentences = normalized.split(/(?<=[.?!])\s+/);
    const groupSize = 2; // agrupar 2 oraciones por párrafo (ajusta si quieres)
    paragraphs = [];
    for (let i = 0; i < sentences.length; i += groupSize) {
      paragraphs.push(sentences.slice(i, i + groupSize).join(' ').trim());
    }
  }

const splitToreros = (raw?: string | string[]) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean).map(r => r.trim());
  return String(raw)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
};

  // 3) Si sigue siendo uno y hay comas largas, romper por comas con sentido (fallback)
  if (paragraphs.length === 1 && normalized.length > 1000) {
    const parts = normalized.split(/, /);
    paragraphs = [];
    for (let i = 0; i < parts.length; i += 4) {
      paragraphs.push(parts.slice(i, i + 4).join(', ').trim());
    }
  }

  // Función que convierte **bold** y limita HTML esperado
  const toHtml = (p: string) =>
    p
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/\n+/g, ' ');

  return paragraphs.map((p, i) => (
    <p
      key={i}
      className="text-gray-700 text-sm leading-relaxed mb-4"
      dangerouslySetInnerHTML={{ __html: toHtml(p) }}
    />
  ));
};

const CrónicaLayout = ({ news }: { news: any }) => (
  <article
    key={news.id}
    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 cursor-pointer"
    onClick={() => openNewsModal(news)}
  >
    <div className="p-6">
      <h3 className="text-2xl md:text-3xl font-bold text-red-700 mb-6 leading-tight">
        {news.title}
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="relative overflow-hidden rounded-xl">
            <img
              src={news.image}
              alt={news.title}
              className="rounded-xl w-full h-auto max-h-[400px] object-cover shadow-sm"
              loading="lazy"
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex flex-wrap justify-between text-sm md:text-base">
              <p>
                <span className="font-semibold text-gray-900">Plaza:</span>{" "}
                <span className="text-gray-700">{news.plaza || "No especificada"}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-900">Ganadería:</span>{" "}
                <span className="text-red-600 font-medium">{news.ganaderia || "No indicada"}</span>
              </p>
            </div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border-l-4 border-red-500">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <i className="ri-file-text-line mr-2 text-red-600"></i>
              Resumen de la corrida
            </h4>
            <div className="text-gray-700 text-sm leading-relaxed">
 			 { renderArticleContent(news.fullContent || news.excerpt) }
			</div>

          </div>
          <div className="text-right mt-6">
            <button className="text-red-600 hover:text-red-700 font-bold text-sm cursor-pointer whitespace-nowrap flex items-center gap-2 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition-all duration-300 inline-flex">
              Leer crónica completa <i className="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </article>
);
	
const featuredNews: NewsItem[] = [
	{ 
    id: 1000,
    title: `Los retrasos en la Diputación ponen en riesgo la Feria de San Jorge 2026`,
    image: "/images/retrasos.jpg",
    category: "Actualidad",
    date: "14 de Enero de 2026",
	fullContent: `La celebración de **la Feria de San Jorge 2026** podría verse comprometida debido a los retrasos de la Diputación Provincial en la publicación del pliego de gestión de la plaza de toros de la Misericordia, una circunstancia que pone en riesgo el arranque de la temporada taurina.

Así lo ha advertido **Fernando Polo**, exgerente del coso zaragozano, en una entrevista concedida al programa Mediodía COPE Zaragoza. Polo ha recordado precedentes recientes, como el año 2018, cuando la Feria de San Jorge no pudo celebrarse tras la publicación tardía del pliego y la posterior presentación de un recurso.

Una situación similar se produjo en 2022, cuando el contrato se firmó el 29 de marzo, apenas unas semanas antes de una feria tradicionalmente articulada en torno al 23 de abril. “Si entonces estuvo al límite de suspenderse San Jorge, este año el retraso es aún mayor, con diez días más de demora”, ha señalado Polo, alertando de la dificultad para organizar el ciclo en los plazos habituales.`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 1001,
    title: `Guadalajara tendrá cinco encierros en 2026`,
    image: "/images/guadaa.jpg",
    category: "Actualidad",
    date: "15 de Enero de 2026",
	fullContent: `El Ayuntamiento de Guadalajara ha abierto el proceso para contratar la organización de los festejos taurinos de las Ferias de 2026 y 2027 —con opción de prórroga hasta 2029—, incluyendo una programación histórica de encierros urbanos.  ￼

El pliego de condiciones contempla la celebración de cinco encierros tradicionales, una cifra sin precedentes en la ciudad, a los que se sumará un sexto encierro de prueba con cabestros —una modalidad que ya se probó durante las ferias de 2025— para familiarizar las reses y reforzar la seguridad de las carreras.  ￼

El quinto encierro se ha programado para el miércoles de Ferias, día en el que tradicionalmente se celebra el concurso de recortadores, aunque el horario aún está por determinar con la empresa adjudicataria del contrato.  ￼

Según ha explicado el concejal de Festejos, la ampliación del número de encierros responde tanto a motivos tradicionales como a la intención de dinamizar económicamente el centro de la ciudad y situar a Guadalajara en el panorama nacional de festejos taurinos.  ￼

El contrato previsto incluye, además de los encierros, cuatro corridas de toros en la plaza de Las Cruces y el concurso nacional de recortadores, junto con actividades formativas de la Escuela Taurina local.  ￼

El presupuesto para estos dos años de contratación asciende a 847.000 euros, y las ofertas se podrán presentar hasta el 13 de febrero de 2026.  ￼`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   }
];

const latestNews: NewsItem[] = [
 	{ 
    id: 123,
    title: `Los retrasos en la Diputación ponen en riesgo la Feria de San Jorge 2026`,
    image: "/images/retrasos.jpg",
    category: "Actualidad",
    date: "14 de Enero de 2026",
	fullContent: `La celebración de **la Feria de San Jorge 2026** podría verse comprometida debido a los retrasos de la Diputación Provincial en la publicación del pliego de gestión de la plaza de toros de la Misericordia, una circunstancia que pone en riesgo el arranque de la temporada taurina.

Así lo ha advertido **Fernando Polo**, exgerente del coso zaragozano, en una entrevista concedida al programa Mediodía COPE Zaragoza. Polo ha recordado precedentes recientes, como el año 2018, cuando la Feria de San Jorge no pudo celebrarse tras la publicación tardía del pliego y la posterior presentación de un recurso.

Una situación similar se produjo en 2022, cuando el contrato se firmó el 29 de marzo, apenas unas semanas antes de una feria tradicionalmente articulada en torno al 23 de abril. “Si entonces estuvo al límite de suspenderse San Jorge, este año el retraso es aún mayor, con diez días más de demora”, ha señalado Polo, alertando de la dificultad para organizar el ciclo en los plazos habituales.`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 124,
    title: `Guadalajara tendrá cinco encierros en 2026`,
    image: "/images/guadaa.jpg",
    category: "Actualidad",
    date: "15 de Enero de 2026",
	fullContent: `El Ayuntamiento de Guadalajara ha abierto el proceso para contratar la organización de los festejos taurinos de las Ferias de 2026 y 2027 —con opción de prórroga hasta 2029—, incluyendo una programación histórica de encierros urbanos.  ￼

El pliego de condiciones contempla la celebración de cinco encierros tradicionales, una cifra sin precedentes en la ciudad, a los que se sumará un sexto encierro de prueba con cabestros —una modalidad que ya se probó durante las ferias de 2025— para familiarizar las reses y reforzar la seguridad de las carreras.  ￼

El quinto encierro se ha programado para el miércoles de Ferias, día en el que tradicionalmente se celebra el concurso de recortadores, aunque el horario aún está por determinar con la empresa adjudicataria del contrato.  ￼

Según ha explicado el concejal de Festejos, la ampliación del número de encierros responde tanto a motivos tradicionales como a la intención de dinamizar económicamente el centro de la ciudad y situar a Guadalajara en el panorama nacional de festejos taurinos.  ￼

El contrato previsto incluye, además de los encierros, cuatro corridas de toros en la plaza de Las Cruces y el concurso nacional de recortadores, junto con actividades formativas de la Escuela Taurina local.  ￼

El presupuesto para estos dos años de contratación asciende a 847.000 euros, y las ofertas se podrán presentar hasta el 13 de febrero de 2026.  ￼`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 125,
    title: `La Plaza de Toros de Guadalajara sale a licitación pública`,
    image: "/images/guada.jpg",
    category: "Actualidad",
    date: "14 de Enero de 2026",
	fullContent: `La Plaza de Toros de Guadalajara se encuentra actualmente en proceso de licitación pública para la adjudicación de su gestión. Según ha podido saber este medio, **varias empresas taurinas estarían interesadas en concurrir al concurso**, atraídas por el potencial de una plaza que en los últimos años ha mantenido una programación estable.

El procedimiento se abre tras varias temporadas en las que la Feria de la Antigua ha logrado consolidarse dentro del calendario taurino nacional, con carteles de buen nivel y presencia habitual de figuras del toreo, así como de ganaderías contrastadas.

Esta continuidad en la oferta taurina convierte a Guadalajara en un coso atractivo desde el punto de vista empresarial. La resolución del concurso será clave para definir el futuro inmediato de la plaza y el modelo de feria de las próximas ediciones.`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 126,
    title: `La Plaza de Toros de Valencia confirma una Feria de Fallas 2026 de gran proyección`,
    image: "/images/gran.jpg",
    category: "Actualidad",
    date: "14 de Enero de 2026",
	fullContent: `La Plaza de Toros de Valencia ha presentado oficialmente la programación de la Feria de Fallas 2026, un ciclo que se celebrará del **13 al 19 de marzo** y que vuelve a situar a la ciudad como uno de los grandes ejes del inicio de la temporada taurina. Los carteles, **que ya fueron avanzados por este medio**, ratifican una apuesta clara por la calidad artística, el equilibrio entre figuras consolidadas y toreros en proyección, así como una cuidada diversidad de encastes.

Bajo el lema "¡Estem en Falles, ara toquen bous!", la feria combina corridas de máximo atractivo, el tradicional festejo de rejones y una programación de novilladas que refuerza la atención a la cantera, uno de los pilares históricos del coso de la calle Xàtiva.

El abono reúne a nombres propios del primer nivel como **Roca Rey, Alejandro Talavante, José María Manzanares, Sebastián Castella, Pablo Aguado, Emilio de Justo, Miguel Ángel Perera, Borja Jiménez y Tomás Rufo**, junto a jóvenes valores que encuentran en Valencia un escenario de máxima exigencia para su consolidación.

La confirmación oficial de los carteles refrenda la información adelantada por este medio y perfila una feria llamada a marcar el pulso artístico y empresarial del arranque de la temporada europea.

___

**Carteles oficiales – Feria de Fallas Valencia 2026**

**Corridas de toros**

**Viernes 13 de marzo** – 17:00 h
Toros de La Quinta
Fortes – Román – David de Miranda

**Sábado 14 de marzo** – 17:00 h
Alejandro Talavante – Roca Rey – Samuel Navalón

**Domingo 15 de marzo** – 17:00 h
Toros de Jandilla – Vegahermosa
Sebastián Castella – José María Manzanares – Pablo Aguado

**Martes 17 de marzo** – 17:00 h
Toros de Santiago Domecq
Miguel Ángel Perera – Víctor Hernández – Marco Pérez

**Miércoles 18 de marzo** – 17:00 h
Toros de Domingo Hernández
Borja Jiménez – Tomás Rufo (mano a mano)

**Jueves 19 de marzo** – 17:00 h
Toros de Núñez del Cuvillo
Alejandro Talavante – Emilio de Justo – Juan Ortega

___

**Rejones**

**Domingo 15 de marzo** – 12:00 h
Reses de María Guiomar C. de Moura
Andy Cartagena – Diego Ventura – Lea Vicens

___

**Novilladas**

**Sábado 7 de marzo** – 17:00 h
Novillada sin picadores
Alejandro Jován – Álvaro Alarcón – Iñaki Bermejo – Israel Guirao – Carlos Luis – Hugo Mása – Daniela García

**Domingo 8 de marzo** – 17:00 h
Novillada picada
Alejandro Talavante – Emiliano Osornio – Mario Vilau – Marco Polope

**Lunes 16 de marzo** – 17:00 h
Novillada picada
Juan Alberto Torrijos – Julio Méndez – Julio Norte`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 127,
    title: `Plaza 1 define las novilladas de San Isidro con tres carteles de máxima proyección`,
    image: "/images/plazaa1.jpg",
    category: "Actualidad",
    date: "13 de Enero de 2026",
	fullContent: `La empresa Plaza 1 tiene prácticamente cerradas las novilladas de la próxima Feria de San Isidro.

Serán tres citas en las que se anuncian algunos de los novilleros más destacados del escalafón, que se medirán a encierros de **Conde de Mayalde, Fuente Ymbro y Montealto**, conformando un elenco ganadero de primer nivel.

En el apartado de los actuantes, el ciclo contará con una marcada presencia internacional, ya que harán el paseíllo el mexicano **Emiliano Osornio, el peruano Pedro Luis y el portugués Tomás Bastos. Además, debutará en la Plaza de Las Ventas Julio Norte, uno de los nombres propios de la temporada 2025, junto al catalán Mario Vilau.** Completan los carteles **Álvaro Serrano, triunfador del Circuito de Novilladas de la Comunidad de Madrid, así como Martín Morilla, Julio Méndez y Pedro Montaldo.**

A falta de confirmación oficial y a expensas de los últimos flecos de las negociaciones, los carteles previstos para las novilladas de San Isidro son los siguientes:

– **Lunes 12 de mayo**: Tomás Bastos, Martín Morilla y Álvaro Serrano (Montealto)

– **Lunes 19 de mayo**: Pedro Luis, Mario Vilau y Julio Norte (Fuente Ymbro)

– **Lunes 26 de mayo**: Emiliano Osornio, Pedro Montaldo y Julio Méndez (Conde de Mayalde)`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 128,
    title: `Diputación de Huelva y la Fundación Toro de Lidia analizan el presente y futuro de la Plataforma de impulso a los Novilleros de Andalucía`,
    image: "/images/ftl.jpg",
    category: "Actualidad",
    date: "13 de Enero de 2026",
	excerpt: "La institución onubense ha sido clave para la celebración de la sexta edición del Circuito de Novilladas de Andalucía, cuyo triunfador fue el ayamontino Carlos Tirado",
    fullContent: `Borja Cardelús, director general de la Fundación Toro de Lidia, y David Toscano, presidente de la Diputación de Huelva, mantuvieron en la mañana de ayer una reunión de trabajo en la que analizaron el desarrollo del primer curso de la Plataforma de impulso a los Novilleros de Andalucía, cuya Memoria 2025 fue presentada y evaluada, así como las líneas de actuación y objetivos de cara a la temporada 2026.

        

En el encuentro estuvo también presente el empresario taurino Jorge Buendía, gestor del coso de la localidad onubense de Cortegana, plaza que en 2025 acogió la primera semifinal del Circuito de Novilladas de Andalucía, consolidándose como un enclave clave dentro del certamen.

        

Durante la reunión se puso en valor el impacto del proyecto impulsado por la Fundación Toro de Lidia, que tiene como ejes principales la promoción y visibilidad de los novilleros andaluces, la difusión de los certámenes celebrados en Andalucía y el respaldo al trabajo formativo de las Escuelas Taurinas. La Memoria presentada refleja unos resultados muy destacados en su primer año de vida, con una comunidad digital que supera los 66.000 seguidores y cerca de 40 millones de impresiones, cifras que avalan el alcance y la repercusión de la iniciativa.

 

Asimismo, se destacó la intensa actividad presencial desarrollada por la Plataforma a lo largo de la temporada, con numerosos encuentros institucionales y acciones sociales y divulgativas encuadradas en programas de la Fundación Toro de Lidia, acercando la tauromaquia a centros sociales, educativos y universitarios, y reforzando su dimensión cultural y social.

 

En el transcurso del encuentro se subrayó también el excelente momento que atraviesa el Circuito de Novilladas de Andalucía, certamen encuadrado en la Liga Nacional de Novilladas, cuya sexta edición tuvo como triunfador al novillero onubense Carlos Tirado, reafirmando el papel protagonista de Huelva en el presente y futuro del toreo joven. Tirado se proclamó vencedor tras una temporada de alto nivel, convirtiéndose en uno de los nombres propios del escalafón menor.

 

La Diputación de Huelva fue reconocida como una de las instituciones clave en el sostenimiento y crecimiento de estos proyectos, al ser patrocinador oficial tanto del Circuito de Novilladas de Andalucía como de la Plataforma de impulso a los Novilleros de Andalucía, una muestra más de su firme apuesta por la tauromaquia como manifestación cultural, por el medio rural y por el futuro de los jóvenes toreros.

 

La reunión sirvió, además, para sentar las bases de colaboración de cara a 2026, con el objetivo común de seguir fortaleciendo un modelo de certamen y de promoción que se ha consolidado como referente a nivel nacional y que sitúa a Andalucía —y a la provincia de Huelva— en una posición destacada dentro del panorama taurino actual.

 

La Plataforma de Impulso a los Novilleros de Andalucía nace con el objetivo de promocionar y potenciar las carreras de los novilleros en la comunidad, así como sus Escuelas Taurinas y certámenes. Un proyecto anual, impulsado por la Fundación Toro de Lidia y respaldado por la Junta de Andalucía, Fundación Caja Rural del Sur, Fundación Cajasol, Instituto Andaluz de la Juventud, Real Maestranza de Caballería de Sevilla, Diputación de Málaga, Diputación de Huelva, Diputación de Córdoba, Diputación de Granada y Diputación de Cádiz.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 129,
    title: `David de Miranda, Medalla de Huelva al Arte 2026`,
    image: "/images/davidd.jpg",
    category: "Actualidad",
    date: "13 de Enero de 2026",
	excerpt: "El Ayuntamiento distingue al torero onubense como uno de los grandes referentes culturales de la provincia por su trayectoria, autenticidad y proyección dentro y fuera de Huelva",
    fullContent: `El Ayuntamiento de Huelva ha anunciado oficialmente la concesión de la **Medalla de Huelva al Arte 2026** al diestro **David de Miranda**, uno de los máximos exponentes actuales del arte taurino surgidos de la provincia. El anuncio ha sido realizado esta mañana **-12 de enero-** por la alcaldesa de la ciudad, **Pilar Miranda**, acompañada por el concejal de Presidencia y Relaciones Institucionales, **Alfonso Castro**, tras haber comunicado previamente la propuesta a todos los grupos políticos municipales.

Esta distinción forma parte de las **Medallas de la Ciudad 2026**, cuya aprobación definitiva se elevará al **Pleno de Honores y Distinciones**, convocado para el próximo **martes 20 de enero**. La entrega oficial de los galardones tendrá lugar posteriormente en el **solemne acto institucional incluido en el Programa de las Fiestas de San Sebastián**, patrón de la ciudad, que se celebrará el **viernes 23 de enero, a las 20.00 horas, en el Gran Teatro de Huelva**.

Durante su intervención, la alcaldesa ha querido subrayar el profundo significado de esta jornada para la ciudad, recordando que **“El Día de Huelva es sin duda el más solemne y protocolario que organiza el Ayuntamiento, pero también es uno de los días más emocionantes, porque es el día en que Huelva reconoce el trabajo y la trayectoria de personas e instituciones onubenses que han brillado en su compromiso con esta ciudad”**.

En este sentido, **Pilar Miranda** ha destacado además que **“Es un día también para afianzar nuestro onubensismo, a través de la gratitud y la admiración a aquellas entidades y personas que no sólo desempeñan su trabajo y responsabilidades con eficacia, sino que además han demostrado el amor a su tierra y que representan lo mejor de Huelva y del onubense”**.

La **Medalla de Huelva al Arte** reconoce en **David de Miranda** una trayectoria marcada por una **vocación profunda, forjada a base de esfuerzo, constancia y superación**. Su concepto del toreo, **asentado en el valor, la verdad y la pureza**, lo ha convertido en una de las figuras más sólidas y respetadas del panorama taurino actual.

En los últimos años, el torero onubense ha protagonizado **actuaciones de enorme relevancia en plazas de primer nivel**, firmando faenas que han quedado grabadas en la memoria de la afición y alcanzando algunos de los **triunfos más destacados de la temporada taurina**. Su evolución artística y profesional ha supuesto, además, una importante proyección de la provincia de Huelva dentro y fuera de sus fronteras.

Por su **aportación al patrimonio cultural y artístico**, por la **calidad y autenticidad de su expresión taurina** y por representar con dignidad y orgullo a su tierra, el Ayuntamiento considera que **David de Miranda es plenamente merecedor de la Medalla de Huelva al Arte**, un reconocimiento que pone en valor no solo su carrera, sino también el vínculo profundo entre el torero y la ciudad que lo vio nacer y crecer.

Con esta distinción, **Huelva** vuelve a reafirmar su compromiso con el talento propio y con aquellos nombres que, desde diferentes ámbitos, contribuyen a engrandecer la identidad cultural, artística y emocional de la ciudad como el diestro **David de Miranda**.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 130,
    title: `Largas colas en Valencia en la venta de los nuevos abonos de temporada`,
    image: "/images/colas.jpg",
    category: "Actualidad",
    date: "12 de Enero de 2026",
    fullContent: `La temporada valenciana del 2026 se abre paso, esta vez con la renovación de los abonos especiales para jóvenes y jubilados de la Plaza de Toros de Valencia. 

Desde bien entrada la mañana y a pesar del frío, la afición valenciana se ha congregado en la explanada de la plaza de toros formando una cola que ha alcanzado cerca de 75 metros. 
Pese a la gran afluencia de aficionados, la empresa solo puso a disposición 90 abonos sobrantes lo que provocó que gran parte de los allí presentes, quitando a los que como yo llevábamos desde las 6:00h de la mañana,volvieran a casa con las manos vacías. 

Desde aquí hago un llamamiento personal a la empresa para que facilite el proceso. Abriendo antes de las 10h las taquillas, ampliando el abono disponible y poniendo este día de nuevos abonos en una fecha donde sea posible a todos (incluidos los jóvenes) asistir sin perder clase o faltar al trabajo, cosa que ha sido difícil teniendo en cuenta que hoy ha sido lunes. Exceptuando esto, la afición valenciana espera expectante la publicación oficial de los carteles de esta feria de Fallas 2026, un serial cuyos carteles ya han sido avanzados por este medio.`,
    author: "Arnau Agulló",
    authorLogo: "/images/tendidodigitallogosimple.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 131,
    title: `Jesús Sánchez se une al apoderamiento del novillero peruano Pedro Luis junto a José Ángel Martín`,
    image: "/images/jesus.jpg",
    category: "Actualidad",
    date: "12 de Enero de 2026",
    fullContent: `El taurino madrileño Jesús Sánchez se incorpora al equipo de apoderamiento del novillero peruano Pedro Luis, al que continuará representando José Ángel Martín. 

Ambos asumirán de manera conjunta la planificación y dirección de la carrera del novillero limeño, uno de los nombres más destacados de la pasada temporada.

En los últimos años, Jesús Sánchez ha formado parte del equipo de comunicación del matador de toros burgalés Morenito de Aranda. El acuerdo se ha formalizado esta mañana mediante el tradicional apretón de manos.`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 132,
    title: `José María Garzón explica cual será sus líneas maestras para la gestión de Maestranza de Sevilla`,
    image: "/images/lance.jpg",
    category: "Actualidad",
    date: "12 de Enero de 2026",
	footerImage1: "/images/lance2.jpg",
    fullContent: `En el **Hotel Querencia de Sevilla** ha sido el escenario elegido para la rueda de prensa con los medios de comunicación especializados en tauromaquia, que ha protagonizado José María Garzón como nuevo responsable de la **Plaza de Toros de la Real Maestranza de Caballería de Sevilla**, con su empresa Lances de Futuro.
**José María Garzón**, ha comenzado expresando su máximo agradecimiento a la Real Maestranza de Caballería de Sevilla por la confianza depositada en su empresa para la gestión del coso sevillano. Del mismo modo, quiso reconocer y agradecer la labor de la Empresa Pagés durante sus **93 años**, aunque reconoció que en estos días desde que lo nombraron nuevo gestor del coso del baratillo no ha tenido contacto con Ramón Valencia.
Una de las primeras palabras de Garzón fue para confirmar que ha integrado al 100% al equipo humano de la Empresa Pagés, encontrando actualmente en un proceso lógico de adaptación, y recordó que dispone de un contrato de cinco años para desarrollar su proyecto.

**ABONADOS**
Garzon destacó un trato muy especial para el abonado, al que considera fundamental: habrá descuentos, actividades exclusivas y ventajas específicas. Asimismo, anunció un importante descuento en los abonos para menores de 25 años.
También destaco momo uno de los objetivos de Lances de Futuro para esta edición es incrementar el abono en alrededor de **600 o 700 nuevos abonados**.

**REAL VENTA DE ANTEQUERA**
José María Garzón anunció la recuperación de la **Real Venta de Antequera**, recordó que desde hace más de 40 años no se celebra una corrida de toros en este enclave, siendo la última la célebre corrida de Miura en la que Espartaco se encerró con seis toros, la Venta de Antequera será expuesta algunas corridas además se celebrarán actos relacionados con el abono. La nueva empresa quiere también potenciar la tauromaquia entre los jóvenes, con actividades dirigidas a colegios, institutos y universidades, además de ampliar las tradicionales jornadas de puertas abiertas.

**CARTELES**
Lances de Futuro tiene previsto entre el **6 y el 20 de febrero** pata ña celebración de una gran gala de presentación oficial de la temporada,
Garzón confirmó su intención de recuperar fechas emblemáticas para **Sevilla**, como la del **Corpus Christi**, reforzar la **Feria de San Miguel** y otras citas señaladas del calendario taurino sevillano. También señaló que el 15 de agosto -«el primer año no me puedo inmolar»- Asimismo, anunció que se está trabajando, en coordinación con la Junta de Andalucía y la Real Maestranza, para dejar puestos abiertos tanto en novilladas como en San Miguel para toreros triunfadores, relevantes o de especial interés llegado el momento. En cuanto al calendario de la temporada en **Sevilla**, las fechas anunciadas son: **Domingo de Resurrección, 5 de abril**; el siguiente fin de semana, **10, 11 y 12 de abril**; y de forma continuada desde el **miércoles 15 hasta el 26 de abril**.

**GANADERIAS**
Manolo Tornay y Niño de Belén, sean los hombres de Campo de Lances de Futuro, confirmó el debut en Sevilla de la ganadería de **Álvaro Núñez**, el regreso de **La Quinta** y de **Puerto de San Lorenzo**. Además, estarán Cuvillo, Garcigrande, Fuente Ymbro, Santi Domecq, Domingo Hernández, Victorino Martín y Miura. y una novillada de la ganadería **Garcigrande**

**MORANTE DE LA PUEBLA**
**José María Garzón**, empresario taurino, **“decisión del propio maestro”**.

**TELEVISIÓN**
Garzón: **“Me gustaría que se televisara de forma mixta, por plataforma privada y pública”**.

**WEB**
Lances de futuro crea una nueva web para la maestranza con el dominio 	<a
  href="lancesmaestranza.com"
  target="_blank"
  rel="noopener noreferrer"
  style="color:#2563eb; text-decoration:underline; font-weight:500;"
>
www.lancesmaestranza.com
</a>`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 133,
    title: `David de Miranda gana la Catedral de Manizales y “El Voceador de la Patria”, máximos premios que lo acreditan como Triunfador de la Feria`,
    image: "/images/notix.jpg",
    category: "Actualidad",
    date: "12 de Enero de 2026",
    fullContent: `La **71.ª Temporada Taurina de Manizales** llegó a su fin este domingo con un nombre grabado en lo más alto del escalafón: **David de Miranda**. El torero español se erigió como el **gran triunfador del ciclo** al conquistar los dos galardones más importantes de la feria, la réplica de la **Catedral de Manizales** y el prestigioso trofeo **“El Voceador de la Patria”**, reconocimientos que lo acreditan como triunfador absoluto del serial manizaleño.

El impacto del debut de **David de Miranda** en la **Feria de Manizales** no pudo ser mayor. Su rotunda actuación frente al toro **Serrano**, de 462 kilogramos, perteneciente a la ganadería de **Santa Bárbara**, marcó uno de los momentos más altos de la temporada. Una faena de gran dimensión artística, entrega y profundidad que conectó de manera inmediata con el público y el jurado, consolidando su gran momento profesional y proyectándolo con fuerza en el panorama taurino internacional.

La feria también dejó otros reconocimientos destacados. La ganadería **Santa Bárbara** fue distinguida como **Mejor Ganadería**, ratificando la calidad y bravura de sus ejemplares. El premio a **Mejor Subalterno** fue para **Emerson Pineda**, por su destacada labor en el ruedo, mientras que **Olga Casado** recibió el reconocimiento como **Mejor Novillero**, confirmando su proyección y talento.

Con este contundente triunfo, **David de Miranda** no solo cierra una feria memorable, sino que **escribe una página dorada en la historia reciente de la Temporada Taurina de Manizales**, una de las más importantes de América, dejando claro que su nombre ya forma parte del elenco de figuras que han sabido conquistar la exigente afición manizaleña.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 134,
    title: `Curro Romero encabeza la comisión pro-monumento a Rafael de Paula junto a la Plaza de Toros de Jerez`,
    image: "/images/curroyrafa.jpg",
    category: "Actualidad",
    date: "11 de Enero de 2026",
    fullContent: `Se ha constituido en la ciudad de Jerez de la Frontera una comisión con personalidades del ámbito de la cultura y del ámbito taurino con el objetivo de rendir homenaje al torero Rafael de Paula en su ciudad natal.

El diestro falleció el pasado 2 de noviembre a los 85 años, dejando un legado reconocido en los principales escenarios taurinos.

La comisión propone diversas iniciativas para perpetuar la memoria del artista del torero Rafael de Paula. Una de las principales es la **instalación de un monumento en los alrededores de la plaza de toros de Jerez** y la colocación de un mármol en la calle Cantarería que recuerde su lugar de nacimiento. También se contempla la creación de un patio o jardín en el barrio de Santiago que lleve su nombre.

El colectivo recuerda la trayectoria de Rafael de Paula, condecorado en 2002 con la Medalla de Oro de las Bellas Artes por Juan Carlos I en Cádiz. Señalan que, a pesar de su **reconocimiento internacional** y la pasión que siempre despertó entre los jerezanos, nunca había recibido un homenaje oficial por parte de su ciudad.

Desde la comisión pro-Rafael de Paula destacan que esta iniciativa recoge un sentimiento histórico entre los aficionados que, desde 1979, reclamaban un homenaje al torero en su tierra. **Subrayan que se trata de un “deber moral, histórico y de justicia artística”** hacia quien llevó “el sentimiento y compás” de Jerez a los escenarios más importantes del toreo.

Estas son las personas que la componen:

**Por el mundo del toro** están Curro Romero, Luis Domecq, Santiago Domecq y Salvador Gavira.

**Por el Flamenco** Manuel Morao y José Mercé.

**Sus hijo y sobrino** Bernardo Soto Muñoz, Jesús Soto de Paula y Rafael Soto.

**Por la Pintura están los pintores** Pedro Serna, Humberto Parra y Diego Ramos.

**Por la literatura los escritores** Fernando Bergamin, Antonio Parra, Joaquín Albaicín y el director de ABC de Sevilla Alberto García Reyes.

**Entidades que forman parte de la comisión son** la tertulia Los 13, la Asociación Cultural Calles Nueva y Cantarería, la Hermandad de Santiago de Nuestro Padre Jesús del Prendimiento, La Peña Tío José de Paula, la Fundación Cultural Taurina de Jerez y la Peña Rafael de Paula.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 135,
    title: `El rejoneador José María Martín, con apoderado`,
    image: "/images/apode.jpg",
    category: "Actualidad",
    date: "11 de Enero de 2026",
    fullContent: `El empresario taurino **Tito Flores**, gerente de **Tierra Castilla** y el rejoneador toledano **José María Martín** han llegado a un acuerdo profesional de apoderamiento.

Con el tradicional apretón de manos, para esta temporada 2026 y de forma indefinida, tanto empresario como rejoneador basándose en la confianza y respeto mutuo, empezarán una nueva etapa llena de proyectos e ilusiones.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 136,
    title: `Morante presenta el cartel de La Puebla del Río para las fiestas de San Sebastián 2026`,
    image: "/images/moratnte.jpg",
    category: "Actualidad",
    date: "11 de Enero de 2026",
	excerpt: "El Ayuntamiento de La Puebla del Río ha oficializado junto al diestro cigarrero Morante de la Puebla los carteles de las fiestas de San Sebastián 2026.",
    fullContent: `En esta edición del 2026 repetirá la fórmula del año pasado con un encierro infantil el viernes 23 de enero, dos encierros y sendas novilladas sin picadores los días 24 y 25, aunque teniendo como novedad, tras el chupinazo y el encierro infantil, el viernes 23 la plaza acogerá una exhibición de recortadores de primer nivel.

Como ya es también tradicional el novillero triunfador de ambos festejos obtendrá como premio torear en la **Real Maestranza de Caballería de Sevilla**.

Los carteles son los siguientes:

**– Viernes 23 de enero**. Exhibición de recortes con astados de Fermín Bohórquez

**– Sabado 24 de enero** Novillada sin picadores. Erales de Garcigrande, Santiago Domecq, Fermín Bohórquez, Hermanos García Jiménez, Juan Manuel Criado, Alcurrucén y David Ribeiro Telles, para **Armando Rojo, Julio Aparicio, Blas Márquez, Iñigo Norte, Joao Fernándés, Jaime de Pedro, Ignacio Garibay**

**– Domingo 25 de enero** Novillada sin picadores, erales de Manuel Veiga para **Héctor Nieto, Manuel Real ‘Realito’, Manuel Luque ‘El Exquisito’, Nacho Sabater, Manuel León, Manuel Domínguez y Jaime Padilla**

Además, del 10 al 19 de enero se podrá visitar la exposición "El alma de Morante", de Manuel Machuca, en la galería Luiz Verri del municipio, situado en la calle Betis 54.

El cartel anunciador de las Fiestas de los Encierros en honor a San Sebastián rinde este año un emotivo homenaje a la gran tonadillera y vecina de La Puebla del Rio, Macarena del Río.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   }, 
	{ 
    id: 137,
    title: `El consejo de administración de la Plaza de Toros aprueba la prórroga del contrato con Lances de Futuro para la feria de 2026`,
    image: "/images/saantander.jpg",
    category: "Actualidad",
    date: "9 de Enero de 2026",
	excerpt: "El Ayuntamiento realizará este año diferentes obras de reforma y mantenimiento en el Coso de Cuatro Caminos, entre las que se encuentran la sustitución de bancos del tendido 2 y la construcción de nuevos aseos y un archivo-sala de reuniones.",
    fullContent: `Lances de Futuro organizará y gestionará la Feria de Santiago de 2026, una vez que el consejo de administración de la Plaza de Toros de Santander ha aprobado hoy la prórroga prevista en el contrato de adjudicación acordado en diciembre de 2024.

La empresa, que se ha encargado de los festejos santanderinos desde 2021, ha expuesto al consejo las líneas básicas de su proyecto, que pasa por mantener el nivel de toreros, ganaderías y número de festejos.

En este sentido, ha avanzado su interés por contar con algunas de las principales figuras del toreo, a la vez que seguirá trabajando en su plan de promoción para que los festejos santanderinos sigan consolidados como la feria de referencia en el norte de España.

El consejo ha puesto en valor el trabajo realizado por Lances de Futuro en el éxito y proyección de la feria santanderina, y ha trasladado su felicitación a la empresa por su reciente designación como nueva gestora de la Real Maestranza de Sevilla, una de las instituciones más emblemáticas del ámbito taurino.

Por otro lado, en el consejo de administración se ha presentado el informe sobre los trabajos a realizar en el recinto durante el año 2026, entre los que se encuentra la construcción de cuatro nuevos aseos y un salón de usos múltiples para archivo y sala de reuniones.

Por otro lado, este año también está previsto sustituir los bancos del tendido 2, con madera nueva de pino de invernadero, aumentando los soportes metálicos, así como cambiar la cubierta del último corral.

Además, los Talleres Municipales realizarán diferentes obras de mantenimiento para la puesta a punto de la Plaza de Toros de cara a los festejos de la Feria de Santiago 2026.

De este modo, el taller metalúrgico revisará y reparará, en caso de que sea necesario, las puertas de corrales y toriles, las barandillas de grada y andanada, y engrasará los sistemas de apertura de todas las puertas metálicas.

En lo que se refiere a la carpintería, se revisará la estructura de bajo cubierta, se reparará y sustituirá, en caso de que sea preciso, los bancos de grada, tendido y andanada, así como los tablones, puertas y burladeros del ruedo, enfermería y toriles que se encuentren en mal estado.

Otros trabajos afectarán a la limpieza de cubierta y pesebrones, así como la pintura de la cubierta, el patio de caballos, cuadras, hall de la capilla, enfermería, foso, burladeros y otros elementos estructurales del recinto.

**Premios Taurinos del Ayuntamiento**

Además, el consejo de administración de la Plaza de Toros también ha dado cuenta de la gala de entrega de los Trofeos Taurinos del Ayuntamiento de Santander, que se celebrará el 27 de febrero en el Hotel Chiqui. A partir del próximo lunes, 12 de enero, las peñas ya podrán reservar su asistencia.

Como es habitual, en esta cita se entregarán los tradicionales premios que reconocen a los principales protagonistas que han pasado por el ruedo del Coso de Cuatro Caminos en la última edición de la feria de Santiago.

Según la decisión de un jurado compuesto por miembros del consejo de administración de la Plaza de Toros, periodistas y representantes de las peñas, en la categoría de ‘Triunfador de la Feria’, el premio fue para ‘El Cid’; mientras que la ganadería de Victorino Martín resultó distinguida como la ‘Mejor Ganadería’ de la feria, por lo que el tándem formado por ambos, en el que el sevillano cortó dos orejas y salió por la puerta grande, logró los máximos trofeos.

La ‘Mejor Estocada’ fue para Roca Rey, el premio al ‘Mejor Rejoneador’ para Diego Ventura, mientras que el galardón al ‘Mejor Debutante’ recayó en Damián Castaño.

Además, se ha premiado a Juan Renedo como ‘Aficionado Ejemplar’; a Patricia Navarro por su labor periodística, y se ha reconocido al matador de toros Curro Vázquez con la distinción ‘A toda una trayectoria’.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 138,
	title: `David de Miranda estrena su nueva página web oficial`,
    image: "/images/foto.jpg",
    category: "Actualidad",
    date: "9 de Enero de 2026",
	excerpt: "Una plataforma moderna, visual y dinámica para seguir toda la actualidad del torero onubense",
    fullContent: `Con la llegada del nuevo año, el matador de toros **David de Miranda** presenta su nueva página web oficial, 	
	<a
  href="www.davidemiranda.com"
  target="_blank"
  rel="noopener noreferrer"
  style="color:#2563eb; text-decoration:underline; font-weight:500;"
>
www.davidemiranda.com
</a> , un espacio digital concebido para acercar al aficionado toda la información, noticias y próximos compromisos profesionales del diestro nacido en **Trigueros**.

El torero onubense ha puesto en marcha esta nueva plataforma el pasado viernes 2 de enero, apostando por un diseño altamente visual y gráfico, acorde con los nuevos tiempos. La web incorpora un innovador sistema adaptable que permite su correcta visualización desde cualquier dispositivo, ya sea ordenador, tablet o teléfono móvil.

En <a
  href="www.davidemiranda.com"
  target="_blank"
  rel="noopener noreferrer"
  style="color:#2563eb; text-decoration:underline; font-weight:500;"
>
www.davidemiranda.com
</a> , el aficionado podrá encontrar toda la actualidad de **David de Miranda** a golpe de clic. El sitio web ofrece un contenido amplio, dinámico y en constante actualización, que permite profundizar en la trayectoria y el presente profesional del matador.

Entre sus principales secciones destacan la página de inicio con el posicionamiento de su eslogan, un completo apartado multimedia con galerías de imágenes y vídeos, la sección Crew Miranda, noticias de actualidad, carteles e información detallada sobre las próximas corridas, así como un espacio dedicado a las estadísticas, donde se recogen todos los festejos celebrados y sus resultados.

Con este nuevo proyecto digital, **David de Miranda** refuerza su presencia en el entorno online y estrecha aún más el vínculo con los aficionados, ofreciendo una ventana directa y accesible a su carrera taurina.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 139,
    title: `VÍCTOR PUERTO SE DESPEDIRÁ DEL TOREO ESTA TEMPORADA CONMEMORANDO EL XXXI ANIVERSARIO DE SU ALTERNATIVA`,
    image: "/images/puerto.jpg",
    category: "Actualidad",
    date: "9 de Enero de 2026",
	footerImage1: "/images/puerto1.jpg",
	footerImage2: "/images/puerto2.jpg",
	footerImage3: "/images/puerto3.jpg",
    fullContent: `En una emotiva rueda de prensa celebrada esta mañana en el **Hotel Restaurante Casa Pepe de Carrión de Calatrava** (Ciudad Real), el matador de toros **Víctor Puerto** ha anunciado oficialmente su retirada definitiva del toreo activo al término de la presente temporada 2026.
La noticia marca el cierre de una de las trayectorias más longevas y respetadas de la tauromaquia en la provincia de **Ciudad Real**, coincidiendo con el **XXXI Aniversario de su Alternativa**. La idea del diestro es afrontar una temporada donde se pueda despedir de las plazas que han marcado su carrera en **España**, sobre todo en la provincia de **Ciudad Real**.
La gira de despedida constará de un número limitado de festejos, seleccionados cuidadosamente para agradecer a la afición el apoyo recibido desde aquel **9 de abril de 1995**, cuando tomó la alternativa en la **Plaza de Toros de Ciudad Real** de manos de **Miguel Báez "Litri"** de padrino y **Jesulín de Ubrique** de testigo con reses de la ganadería de **Luis Algarra**.
"El toro me ha ido dado todo, ya él le he entregado mi vida entera. Tras treinta años de alternativa, siento que el cuerpo y la mente han alcanzado la plenitud, pero es el momento de dejar paso a las nuevas generaciones y retirarme con la dignidad que este traje merece. Todo lo que haga en el año de mi despedida quiero que tenga un significado especial. Me gustaría poder despedirme de la afición en las plazas de toros que han tenido una gran importancia en mi carrera y la provincia de Ciudad Real es la que me hizo torero y donde quiero buscar mi última temporada", declaró un emocionado Víctor Puerto.
**Una trayectoria de leyenda: De 1996 a la cumbre**
La carrera de **Víctor Puerto** quedó grabada en los anales de la tauromaquia desde su primer año como doctor en tauromaquia. 1996 fue el año de su consagración absoluta, logrando la histórica hazaña de **abrir dos veces la Puerta Grande de Las Ventas de Madrid**, una gesta que lo catapultó a la cima del escalafón de inmediato.
Su idilio con las plazas de primera no se detuvo ahí. En la memoria de los aficionados queda para la eternidad su faena antológica en la **Real Maestranza de Caballería de Sevilla** ante toro de **Gavira**, un triunfo que le sirvió para entrar de lleno en la afición sevillana. La tarde de **Bilbao** que le espada le privó del corte de las orejas o las **Puertas Grandes de Pamplona, Santander**, entre otras.
La Gira de Despedida 2026
La campaña de este año, será un homenaje a estas tres décadas de entrega, donde espera poder despedirse de la afición en las plazas más significativas de su carrera y en especial en Ciudad Real capital, donde le encantaría poner el broche de oro a su trayectoria.
La plaza de toros de Ciudad Real es uno de los cosos más representativos en la carrera de Víctor Puerto. No solo porque en ella tomó la alternativa ya referida, sino porque en su ruedo ha trenzado más de veinte paseillos como matador de toros, en los que ha alternado, tanto en feria como en la desaparecida Corrida de Beneficencia, con toreros como Enrique Ponce, El Juli, Rivera Ordóñez, Litri, Jesulín, Finito de Córdoba, Morante de la Puebla, o José Tomás (en dos ocasiones), además de varias actuaciones como novillero.
Apoyo institucional
En el acto estuvieron presentes el vicepresidente de la Diputación de Ciudad Real, Adrián Fernández y la concejal de asuntos taurinos de la capital, Mar Sánchez Izarra, los alcaldes de Miguelturra y Carrión de Calatrava, medios de comunicación y algunos aficionados, que mostraron su apoyo y admiración a la carrera del maestro, con el deseo de que esta temporada Víctor Puerto pueda despedirse de los aficionados de la provincia y la capital a los que tanto ha dado.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 140,
    title: `Morante de la Puebla repetirá como organizador de los festejos taurinos de La Puebla del Río en 2026`,
    image: "/images/organizara.jpg",
    category: "Actualidad",
    date: "9 de Enero de 2026",
    fullContent: `Morante de la Puebla organizará un año más los festejos taurinos de La Puebla del Río, según publica **José Manuel Peña en ABC de Sevilla**. El Ayuntamiento de la localidad sevillana hará oficial este viernes la adjudicación a la empresa compuesta por el diestro cigarrero y su apoderado y amigo, **Pedro Jorge Marqués**.

La edición de 2026 repetirá la fórmula del año pasado, con un programa que se desarrollará entre el **viernes 23 y el domingo 25 de enero. El viernes 23 se celebrará un encierro infantil** y, como principal novedad, tras el chupinazo y dicho encierro, la plaza acogerá una exhibición de recortadores de primer nivel.

Los días 24 y 25 tendrán lugar dos encierros y sendas novilladas sin picadores. El sábado se celebrará un concurso de ganaderías con novillos de **Garcigrande, Santiago Domecq, Fermín Bohórquez, Hermanos García Jiménez, Juan Manuel Criado, Alcurrucén y David Ribeiro Telles**. Para la jornada del domingo, las reses pertenecerán a la ganadería portuguesa de **Manuel Veiga**.

El novillero triunfador de ambos festejos obtendrá como premio torear en la **Real Maestranza de Caballería de Sevilla**.`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 141,
    title: `Yunquera de Henares acogerá la charla-coloquio “La tauromaquia de invierno 2025/2026”`,
    image: "/images/charla.jpg",
    category: "Actualidad",
    date: "8 de Enero de 2026",
    fullContent: `El próximo domingo **25 de enero de 2026**, a las **18:30 horas**, Yunquera de Henares acogerá la charla-coloquio “La tauromaquia de invierno 2025/2026”, organizada por la **Peña Taurina El Quite** en colaboración con el Ayuntamiento de la localidad.

El acto tendrá lugar en el **Centro Polivalente (C/ La Seda nº 41)** y estará moderado por **Diego Cervera**. Participarán **Carlos Aragón Cancela**, de la ganadería **Flor de Jara**, y el matador de toros **Gómez del Pilar**, quienes analizarán la actualidad del mundo taurino y las perspectivas de la próxima temporada.

Al finalizar la charla se ofrecerá un vino español a los asistentes.`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 142,
    title: `Con fecha, grupos y ganaderías para el Bolsín clasificatorio del Circuito de Novilladas de Andalucía 2026`,
    image: "/images/andalucia.jpg",
    category: "Actualidad",
    date: "8 de Enero de 2026",
    fullContent: `La séptima edición del certamen impulsado por la Fundación Toro de Lidia y la Junta de Andalucía ya conoce todos los detalles de sus tentaderos clasificatorios

 

El Circuito de Novilladas de Andalucía 2026 ya conoce todos los detalles de su Bolsín clasificatorio, cita determinante de la que saldrán siete nombres que formarán parte de la séptima edición de uno de los certámenes más consolidados y prestigiosos del panorama taurino nacional, impulsado por la Fundación Toro de Lidia y la Junta de Andalucía y encuadrado en la Liga Nacional de Novilladas.

 

El Bolsín se celebrará el próximo jueves 15 de enero, en una intensa jornada dividida en dos tentaderos clasificatorios, con la participación de un total de 22 novilleros procedentes de distintas provincias andaluzas, además de espadas formados en las distintas Escuelas Taurinas de la comunidad.

 

El Grupo 1 actuará en horario matinal en la ganadería de Aguadulce, situada en la provincia de Sevilla. Este primer bloque estará integrado por los siguientes novilleros: Isaac Galvín, Iván Rejas, Dennis Martín, Guillermo Luna, Julio Romero, Juan Jesús Rodríguez, Antonio Santana, Miriam Cabas, Joselito de Córdoba, Francisco Fernández, Pepe Martínez y Alfonso Alonso.

 

Por su parte, el Grupo 2 está previsto para la sesión vespertina en la ganadería de Chamaco, en la localidad onubense de Hinojos (Huelva). En este segundo tentadero tomarán parte Víctor Barroso, Manuel Olivero, Pedro Luis, Fuentes Bocanegra, El Primi, Gonzalo Capdevila, Martín Morilla, Alejandro Duarte, Pedro Montaldo e Ignacio Candelas.

       

El Bolsín clasificatorio se consolida así como una de las jornadas más exigentes e importantes del calendario taurino andaluz, en la que los jóvenes aspirantes deberán demostrar sus cualidades técnicas, artísticas y su capacidad para afrontar un certamen que representa una auténtica plataforma de lanzamiento para sus carreras profesionales.

 

El Circuito de Novilladas de Andalucía, promovido por la Junta de Andalucía y la Fundación Toro de Lidia, se ha convertido en un referente nacional en la promoción del toreo base, apostando por el relevo generacional, la vertebración del territorio y la puesta en valor de las ganaderías y profesionales andaluces, con un formato que combina exigencia, visibilidad y proyección mediática. Su celebración es posible gracias al apoyo de Diputación de Málaga, Diputación de Granada, Diputación de Huelva, Diputación de Córdoba, Diputación de Cádiz, Instituto Andaluz de la Juventud, Fundación Caja Rural del Sur y Fundación Cajasol.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 143,
    title: `Ubrique (Cádiz), ya conoce el cartel para la corrida de la piel`,
    image: "/images/ubrique2.jpg",
    category: "Actualidad",
    date: "8 de Enero de 2026",
    fullContent: `La empresa **Toros y Espectáculos Hnos. Durán** ha dado a conocer el cartel de la tradicional **Corrida de la Piel de Ubrique**, que se celebrará el 21 de marzo.

Con toros de la ganadería sevillana de **Virgen María**, harán el paseíllo los diestros **Daniel Luque, David de Miranda y Curro Durán**

La empresa tiene previsto presentar el cartel de manera oficial en los próximos días.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
   { 
    id: 144,
    title: `Arcos de la Frontera con un Rey Melchor muy taurino`,
    image: "/images/arcos.jpg",
    category: "Actualidad",
    date: "8 de Enero de 2026",
	footerImage1: "/images/arcos1.jpg",
    fullContent: `Si hay una noche mágica en el año en la de reyes, y este año en plena ruta de los pueblos blancos de Cádiz, más concretamente en Arcos de la Frontera, han tenido un Rey Melchor de lo más taurino en la figura del ganadero y empresario taurino **Eduardo Duarte**, gerente de **Ruedos del Sur**, encarnó a **Su Majestad el Rey Melchor**.

Ante la atenta mirada de miles de paisanos, vecinos y visitantes que abarrotaron las calles del casco urbano de la serrana localidad gaditana, **Melchor** hizo su entrada triunfal en una carroza cargada de referencias al mundo del toro. No se trató de un gesto improvisado, sino de una cuidada puesta en escena que quiso rendir homenaje a una de las expresiones culturales más arraigadas en **España**. **El Rey de Oriente** apareció ataviado con enseres propios del toreo, integrando así la liturgia festiva de los **Reyes Magos** con la simbología taurina, en una fusión que despertó tanto admiración como emoción entre el público.

Acompañando a **Su Majestad** marchaba un nutrido séquito de ‘**Pajes Taurinos**’, conformado por familiares y amigos cercanos a la gran familia de **Ruedos del Sur**. Este singular cortejo, lejos de ser anecdótico, reforzó el carácter reivindicativo de la presencia taurina en la cabalgata. Entre ellos destacó la figura del reconocido ‘**Plata de Ley**’ **Juan Sierra**, cuyo prestigio y trayectoria aportaron aún mayor solemnidad y autenticidad al desfile.

La participación de **Eduardo Duarte** como **Rey Melchor** no solo supuso un honor personal, sino también un claro guiño de apoyo a la tauromaquia, entendida como patrimonio cultural y una de las señas de identidad más relevantes de nuestro país. En un contexto en el que el debate sobre las tradiciones ocupa un lugar destacado en la agenda social y cultural, este gesto simbólico cobró especial relevancia al desarrollarse en un evento tan transversal y popular como la **Cabalgata de Reyes**, capaz de congregar a generaciones enteras en torno a la ilusión compartida

La estampa de **Melchor** avanzando entre aplausos, caramelos, juguetes, regalos... y miradas de asombro, envuelto en un imaginario taurino respetuoso y elegante, dejó una huella imborrable en la memoria colectiva de **Arcos de la Frontera**. Una noche en la que la fantasía infantil, la tradición festiva y la tauromaquia caminaron de la mano, recordando que las fiestas populares también pueden ser un espacio para la identidad, el mensaje y la reivindicación cultural y social.

Así, el día Reyes volvió a cumplir su cometido: repartir ilusión, emoción y sueños. Pero este año, además, dejó constancia de que las tradiciones, cuando se expresan con sensibilidad y respeto, siguen teniendo un lugar destacado en el corazón de los pueblos.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 145,
    title: `Valdesaz apuesta por el futuro con una clase práctica de máximo interés en enero`,
    image: "/images/valdesaz.jpg",
    category: "Actualidad",
    date: "7 de Enero de 2026",
    fullContent: `La localidad alcarreña de Valdesaz se convertirá en el epicentro de la base del toreo el próximo **sábado 17 de enero**. En una firme apuesta por la promoción de los nuevos valores, el municipio celebrará una extraordinaria clase práctica a partir de las **12:00 horas**, consolidando su compromiso con la formación de los futuros profesionales del escalafón.

Para la ocasión, se ha reseñado un encierro de la ganadería **Finca Valtaja,** situada en Galápagos , cuyos novillos servirán para medir las capacidades y el progreso de cuatro jóvenes promesas procedentes de distintas escuelas taurinas del país. El cartel, que destaca por su variedad y proyección, contará con la participación de Pedro Gómez, de la Escuela de Galapagar; Celso Ortega, representante de la Escuela La Gallosina; y los alumnos Pablo Serrano e Izan Alonso, quienes actuarán en calidad de locales pertenecientes a la Escuela Taurina de Guadalajara.

El festejo, que cuenta con la organización de la Escuela Taurina de Guadalajara y la Federación Taurina de Guadalajara, tendrá carácter gratuito para todos los aficionados que deseen acercarse a presenciar las evoluciones de estos novilleros.`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
   { 
    id: 146,
    title: `El rigor de Cuadri y la seriedad de los encastes: Madrid define su despertar en 2026`,
    image: "/images/rigor.jpg",
    category: "Actualidad",
    date: "7 de Enero de 2026",
	excerpt: "Plaza 1 recupera el pulso de Las Ventas con un inicio de temporada volcado en el toro; los hierros de Palha y Dolores Aguirre completan una apuesta de máximo compromiso.",
    fullContent: `La empresa Plaza 1 ha definido la arquitectura de lo que será el primer tramo de la temporada 2026 en la Monumental de Las Ventas, un diseño de carteles que apuesta decididamente por la ortodoxia ganadera y el reconocimiento a una nómina de toreros curtidos en la severidad del ruedo madrileño. 

El ciclo arrancará el próximo **22 de marzo** con un acontecimiento de especial calado para la afición: el retorno de la emblemática ganadería de **Cuadri**. Tras un paréntesis de un año, los ejemplares onubenses de la "H" coronada volverán a pisar el albero capitalino para ser lidiados por una terna de especialistas en la lidia de poder a poder conformada por **Pepe Moral, Gómez del Pilar y Damián Castaño**, tres diestros cuya trayectoria avala su solvencia ante el desafío que siempre supone el encaste propio de la familia Cuadri.

El calendario de primavera mantendrá sus dos fechas de mayor calado litúrgico con una configuración de máximo interés. **El Domingo de Ramos, 29 de marzo**, la maestría de **Curro Díaz encabezará la terna frente a los toros de Martín Lorca**, en un cartel que completan la madurez de **Rafael Serna y el ímpetu del mexicano Diego San Román**, quien afronta una temporada de vital importancia para su consolidación en el escalafón europeo. Por su parte, la Pascua de Resurrección, el 5 de abril, recuperará la esencia lusa con los **toros de Palha. La veteranía de Antonio Ferrera servirá de eje en un festejo que contará con la entrega de Juan de Castilla e Isaac Fonseca**, configurando una terna de gran calado internacional.

El mes de abril no rebajará la exigencia ganadera y completará el abono con una clara apuesta por la diversidad. El domingo 26 se ha reservado para una corrida de Dolores Aguirre, hierro de culto para el sector más exigente de la afición madrileña por su transmisión y casta. Previamente, el fomento de la cantera tendrá su espacio con dos novilladas de abono en las que se lidiarán los hierros de Antonio Palla y Sánchez Herrero, brindando la oportunidad a los nuevos valores de medirse en la primera plaza del mundo antes del inicio del ciclo isidril.`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 147,
    title: `La Comunidad de Madrid reconoce la trayectoria profesional del periodista taurino Miguel Ángel Moncholi`,
    image: "/images/moncholi1.jpg",
    category: "Actualidad",
    date: "2 de Enero de 2026",
	footerImage1: "moncholi2",
    fullContent: `La Comunidad de Madrid ha reconocido hoy la trayectoria profesional del periodista taurino Miguel Ángel Moncholi en un acto celebrado en la Plaza de Toros de Las Ventas. El consejero de Medio Ambiente, Agricultura e Interior, Carlos Novillo, ha presidido el coloquio homenaje en el que se ha realizado un recorrido por su extensa carrera y se ha descubierto una placa conmemorativa, ubicada en el tendido bajo del coso madrileño.

Al encuentro han asistido también destacadas personalidades del sector, como el ganadero Victorino Martín y el periodista Roberto Gómez. Durante su intervención, el consejero ha subrayado la contribución de Moncholi a la difusión de la tauromaquia, destacando que “durante más de 50 años, toda una vida, se ha dedicado a acercar el mundo del toro a la sociedad a través de los medios de comunicación”, entre otros, Cadena Ser y ABC, Televisión Española y Telemadrid.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 148,
    title: `Un festival de lujo unirá toreo y cante del más alto nivel en Atarfe`,
    image: "/images/noticia.jpg",
    category: "Actualidad",
    date: "31 de Diciembre de 2025",
	excerpt: "Novedosa forma de arrancar la temporada en el Coliseo de esta localidad granadina",
    fullContent: `El Ayuntamiento de Atarfe (Granada) y el empresario **Pedro Pérez 'Chicote'** han cerrado el cartel del festejo que abre la temporada en la provincia de Granada el próximo 28 de febrero, una cita que se ha convertido en clásica en el arranque del año taurino en Andalucía.

En esta ocasión, y como gran novedad, se trata de un festival taurino que reza en el cartel como "Extraordinaria y magna Fiesta Andaluza", ya que conjugará toreo y cante del más alto nivel en un acontecimiento único.

Con motivo del día de Andalucía, Atarfe acogerá el sábado 28 de febrero este festival benéfico en el que actuarán los matadores de toros **Fimito de Córdoba**, **Diego Urdiales**, **El Cid**, **El Fandi**, **Esaú Fernández** y el novillero **Jaime de Pedro**, que hará su presentación ante el público de su tierra. El ganado será de **Virgen María** y el festejo dará comienzo a las 5 de la tarde. Los toreros estarán acompañados por un importante elenco de artistas flamencos que se anunciará próximamente.

Este festival se organiza en colaboración con la hermandad Oración en el Huerto Realejo de Granada, que participará de los beneficios.

**Declaraciones**

El empresario **Pedro Pérez 'Chicote'** valora este festival como "una forma novedosa de abrir la temporada, es el primer festival de este nivel que se programa en la plaza de Atarfe", a lo que añade: "Se trata un cartel de lujo que mezcla figuras del toreo y del flamenco en una fórmula muy atractiva. Cante y toreo se unirán en una tarde irrepetible".

La alcaldesa de Atarfe, **Yolanda Fernández**, explica que "desde el Ayuntamiento de Atarfe seguimos apostando por que haya toros el Día de Andalucía en nuestro Coliseo y estamos contentos de que en esta ocasión sea un festival que reúna a figuras del toreo y del flamenco. La Tauromaquia es cultura y en un pueblo con tradición taurina no podemos obviar nuestras raíces". Y expresa un deseo: "Ahora solo falta que se anime la gente y se llene la plaza".

**Precios económicos**

Como es habitual, Chicote ofrece precios económicos para que todo el mundo pueda tener acceso a este festejo, de modo que el tendido general costará 35 euros, con entradas a 15 y 25 euros para jóvenes.

Se han habilitado puntos de venta en el Centro Cultural de Atarfe, Teatro Isabel la Católica, Cofradía Oración en el Huerto y a través de la web: <a
  href="www.redentradas.com"
  target="_blank"
  rel="noopener noreferrer"
  style="color:#2563eb; text-decoration:underline; font-weight:500;"
>
www.redentradas.com
</a> .

Las taquillas del Coliseo de Atarfe se abrirán en horario de tarde (de 17 a 20 horas) a partir del 25 de febrero. Teléfono de reservas 618 606 680.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 149,
    title: `La Real Unión de Criadores de Toros de Lidia cierra un año cargado de historia`,
    image: "/images/canalo.jpg",
    category: "Actualidad",
    date: "31 de Diciembre de 2025",
	fullContent: `<p> El año 2025 quedará grabado para siempre en la historia de la **Real Unión de Criadores de Toros de Lidia (RUCLT)**. Se han cumplido 120 años desde su fundación, el 15 de abril de 1905, una fecha que marca el inicio de un compromiso colectivo con el toro bravo, el campo español y una forma de vida ligada a la tierra, al esfuerzo y a la tradición.

Durante doce meses, la RUCLT ha celebrado este aniversario con un intenso programa de actos que ha servido para rendir homenaje a los ganaderos que, generación tras generación, han cuidado y engrandecido uno de los patrimonios culturales y medioambientales más singulares de nuestro país. Un aniversario vivido con orgullo, pero también con gratitud hacia el legado recibido y responsabilidad hacia el futuro.

Uno de los momentos más simbólicos de esta conmemoración fue la **corrida del 120 Aniversario**, celebrada en la plaza de toros de Las Ventas de Madrid, epicentro de la tauromaquia. Aquella tarde, el toro bravo ocupó el lugar que le corresponde como eje de una tradición viva, en un acto de memoria compartida y reconocimiento a la labor constante de la RUCLT a lo largo de más de un siglo.

La emoción alcanzó uno de sus puntos culminantes con la **gala institucional del 120 aniversario**, presidida por **S.A.R. la Infanta Doña Elena**, que reunió a representantes del mundo ganadero, cultural, social y taurino. En este acto se rindió un homenaje especial a los **hierros fundadores de la Real Unión**, auténticos cimientos de la institución, reconociendo su legado y su contribución decisiva a la historia del toro de lidia en España.

Otro de los grandes hitos del año fue la presentación en Sevilla de **El libro Verde del Toro Bravo**, una obra impulsada por la RUCLT que aborda, desde una perspectiva rigurosa y multidisciplinar, la importancia del toro bravo para la biodiversidad, la economía rural, la conservación de la dehesa y la identidad cultural española. Su presentación se convirtió en un espacio de reflexión y diálogo con la sociedad.

La conmemoración tuvo también un destacado reflejo en el ámbito cultural y del campo. **Juan Pedro Domecq** (ganadero y vicepresidente de la RUCL) firmó la Tercera de ABC el mismo día del 120 aniversario, el 15 de abril de 2025, con un texto de hondo calado en defensa del campo bravo como depositario de memoria y futuro. Asimismo, la Real Unión de Criadores de Toros de Lidia colaboró en el **42º Concurso Nacional de Faenas y Doma de Campo de Ciudad Rodrigo (Salamanca)**, que se saldó con un éxito rotundo, reforzando el vínculo entre el toro, el caballo y los oficios tradicionales del mundo rural.

La RUCLT tuvo además una presencia destacada en la **Feria Ecuestre de Badajoz**, uno de los encuentros de referencia del campo y el caballo, donde el toro bravo y la labor ganadera ocuparon un lugar central, subrayando la unión entre tradición, naturaleza y futuro.

A lo largo de este año conmemorativo, la Real Unión de Criadores de Toros de Lidia ha recibido numerosos reconocimientos en distintos puntos de la geografía española, reflejo del respeto y la consideración ganados a lo largo de sus **120 años de historia**.

Como broche final, se adjunta un **vídeo resumen** que recoge los momentos más significativos de este aniversario, una mirada audiovisual que condensa la emoción y el espíritu de una celebración histórica.

Con el cierre de este 120 aniversario, la **Real Unión de Criadores de Toros de Lidia** reafirma su compromiso con la defensa del toro bravo, la excelencia ganadera y la conservación del medio natural, proyectando hacia el futuro un legado que, más de un siglo después, sigue vivo y lleno de sentido.
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; margin: 1.5rem 0;">
  <iframe
    src="https://www.youtube.com/embed/GLyKxaOlHAo"
    title="Video de YouTube"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
  ></iframe>
</div>
</p>`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 150,
    title: `Illescas: con carteles para su feria del Milagro`,
    image: "/images/illescas2.jpg",
	footerImage1: "/images/illescas3.jpg",
    category: "Actualidad",
    date: "31 de Diciembre de 2025",
    fullContent: `La plaza de toros de Illescas volverá a ser, un año más, epicentro del inicio de la temporada taurina 2026 con una **Feria del Milagro** llena de máximos alicientes. La corrida de toros (14 de marzo) y la de rejones (8 de marzo), que han sido oficializadas por la empresa MaxiToro este martes, se vuelven a erigir como **dos auténticos acontecimientos del arranque de campaña en el mundo del toro**.

Además, y fiel a la tradición que Maximino Pérez ha venido llevando a cabo en las últimas temporadas, **oficializa los carteles durante la Navidad para que los aficionados puedan hacer el regalo de Reyes perfecto a sus familiares y amigos** de cara a estas fechas tan entrañables.

**Un cartel de presente y futuro en la Corrida del Milagro el 14 de marzo**

En la corrida de toros, que se celebrará el 14 de marzo, tendrá lugar la presentación de una de las grandes revelaciones del 2025, **Víctor Hernández**, que tuvo dos importantes actuaciones en Las Ventas durante la temporada pasada, además de destacar en otros cosos de primera categoría.

Abrirá plaza una figura de gran relevancia, **José María Manzanares**, que repite en este escenario después de las grandes faenas realizadas en las últimas Ferias del Milagro. Y, tras él, otro de los nombres clave del escalafón, el sevillano **Juan Ortega**. Se lidiará un encierro con los hierros de **Domingo Hernández y Román Sorando**.

**El cartel de rejones: una oda al toreo a caballo el día 8 de marzo**

Pero si el cartel a pie es de impacto y futuro, el festejo a caballo del 8 de marzo también está lleno de gran atracción por la presencia de la máxima figura del momento, **Diego Ventura**, que tiene a Illescas como una de sus plazas "fetiche".

En ese cartel, estará otro de los grandes nombres del toreo a caballo de los últimos años, el alicantino **Andy Cartagena**, y junto a él, el luso **Rui Fernandes**. Se lidiará una corrida de **El Capea** después de su gran resultado en los últimos años en este coso.

**La venta de entradas, disponible desde este martes**

La venta de entradas de forma anticipada **será de forma online en la pagina web <a
  href="www.maxitoro.com"
  target="_blank"
  rel="noopener noreferrer"
  style="color:#2563eb; text-decoration:underline; font-weight:500;"
>
www.maxitoro.com
</a> a partir de este día 30 de diciembre de 2025, mientras que la venta en taquilla será a partir del día 19 de enero de 2026 ubicada en la Avda. Castilla La Mancha nº 89 de Illescas (junto al restaurante El Bohío) en horario de 10:30 h. a 14:00 h. y de 17:00 h. a 20:00 h. de lunes a domingo. Los domingos tarde permanecerá cerrada.

El día de los festejos, la venta de entradas se realizará en la misma taquilla ubicada en la Avda. Castilla La Mancha nº 89, en horario de 10:30 h. a 14:00 h. y en las Taquillas de la Plaza de toros desde las 10:30 h. ininterrumpidamente hasta la hora del festejo.

Las entradas también se pueden adquirir a través del **Bono Cultural Joven** al que está adherida la empresa.

**Venta por teléfono e información**

La venta telefónica puede realizarse a través del número 672 00 33 22 (5% recargo - Envío **GRATUITO** a domicilio a partir de 100 euros).`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 151,
    title: `La Plaza de Toros de Valladolid acoge la exposición "Revoleras de Colores" de Mer Fidalgo con cerca de mil visitantes`,
    image: "/images/valladolid1.jpg",
    category: "Actualidad",
    date: "29 de Diciembre de 2025",
    fullContent: `La Plaza de Toros de Valladolid ha sido el escenario los días **27 y 28 de diciembre**, de la exposición **"Revoleras de Colores"**, una muestra de la artista **Mer Fidalgo** que ha congregado a **cerca de mil aficionados y visitantes** durante su celebración.

La exposición, que combina arte y tauromaquia desde una mirada contemporánea y colorista, ha despertado un notable interés entre el público. **Destacando las imágenes** dedicadas a diestros como **Emilio de Justo**, **Ginés Marín**, **Manuel Escribano** o **José María Manzanares**. Las obras de **Mer Fidalgo** han llenado de vida y expresión uno de los espacios más emblemáticos de la ciudad de Valladolid.

**"Revoleras de Colores"** se ha desarrollado en el marco del **Ateneo Cultural "Valladolid Ciudad Taurina"**, una iniciativa de **Tauroemoción** impulsada por el **Ayuntamiento de Valladolid** a través de la **Concejalía de Educación y Cultura**, con el objetivo de fomentar la difusión cultural y poner en valor la tauromaquia desde una perspectiva artística y taurina.

La autora, **Mer Fidalgo**, ha querido mostrar su agradecimiento a las entidades que han hecho posible la exposición: **"Es muy gratificante compartir mi trabajo con el público vallisoletano y sentir tan de cerca su acogida. Gracias a la iniciativa del Ayuntamiento de Valladolid es una referencia taurina nacional."**

La excelente acogida por parte del público confirma el interés por propuestas culturales que unen arte, identidad y patrimonio, reforzando el compromiso del **Ayuntamiento de Valladolid** con una programación diversa y de calidad.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 252,
    title: `El Ayuntamiento de Burgos prorroga el contrato a Tauroemoción para la organización de la feria taurina 2026`,
    image: "/images/burgos.jpg",
    category: "Actualidad",
    date: "29 de Diciembre de 2025",
	excerpt: "La empresa que encabeza Alberto García lleva las riendas del Coliseum de Burgos desde el año 2018",
    fullContent: `El Ayuntamiento de Burgos ha aprobado la prórroga del contrato con la empresa taurina Tauroemoción, que será la encargada de organizar los festejos taurinos en torno a la feria de San Pedro y San Pablo en el año 2026.

Tauroemoción gestiona el Coliseum de Burgos desde el año 2018, periodo en el que los espectáculos taurinos han cosechado un gran éxito de público aumentando el número de abonados año tras año, consolidando a la capital burgalesa como una de las plazas más destacadas del norte de España.

Además de Burgos, Tauroemoción gestionó en la temporada pasada 15 plazas de toros en el conjunto del panorama nacional, donde destacan los cosos de segunda categoría como Valladolid, Zamora, Ávila, Soria, Huesca y Jaén, lo que avala su amplia experiencia y solvencia en la organización de festejos taurinos de primer nivel.

Con esta prórroga, el Ayuntamiento de Burgos reafirma su confianza en un modelo de gestión que ha demostrado eficacia y aceptación entre los aficionados, garantizando la continuidad de los festejos taurinos en 2026 con los estándares de calidad alcanzados en los últimos años. Además vuelve a poner en valor la capacidad de la mercantil para diseñar carteles atractivos y desarrollar una gestión profesional, contribuyendo al impulso cultural, social y económico de la ciudad.

Tauroemoción ya se encuentra trabajando en la temporada 2026 la cual tendrá el pistoletazo de salida en una gran gala de presentación de carteles que tendrá lugar en los primeros meses del año.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 253,
    title: `Morante de la Puebla y Victorino Martín, Oreja y Hierro de Oro`,
    image: "/images/clarin.jpg",
    category: "Actualidad",
    date: "29 de Diciembre de 2025",
    fullContent: `En declaraciones exclusivas a Clarín, Morante de la Puebla afirma que está luchando para volver a torear y ganar más Orejas de Oro en el futuro.

 

Morante de la Puebla gana su tercera Oreja de Oro de RNE y Victorino Martín su cuarto Hierro de Oro en la final que ha culminado este domingo en directo con los votos de los 9 corresponsales y colaboradores de Clarín que faltaban por pronunciarse tras el programa del sábado. Morante recibe de forma unánime todos los votos emitidos en esta final, sumando un total de 23 puntos, frente a los 6 del segundo clasificado, David de Miranda, y los 4 del tercero, Borja Jiménez.

 

En el Hierro de Oro, Victorino Martín se impone con 19 puntos frente a los 8 sumados por Santiago Domecq y los 5 de Victoriano del Río. En declaraciones exclusivas a Clarín, Morante afirma que está luchando para recuperarse y no descarta volver a torear e, incluso, ganar más Orejas de Oro en el futuro.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 254,
    title: `ASPROT: Los derechos de imagen a todas las asociaciones profesionales del sector taurino por igual`,
    image: "/images/TV.jpg",
    category: "Actualidad",
    date: "29 de Diciembre de 2025",
	excerpt: "Nuevo reconocimiento judicial de la obligación de pago de los derechos de imagen a todas las asociaciones profesionales del sector taurino por igual, y el logro judicial más importante de ASPROT al haber corroborado un tribunal superior de justicia, las numerosas sentencias de los juzgados de lo social que le han dado la razón a ASPROT",
    fullContent: `El Tribunal Superior de Justicia de Castilla y León con Sede en Valladolid, ha estimado un Recurso de suplicación de ASPROT, y anula la **Única Sentencia** que era contradictoria, es decir todas las demás han dado la razón a ASPROT, y esta **Única, ha sido anulada por el más alto Tribunal de la Jurisdicción Social de la Comunidad Autónoma**.

El alto Tribunal crea Doctrina, al haber reconocido y declarado que los Derechos de imagen en festejos taurinos televisados, son **Salarios**, por lo que muy al contrario de lo que han venido sosteniendo UNPBE, ASNAMAE, UT y ANOET, **a todos los profesionales afiliados a cualquier Entidad profesional, deben serle abonados por igual**, y no solo a UNPBE y ASNAMAE, como **ilegalmente sostienen las partes firmantes del Convenio estatutario, motivo por el que ASPROT no quiso firmar el Convenio**, debido a esta y otras ilegalidades, encontrándose adherida al Convenio Nacional Taurino extraestatutario para defender los Derechos Laborales de todos los profesionales por igual.

La citada Sentencia declara, que la Disposición final séptima del mencionado Convenio debe ser interpretada, que los Derechos de imagen no pueden estar condicionados, a que los Empresarios así lo decidan con total discrecionalidad, ni abonando los mismos, a unas entidades y a otras no, ya que los Empresarios no son destinatarios, ni beneficiarios de los Derechos de imagen de los profesionales con los que comercializan con las Entidades de Televisión, ya que son simples intermediarios y los mismos tienen la obligación de abonar los referidos derechos de imagen a todos por igual y **de forma cuantificada, al ser indiscutible que los Derechos de imagen son Salarios**.

Desde ASPROT se comunica, a todos los profesionales del sector taurino que a partir de los próximos meses vamos a luchar ante la Administración y los Tribunales, para que todos los profesionales perciban sus legítimos Derechos Salariales de imagen, igual que los Honorarios correspondientes, es decir, que igual que cobran los salarios mínimos establecidos en los Convenios Colectivos Nacionales Taurinos, es decir sus sueldos, tienen Derecho a percibir los Derechos de imagen y que los Empresarios coticen además a la Seguridad Social por los mencionados Derechos.

La mencionada Sentencia del alto Tribunal, fija Doctrina y ello unido a las numerosas Sentencias de los Juzgados de lo Social que han dado la razón a ASPROT, es inapelable, y condena a Circuitos Taurinos S.L., representada por D. Carlos Zúñiga (hijo), que se negó a pagar los derechos de imagen de nuestros afiliados, ha sido condenado a pagar los mismos, más los intereses correspondientes.

Para finalizar se informa, que va a ser comunicado a las diferentes Inspecciones de Trabajo, cualquier incumplimiento de abono de derechos de imagen y su obligatoria Cotización, y **se informa, a todos los Matadores, Novilleros y Rejoneadores, que tienen el mismo derecho que los banderilleros, picadores y mozos de espadas al abono de los derechos de imagen**, y la correspondiente Cotización a la Seguridad Social por ser **Derechos Salariales, por lo que hasta ahora ha sido marginado por las partes firmantes del Convenio Estatutario**, es decir, las mencionadas Asociaciones anteriormente, ya que, durante décadas se ha omitido sobretodo, luchar por los Derechos de imagen de los toreros más humildes.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 255,
    title: `Óscar Campos se impone en el IV Certamen de Invierno de Escuelas Taurinas de la Comunidad de Madrid`,
    image: "/images/novillero1.jpg",
    category: "Crónicas",
    date: "28 de Diciembre de 2025",
    imageCaption: "Plaza de Toros Venta del Batán",
	plaza: "Plaza de Toros Venta del Batán.",
	ganaderia: "Toros de la Plata y Zacarías Moreno",
	torerosRaw: `Andreo Sánchez (E.T. Navas del Rey), vuelta al ruedo 

Pablo Jurado (E.T. Fundación El Juli), vuelta al ruedo 

José Huelves (E.T. Colmenar Viejo), dos orejas 

Brahian Osorio ‘Carrita’ (E.T. Galapagar), vuelta al ruedo 

Óscar Campos (E.T. Yiyo), dos orejas 

Kevin Montiel (E.T. CITAR-Anchuelo), silencio`,
  fullContent: `El novillero Óscar Campos ha ganado el IV Certamen de Invierno de Escuelas Taurinas de la Comunidad de Madrid, que como cada Navidad ha tenido lugar este mediodía en la plaza de tientas de la Venta del Batán. El alumno de la Escuela José Cubero Yiyo ha cortado dos orejas simbólicas, igual que José Huelves, de Colmenar Viejo, que también ha dejado momentos muy destacados. 

Campos, que cuajó a su novillo de Toros de la Plata el mejor saludo capotero de la mañana, brilló sobre todo por el modo de componer y de expresarse, así como en los remates, sobre todo en los cambios de mano. Huelves por su parte evidenció quietud, mano baja y buen juego cintura frente a un buen ejemplar de Zacarías Moreno al que extrajo naturales de mucho peso y plomada. 

Más voluntariosos anduvieron el resto de actuantes, que dieron una vuelta al ruedo al concluir su actuación. El festejo sirvió además para rendir homenaje a Tomás Serrano Guío por su labor como Presidente del Patronato de Escuela de Tauromaquia de Madrid.

Con excelente ambiente en una mañana soleada y fría se han lidiado ejemplares de Toros de la Plata y dos (2º y 3º) de Zacarías Moreno, de buen juego en términos generales. El resultado de los novilleros ha sido el siguiente: 

Andreo Sánchez (E.T. Navas del Rey), vuelta al ruedo 

Pablo Jurado (E.T. Fundación El Juli), vuelta al ruedo 

José Huelves (E.T. Colmenar Viejo), dos orejas 

Brahian Osorio ‘Carrita’ (E.T. Galapagar), vuelta al ruedo 

Óscar Campos (E.T. Yiyo), dos orejas 

Kevin Montiel (E.T. CITAR-Anchuelo), silencio`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 256,
    title: `José Carlos Venegas: “Volver a San Isidro en 2026 es el mejor regalo de Navidad”`,
    image: "/images/venegas3.jpg",
    category: "Actualidad",
    date: "27 de Diciembre de 2025",
    fullContent: `A falta de la presentación oficial por parte de Plaza 1, con Rafael García Garrido y Simón Casas al frente de la gestión, la Feria de San Isidro 2026 puede darse prácticamente por cerrada. Un hecho histórico, al quedar rematada antes que nunca y en plenas fechas navideñas, anticipando una edición que volverá a situar a Madrid en el epicentro del mundo taurino.

La feria más importante del planeta, cuya presentación oficial —salvo cambios— está prevista para el próximo 5 de febrero de 2026, incluirá entre sus combinaciones el regreso del torero jienense José Carlos Venegas, un nombre propio del toreo contemporáneo por su capacidad para imponerse a todo tipo de encastes y por una tauromaquia marcada por la pureza, el compromiso y la personalidad.

Este esperado retorno a San Isidro no es fruto de la casualidad, sino del trabajo constante, serio y eficaz desarrollado en los despachos por su apoderada, Lidia Rodríguez Bermejo, cuya profesionalidad contrastada ha vuelto a quedar patente. Con discreción, conocimiento del sistema y una firme defensa de los méritos de su torero, ha sabido “lidiar” con solvencia las complejidades de la gestión para que Venegas vuelva a ocupar el lugar que le corresponde, demostrando una vez más que la tauromaquia también se construye fuera del ruedo.

José Carlos Venegas no actúa en San Isidro desde 2018, cuando se enfrentó a una corrida de Dolores Aguirre, una de las ganaderías más exigentes del campo bravo. Posteriormente, el diestro volvió a trenzar el paseíllo en Las Ventas en septiembre de 2022, midiéndose a reses de Pahla y Saltillo, firmando aquella tarde una actuación de alto nivel que culminó con una reconocida vuelta al ruedo tras petición, después de una gran faena a un toro de Pahla que dejó una profunda impresión en los tendidos y que reforzó su crédito ante la afición madrileña.

Según han avanzado los principales medios especializados en tauromaquia, el miércoles 20 de mayo será la fecha señalada para el esperado regreso de José Carlos Venegas al ciclo isidril. Una comparecencia que llegará en el corazón de la feria y en un cartel de máxima responsabilidad, acorde con la trayectoria de un torero que ha cimentado su carrera en el rigor, la autenticidad y el respeto a los encastes.

El acontecimiento tendrá lugar ante toros de la ganadería de Saltillo, en un cartel que completan Juan Leal y Juan de Castilla, dos espadas igualmente caracterizados por su valor y entrega, configurando una terna de alto voltaje y marcada exigencia para la afición de Madrid.

Con tanto fundamento informativo el propio José Carlos Venegas ha expresado sus sensaciones ante este regreso tan esperado:  
“Me produce una ilusión enorme y, a la vez, una gran responsabilidad, con el máximo deseo de darlo todo y con el único recelo de que la suerte nos acompañe a modo de embestidas. Los toreros soñamos con escenarios así y es como el mejor regalo de Navidad que pueda tener. Quiero disfrutar esa tarde con el deseo de darle la vuelta a la moneda con un triunfo y poder entrar así en otras importantes ferias del circuito”.

De este modo, San Isidro 2026 se presenta como un punto de inflexión en la trayectoria del torero jienense, que vuelve a Madrid dispuesto a reivindicarse en el escenario más exigente del toreo, respaldado por su experiencia, su calidad contrastada y el sólido trabajo de una apoderada que ha sabido estar a la altura del desafío, dentro y fuera de la plaza.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 257,
    title: `David de Miranda debutará en el Carnaval de Jalostotitlán 2026, una de las grandes ferias taurinas de México`,
    image: "/images/cartelferia1.jpg",
	footerImage1: "/images/cartelferia.jpg",
    category: "Actualidad",
    date: "27 de Diciembre de 2025",
    fullContent: `La empresa **AjaToro**, dirigida por **Adrián Padilla**, ha hecho oficiales los carteles del serial taurino del **Carnaval de Jalostotitlán 2026**, uno de los ciclos más arraigados y de mayor prestigio del panorama taurino mexicano. El acto de presentación tuvo lugar en la **Casa de Cultura de Jalostotitlán (Jalisco)** y contó con la presencia de honor de la **Presidenta Municipal, Judith García Ramírez**, respaldando institucionalmente un acontecimiento de gran relevancia cultural y social para la localidad.

El serial se celebrará los días **15, 16 y 17 de febrero de 2026** en la emblemática plaza de toros **Fermín Espinosa “Armillita”**, escenario histórico que volverá a convertirse en epicentro del toreo durante el tradicional Carnaval de Jalostotitlán. Una feria que, fiel a su esencia, conjuga figuras consolidadas, jóvenes valores y atractivos debuts, tanto de toreros mexicanos como europeos.

Entre los grandes alicientes del abono destaca de manera especial el **debut en tierras mexicanas del torero onubense David de Miranda**, reconocido como **Torero Revelación de la Temporada Española**. Su inclusión en este importante ciclo supone un paso decisivo en su proyección internacional y un reconocimiento a una campaña marcada por la regularidad, el triunfo y la madurez artística demostrada en los principales cosos españoles.

Junto a él, el serial contará también con la presentación del joven matador español **Marcos Pérez**, así como con la presencia del rejoneador **Guillermo Hermoso de Mendoza**, uno de los nombres propios del toreo a caballo a nivel mundial. Por parte mexicana, la feria reunirá a una nómina de primer nivel, en la que sobresale la actuación conjunta, por primera vez, de los hermanos **Fauro y Bruno Aloi**.

Además de figuras consolidadas como **Juan Pablo Sánchez**, **Arturo Saldívar**, **Ernesto Javier “Calita”** y **Diego San Román**.

Los carteles del **Carnaval de Jalostotitlán 2026** han quedado configurados de la siguiente manera:

**Domingo 15 de febrero**: Toros de José Garfias para **Juan Pablo Sánchez**, **Arturo Saldívar** y el español **David de Miranda**, en una terna que combina experiencia, solvencia y la expectación del esperado debut del diestro onubense.

**Lunes 16 de febrero**: Toros de Begoña para el rejoneador **Fauro Aloi**, acompañado por los Forcados Amadores de México, junto a los diestros **Marcos Pérez (España)** y **Bruno Aloi**.

**Martes 17 de febrero**: Toros de San Mateo para el rejoneador español **Guillermo Hermoso de Mendoza**, **“Calita”** y **Diego San Román**, cerrando el ciclo con un cartel de gran fuerza y atractivo.

Con esta combinación de figuras, revelaciones y acontecimientos inéditos, el **Carnaval de Jalostotitlán 2026** se perfila como una de las citas imprescindibles del calendario taurino internacional, subrayando especialmente la expectación que genera el debut de **David de Miranda**, llamado a escribir un nuevo capítulo de su carrera ante la afición mexicana en una plaza de referencia.
`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 258,
    title: `CABRA: Un cartel de figuras para una fecha señalada`,
    image: "/images/cabra.jpg",
    category: "Actualidad",
    date: "27 de Diciembre de 2025",
    fullContent: `**CABRA: Un cartel de figuras para una fecha señalada** en la localidad cordobesa de **Cabra** tendrá lugar el próximo **4 de abril**, **Sábado de Gloria**, el festejo ha sido concebido como un **homenaje a la Semana Santa egabrense**, declarada de Interés Turístico Nacional.

El empresario taurino mexicano **José Luis Alatorre** ha dado un paso decisivo en su consolidación en España con la organización de una corrida de toros de máxima expectación.

El cartel está encabezado por el diestro francés **Sebastián Castella**, junto a él, actuará el extremeño **Miguel Ángel Perera**. La terna la completa **Borja Jiménez**, lidiarán una corrida con el hierro de **El Capea**.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 259,
    title: `José María Soler, novedad en la cuadrilla de Paco Ureña para 2026`,
    image: "/images/soler.jpg",
    category: "Actualidad",
    date: "27 de Diciembre de 2025",
    fullContent: `José María Soler será la principal novedad en la cuadrilla de **Paco Ureña de cara a la temporada 2026**. El subalterno se incorpora al equipo del diestro murciano para cubrir la vacante dejada por el sevillano Agustín de Espartinas, quien formó parte de la cuadrilla en las últimas temporadas.

La llegada de Soler será el único cambio en el equipo de Paco Ureña, que mantiene así la línea de continuidad en su cuadrilla. De este modo, el torero murciano seguirá contando entre los hombres de a pie con Curro Vivas y Azuquita, pilares habituales de su equipo en los últimos años.

Con esta incorporación, Paco Ureña refuerza su cuadrilla de cara a un nuevo curso, apostando por la experiencia y la solidez de un equipo que ha demostrado regularidad y compromiso en las principales plazas del circuito taurino.`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 260,
    title: `Borja Jiménez presentará en la finca de Sánchez Mejías su corrida en solitario en Las Ventas`,
    image: "/images/borja.jpg",
    category: "Actualidad",
    date: "27 de Diciembre de 2025",
    fullContent: `Borja Jiménez presentará oficialmente su corrida en solitario en Madrid el próximo 12 de febrero, a las 20:15 horas, en la histórica finca de **Ignacio Sánchez Mejías**, situada en Pino Montano. El festejo se celebrará el 7 de junio en la Plaza de Toros de Las Ventas, dentro de la corrida “**In Memoriam**”, con motivo del 92 aniversario del fallecimiento del torero sevillano.

**Borja Jiménez** afrontará esta gesta en solitario frente a seis toros de las ganaderías **Victoriano del Río**, **Toros de Cortés** y **Domingo Hernández**, en un homenaje que trasciende lo taurino para reconocer también el legado cultural y literario de **Sánchez Mejías**.

La finca elegida para la presentación fue propiedad de **Rafael El Gallo**, posteriormente de **José**, y finalmente de **Ignacio Sánchez Mejías**, convirtiéndose durante décadas en un destacado foco de vida social y cultural. En ella se celebraron tertulias y encuentros que reunieron a figuras clave de la Generación del 27, como **Federico García Lorca**, **Rafael Alberti** o **Jorge Guillén**.

El acto contará con la presencia de los ganaderos, así como del director general de **Plaza 1**, **Rafael García Garrido**, quien ha agradecido la colaboración de la familia **Sánchez Mejías** y del propio **Borja Jiménez** para la celebración de este homenaje.

La corrida “**In Memoriam**” refuerza la figura de **Ignacio Sánchez Mejías**, torero, escritor, dramaturgo y mecenas cultural, cuya muerte en 1934 inspiró a Lorca el célebre “Llanto por Ignacio Sánchez Mejías”. Un personaje que simbolizó como pocos la unión entre el toro y la cultura, y al que Madrid y Las Ventas rinden ahora un merecido tributo.`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 261,
    title: `Tres empresas concurren al concurso para la gestión de la plaza de toros de La Malagueta`,
    image: "/images/empresas.jpg",
    category: "Actualidad",
    date: "27 de Diciembre de 2025",
    fullContent: `Hasta el momento, tres empresas han presentado su candidatura para la gestión de la plaza de toros de La Malagueta, tras el nuevo concurso de adjudicación convocado por la Diputación de Málaga. No obstante, el número de ofertas podría incrementarse hasta las 00:00 horas de esta noche, momento en el que finaliza el plazo oficial para la presentación de propuestas.

Las empresas que, según ha informado el medio especializado **Málaga Taurina**, habrían completado correctamente todos los trámites exigidos en el pliego son **Tauroemoción**, encabezada por **Alberto García**; **Lances de Futuro**, dirigida por **José María Garzón**; y **Toreo, Arte y Cultura BM**, una sociedad formada por la unión del **Grupo Bailleres**, **Casa Chopera** y **FIT**.

Este nuevo proceso de licitación deriva de la impugnación del anterior contrato por parte de la empresa Nautalia, que detectó una cláusula considerada abusiva en el apartado relativo a la solvencia técnica y profesional del pliego. Tras dicha impugnación, la Diputación de Málaga procedió a rectificar el error, subsanando las condiciones cuestionadas y publicando un nuevo pliego, cuyo plazo de presentación de ofertas concluye en el día de hoy.`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 262,
    title: `Apertura del plazo de renovación de abonos para la temporada taurina en Las Ventas`,
    image: "/images/apertura.jpg",
    category: "Actualidad",
    date: "27 de Diciembre de 2025",
    fullContent: `El próximo **12 de enero** se abrirá el plazo de renovación de los abonos de temporada completa para todos los festejos taurinos que se celebrarán en la **Plaza de Toros de Las Ventas**, incluyendo los correspondientes a la **Feria de San Isidro** y la **Feria de Otoño**.

**Plaza 1** mantiene un año más su compromiso con los colectivos sociales, conservando el carácter gratuito de dos cupos de abonos:

• **2.100 abonos** para jubilados, ubicados en localidades de andanada de sombra y sol y sombra.

• **700 abonos** para jóvenes hasta 25 años, en localidades de filas 1 a 7 de las andanadas de los tendidos 5 y 6.

Ambos cupos se agotaron en la pasada temporada. Los abonados que deseen renovar sus tarjetas podrán hacerlo exclusivamente en las taquillas de la plaza, del **12 al 20 de enero**.

Una vez finalizado el periodo de renovación, los abonos gratuitos que queden disponibles se pondrán a la venta el **22 de enero**.
La adquisición de los abonos para jubilados se realizará en las taquillas de la plaza, mientras que los abonos jóvenes sobrantes se podrán obtener únicamente de forma online, a través de la página web 
<a
  href="www.las-ventas.com"
  target="_blank"
  rel="noopener noreferrer"
  style="color:#2563eb; text-decoration:underline; font-weight:500;"
>
 www.las-ventas.com
</a> .

Asimismo, se recuerda que los titulares del abono joven gratuito deberán asistir al menos al 50 % de los festejos programados durante la temporada 2026 para poder optar a su renovación en 2027.`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 263,
    title: `Las Ventas perfila un arranque de temporada 2026 de marcado acento torista y máxima exigencia`,
    image: "/images/exigencia.jpg",
    category: "Actualidad",
    date: "22 de Diciembre de 2025",
    fullContent: `Una vez encarrilado el grueso de las negociaciones de la **Feria de San Isidro**, **Plaza 1** trabaja ya en la configuración del inicio de la **temporada 2026** en la **Plaza de Toros de Las Ventas**, que se anuncia con un marcado acento torista y carteles de máxima exigencia para el aficionado madrileño.

La apertura oficial de la temporada tendrá lugar el **domingo 22 de marzo**, con una corrida de toros de **Hijos de Celestino Cuadri**, uno de los hierros más emblemáticos del campo bravo onubense y auténtica referencia para la afición torista. Para este compromiso inaugural, la empresa maneja una terna integrada por **Damián Castaño**, **Gómez del Pilar** y **Juan de Castilla**, tres matadores sobradamente curtidos en este tipo de encastes.

El **domingo 29 de marzo**, **Domingo de Ramos**, **Plaza 1** tiene previsto anunciar una corrida del hierro de **Martín Lorca**, habitual en los inicios de temporada venteños. El ganadero malagueño prepara un encierro serio para un cartel que la empresa perfila con **Curro Díaz**, **Rafael Serna** y el mexicano **Diego San Román**, en caso de no entrar finalmente en los carteles isidriles.

El **domingo 5 de abril**, **Domingo de Resurrección**, llegará el turno del hierro portugués de **Palha**, con un cartel de alto compromiso en el que figuran **Antonio Ferrera** e **Isaac Fonseca**. El tercer actuante será un torero que confirmará su alternativa ese mismo día en el coso de la calle de Alcalá.

Tras las novilladas picadas programadas para los días **12 y 19 de abril**, **Plaza 1** contempla para el **domingo 26 de abril** la lidia de la corrida de **Dolores Aguirre**, un encierro inicialmente previsto para San Isidro y cuyo lugar ha sido finalmente ocupado por el hierro de **Saltillo**.

Este primer bloque de la temporada madrileña 2026 quedará completado con la ya anunciada **Corrida Goyesca del 2 de mayo**, en la que están anunciados **Uceda Leal**, **El Cid** y **Javier Cortés**.

Así quedarían los carteles del inicio de la temporada 2026 en **Las Ventas**:

**Domingo 22 de marzo**  
Toros de **Hijos de Celestino Cuadri**  
**Damián Castaño – Gómez del Pilar – Juan de Castilla**

**Domingo 29 de marzo (Domingo de Ramos)**  
Toros de **Martín Lorca**  
**Curro Díaz – Rafael Serna – Diego San Román**

**Domingo 5 de abril (Domingo de Resurrección)**  
Toros de **Palha**  
**Antonio Ferrera – Isaac Fonseca – Matador por confirmar**

**Domingo 12 de abril**  
Novillada con picadores  
Cartel por definir

**Domingo 19 de abril**  
Novillada con picadores  
Cartel por definir

**Domingo 26 de abril**  
Toros de **Dolores Aguirre**  
Terna por definir

**Sábado 2 de mayo – Corrida Goyesca**  
Toros por anunciar  
**Uceda Leal – El Cid – Javier Cortés**`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 264,
    title: `San Agustín del Guadalix presenta la Feria del Aficionado 2026 con tres desafíos ganaderos de máxima exigencia`,
    image: "/images/san.jpg",
    category: "Actualidad",
    date: "22 de Diciembre de 2025",
    fullContent: `La plaza de toros de **San Agustín del Guadalix** volverá a situarse en el centro del interés de la afición torista con la celebración de la **Feria del Aficionado 2026**, cuyos carteles oficiales han sido presentados por el **Club Taurino 3 Puyazos**. El certamen mantiene intacta su filosofía original, apostando por el toro íntegro y por desafíos ganaderos de máxima exigencia, con hierros de marcada personalidad y toreros contrastados frente a encastes minoritarios.

El ciclo se desarrollará durante los días **25 y 26 de abril**, articulándose en torno a tres festejos de notable interés ganadero y torero.

La feria dará comienzo el sábado **25 de abril**, a las **12:00 horas**, con una novillada en desafío ganadero entre las divisas de **Salvador Guardiola** e **Isaías y Tulio Vázquez**. Para la ocasión están anunciados los novilleros **Joao D’Alva** y **Jesús de la Calzada**, dos nombres en clara proyección dentro del circuito de novilladas de máximo rigor.

Ese mismo sábado, a las **18:30 horas**, se celebrará la primera corrida de toros, también bajo el formato de desafío ganadero, con reses de **Prieto de la Cal** y **Reta de Casta Navarra**. En el cartel figuran **Sánchez Vara**, **Joselillo** y **Francisco Montero**, tres matadores estrechamente vinculados al toro encastado y a las corridas de mayor dificultad.

La **Feria del Aficionado 2026** se cerrará el **domingo 26 de abril**, a las **12:00 horas**, con un desafío ganadero de alto voltaje entre las prestigiosas ganaderías de **Dolores Aguirre** y **José Escolar**. Harán el paseíllo **Damián Castaño**, **Juan de Castilla** y **Maxime Solera**, toreros con acreditada solvencia en este tipo de compromisos.

En el apartado comercial, la organización ha confirmado las siguientes fechas:
• Renovación de abonos: a partir del 2 de febrero  
• Nuevos abonos: desde el 2 de marzo  
• Entradas sueltas: a la venta a partir del 22 de marzo  

Con esta programación, la **Feria del Aficionado** reafirma su condición de cita imprescindible para los defensores del toro íntegro y consolida a **San Agustín del Guadalix** como uno de los enclaves fundamentales del calendario torista europeo.`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 265,
    title: `FRANCIA: Interesante terna en Gamarde`,
    image: "/images/garmade.jpg",
    category: "Actualidad",
    date: "20 de Diciembre de 2025",
    fullContent: `A pocos días para que acabe en 2025, la temporada europea 2026 comienza a tomar forma y el país vecino tiene ya una de sus primeras fechas oficiales.

La cita será el próximo **12 de abril de 2026** en la localidad francesa de **Gamarde**, dará una corrida de toros con astados de la ganadería de **Virgen María**.

Para un cartel de los más interesante **David Galván** como triunfador de la pasada temporada en esta plaza, completan el matador de toros de El Puerto de Santa María **Daniel Crespo** y el torero revelación de 2025 **Víctor Hernández**, conformando una terna de gran atractivo para la afición francesa.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 266,
    title: `MADRID: Al completo, el calendario de la temporada 2026 en Las Ventas`,
    image: "/images/calendario.jpg",
    category: "Actualidad",
    date: "20 de Diciembre de 2025",
    fullContent: `La temporada 2026 en la Plaza de Toros de Las Ventas ya tiene definidas, al completo, las fechas de espectáculos. Una temporada en la que el coso venteño va a celebrar 60 festejos taurinos: 41 corridas de toros; 16 novilladas, una de ellas sin picadores, final del 'Camino hacia Las Ventas'; y 3 corridas de rejones.

El inicio de la temporada está fijado con corrida de toros para el 22 de marzo. La Feria de San Isidro se celebrará del viernes 8 de mayo al sábado 7 de junio, con los domingos 8 y 14 de junio marcados en rojo con la celebración de las corridas In Memoriam y Beneficencia. Una corrida de toros más, el domingo 21 de junio, servirá de antesala al Certamen de novilladas nocturnas 'Cénate Las Ventas'.

Cénate Las Ventas, que comenzará el jueves 25 de junio, se prolongará con cinco novilladas hasta el jueves 23 de julio. El resto del verano traerá hasta cuatro corridas de toros (los jueves 30 de julio, 6 y 27 de agosto, junto a la corrida de La Paloma el 15 de agosto) y una corrida de rejones programada para el 20 de agosto.

Durante el mes septiembre volverán los espectáculos a los domingos, con una novillada el primer domingo del mes y tres corridas de toros los domingos 13, 20 y 27 de septiembre. Finalmente, la Feria de Otoño se celebrará como es ya habitual en dos tramos, del 1 al 4 de octubre y del 9 al 11, con el lunes 12 de octubre reservado para la tradicional corrida de la Hispanidad que pondrá punto final a la temporada 2026. `,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 267,
    title: `Roca Rey cierra su cuadrilla para 2026`,
    image: "/images/rocarey1.jpg",
    category: "Actualidad",
    date: "20 de Diciembre de 2025",
    fullContent: `**Andrés Roca Rey** ya tiene definida la cuadrilla que le acompañará durante la temporada 2026. La principal novedad es la incorporación del banderillero **Agustín de Espartinas**.

Continuarán dos nombres de absoluta confianza para el torero: **Francisco Durán ‘Viruta’** y **Francisco Gómez ‘Paquito Algaba’**.

También continúan los picadores **José Manuel Quinta** y **Sergio Molina**.

La cuadrilla se completa con **Manuel Lara ‘Larita’** como mozo de espadas, y **Curro Puya** como ayuda.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 268,
    title: `La Venta del Batán acoge el IV Certamen de Invierno de Escuelas Taurinas en homenaje a Tomás Serrano Guío`,
    image: "/images/batan.jpg",
    category: "Actualidad",
    date: "20 de Diciembre de 2025",
    fullContent: `La **Plaza de Tientas de la Venta del Batán** será escenario el próximo **sábado 27 de diciembre**, a partir de las **11:30 horas**, del **IV Certamen de Invierno de Escuelas Taurinas de la Comunidad de Madrid**, un festejo que se celebrará en homenaje y recuerdo de **Tomás Serrano Guío**, figura clave en la formación taurina madrileña por su labor como presidente del Patronato de la **Escuela de Tauromaquia de Madrid**.

El certamen, ya consolidado como una cita destacada en el calendario formativo taurino, reunirá a alumnos procedentes de distintas escuelas de la **Comunidad de Madrid**, en una jornada que combina recuerdo, proyección de futuro y compromiso con la tauromaquia desde la base.

Para la ocasión se lidiarán dos novillos de la ganadería de **Zacarías Moreno** y cuatro novillos de **Toros de la Plata**, encastes que aportan variedad y exigencia a un festejo pensado para medir la evolución y el concepto de los jóvenes aspirantes.

Harán el paseíllo **Andreo Sánchez** (**E.T. Navas del Rey**), **Pablo Jurado** (**E.T.F. El Juli**), **José Huelves** (**E.T. Colmenar Viejo**), **Brahian Osorio “Carrita”** (**E.T. Galapagar**), **Óscar Campos** (**E.T. Yiyo**) y **Kevin Montiel** (**E.T. CITAR-Anchuelo**), representantes del presente y futuro de las escuelas taurinas madrileñas.

El festejo, de **entrada gratuita hasta completar aforo**, contará además con un **desayuno gratuito** para los asistentes a partir de las **10:30 horas**, reforzando el carácter abierto y divulgativo del certamen. La organización corre a cargo del **Centro de Asuntos Taurinos de la Comunidad de Madrid**, en colaboración con **Plaza 1** y la **Escuela Taurina Yiyo**.`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 269,
    title: `Olivenza presenta una Feria Taurina 2026 de máximo interés y grandes alicientes`,
    image: "/images/olivenza1.jpg",
    category: "Actualidad",
    date: "20 de Diciembre de 2025",
    fullContent: `La localidad pacense de Olivenza ha dado a conocer oficialmente los carteles de su **Feria Taurina 2026**, un ciclo que vuelve a erigirse como uno de los grandes referentes del inicio de la temporada taurina y que destaca por su equilibrio entre figuras consagradas, toreros en plenitud y jóvenes valores en proyección, junto a hierros de reconocido prestigio.

El abono se abrirá el **viernes 6 de marzo** con una novillada con picadores en la que harán el paseíllo **Tomás Bastos**, **Olga Casado** y **David Gutiérrez**, que debutará con picadores. Se lidiarán novillos de **Talavante**, una ganadería que aporta un plus de interés a una tarde marcada por la ilusión, la juventud y las expectativas de futuro.

El **sábado 7 de marzo** se celebrará la primera corrida de toros del ciclo, con un cartel de máximo atractivo compuesto por **José María Manzanares**, **Daniel Luque** y **Juan Ortega**, quienes se enfrentarán a un encierro de **Puerto de San Lorenzo**. Una terna que conjuga clasicismo, solvencia y estética, llamada a protagonizar una de las citas más destacadas de la feria.

La programación continuará el **domingo 8 de marzo** con una corrida matinal en la que actuarán **Borja Jiménez**, **David de Miranda** y **Marco Pérez**, ante toros de **Domingo Hernández** y **La Ventana del Puerto**, en un festejo que apuesta por la ambición, la proyección y el presente más pujante del escalafón.

El ciclo se clausurará esa misma tarde con un cartel de alto voltaje integrado por **Alejandro Talavante**, **Emilio de Justo** y **Roca Rey**, que lidiarán reses de **Victoriano del Río**, garantía de bravura y emoción para un cierre de máximo nivel.

Con esta cuidada combinación de nombres y ganaderías, Olivenza reafirma su condición de plaza clave del mes de marzo y su papel como punto de partida de la temporada taurina. Una feria rematada, atractiva y con sólidos argumentos para captar tanto al aficionado exigente como al gran público.`,
    author: "Eduardo Elvira",
    authorLogo: "/images/edu4.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 270,
    title: `Tres ganaderías de lujo para la Feria del Milagro de Illescas 2026`,
    image: "/images/tres.jpg",
    category: "Actualidad",
    date: "18 de Diciembre de 2025",
    fullContent: `**MAXITORO** volverá a apostar por la categoría y la calidad ganadera en su tradicional **FERIA DEL MILAGRO DE ILLESCAS**. Así, la empresa ha anunciado los nombres del campo bravo que protagonizarán la edición de 2026, con tres hierros de máximo prestigio: **DOMINGO HERNÁNDEZ** y **ROMÁN SORANDO** para la corrida de toros a pie, y **CAPEA** para el festejo de rejones.

Estas ganaderías han sido protagonistas de faenas memorables durante las últimas temporadas, sustento de grandes triunfos de las figuras. Su presencia reafirma la apuesta por hierros de garantías contrastadas y por un nivel ganadero a la altura del cartel de figuras que acostumbra a concentrar la feria.

En las próximas jornadas, la empresa irá desvelando más detalles de unas combinaciones que buscan seguir consolidando a Illescas como una plaza de referencia en el arranque de la temporada. La Feria del Milagro, marcada por su carácter social y por la presencia habitual de numerosas personalidades, volverá a situarse como uno de los grandes polos de atención taurina tanto para los aficionados como para los principales toreros del escalafón, a pie y a caballo.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 271,
    title: `La A.N.V.T. y F.F. entrega su ‘Insignia de Oro’ a la Presidenta de la Excma. Diputación de Cádiz y al Vicepresidente Segundo`,
    image: "/images/13.jpg",
    category: "Actualidad",
    date: "18 de Diciembre de 2025",
	excerpt: `Dª. Almudena Martínez del Junco y D. Francisco Javier Vidal, fueron galardonados por la Asociación Nuevos Valores del Toreo y Fomento de la Fiesta (Escuelas de Cádiz) “Por el Fomento de la Tauromaquia y a las Escuelas Taurinas de la Provincia de Cádiz”`,
    fullContent: `La finca del maestro **Francisco Ruiz Miguel**, conocida como *El Algarrobo* (Los Barrios-Cádiz), fue escenario en la mañana de hoy, **jueves 18 de diciembre**, del acto institucional de entrega de la **Insignia de Oro de la Asociación Nuevos Valores del Toreo y Fomento de la Fiesta**, entidad que agrupa a las **Escuelas Taurinas de la provincia de Cádiz**. El reconocimiento recayó en la **Excma. Sra. Presidenta de la Diputación de Cádiz, Dª. Almudena Martínez del Junco**, y en el **Ilmo. Sr. Vicepresidente Segundo, D. Francisco Javier Vidal**, en agradecimiento al firme respaldo que la institución provincial mantiene con la tauromaquia y la formación de nuevos valores del toreo.

El acto dio comienzo a las 13:45 horas con la recepción oficial de las autoridades, que fueron recibidas por el **Presidente de la Asociación Nuevos Valores del Toreo y Fomento de la Fiesta, D. Eduardo Ordóñez**, y por el anfitrión de la jornada, el maestro **D. Francisco Ruiz Miguel**, Vicepresidente de la Asociación Andaluza de Escuelas Taurinas “Pedro Romero”.

La apertura y conducción del evento corrió a cargo de **Emilio Trigo**, Jefe de Gabinete de Prensa, quien ofreció un saludo institucional y dio la bienvenida a los asistentes. Seguidamente, tomó la palabra el maestro **Ruiz Miguel**, quien, en calidad de anfitrión, expresó su satisfacción por acoger el encuentro.

A continuación, intervino el presidente de la Asociación, **Eduardo Ordóñez**, quien explicó el significado del acto y los motivos que han llevado a la concesión de la **Insignia de Oro**, subrayando que el galardón **reconoce el constante fomento de la tauromaquia y el apoyo decidido a las Escuelas Taurinas de la provincia**, destacando la colaboración institucional y personal de la **Diputación de Cádiz** con la formación de los futuros profesionales del toreo.

El momento central del acto llegó con la entrega de las distinciones. La **Insignia de Oro** fue impuesta al **Vicepresidente Segundo de la Diputación, D. Francisco Javier Vidal**, de manos del maestro **D. José Luis Galloso**, Vicepresidente de la Asociación Nuevos Valores del Toreo y Fomento de la Fiesta, y de **D. Eduardo Ordóñez**. Posteriormente, la **Presidenta de la Diputación, Dª. Almudena Martínez del Junco**, recibió el galardón de manos del maestro **D. Francisco Ruiz Miguel** y del Presidente de la Asociación.

Tanto la **Presidenta** como el **Vicepresidente** agradecieron visiblemente emocionados la distinción recibida, **reafirmando su compromiso con la tauromaquia y con las Escuelas Taurinas de Cádiz**, cuya labor formativa y cultural destacaron como esencial para garantizar **el futuro de la Fiesta**.

El acto concluyó con una fotografía de familia y un **almuerzo institucional de convivencia**, en el que autoridades, representantes de las Escuelas Taurinas de Cádiz, miembros de la Junta Directiva de la Asociación, ganaderos e invitados compartieron impresiones en un ambiente de cordialidad, hermandad y reconocimiento mutuo.
`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 272,
    title: `La excelencia taurina de El Puerto de Santa María, vuelve a brillar en la histórica Bodega Caballero del Castillo de San Marcos`,
    image: "/images/excelencia.jpg",
	footerImage1: "/images/excelencia1.jpg",
    category: "Actualidad",
    date: "18 de Diciembre de 2025",
	excerpt: "Los Premios Taurinos “Toros en El Puerto” organizados por la empresa EVENTIC, se consolidan como el evento social y cultural de referencia para el sector, reafirmando el posicionamiento estratégico de la ciudad en el panorama taurino nacional.",
    fullContent: `La histórica Bodega Caballero del Castillo de San Marcos, volverá a ser el escenario para reconocer la excelencia de la Temporada Taurina 2025.

 

Tras el rotundo éxito de su primera edición, la emblemática Bodega Caballero del Castillo de San Marcos volverá a abrir sus puertas para acoger la Gala de Entrega de la II edición de los Premios Taurinos “Toros en El Puerto” Temporada 2025, que se celebrará con una nueva gala el próximo viernes 30 de enero de 2026.

 

Esta velada distinguirá las actuaciones más destacadas durante la pasada temporada en El Puerto de Santa María. Como ya se anunció en su día, el cartel de galardonados lo encabezan referentes del escalafón como José Antonio Morante de la Puebla y José María Manzanares, compartiendo protagonismo con el torero portuense, Daniel Crespo, entre otros premiados.

 

Por otra parte, cabe destacar que en esta edición adquiere un protagonismo muy especial el galardón a la mejor faena de rejones, otorgado a Rui Fernandes, ya que éste se bautizó con el nombre “Premio Álvaro Domecq” y ahora con más fuerza aún si cabe, volvemos a rendir homenaje a. D. Álvaro Domecq Romero, alma de Torrestrella, figura del rejoneo y fundador de la Real Escuela Andaluza del Arte Ecuestre, cuya ausencia el pasado 18 de noviembre, nos dejó un inmenso vacío.

 

La conducción del acto recaerá nuevamente en Fernando García Mena, actual presentador de los informativos del fin de semana de Canal Sur, T.V., gran profesional de la comunicación andaluza, avalado por una dilatada y prestigiosa trayectoria.

 

 El evento se perfila como una cita imprescindible que reunirá a figuras del toreo, profesionales taurinos y de la comunicación, autoridades, patrocinadores y empresarios, así como una nutrida representación de la afición de la ciudad y de la propia provincia.

 

La elección de un escenario con la carga histórica del Castillo de San Marcos, gracias a la inestimable colaboración de Grupo Caballero, subraya el compromiso de la organización con la puesta en valor del patrimonio local.

 

Esta gala ha sido diseñada con el firme propósito de buscar notoriedad y posicionamiento a El Puerto y a la propia provincia, como referente indiscutible del mundo taurino. Asimismo, busca fortalecer el tejido social creando un espacio de convivencia donde peñas, aficionados y público en general se sientan representados, además de reivindicar la cultura, celebrando la tauromaquia como una manifestación viva que define la tradición y la esencia de El Puerto de Santa María, trascendiendo las fronteras de la propia plaza y contribuyendo a la promoción turística y cultural de la provincia de Cádiz. 

 

Para Raúl Capdevila, CEO de EVENTIC, empresa impulsora de esta iniciativa, esta segunda edición supone la consolidación de un proyecto de largo recorrido: “Para EVENTIC es un orgullo poder celebrar esta segunda edición, ya que estos premios son el mejor testimonio de nuestra firme apuesta por la excelencia, la promoción y la tradición taurina, un patrimonio que debemos impulsar y reconocer con acciones que refuercen nuestra identidad, no solo durante la temporada de verano sino durante todo el año”.

 

EVENTIC, quiere expresar su agradecimiento a las empresas patrocinadoras, ya que no son sólo una fuente de financiación, son socios estratégicos que aportan además confianza, credibilidad y alcance, asegurando que esa noche de galardones, adquirirán el protagonismo que sin duda han cosechado. Gracias a: Bodegas Caballero y Gutiérrez Colosía, Balcris Gallery, Puerto Sherry, restaurantes El Faro y Bar Jamón, inmobiliarias GICA y Gilmar, Puerto Taller El Palmar, Postres Pepe Mesa, Catering Momento Andaluz, Geocaminos y Sonido Ojeda, así por supuesto como a los media partners que amplificarán el mensaje a su audiencia: Cadena COPE, 65ymas, Radio Puerto, eventic360 y Onetoro.

 

Por último, hay que destacar que, la importancia de la colaboración entre administraciones públicas y entidades privadas es un motor esencial para el desarrollo económico y social de la provincia, permitiendo alcanzar objetivos complejos y mejorando la eficiencia en la prestación de servicios. Sirvan estas líneas para extender nuestro agradecimiento a la Diputación Provincial de Cádiz y a la Delegación de Turismo y Promoción de la Ciudad de El Puerto de Santa María por confiar y apoyar públicamente el proyecto “Toros en El Puerto”.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 273,
    title: `La Plataforma de impulso a los Novilleros de Andalucía presenta su Memoria 2025 a la Fundación Caja Rural del Sur y la Real Maestranza de Caballería de Sevilla`,
    image: "/images/plataforma.jpg",
    category: "Actualidad",
    date: "18 de Diciembre de 2025",
    fullContent: `El director general de la Fundación Toro de Lidia refuerza el respaldo institucional a un proyecto clave para el futuro de la tauromaquia andaluza

Jueves, 18 de diciembre de 2025

La Plataforma de impulso a los Novilleros de Andalucía continúa afianzando su proyecto tras la presentación de su Memoria 2025 ante algunas de las principales entidades colaboradoras que hacen posible esta iniciativa. En la mañana de hoy, Borja Cardelús, director general de la Fundación Toro de Lidia, ha presentado el balance del primer curso de actividad de la Plataforma en la Fundación Caja Rural del Sur, donde ha sido recibido por Manuel Ruiz Rojas, así como en la Real Maestranza de Caballería de Sevilla, institución en la que el encuentro ha tenido lugar con el Teniente de Hermano Mayor, Marcelo Maestre.

        

Estas presentaciones se suman a la realizada ante la Diputación de Córdoba, donde Cardelús expuso la Memoria 2025 a Andrés Lorite, vicepresidente primero y diputado delegado de Infraestructuras, Sostenibilidad y Agricultura, institución que patrocina activamente este proyecto estratégico para el futuro de la tauromaquia andaluza. Durante dicho encuentro quedó patente el firme respaldo de la Diputación de Córdoba a una iniciativa cuyos ejes fundamentales son la promoción y visibilidad de los novilleros andaluces, la difusión y reconocimiento de los certámenes taurinos celebrados en Andalucía y el impulso al trabajo formativo de las Escuelas Taurinas de la comunidad.

        

Impulsada por la Fundación Toro de Lidia, la Plataforma ha cerrado su primer curso de actividad con resultados altamente positivos, consolidándose como una herramienta de comunicación, proyección y vertebración del sector sin precedentes. En el ámbito digital, el proyecto ha alcanzado 66.000 seguidores en su primer año de vida, acumulando cerca de 40 millones de impresiones, cifras que reflejan el impacto real de la iniciativa y su capacidad para acercar la tauromaquia y a sus jóvenes protagonistas a nuevos públicos.

 

Más allá de su presencia en redes sociales y en su web oficial, la Plataforma ha desarrollado un amplio calendario de actos y encuentros presenciales, entre los que destacan reuniones institucionales y actividades incluidas en el programa ‘Veteranos y noveles’ de la Fundación Toro de Lidia. Este programa posee una marcada vocación social y divulgativa, llevando la tauromaquia a residencias de mayores, centros sociales, colegios y universidades, y fomentando la transmisión de valores culturales, educativos y humanos ligados al mundo del toro.

 

Con la presentación de esta Memoria 2025, la Plataforma de impulso a los Novilleros de Andalucía culmina su primer año de trabajo con un balance muy positivo, sentando las bases de un proyecto sólido, moderno y vertebrador, en el que el respaldo institucional —con especial protagonismo de la Diputación de Córdoba— se erige como pilar fundamental para la defensa y promoción de la tauromaquia como expresión cultural y social de Andalucía.

 

La Plataforma de Impulso a los Novilleros de Andalucía nace con el objetivo de promocionar y potenciar las carreras de los novilleros en la comunidad, así como sus Escuelas Taurinas y certámenes. Un proyecto anual, impulsado por la Fundación Toro de Lidia y respaldado por la Junta de Andalucía, Fundación Caja Rural del Sur, Fundación Cajasol, Instituto Andaluz de la Juventud, Real Maestranza de Caballería de Sevilla, Diputación de Málaga, Diputación de Huelva, Diputación de Córdoba, Diputación de Granada y Diputación de Cádiz.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 274,
    title: `La Escuela Comarcal de Ubrique cerrará el 2025 con un 'Tentadero Público en Clase Práctica Fin de Curso'`,
    image: "/images/ubrique.jpg",
	footerImage1: "/images/ubriqueb.jpg",
    category: "Actualidad",
    date: "18 de Diciembre de 2025",
    fullContent: `La **Plaza de Toros de Ubrique**, conocida como la 'Capital de la Piel', será escenario el próximo **sábado 20 de diciembre**, a partir de las **12:00 horas**, del tradicional **Tentadero Público en Clase Práctica Fin de Curso** con el que la **Escuela Comarcal Taurina de Ubrique** pondrá el broche final al periodo 2025.

Este festejo, concebido como un acto abierto al público y de marcado carácter formativo, está organizado por la propia **Escuela Comarcal Taurina de Ubrique** que preside D. **Eduardo Ordóñez** y cuenta con la estrecha colaboración del **Excmo. Ayuntamiento** de la localidad. En la jornada se lidiarán tres reses pertenecientes a la ganadería de **Los Elegidos**, bajo la dirección y magisterio de D. **Juan Rojas**, director de la escuela ubriqueña y reconocido banderillero de 'Plata de Ley'.

El cartel de la clase práctica lo integran los alumnos más avanzados del centro: **Mario Torres**, **Juan Manuel Viruez**, **Javier Torres “Bombita”**, **Tomás Carmelo**, **Javier Caro**, **Francisco de Paula** y **Sheila Berrocal**, quienes tendrán la oportunidad de demostrar sobre el albero los conocimientos y la evolución adquiridos a lo largo del curso.

Finalizadas las labores camperas, el público asistente podrá disfrutar de una **exhibición de toreo** protagonizada por el resto de aprendices de la escuela. En esta demostración participarán **Pablo Román**, **David Flores**, **Álvaro Sánchez**, **Víctor Iván Chacón**, **Franco Juan Rojas**, **Juanjo Domínguez**, **Javier Olmedo**, **Curro Pazo**, **Javier Almendro**, **Gonzalo García**, **Álvaro Ríos**, **Antonio García**, **Juan Rodríguez**, **Azarel Gil**, **Andra García**, **Juan González**, **Héctor García**, **Paula Jiménez**, **Javier Álvarez**, **Alejandro Núñez**, **Juan José Carrera**, **Juan Antonio Olmo**, **Claudio Rubiales**, **Rodrigo Sevillano** y **Lola Rubiales**, reflejando el amplio y diverso alumnado que conforma la cantera taurina ubriqueña.

Como colofón a esta intensa jornada taurina y formativa, se hará entrega de un **Diploma Acreditativo de Fin de Curso** a todos los alumnos de la **Escuela Comarcal Taurina de Ubrique**, reconociendo así su esfuerzo, dedicación y compromiso con el aprendizaje del arte del toreo.

El tentadero supondrá, un año más, una cita destacada en el calendario taurino local y una muestra del firme trabajo que la escuela desarrolla en favor de la formación y promoción de nuevos valores de la tauromaquia.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 275,
    title: `Eventos Mare Nostrum continuará al frente de la Plaza de Toros de Alicante tras ser la única oferta presentada`,
    image: "/images/eventos.jpg",
    category: "Actualidad",
    date: "18 de Diciembre de 2025",
    fullContent: `La **Plaza de Toros de Alicante** continuará siendo gestionada por la empresa **Eventos Mare Nostrum**, al haber sido la única **propuesta presentada al concurso público** convocado para su explotación. Esta circunstancia quedó confirmada en la **Mesa de Contratación** celebrada ayer, lo que deja como único escenario posible la renovación de la actual concesión.

El nuevo contrato entraría en vigor el próximo mes de abril y **podría extenderse por un periodo máximo de tres años**. De este modo, Eventos Mare Nostrum afrontaría su cuarto ciclo al frente del coso alicantino, tras haber asumido la gestión como empresa heredera de la anterior UTE formada por Simón Casas y Toros del Mediterráneo.

La renovación de la concesión se produce en un contexto en el que se persigue reforzar el carácter taurino de la Plaza de Toros de Alicante, al tiempo que se impulsa su apertura a otros tipos de espectáculos con capacidad para generar un impacto económico y cultural positivo en la ciudad.

Con este objetivo, el pliego contempla una rehabilitación integral del inmueble, orientada a la mejora y adaptación de sus instalaciones para nuevos usos. En este sentido, se establece como requisito mínimo la celebración de seis espectáculos no taurinos, cifra que se pretende ampliar hasta diez en el próximo pliego de condiciones.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
   },
	{ 
    id: 276,
    title: `El Premio Nacional de Tauromaquia 2025 se entregará de nuevo en el Senado`,
    image: "/images/premio2.jpg",
    category: "Actualidad",
    date: "17 de Diciembre de 2025",
    fullContent: `La entrega del **Premio Nacional de Tauromaquia 2025** volverá a celebrarse en el **Senado**, consolidando así el compromiso institucional de reconocer los méritos de los profesionales y figuras más destacadas del mundo del toro, en un contexto marcado por la situación de excepcionalidad generada tras la supresión del galardón por parte del **Ministerio de Cultura**.

En esta segunda edición, el premio será concedido de manera conjunta por el **Senado**, la **Junta de Andalucía**, **Cantabria**, la **Región de Murcia**, la **Comunitat Valenciana**, el **Gobierno de Aragón**, la **Junta de Comunidades de Castilla-La Mancha**, la **Junta de Extremadura**, la **Comunidad de Madrid**, la **Junta de Castilla y León**, la **Ciudad Autónoma de Melilla** y la **Fundación Toro de Lidia**. De este modo, **Melilla** se incorpora a las once instituciones que ya impulsaron el premio en la pasada edición.

Cabe recordar que el **Premio Nacional de Tauromaquia** fue creado en 2013 para reconocer los méritos profesionales en el ámbito de la tauromaquia, hasta que en 2024 fue suprimido por el entonces ministro de Cultura, **Ernest Urtasun**. Esta decisión motivó que la **Fundación Toro de Lidia** y diversas administraciones públicas asumieran la convocatoria del galardón como una iniciativa propia, en defensa y promoción de la tauromaquia.

En la edición de 2024, el **Premio Nacional de Tauromaquia** fue concedido ex aequo a la **Real Unión de Criadores de Toros de Lidia** y al cineasta **Albert Serra**. Con la celebración de la entrega del **Premio Nacional de Tauromaquia 2025** en el **Senado**, la Cámara Alta volverá a acoger a miles de representantes del mundo del toro en un acto que se presenta como un nuevo ejercicio de reconocimiento y libertad cultural.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
   },
	{ 
    id: 277,
    title: `Valladolid fija la Feria de San Pedro Regalado 2026 para los días 16 y 17 de mayo`,
    image: "/images/valladolid.jpg",
    category: "Actualidad",
    date: "17 de Diciembre de 2025",
    fullContent: `La temporada taurina en Valladolid ya ha comenzado a tomar forma. La empresa **TauroEmocion**, dirigida por **Alberto García**, ha anunciado oficialmente las fechas de celebración de la **Feria de San Pedro Regalado 2026**, que tendrá lugar los días 16 y 17 de mayo.

Durante esas dos jornadas se celebrarán dos corridas de toros con las que la empresa busca continuar consolidando la plaza del Paseo de Zorrilla como uno de los escenarios más destacados del panorama taurino nacional.

Asimismo, en la mañana de este miércoles 17 de diciembre se ha hecho público el cartel de la tradicional corrida de la oportunidad, integrada dentro de la Feria de San Pedro Regalado. En el festejo están anunciados **Manuel Diosleguarde**, **Sergio Rodríguez**, **Jarocho** y **Mario Navas**, quienes lidiarán toros de la ganadería de **El Pilar**. El triunfador de la tarde obtendrá un puesto en la próxima Feria de la **Virgen de San Lorenzo**, que se celebrará el próximo mes de septiembre.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
   },
	{ 
    id: 278,
    title: `Curro Vázquez tendrá su azulejo en Las Ventas`,
    image: "/images/curro2.jpg",
    category: "Actualidad",
    date: "17 de Diciembre de 2025",
    fullContent: `Curro Vázquez contará por fin con un azulejo conmemorativo en la plaza de toros de Las Ventas, un reconocimiento largamente reclamado por la afición madrileña. La noticia ha sido adelantada por el periodista Zabala de la Serna en Diario El Mundo.

El torero linarense, una de las grandes figuras de Madrid en la década de los años ochenta y considerado por muchos como el último torero romántico que tuvo la plaza, verá así reconocida su estrecha vinculación con el coso venteño y con su público.

La inauguración oficial del azulejo tendrá lugar el próximo 15 de mayo, festividad de San Isidro, según ha confirmado el Centro de Asuntos Taurinos de la Comunidad de Madrid. Este homenaje pone en valor la trayectoria profesional de Curro Vázquez en la tauromaquia y su especial relevancia en la historia reciente de Las Ventas.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
   },
	{ 
    id: 279,
    title: `El Premio Nacional de Tauramaquia 2025 se entregará de nuevo en el Senado`,
    image: "/images/premio3.jpg",
	footerImage1: "/images/lidia.jpg",
    category: "Actualidad",
    date: "17 de Diciembre de 2025",
    fullContent: `El Premio Nacional de Tauramaquia 2025 se entregará de nuevo en el Senado
 
El Senado, la Junta de Andalucía, Cantabria, Región de Murcia, Comunitat Valenciana, Gobierno de Aragón, Junta de Comunidades de Castilla-La Mancha, Junta de Extremadura, Comunidad de Madrid, Junta de Castilla y León, la Ciudad Autónoma de Melilla y la Fundación Toro de Lidia convocan de nuevo el Premio Nacional de Tauromaquia suprimido por el Ministerio de Cultura de Ernest Urtasun
 
La convocatoria cuenta este año con la incorporación de la Ciudad Autónoma de Melilla, sumándose a las once instituciones que ya participaron en 2024

La entrega del Premio Nacional de Tauromaquia 2025 tendrá lugar de nuevo en el Senado, galardón que en esta segunda edición mantiene el compromiso institucional de reconocer los méritos de profesionales y figuras destacadas del mundo taurino mientras persiste la situación de excepción censora creada por el Ministerio de Cultura.
 
El premio será otorgado por el Senado, la Junta de Andalucía, Cantabria, la Región de Murcia, la Comunitat Valenciana, el Gobierno de Aragón, la Junta de Comunidades de Castilla-La Mancha, la Junta de Extremadura, la Comunidad de Madrid, la Junta de Castilla y León, la Ciudad Autónoma de Melilla y la Fundación Toro de Lidia. 
 
Así, Melilla se suma a las once instituciones que ya convocaron el Premio Nacional de Tauromaquia el año pasado. 

Sobre el Premio Nacional de Tauromaquia
El Premio Nacional de Tauromaquia fue otorgado por primera vez en 2013 por el Ministerio de Cultura de España para reconocer los méritos de profesionales de la tauromaquia o de personas e instituciones que destacaran por su labor en favor de la difusión de los valores culturales de esta manifestación artística.
 
En mayo de 2024, el ministro de Cultura, Ernest Urtasun, anunció la supresión del Premio Nacional de Tauromaquia, un ataque ideológico a la libertad y diversidad de la cultura en España que fue inmediatamente contestado por la sociedad y por gran parte de las instituciones públicas.
 
Ante esta situación, la Fundación del Toro de Lidia, entidad que aglutina y representa a todos los profesionales y aficionados que forman el sector taurino, reunió todas las iniciativas promovidas por instituciones públicas en un único gran Premio Nacional de Tauromaquia, en estricto cumplimiento de la obligación de defender y promover la Tauromaquia que la ley 18/2013 impone a todas las administraciones públicas.
 
El Premio Nacional de Tauromaquia 2024 se otorgó ex aequo a la Real Unión de Criadores de Toros de Lidia y a Albert Serra. 
 
Situación legal de la tauromaquia
La tauromaquia es una expresión cultural característica de España, protegida por la Constitución Española, cuyo artículo 46 establece que los poderes públicos deben garantizar la conservación y promoción del enriquecimiento del patrimonio histórico, cultural y artístico de los pueblos de España y de los bienes que lo integran, reconociendo el artículo 44 que los poderes públicos promoverán y tutelarán el acceso a la cultura, a la que todos tienen derecho.
 
En desarrollo de esta realidad cultural y esta obligación impuesta a los poderes públicos, en 2013 se aprobó la Ley 18/2013, de 12 de noviembre, para la regulación de la Tauromaquia como patrimonio cultural.
 
Tanto el Tribunal Constitucional como el Tribunal Supremo han tenido ocasión de reafirmar en diversas ocasiones el carácter cultural de la tauromaquia y la obligación de los poderes públicos de protegerla, promoverla y divulgarla, sin que quepa discriminarla frente a otras manifestaciones culturales. Y ello, a pesar de que existan detractores de esta. De forma expresa, el Tribunal Constitucional en su sentencia 177/2016, de 20 de octubre de 2016 afirmó “el hecho que la aceptación de ese carácter no sea pacífico, no priva a las corridas de toros (…), de su carácter cultural pues, existiendo en la realidad social española, el Estado contribuye así a su conservación mediante una acción de salvaguarda de una manifestación subyacente que entiende digna de protección en tanto que integrada en el genérico concepto constitucional de cultura, cuya salvaguarda incumbe a todos los poderes públicos en el ejercicio de sus respectivas competencias”.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 280,
    title: `EL REY DON JUAN CARLOS HACE LLEGAR SU AGRADECIMIENTO A LA 
ASOCIACIÓN INTERNACIONAL DE TAUROMAQUIA`,
    image: "/images/juancarlos.jpg",
    category: "Actualidad",
    date: "17 de Diciembre de 2025",
    fullContent: `Su Majestad expresa con cariñosas palabras el agradecimiento por las muestras de respeto y 
admiración de los aficionados
Los ciudadanos que acuden a las plazas tienen el derecho de disfrutar de Su presencia en los 
tendidos, un entorno de total afinidad con la Corona y de forma especial con la figura y la persona 
de Don Juan Carlos


Un especial honor ha supuesto recibir las cariñosas palabras del Rey Don Juan Carlos tanto para la junta 
directiva de la Asociación Internacional de Tauromaquia (AIT), como para los miembros que la componen 
y las personas y entidades con las que venimos trabajando en proyectos de defensa de La Fiesta de los 
toros.
Como gesto de consideración a la nota de prensa emitida días atrás por la AIT felicitando a Su Majestad por 
el 50 aniversario de su proclamación y expresándole la importancia de Su apoyo a la Tauromaquia, Don 
Juan Carlos ha enviado cálidas palabras de agradecimiento, que por inesperadas y remitidas desde la Casa 
de Su Majestad el Rey, han sido recibidas como un hecho privilegiado.
En un acto de justicia, la AIT. en la referida nota expresó a Su Majestad el sentir de millones de personas 
que acuden a las plazas o ven correr los toros por sus calles, un hecho sencillo y ordinario que ahora, 
recibida Su respuesta, lo convierte en extraordinario.
Es el deseo de esta asociación compartir el saludo que hace extensivo a todos los miembros de la AIT. con 
cada una de las personas, instituciones y asociaciones que tanto en España como en el resto de países 
con tradición taurina de Europa y América, venimos desde años atrás intensamente trabajando.
Una forma feliz para terminar este 2025, seguros de que el nuevo año que pronto comienza, nos consta 
que va a ser en el que Don Juan Carlos volverá a estar presente en los tendidos, un entorno de total 
afinidad con la Corona y de forma especial con la figura y la persona de Don Juan Carlos.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 281,
    title: `El Coso de El Pino acoge un tentadero público fin de curso de las escuelas taurinas de Sanlúcar y Chiclana`,
    image: "/images/coso.jpg",
	footerImage1: "/images/coso1.jpg",
    category: "Actualidad",
    date: "17 de Diciembre de 2025",
    fullContent: `El histórico **Coso de El Pino** será escenario el próximo **domingo 21 de diciembre**, a partir de las **12:30 horas**, de un **tentadero público de fin de curso** que pondrá el broche a la temporada formativa de la **Escuela Taurina “El Volapié”** de Sanlúcar de Barrameda.

El festejo, organizado por la empresa **Espectáculos Carmelo García**, contará con la participación de alumnos de la escuela sanluqueña y de la **Escuela Taurina “Francisco Montes ‘Paquiro’”** de Chiclana de la Frontera, que ha sido invitada para la ocasión, reforzando así los lazos de convivencia y aprendizaje entre ambas instituciones.

Durante la jornada se lidiarán **tres vacas**, en un marco de especial significado, ya que el **centenario Coso de El Pino** ha celebrado este año su **125 aniversario**, convirtiéndose en un escenario idóneo para que los jóvenes aspirantes a toreros muestren los conocimientos adquiridos a lo largo del curso.

Por parte de la **Escuela de Tauromaquia “El Volapié”**, actuarán los alumnos **Jaime Benítez**, **Manuel Delgado**, **Nacho Mateo**, **Cándido Moreno**, **José M. Márquez**, **Santiago Rodríguez**, **Álvaro Díaz**, **José Núñez**, **Daniel Pacheco**, **Gabriel Moreno “El Calé”**, **Hugo Silva** y **Héctor Camacho**.

En representación de la **Escuela Taurina “Francisco Montes ‘Paquiro’”** de Chiclana de la Frontera, participarán los alumnos **Martín**, **Pancho**, **Bruno**, **Yeray**, **Cayetano**, **Mariano**, **Álvaro** y **Saúl**.

El tentadero público servirá no solo como evaluación final del curso, sino también como una oportunidad para que aficionados y público en general puedan presenciar el progreso y la ilusión de las nuevas generaciones del toreo, en una cita que promete emoción y compromiso con la tradición taurina.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 282,
    title: `Aula Taurina perteneciente a la Escuela de Tauromaquia de Sevilla, convoca el XXXV Concurso de Creación Artística “La Fiesta de los Toros”`,
    image: "/images/aula.jpg",
	footerImage1: "/images/aula1.jpg",
    category: "Actualidad",
    date: "17 de Diciembre de 2025",
    fullContent: `**Aula Taurina** perteneciente a la **Escuela de Tauromaquia de Sevilla**, con el patrocinio de la **Real Maestranza de Caballería de Sevilla**, ha convocado el **XXXV Concurso de Creación Artística** sobre el tema **“La Fiesta de los Toros”**, dirigido a jóvenes de **Sevilla** y su **provincia**.

El certamen establece dos modalidades de participación: **fotografía** y **vídeos cortos**, con el objetivo de fomentar la creatividad artística y la reflexión cultural en torno al mundo del toro entre los jóvenes.

En la **modalidad de fotografía**, las obras deberán presentarse en **formato digital JPEG**, con una resolución mínima recomendada de **1600 x 1200 píxeles** y **formato 3:4 o 9:16**. Cada participante podrá presentar una única fotografía, que deberá enviarse por correo electrónico a **[concursosaulataurina@gmail.com](mailto:concursosaulataurina@gmail.com)**, indicando nombre, domicilio y teléfono de contacto. **El plazo de presentación finalizará el 3 de febrero de 2026**.

Por su parte, **los vídeos** deberán tener **una duración de entre tres y cuatro minutos**, presentarse en **formato MP4**, con **resolución mínima 720p** y **grabación horizontal 16:9**. Los trabajos deberán entregarse en **soporte ‘Pendrive’** en la sede social de la **Asociación**, situada en **C/ Adriano nº 31, bajo (Sevilla)**, los **martes en horario de 10:00 a 13:00 horas**, junto con los datos personales del participante. **El plazo de entrega concluirá el 3 de febrero de 2026 a las 13:00 horas**.

**El jurado** estará presidido por el **Presidente de Aula Taurina** y contará con miembros de su **Junta Directiva** y profesionales de las disciplinas artísticas a concurso. **El fallo del jurado se hará público antes del 13 de febrero de 2026**.

Se concederán **dos premios en cada modalidad**, consistentes en **un abono para la Temporada Taurina 2026** y, en el caso del **primer premio**, la **Medalla de la Orden de la Real Maestranza**. Los trabajos premiados pasarán a ser propiedad de **Aula Taurina**, que se reserva los derechos de publicación y utilización.

La participación en el concurso supone la aceptación íntegra de las bases y de las decisiones del jurado. Para más información, los interesados pueden dirigirse al correo electrónico **[concursosaulataurina@gmail.com](mailto:concursosaulataurina@gmail.com)**.
`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 283,
    title: `Valdemorillo abre la temporada 2026 con una feria de máximo nivel y figuras del toreo`,
    image: "/images/valdemorillo1.jpg",
    category: "Actualidad",
    date: "16 de Diciembre de 2025",
    fullContent: `La empresa **Pueblos del Toreo**, con **Víctor Zabala** y **Carlos Zúñiga** al frente, ha cerrado los carteles de la **Feria Taurina de Valdemorillo**, primera gran cita del calendario taurino de la temporada 2026. El ciclo, adelantado previamente por el Portal Tendido Digital, con el elenco ganadero y toreros, vuelve a apostar por la presencia de máximas figuras del toreo y por un elenco ganadero de plenas garantías, con el objetivo de mantener la alta expectación y el notable éxito de público cosechado en las últimas ediciones.

La presentación oficial del ciclo tendrá lugar el **viernes 16 de enero**, a las **12:00 horas**, en la **Sala Antonio Bienvenida de la Plaza de Toros de Las Ventas**. El acto contará con un coloquio conducido por el periodista **José Ribagorda**, en el que participarán los matadores **Borja Jiménez** y **Tomás Rufo**, y servirá como puesta de largo de la feria.

El evento contará asimismo con la presencia de los empresarios **Carlos Zúñiga** y **Víctor Zabala**, así como del alcalde de Valdemorillo, **Santiago Villena**. Durante el acto se dará a conocer la imagen oficial del ciclo, fiel a la estética clásica que ha caracterizado los carteles de la feria en los últimos años.

El abono estará compuesto por una **novillada con picadores**, dos **corridas de toros** y una **clase práctica** como prólogo, con el siguiente calendario:

- **Jueves 5 de febrero**: Clase práctica de la **Escuela Taurina de Madrid**.

- **Viernes 6 de febrero**: Novillada con picadores.  
Álvaro Serrano, Mario Vilau, Julio Méndez, Sergio Rollón, Félix San Román y Samuel Castrejón  
(Ganadería: **Jiménez Pasquau**).

- **Sábado 7 de febrero**: Corrida de toros, mano a mano.  
**Borja Jiménez** y **Tomás Rufo**  
(Ganaderías: **El Capea**, **Fuente Ymbro** y **Hermanos García Jiménez**).

- **Domingo 8 de febrero**: Corrida de toros.  
Uceda Leal, Juan Ortega y **Pablo Aguado**  
(Ganadería: **Torrealta**).

Los abonos podrán adquirirse del **26 de enero al 1 de febrero**, tanto en la web <a
  href="www.torosvaldemorillo.es"
  target="_blank"
  rel="noopener noreferrer"
  style="color:#2563eb; text-decoration:underline; font-weight:500;"
>
  www.torosvaldemorillo.es
</a> como en los puntos de venta físicos. Las entradas sueltas se pondrán a la venta a partir del **2 de febrero**. Asimismo, los billetes de autobús que se fletarán el sábado y el domingo desde la **Plaza de Toros de Las Ventas (Puerta de Arrastre)** estarán disponibles a través de la misma plataforma online.

**Puntos de venta físicos**:

- **Ayuntamiento de Valdemorillo**: de 10:00 a 14:00 h y de 16:00 a 19:00 h.
- **C/ Alejandro González, 5 (Madrid)**: de 11:00 a 14:00 h y de 16:00 a 19:00 h.
- **Plaza de Toros de Valdemorillo**: los días de festejo, desde las 10:00 h.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
   },
	{ 
    id: 284,
    title: `Calasparra reafirma su apuesta ‘torista’ con un elenco ganadero de nivel`,
    image: "/images/colasparra.jpg",
    category: "Actualidad",
    date: "16 de Diciembre de 2025",
    fullContent: `El **Ayuntamiento de Calasparra**, la **Mesa de Trabajo** y la empresa **Chipé Producciones**, dirigida por **Pedro Pérez “Chicote”**, han dado esta tarde el primer paso de cara a la próxima temporada taurina con la presentación oficial del elenco ganadero. El acto tuvo lugar en la Casa de la Cultura de la localidad murciana y despertó una notable expectación entre los aficionados.

La presentación estuvo presidida por la alcaldesa de Calasparra, **Teresa García**, y sirvió también para dar a conocer las ganaderías que compondrán la **XVII edición** del **Certamen Espiga de Plata**, que como principal novedad recupera este año el formato de **dos novilladas sin picadores**.

Una vez más, **Pedro Pérez “Chicote”** ha vuelto a demostrar creatividad y compromiso en la confección de la programación taurina de una plaza con profundo arraigo, manteniéndose fiel a la filosofía que ha consolidado a Calasparra como “la feria de novilladas más torista de España”. Para ello, se ha apostado por ganaderías de primer nivel, con variedad de encastes, reforzando además el serial con la inclusión de dos desafíos ganaderos, fórmula que ya cosechó un notable éxito en la edición de 2025.

Como es tradición, del **3 al 8 de septiembre** se celebrará el **Certamen Espiga de Oro**, compuesto por seis novilladas, con las siguientes ganaderías anunciadas:

- María Cascón  
- Aldeanueva  
- Raso de Portillo  
- Rehuelga  
- Prieto de la Cal y Partido de Resina (desafío ganadero)  
- Miura y Fuente Ymbro (desafío ganadero)`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
   },
	{ 
    id: 285,
    title: `Seleccionados los 18 toreros para la Copa Chenel 2026`,
    image: "/images/18.jpg",
    category: "Actualidad",
    date: "16 de Diciembre de 2025",
    fullContent: `La **Copa Chenel 2026** ya es una realidad y contará con la participación de 18 toreros en su sexta edición. El certamen de corridas de toros, organizado por la **Fundación Toro de Lidia** y la **Comunidad de Madrid** desde 2021, se enmarca dentro de la Fiesta del Toro y continúa consolidándose año tras año como una de las competiciones de referencia del panorama taurino.

La principal novedad de esta edición es la celebración de la **Gran Final** en la **Plaza de Toros de Las Ventas**, un escenario emblemático que supone un aliciente añadido para los finalistas y un marco especialmente simbólico para el torero que da nombre al certamen, **Antonio Chenel “Antoñete”**.

Los nombres de los 18 participantes fueron desvelados en un programa especial emitido en directo a través del canal de YouTube de la Fundación Toro de Lidia. El espacio, titulado **ChenelReveal**, estuvo dirigido por el periodista **Carmelo López**, acompañado por **Gonzalo Bienvenida** y los aficionados **Iván de la Cruz** y **Daniel de la Morena**.

La Copa Chenel mantiene en esta sexta edición su marcado carácter internacional, con representantes de España, Perú, México y Francia. Los toreros seleccionados para la edición 2026 son:

- Jorge Isiegas  
- Alejandro Marcos  
- Guillermo García Pulido  
- El Rafi  
- Alejandro Chicharro  
- Manuel Perera  
- Fernando Plaza  
- Manuel Diosleguarde  
- Fabio Jiménez  
- Tomás Campos  
- Tomás Angulo  
- Héctor Gutiérrez  
- Juan Carlos Cubas  
- Álvaro Burdiel  
- Alberto Durán  
- Juan Miguel  
- Javier Cortés  
- Mario Navas`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
   },
	{ 
    id: 286,
    title: `Cristiano Torres y Carlos Aragón Cancela fin a la relación de apoderamiento`,
    image: "/images/relacion.jpg",
    category: "Actualidad",
    date: "16 de Diciembre de 2025",
    fullContent: `La relación profesional entre el matador de toros **Cristiano Torres** y el ganadero **Carlos Aragón Cancela** ha concluido tras dos años de colaboración. La decisión ha sido adoptada de mutuo acuerdo, manteniendo ambas partes la excelente relación personal que les ha unido durante este tiempo.

A lo largo de las dos últimas temporadas taurinas, **Cristiano Torres** ha estado anunciado en las principales ferias del calendario taurino, como **Madrid**, **Sevilla**, **Pamplona**, **Zaragoza**, **Arganda**, **Arnedo**, **Villaseca o Peralta**, consolidándose como uno de los novilleros revelación de los últimos años gracias a su capacidad, proyección y destacados triunfos.

Tanto **Cristiano Torres** como **Carlos Aragón Cancela** desean expresar su agradecimiento mutuo por el trabajo y el camino compartidos, deseándose los mayores éxitos en sus respectivas trayectorias profesionales y manteniendo la amistad forjada durante estas temporadas de estrecha colaboración.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
   },
	{ 
    id: 287,
    title: `Roca Rey hará el paseíllo en la Feria de la Manzanilla 2026`,
    image: "/images/roca.jpg",
    category: "Actualidad",
    date: "16 de Diciembre de 2025",
    fullContent: `Sanlúcar de Barrameda volverá a contar con la presencia de **Andrés Roca Rey**, que hará el paseíllo en el **Coso de El Pino** con motivo de la **Feria de la Manzanilla 2026**.

El diestro peruano, máxima figura del toreo, actuará en la corrida de toros anunciada para el **domingo 7 de junio**, convirtiendo una vez más a la feria sanluqueña en una de las citas de máximo interés en el calendario de los aficionados taurinos.

La presencia de Roca Rey en el cartel de la Feria de la Manzanilla 2026 supone una firme apuesta por la calidad y el atractivo de los festejos taurinos en **Sanlúcar de Barrameda**, consolidando al Coso de El Pino como un escenario de referencia.

Esta confirmación se suma al adelanto de la **temporada taurina sanluqueña 2026** que la empresa **Espectáculos Carmelo García** dio a conocer semanas atrás, que incluye las fechas de la **Corrida de Rejones** en primavera, el **sábado 11 de abril**, y la ya tradicional **Corrida de toros Magallánica**, en su VIII edición, el **domingo 16 de agosto**.
`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 288,
    title: `ANOET estudia los festejos de los últimos 15 años en Castilla-La Mancha`,
    image: "/images/ANOET1nueva.jpg",
	footerImage1: "/images/ANOET2.jpg",
	footerImage2: "/images/ANOET3.jpg",
	footerImage3: "/images/ANOET4.jpg",
    category: "Actualidad",
    date: "14 de Diciembre de 2025",
	excerpt: "Completo informe estadístico sobre la presencia taurina en esta comunidad entre 2010 y 2024",
    fullContent: `La Asociación Nacional de Organizadores de Espectáculos Taurinos (ANOET) sigue trabajando en el estudio estadístico de la Tauromaquia por comunidades y en esta ocasión centra su atención en Castilla-La Mancha para constatar la amplia presencia del hecho taurino en esta zona de España.

El estudio abarca un periodo de 15 años (de 2010 a 2024), lo que permite comprobar la evolución de los festejos celebrados en esta comunidad, además de conocer el número de asistentes y de reses lidiadas en los mismos. Este informe se une a los ya publicados de Andalucía, la Comunidad Foral de Navarra, Madrid y Extremadura.

Con este nuevo estudio, realizado en colaboración con la Junta de Comunidades de Castilla-La Mancha, ANOET aporta numerosos datos sobre la celebración de festejos en esta comunidad. Este informe se presenta en un formato digital interactivo que permite introducir numerosas variables en las búsquedas. A través de este trabajo, el usuario puede acceder al número de festejos que se celebraron en un año determinado, segmentarlos por localidades y dividirlos por tipología. También aporta tablas comparativas que permiten una visión por años, provincias, categoría de plazas, etc.

**Mapa**

Este informe sobre los toros en Castilla-La Mancha comienza con un mapa que permite visualizar la actividad taurina en esta comunidad, pudiéndose apreciar una amplia presencia. La cifra total de festejos celebrados en los 15 años objeto de análisis es de 22.221, de los cuales 883 son corridas de toros, 592 novilladas picadas y 553 festejos de rejones. Las novilladas sin picar ascienden a 1.066, predominando muy por encima de todos ellos los festejos populares, de los que se celebraron 16.750 en total.

De los festejos en plaza, fueron mayoría los celebrados en cosos de tercera, 7.536, seguidos de los de plazas portátiles con 4.800 y segunda con 656. En otros recintos se celebraron más de 9.229 festejos.

**Por años**

Este trabajo estadístico muestra la evolución de los festejos a través de los años, en la que se observa el pico más alto en 2011 con 2.059 festejos, produciéndose un descenso en los años siguientes, en los que se mantiene entre 1.600 y 1.700 festejos hasta la pandemia. Después de esta vuelve a superar los 1.600 en 2022 y baja ligeramente en 2023 y 2024, pero manteniéndose en esos dos años por encima de los 1.500.

Por tipo de festejo, el año que más corridas de toros presenta es 2010, seguido de 2018 y 2022. Si atendemos a las novilladas, el año que más es 2010 seguido de 2011, bajando desde 2012 a la mitad y manteniendo a partir de ahí esa misma línea. El informe demuestra que septiembre es el mes más taurino en Castilla-La Mancha.

**Número de reses**

El total de reses lidiadas fue de 67.846, siendo el año posterior a la pandemia el de mayor número, con 6.160 animales. Destacan los más de 29.000 novillos y las más de 18.000 vacas.

**Asistencia**

La asistencia se situó entre 2010 y 2018 por encima de las 800.000 personas, superándose los 900.000 espectadores en 2023 y 2024.

**Enlace al informe completo**
	<a
  href="https://app.powerbi.com/view?r=eyJrIjoiY2Y1N2NhNmMtMzAyNy00OTQzLWE0N2QtZDA0NDBhNzEyY2Y5IiwidCI6Ijg5MTdiYmExLTMwZmYtNDQyNy1iYTYxLTA0OGNmMGE5ZTc0NyIsImMiOjl9"
  target="_blank"
  rel="noopener noreferrer"
  style="color:#2563eb; text-decoration:underline; font-weight:500;"
>
  https://app.powerbi.com/view?r=eyJrIjoiY2Y1N2NhNmMtMzAyNy00OTQzLWE0N2QtZDA0NDBhNzEyY2Y5IiwidCI6Ijg5MTdiYmExLTMwZmYtNDQyNy1iYTYxLTA0OGNmMGE5ZTc0NyIsImMiOjl9
</a>`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 289,
    title: `Borja Jiménez, protagonista en la II Gala de Premios de la Asociación Cultural Taurina ‘Chenel y Oro’ en Las Ventas`,
    image: "/images/protagonista1.jpg",
    category: "Actualidad",
    date: "14 de Diciembre de 2025",
    fullContent: `**La Asociación Cultural Taurina ‘Chenel y Oro’** celebró el pasado sábado 13 de diciembre la segunda edición de su Gala de Premios, un acto que tuvo lugar a partir de las 12:00 horas en la Sala Antonio Bienvenida de la Plaza de Toros de **Las Ventas**.

El momento más destacado de la jornada fue la entrega del premio a la mejor faena de la temporada, que recayó en **Borja Jiménez** por su histórica actuación frente al toro ‘**Milhijas**’, de la ganadería de **Victorino Martín**, lidiado el pasado mes de junio en el coso venteño.

Durante la gala también se procedió a la entrega de los reconocimientos correspondientes al **II Premio Internacional ‘Joven por la Tauromaquia’**, distinguiendo a jóvenes premiados por su compromiso y defensa de la Fiesta, así como a distintos profesionales que han sobresalido a lo largo de la temporada 2025 en Las Ventas, en un acto que puso en valor a todos los estamentos del toreo.

En las diferentes categorías, los galardones fueron concedidos a:
• Saltillo, mejor encierro  
• “Brigadier”, de Pedraza de Yeltes, mejor res lidiada  
• **Víctor Hernández**, mejor torero  
• **Borja Lorente**, mejor puyazo  
• **Iván García**, mejor hombre de plata  
• **Víctor del Pozo**, mejor par de banderillas  
• **Raúl Ruiz**, mejor brega  
• **Morante de la Puebla**, mejor estocada  
• **Ignacio San Juan**, mejor presidente  
• **Isaac Fonseca** y su cuadrilla, reconocimiento a la buena lidia  
• **Borja Jiménez**, mejor faena  

Asimismo, la asociación hizo entrega del **Premio Gabriel Carvajal** a la mejor fotografía taurina, que fue otorgado al fotógrafo **Aritz Arambarri** por una imagen de Morante de la Puebla captada en Salamanca.

La gala concluyó consolidando, una vez más, a Las Ventas como epicentro del reconocimiento a la excelencia taurina y al trabajo de todos los profesionales que dan forma a la temporada.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
   },		
	{ 
    id: 290,
    title: `Plaza 1 avanza en la confección de San Isidro 2026`,
    image: "/images/plaza1.jpg",
    category: "Actualidad",
    date: "14 de Diciembre de 2025",
    fullContent: `Plaza 1 avanza de manera firme en la confección de la **Feria de San Isidro 2026**, el abono más relevante de la temporada. Aunque la presentación oficial de los carteles tendrá lugar el **5 de febrero**, en una gala que se celebrará sobre el ruedo de **Las Ventas** y pendiente aún de la aprobación del Consejo de Asuntos Taurinos de la Comunidad de Madrid, las combinaciones quedarán prácticamente definidas antes de Navidad.

El serial estará marcado por un acontecimiento de especial trascendencia: la **Corrida In Memoriam** en homenaje a **Ignacio Sánchez Mejías**, programada para el **domingo 14 de junio**. El festejo contará con seis toros —tres de **Victoriano del Río** y tres de **Domingo Hernández**— que serán lidiados en solitario por **Borja Jiménez**, en una de las apuestas más singulares y simbólicas del abono.

Entre los nombres propios del ciclo, **Alejandro Talavante** será uno de los toreros con mayor protagonismo al actuar en tres tardes: abrirá la feria el **8 de mayo** con **Núñez del Cuvillo**, hará el paseíllo en la **Corrida de Beneficencia** con **Victoriano del Río** y completará su participación con un encierro de **Garcigrande**, junto a **Emilio de Justo** y **Pablo Aguado**.

**Andrés Roca Rey** doblará actuación en San Isidro, interviniendo en la Beneficencia y en una de las dos corridas de **Juan Pedro Domecq** incluidas en el abono. **Juan Ortega**, por su parte, actuará en dos tardes con toros de **Puerto de San Lorenzo** y **Núñez del Cuvillo**, esta última previsiblemente junto a una confirmación de alternativa.

Tras su brillante actuación en la pasada **Feria de Otoño**, **Emilio de Justo** ha optado por una presencia más selectiva, limitándose a dos festejos de máximo relieve, con los hierros de **Victoriano del Río** y **Garcigrande**. Decisión similar ha tomado **Tomás Rufo**, que además apostará por el encierro de **La Quinta**.

Especial protagonismo tendrá **Víctor Hernández**, que se perfila como uno de los nombres fuertes del ciclo con tres tardes junto a figuras, con las ganaderías de **Juan Pedro Domecq**, **Jandilla** y **Victoriano del Río**.

**Fernando Adrián** podría comparecer también en tres festejos, incluyendo las corridas de **Victorino Martín**, **Fuente Ymbro** y el tradicional festejo del **15 de mayo**, junto a **Diego Urdiales** y una confirmación de alternativa.

Entre las ganaderías confirmadas figuran **Victoriano del Río** (dos tardes y media), **Juan Pedro Domecq** (dos), **Garcigrande**, **Jandilla**, **Alcurrucén**, **Victorino Martín**, **José Escolar**, **Conde de Mayalde**, **Puerto de San Lorenzo**, **Fuente Ymbro**, **Adolfo Martín**, **Dolores Aguirre**, **Partido de Resina**, **El Parralejo**, **Laguna Janda**, **Araúz de Robles**, **La Quinta**, **El Pilar** y **Pedraza de Yeltes**, entre otras.

**Avance completo de combinaciones**

• **2 de mayo – Corrida Goyesca**
Toros por definir para **Uceda Leal**, **Javier Cortés** y un tercer espada por confirmar.

• **8 de mayo – Apertura de feria**
Toros de **Núñez del Cuvillo** para **Alejandro Talavante**, **Juan Ortega** y una confirmación.

• **15 de mayo – San Isidro**
Toros de **El Torero** para **Diego Urdiales**, **Fernando Adrián** y una confirmación.

• Toros de **Victoriano del Río** para **Sebastián Castella**, **Emilio de Justo** y **Tomás Rufo**.

• Toros de **Juan Pedro Domecq** para **Diego Urdiales**, **Andrés Roca Rey** y una confirmación.

• Toros de **Juan Pedro Domecq** para **Víctor Hernández** y otros dos toreros por definir.

• Toros de **Garcigrande** para **Alejandro Talavante**, **Emilio de Justo** y **Pablo Aguado**.

• Toros de **Jandilla** para **José María Manzanares**, **Borja Jiménez** y **Víctor Hernández**.

• Toros de **Victorino Martín** para **Fernando Adrián**, **Román** y un tercer espada.

• Toros de **José Escolar** para **Damián Castaño**, **Gómez del Pilar** y un torero más.

• Toros de **Conde de Mayalde** para **Román** y otros dos diestros.

• Toros de **Puerto de San Lorenzo** para **José María Manzanares**, **Juan Ortega** y **Pablo Aguado**.

• Toros de **Fuente Ymbro** para **Miguel Ángel Perera**, **Paco Ureña** (posible) y **David de Miranda**.

• Toros de **Adolfo Martín** para **Antonio Ferrera**, **Manuel Escribano** y un tercero por confirmar.

• Toros de **Partido de Resina** para **Calita**, **Luis Gerpe** y **Jesús Enrique Colombo**.

• Toros de **El Parralejo** para **Sebastián Castella**, **Daniel Luque** y **Samuel Navalón**.

• Toros de **La Quinta** para **Uceda Leal**, **Daniel Luque** y **Tomás Rufo**.

• Toros de **Dolores Aguirre** para **Juan de Castilla** y otros dos toreros.

• **Domingo, 7 de junio – Corrida de Beneficencia**
Toros de **Victoriano del Río** para **Alejandro Talavante**, **Andrés Roca Rey** y **Víctor Hernández**.

• **Domingo, 14 de junio – Corrida In Memoriam**
Toros de **Victoriano del Río** y **Domingo Hernández** para **Borja Jiménez**, en solitario.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
   },
	{ 
    id: 291,
    title: `David de Miranda recibe en Pozoblanco el Premio 
“Paquirri” al triunfador de la feria`,
    image: "/images/paquirri1.jpg",
	footerImage1: "/images/paquirri.jpg",
    category: "Actualidad",
    date: "14 de Diciembre de 2025",
    fullContent: `Pozoblanco acogió en la jornada del viernes 12 de diciembre, la entrega de los Premios “Paquirri” a los triunfadores de la Feria Taurina de Pozoblanco 2025, galardones concedidos por la Asociación Puerta El Gallo, en un acto celebrado en el reconocido Hotel La Noriega y enmarcado dentro de las I Jornadas Taurinas organizadas por la citada entidad.

El gran protagonista de la noche fue el matador de toros David de Miranda, quien recibió el Premio “Paquirri” al triunfador de la Feria, 
en reconocimiento a su destacada actuación en el ciclo taurino pozoalbense. 

Asimismo, el diestro onubense fue distinguido con el galardón a la mejor 
faena, rubricando así una feria de alto nivel artístico y profesional.

El palmarés de la edición se completó con el reconocimiento a Manuel 
Quintana, distinguido como mejor novillero, y a Cayetano Muñoz, premiado como mejor ganadería, valorándose en ambos casos su aportación decisiva al buen desarrollo y brillantez de la feria. 

El acto contó con la presencia institucional del alcalde de 
Pozoblanco, Santiago Cabello, y del delegado de la Junta de Andalucía, Eduardo Lucena, quienes respaldaron con su asistencia una iniciativa que 
pone en valor la tradición taurina de la localidad y el esfuerzo de los profesionales del sector.

La entrega de premios estuvo moderada por el periodista Luis Miguel Parrado y se desarrolló en un ambiente de cordialidad y afición, reafirmando el compromiso de la Asociación Puerta El Gallo con la promoción y defensa de la tauromaquia en Pozoblanco.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 292,
        title: `Tres figuras para la corrida de Primavera en Brihuega`,
    image: "/images/figuras.jpg",
    category: "Actualidad",
    date: "13 de Diciembre de 2025",
    fullContent: `Brihuega celebrará el próximo 11 de abril, a las 17:30 horas, su tradicional Corrida de Primavera en la plaza de toros de la localidad alcarreña. El cartel reúne a José María Manzanares, que como ya anunció este medio estará presente , Juan Ortega y Andrés Roca Rey, tres figuras destacadas del escalafón actual.

Se lidiarán seis toros de las ganaderías Hermanos García Jiménez y Doña Olga Jiménez , ganaderías propietarias de la familia Matilla.

El festejo está organizado por FUNTAUSA, gestionado por Toño Matilla.


Las entradas ya están a la venta, con precios desde 27 euros, a través de la web
<a
  href="https://www.plazadetorosdebrihuega.es"
  target="_blank"
  rel="noopener noreferrer"
  style="color:#2563eb; text-decoration:underline; font-weight:500;"
>
  www.plazadetorosdebrihuega.es
</a>`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
   },
	{ 
    id: 293,
    title: `Nueva era balear: dos llenos históricos, un indulto y el renacer de la afición`,
    image: "/images/muro.jpg",
    category: "Actualidad",
    date: "12 de Diciembre de 2025",
    fullContent: `Balears Cambio de Tercio celebra una temporada 2025 histórica en las Islas Baleares, marcada por el renacer de la tauromaquia en toda su autenticidad, dignidad y esencia cultural. La entidad reafirma su objetivo de recuperar la tradición taurina en las islas elevando cada celebración al nivel artístico que merece y garantizando la continuidad de este patrimonio vivo.

 

La temporada comenzó el 14 de abril en Inca con una cita inolvidable: una corrida de Miura con Lea Vicens, Manuel Escribano y Jesús Enrique Colombo. El festejo registró un lleno absoluto, hasta el punto de colgar el cartel de “no hay billetes”, con numerosos aficionados quedándose fuera de la plaza. La jornada estuvo marcada por un hecho histórico: el debut de la rejoneadora Lea Vicens frente a la legendaria ganadería de Miura. Además, se produjo el esperado regreso de los menores de edad a los toros, con más de 350 entradas vendidas a jóvenes, señal del resurgir generacional de la afición balear. 

 

El 23 de julio, la agenda cultural impulsada por Balears Cambio de Tercio añadió un nuevo éxito con el concierto acústico de Estrella Morente y el visionado de la premiada película Tardes de Soledad, protagonizada por Roca Rey. El acto reunió a 2.000 personas y alcanzó igualmente el aforo completo, confirmando el interés del público balear por propuestas culturales vinculadas a la tradición taurina.

 

El 4 de agosto, nuevamente en Inca, se celebró una corrida concurso con reses de Adolfo Martín, Fermín Bohórquez, Partido de Resina y Fuente Ymbro, lidiadas por Andy Cartagena, Antonio Ferrera y Borja Jiménez. La tarde dejó momentos imborrables, entre ellos el indulto de “Calderero”, de Fuente Ymbro, a cargo de Borja Jiménez, un hito por tratarse del último toro indultado en las Islas Baleares. La ganadería recibió además el primer premio Rulero de Oro por la bravura de su ejemplar, mientras los tres toreros lograron los máximos trofeos, ofreciendo una de las jornadas más brillantes de la temporada.

 

Otro acontecimiento histórico se vivió el 14 de septiembre en Muro, donde la plaza de toros reabrió sus puertas tras ocho años cerrada. El regreso no pudo ser más rotundo: nuevo lleno absoluto y una tarde que concluyó con los tres toreros —Javier Conde, David de Miranda y Marco Pérez— saliendo a hombros. Destacó también la vuelta al ruedo del toro “Potrico”, con una afición que volvió a demostrar su fuerza, su emoción y la enorme vitalidad que la tauromaquia mantiene en las Islas Baleares.

 

La temporada concluyó el 7 de diciembre en Muro con un festival taurino que reunió a once toreros y ganado de 45.50, Enrique Ponce, Monte la Ermita y Samuel Flores. La jornada se desarrolló con un ambiente de éxito rotundo y una alta participación de aficionados, confirmando nuevamente el interés creciente por las celebraciones taurinas en la isla. 
Para cerrar esta intensa temporada, Balears Cambio de Tercio ha querido dirigirse a la afición balear con un mensaje firmado por **D. Francisco D’Agostino** y **D. Javier Conde**, quienes expresan su más profundo agradecimiento al público:
“Gracias a vosotros hemos demostrado al mundo que la tauromaquia balear está más viva que nunca y que goza de una salud espléndida. Nuestro deber y compromiso es seguir trabajando por y para vosotros, con la misma ilusión y entrega que nos habéis regalado. Gracias por hacer historia con nosotros”.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
   },
	{ 
    id: 294,
    title: `David de Miranda, Morante, Talavante, Emilio de Justo, Borja Jiménez, y Aguado candidatos a la oreja de oro de RNE`,
    image: "/images/premio oreja.jpg",
    category: "Actualidad",
    date: "12 de Diciembre de 2025",
    fullContent: `Un año más, Radio Nacional de España celebrará uno de los reconocimientos más emblemáticos del panorama taurino. Los premios que otorga el veterano programa Clarín, la “Oreja de Oro” al diestro más destacado de la temporada y el “Hierro de Oro” a la ganadería más sobresaliente del curso, se han consolidado como una referencia ineludible en el balance anual de la tauromaquia.

Tras la primera ronda de votaciones en la que participan los colaboradores –30 críticos en la materia tanto nacionales como internacionales– del espacio radiofónico como sus oyentes, ya se ha configurado la lista de seis candidatos que optarán a la prestigiosa “Oreja de Oro”. Entre ellos destaca el nombre del onubense David de Miranda, cuya temporada ha despertado elogios dentro y fuera del circuito taurino. Su inclusión entre los finalistas confirma el respaldo que ha recibido por parte de la afición, que ha seguido con atención su evolución y sus triunfos en plazas de diversa categoría.

“Para mí es una enorme alegría estar entre los seis semifinalistas de la Oreja de Oro. Es la primera vez que opto a un galardón de esta importancia y, sinceramente, me hace muchísima ilusión. Cuando uno ve su nombre junto al de toreros a los que admira y respeta, siente que todo el esfuerzo y los sacrificios de la temporada han merecido la pena.

Me llena de satisfacción que los colaboradores del programa y los oyentes hayan pensado en mí para esta candidatura. Es un impulso muy bonito, un reconocimiento que recibo con humildad y con el compromiso de seguir creciendo como torero y de seguir honrando mi profesión cada tarde. Pase lo que pase, estar en esta lista ya es un premio en sí mismo.” Expresó De Miranda.

Junto a David de Miranda completan la nómina de aspirantes figuras de primera línea como: Morante de la Puebla, Alejandro Talavante, Emilio de Justo, Borja Jiménez y Pablo Aguado. Seis nombres que representan estilos, trayectorias y sensibilidades distintas, y que prometen una competencia reñida en la recta final de las votaciones.

Mientras tanto, el galardón paralelo del “Hierro de Oro” también centra expectativas entre las ganaderías más notables del año, aunque la organización aún no ha revelado las candidaturas oficiales. El anuncio de ambos premios se ha convertido en una tradición esperada por los aficionados y la resolución final se dará a conocer en las próximas semanas, cuando RNE haga público el resultado definitivo.`,
	author: "Manolo Herrera",
    authorLogo: "/images/manoloherrera.jpg",
    showAuthorHeader: true
  },
	{ 
    id: 295,
    title: `Pablo Aguado llena el Hotel Oriente en un encuentro memorable con la afición catalana organizado por UTYAC`,
    image: "/images/utyac.jpg",
    category: "Actualidad",
    date: "12 de Diciembre de 2025",
    fullContent: `La afición taurina catalana volvió a demostrar su fidelidad en el acto organizado por la siempre activa **UTYAC**, que reunió a un centenar de asistentes en el histórico **Hotel Oriente de Las Ramblas de Barcelona** —el mismo en el que se hospedaba Manolete cuando toreaba en La Monumental— y que pronto colgó el cartel de «no hay billetes».

El encuentro consistió en una conversación cercana y dinámica de más de una hora entre **Pablo Aguado** y Gerard Mas, miembro de UTYAC. El torero sevillano expresó su satisfacción por compartir este espacio con la afición catalana, destacando la capacidad de resistencia y compromiso que mantiene viva la llama del toreo en Barcelona pese a la adversidad. Con un discurso pausado, reflexivo y salpicado, cuando procedía, de ese ingenio sevillano que lo caracteriza, Aguado abordó cuestiones sobre su trayectoria profesional, su concepto del toreo y sus principales referentes. El moderador recordó, a propósito de su naturalidad, la célebre máxima belmontina: «Se torea como se es».

Durante el turno de preguntas, el diestro profundizó en su reciente experiencia cinematográfica con Albert Serra, una pieza derivada de la premiada Tardes de soledad y concebida como instalación museística, ya expuesta en Bruselas hace unas semanas. Asimismo, desmintió cualquier mala relación con Roca Rey y, al ser consultado por su cartel ideal en un hipotético regreso de los toros a Barcelona, citó sin vacilar a **Pepe Luis Vázquez y a Curro Romero como compañeros de terna**.

Con este acto, UTYAC continúa una línea de encuentros que en los últimos meses ha contado con figuras como **Paco Ureña, Albert Serra, Juan Ortega o Uceda Leal**, demostrando una vez más que la afición catalana permanece viva y esperanzada, pese al cierre de La Monumental y en espera del día en que la tauromaquia recupere su espacio natural en la ciudad.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 296,
    title: `Rui Bento se incorpora a la empresa FIT y acompañará a Daniel Luque la próxima temporada`,
    image: "/images/rui.jpg",
    category: "Actualidad",
    date: "12 de Diciembre de 2025",
    fullContent: `Fusión Internacional por la Tauromaquia (FIT), empresa perteneciente al Grupo Taurino Internacional (GTI), ha incorporado a sus filas a Rui Bento Vasques, reconocido por su amplia y prestigiosa trayectoria en el ámbito taurino.

Con esta integración, Rui Bento pasará a formar parte del equipo encabezado por Antonio Barrera —representante y director de GTI en España— en las labores de apoderamiento de Daniel Luque, acompañando al torero durante la temporada y reforzando la dirección de su carrera profesional.

Daniel Luque, considerado uno de los diestros más destacados del escalafón y protagonista de numerosas actuaciones de éxito en las últimas temporadas, está apoderado por FIT desde la finalización de su campaña europea. Esta alianza nació con el objetivo de impulsar aún más la carrera del matador de Gerena y situar su nombre en las más altas cotas del toreo.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 297,
    title: `Telemadrid retransmitirá al completo la Feria de San Isidro`,
    image: "/images/telemadrid.jpg",
    category: "Actualidad",
    date: "12 de Diciembre de 2025",
    fullContent: `La Feria de San Isidro de Madrid volverá a ser retransmitida íntegramente por Telemadrid. Así lo ha confirmado el presidente de Plaza 1, Rafael García Garrido, en una entrevista concedida al diario ABC. “Puedo avanzar que Telemadrid emitirá nuevamente la feria al completo y, además, los fines de semana se sumarán otras cadenas autonómicas”, señaló el empresario.

Será el segundo año consecutivo en que la cadena autonómica ofrezca en abierto el ciclo taurino más relevante de la temporada. La Feria de San Isidro dará comienzo el 8 de mayo y se prolongará hasta el 7 de junio, fecha en la que tendrá lugar la corrida In Memoriam en homenaje a Ignacio Sánchez Mejías, y en la que Borja Jiménez lidiará en solitario seis toros. El 14 de junio se celebrará, por su parte, la tradicional Corrida de la Beneficencia.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 298,
    title: `Mario Navas, apoderado por Jesús de Alba`,
    image: "/images/navas.jpg",
    category: "Actualidad",
    date: "12 de Diciembre de 2025",
    fullContent: `El matador de toros Mario Navas y Jesús de Alba han sellado un nuevo apoderamiento rubricado con el clásico apretón de manos. En un comunicado emitido a este medio, Mario Navas ha destacado que ‘Jesús de Alba es la persona indicada para poder formar un buen equipo para la consecución de sus objetivos’.

Por su parte, Jesús de Alba vuelve a apostar por otro torero de clase, con un concepto propicio para abrirse paso en el escalafón.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 299,
    title: `Luis Bolivar y Román nueva relación de apoderamiento`,
    image: "/images/luis.jpg",
    category: "Actualidad",
    date: "11 de Diciembre de 2025",
    fullContent: `El matador valenciano **Román Collado** ha dado un paso decisivo en su carrera al anunciar que, a partir de esta temporada, será apoderado por el también matador **Luis Bolívar**, figura de reconocida experiencia en los ruedos internacionales.

Este acuerdo marca una apuesta estratégica para el futuro de Román, que confía en la sólida trayectoria y el profundo conocimiento del nuevo apoderado para afrontar con mayor proyección y rigor los próximos retos profesionales. Ambas partes han definido esta unión como un proyecto de largo recorrido, basado en la confianza, la ambición y el objetivo común de impulsar la evolución artística del torero.

Con la mirada puesta en la temporada 2026, Román continúa desarrollando su preparación invernal. Su siguiente compromiso será el **27 de diciembre en la Feria de Cali (Colombia)**, uno de los ciclos taurinos más relevantes del continente americano y un escenario idóneo para inaugurar esta nueva etapa.

El acuerdo entre Román y Luis Bolívar, de carácter indefinido, nace con la voluntad de fortalecer la proyección del diestro valenciano y encarar con determinación los desafíos de la próxima campaña.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 300,
    title: `Talavante, Perera y el debut de Borja Jiménez lideran los carteles del Carnaval del Toro 2026 en Ciudad Rodrigo`,
    image: "/images/talavante.jpg",
    category: "Actualidad",
    date: "10 de Diciembre de 2025",
    fullContent: `La Comisión del Carnaval del Toro 2026, encabezada por su presidente, Ramón Sastre y con la presencia de Marcos Iglesias, Alcalde de Ciudad Rodrigo, ha presentado durante este mediodía la composición completa de los dos festivales y la novillada con picadores del Carnaval del Toro 2026.

Una lista donde destacan elementos como la celebración de los 20 años de alternativa Alejandro Talavante, pregonero del Carnaval este año, la presencia de toreros formados en la Escuela de Tauromaquia de Salamanca en todos los carteles organizados por el consistorio y el retorno de varios nombres como Diego Urdiales o El Mene, entre otros.
Así como el debut de Borja Jiménez como matador y el regreso de Miguel Ángel Perera.

**SÁBADO 14 DE FEBRERO – Festival Taurino con Picadores**

4 novillos de Talavante para Diego Urdiales, Alejandro Talavante, Pablo Aguado y El Mene.

**DOMINGO 15 DE FEBRERO – Novillada sin Picadores y Rejones**

4 novillos de Orive para el 2º, 3º, 4º y 5º clasificado del Bolsín Taurino 2026 / 1 astado para el rejoneador Víctor Herrero.

**LUNES 16 DE FEBRERO – Novillada con Picadores**

4 novillos de Sánchez Herrero para Tomas Bastos, Julio Méndez, Felix San Román y Diego Mateos (Debut con picadores)

**MARTES 17 DE FEBRERO – Festival Taurino con Picadores**

3 novillos de Juan Manuel Criado para Miguel Ángel Perera, Borja Jiménez, Manuel Diosleguarde y 1 novillo de Orive para el Triunfador del Bolsín`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 301,
    title: `La A.A.E.T. “Pedro Romero” cerró una temporada 2025 histórica y recibió un reconocimiento internacional por su labor formativa`,
    image: "/images/aaet.jpg",
    category: "Actualidad",
    date: "10 de Diciembre de 2025",
    fullContent: `La **Temporada 2025** quedó marcada como una de las más memorables para la **Asociación Andaluza de Escuelas Taurinas “Pedro Romero” (A.A.E.T.)**, que, bajo la presidencia de **Eduardo Ordóñez**, logró cumplir con creces los objetivos previstos del **Proyecto de Fomento de la Cultura Taurina de Andalucía 2025**, que contó con la figura de **Borja Jiménez** como **padrino de lujo** de la temporada de las Escuelas Taurinas de Andalucía.
La A.A.E.T. “Pedro Romero” consolidó de nuevo su reputación como principal referente formativo de la tauromaquia en **España**. La entidad culminó un año de intensa actividad con un **reconocimiento internacional** que confirmó el peso de su labor en la promoción de nuevos valores y en la defensa de la cultura taurina andaluza.

**Un galardón internacional a más de tres décadas de trabajo**

Durante la temporada, la A.A.E.T. “Pedro Romero” fue distinguida con uno de los premios centrales de la **VI Bienal Internacional de la Tauromaquia**, organizada por la **Asociación Tauromundo** y en colaboración con la **Fundación Cultura Taurina Jerez de la Frontera**, celebrada los días **24, 25 y 26 de octubre de 2025** en el **Alcázar de Jerez de la Frontera**.
El galardón se concedió como apoyo adicional a la candidatura de la ciudad para ser **Capital Europea de la Cultura 2031**, en un marco cultural de gran relevancia.

El jurado reconoció la trayectoria de “**más de 30 años de continuo Proyecto de Fomento de la Cultura Taurina Andaluza con la permanente promoción de los nuevos valores del toreo**”.
La asociación, que aglutinó este año a **31 escuelas taurinas** repartidas por toda Andalucía, recibió el **Premio al Fomento y Promoción de la Cultura Taurina** durante la gala celebrada el 25 de octubre. Este reconocimiento subrayó el impacto sostenido de la entidad en la construcción del futuro del toreo.

**Una labor sostenida por la Junta de Andalucía y Canal Sur Tv**

El crecimiento del proyecto formativo durante 2025 no habría sido posible sin el decidido apoyo de la **Junta de Andalucía**, que mantuvo una apuesta firme por el desarrollo de las escuelas taurinas.
El consejero de la Presidencia, **Antonio Sanz**, destacó durante la temporada que la entidad “**no paraba de crecer y de ayudar a las nuevas generaciones de toreros a cumplir sus sueños**”.
Sanz recordó también que, en los **últimos 26 años**, más de **10.000 jóvenes** habían pasado por las escuelas, de las cuales surgieron varios centenares de novilleros, banderilleros y hasta **109 matadores de toros**.

La difusión y el éxito del proyecto contaron además con la colaboración determinante de **Canal Sur Televisión**, que volvió a apostar por la emisión íntegra de los ciclos formativos.
Bajo la dirección de **Juande Mellado** y con el equipo de retransmisiones integrado por **Enrique Romero**, **Ruiz Miguel** y **Noelia López**, la cadena autonómica registró durante el año importantes cuotas de pantalla, alimentadas por el creciente interés del público hacia los jóvenes aspirantes y la calidad de los espectáculos.

**Las Escuelas impulsan los récords de audiencia históricos en las retransmisiones de Canal Sur Tv**

El reciente curso taurino ha vuelto a poner de manifiesto el papel esencial que desempeñan las escuelas taurinas en la promoción y renovación de la fiesta.
Su trabajo formativo y su capacidad para atraer nuevos talentos han sido decisivos no solo en el éxito del proyecto, sino también en el notable interés generado entre los espectadores.

Prueba de ello es el **récord de audiencia histórico** alcanzado durante la **5ª selección celebrada en Navas de San Juan, el 2 de agosto de 2025**, que registró un **20,00 %** de cuota de pantalla.
Este seguimiento masivo confirma que los festejos protagonizados por los jóvenes valores formados en las escuelas taurinas mantienen viva la expectativa y la emoción entre la afición.

A lo largo del ciclo, compuesto por **15 festejos emitidos**, la media de audiencia alcanzó un **14,30 %**, consolidando estas retransmisiones como uno de los contenidos más sólidos y seguidos dentro de la programación taurina.
Aunque Canal Sur Televisión ha sido un canal clave para su difusión, son las **escuelas taurinas** -con su esfuerzo, dedicación y capacidad para descubrir nuevos talentos- las verdaderas impulsoras de estos logros, convirtiéndose en el motor fundamental del creciente interés del público.

**Un año repleto de citas clave y talento emergente**

La **Temporada 2025** se caracterizó por un amplio calendario de actividades en las que se combinaron formación, oportunidad y competitividad.
Entre los hitos más destacados se encontraron:

**78 Erales** de las siguientes ganaderías: Las Monjas, Toros de El Torero, Martín Lorca, El Añadío, Los Millares, Chamaco, Aquilino Fraile, Condessa de Sobral, Apolinar Soriano.

**59 Becerros** de las siguientes ganaderías: Alvalle, El Rodeo, Isabel Sánchez de Alva, Diego Curiel, Los Millares, Las Monjas, Aquilino Fraile, Martín Lorca, Chamaco, Espartaco y Martín Carrasco.

**XXVI Encuentro Andaluz de Escuelas Taurinas**

El encuentro se desarrolló en Baeza (25 y 26 de octubre) y en Navas de San Juan (1 y 2 de noviembre), reuniendo a **más de 30 alumnos** de distintos centros de Andalucía.
El evento volvió a consolidarse como una plataforma esencial para la proyección de los jóvenes valores.

**XXVII Ciclo de Becerradas**

El ciclo contó con **seis festejos clasificatorios** celebrados en Ubrique, Castellar, Dos Torres, Algeciras, Sanlúcar de Barrameda y Almadén de la Plata.
La **gran final**, celebrada el **7 de septiembre** en el Coso de Los Donceles de Lucena, proclamó vencedor al alumno de la Escuela Taurina de Camas, **Manuel Real “Realito”**, que abrió la **Puerta Grande** tras una faena de enorme temple y madurez.
El segundo y tercer puesto recayeron en **Pablo Sánchez** (E.T. Almería) y **Rogelio Pajuelo** (E.T. Ubrique).

**XXXI Ciclo de Novilladas sin Picadores en Clase Práctica**

Retransmitido al completo por Canal Sur Televisión, el ciclo fue presentado previamente en la **Real Maestranza de Caballería de Sevilla**.
Se celebraron **11 novilladas**, distribuidas entre junio y septiembre, dentro del Proyecto de Fomento de la Cultura Taurina de Andalucía 2025.
En total, el programa incluyó **24 festejos en 21 municipios andaluces**, consolidándose como uno de los pilares fundamentales del calendario taurino formativo.

Este ciclo alcanzó su **Gran Final**, el pasado **30 de agosto** en la Plaza de Toros de Villacarrillo (Jaén).
El alumno de la Escuela Taurina de Ubrique, **Javier Torres “Bombita”**, se alzó como un **triunfador absoluto** y recibió de manos del Sr. Alcalde D. Francisco Miralles y del Secretario General de Interior de la Junta de Andalucía, D. David Gil, el **capote de paseo**.
Los alumnos **Manuel Quintana** (E.T. Córdoba), **David Gutiérrez** (E.T. Badajoz) e **Isaac Galvín** (E.T. San Fernando) obtuvieron el 2º, 3º y 4º premio respectivamente.

Una gran final que también recordó en la lidia de sus astados a **D. Apolinar Soriano**, fiel amigo de las escuelas al que se homenajeó antes del inicio, con un recuerdo a su familia.

**Una dirección comprometida y un modelo consolidado**

El éxito alcanzado durante 2025 no fue casual, sino fruto de la constancia y el trabajo meticuloso de la junta directiva encabezada por **Eduardo Ordóñez, Francisco Ruiz Miguel, Miguel Serrano Falcón, Juan Repullo Muñoz, Juan Carlos Landrove González, Rafael Osorio Monterroso, Juan Rojas Viruez, José Luis Feria Fernández, Rafael Jiménez González, Manuel Ruiz Valdivia, Francisco Delgado Espino, Francisco Acedo Muñoz, Luis Ortiz Valladares, Antonio Luque Muñoz y Emilio Silvera González**.
Su dedicación aseguró un modelo educativo sólido, ético y exigente, capaz de transmitir no solo técnica taurina, sino valores y disciplina.

**Una temporada que reafirmó el liderazgo andaluz en la formación taurina**

La suma de logros, reconocimientos, apoyos mediáticos y participación consolidó la Temporada 2025 como una de las más brillantes de la A.A.E.T. “Pedro Romero”.
La combinación de tradición, pedagogía, institucionalidad y visibilidad mediática volvió a situar a Andalucía como **el principal semillero del toreo en España y un referente internacional**.

El cierre de la temporada dejó claro que el futuro de la tauromaquia seguirá estrechamente vinculado al trabajo profesional y continuado de las **escuelas taurinas andaluzas**.
Un futuro que ya se construye desde los ruedos menores, desde los valores y desde la firme vocación de quienes se preparan cada día para convertirse en los toreros del mañana.

**Balance del Presidente de la A.A.E.T. “Pedro Romero”, D. Eduardo Ordoñez**

El presidente de la A.A.E.T. “Pedro Romero”, **Eduardo Ordoñez**, ofreció un balance de la temporada 2025, subrayando que el éxito alcanzado no responde a un mérito aislado, sino a la **convergencia de múltiples esfuerzos** que han dado lugar a un año calificado como **histórico** para la Asociación.

Desde el comienzo del proyecto, explicó, se articuló un compromiso firme con los **ayuntamientos, las diputaciones provinciales y las diferentes concejalías**.
Determinante también ha sido la colaboración de la **Real Maestranza**, los **ganaderos**, los **mayorales**, los **transportistas de ganado** y los **hombres de plata**, cuyo trabajo silencioso, constante y profesional ha garantizado el rigor y la dignidad de cada jornada taurina.

Ordoñez destacó también el papel esencial de los **profesores, directores de las Escuelas Taurinas y colaboradores**, así como la labor de los **presidentes de plazas de toros**.
A ello se sumó el apoyo institucional de las **Delegaciones del Gobierno Andaluz** y la colaboración de los **medios de comunicación**.

En su intervención, el presidente dedicó un **agradecimiento muy especial a la afición**.
Su presencia en las plazas y su seguimiento a través de las retransmisiones televisivas evidencian el interés creciente por la tauromaquia de base.

De forma emotiva, Ordoñez reservó un recuerdo para quienes **nos dejaron durante este año**.
Miembros, colaboradores y amigos que seguirán formando parte del corazón de las Escuelas Andaluzas y permanecerán en nuestra memoria.

En este marco de reconocimientos, Ordoñez destacó la **donación de material taurino personalizado** realizada por **Andrés Roca Rey**, valorada en **30.000 euros**.
Este gesto demuestra la confianza que las figuras del toreo depositan en la labor de las Escuelas Andaluzas y recuerda que Roca Rey también se formó en ellas en **2013**.

Este reconocimiento puso de relieve cómo los **grandes referentes de la tauromaquia actual** siguen vinculados y agradecidos por su formación en Andalucía.

Finalmente, Ordoñez trasladó la **gratitud** de la Asociación y quiso subrayar el **máximo agradecimiento** a todas las instituciones, profesionales y aficionados cuyo apoyo ha hecho posible una **temporada histórica**.

Con estas palabras, la A.A.E.T. “Pedro Romero” revalida su compromiso con la formación, la cultura y el futuro de la tauromaquia, sustentado en quienes creen en la importancia de esta tradición viva y su transmisión a las nuevas generaciones.`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 302,
    title: `Garzón avanza novedades ganaderas y mantiene la incertidumbre sobre Morante en Sevilla`,
    image: "/images/garzon1.jpg",
    category: "Actualidad",
    date: "10 de Diciembre de 2025",
    fullContent: `El empresario **José María Garzón** anunció que la próxima temporada en la **Plaza de la Maestranza** podría incluir destacadas novedades ganaderas, entre ellas **La Quinta** y, “posiblemente”, **Álvaro Núñez**. Así lo confirmó durante su intervención en el programa Tarde de Toros, de Cope Sevilla, donde aseguró que **“hay ocho o nueve ganaderías básicas que tienen la corrida de Sevilla bien preparada”**.

Uno de los temas más esperados de la entrevista fue la situación de **Morante de la Puebla**, cuya presencia en los carteles sevillanos continúa siendo una incógnita. Garzón evitó ofrecer adelantos y explicó que el diestro **“está en un periodo de descanso” y aún no ha decidido si hará temporada en 2026. “La plaza de Sevilla está abierta para cuando quiera”**, subrayó.

Además, el nuevo gestor de la Maestranza reiteró su intención de **ampliar la Feria de San Miguel**, una medida que sigue en fase de estudio, y de poner en marcha un portal de comunicación directa con los abonados. Esta plataforma permitirá a los aficionados expresar opiniones y acceder a ventajas económicas y planes de fidelización.

Antes de concluir, Garzón confirmó también su intención de presentarse al próximo **pliego de Málaga**, un movimiento que apunta a reforzar su presencia al frente de algunas de las plazas más relevantes del panorama taurino.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 303,
    title: `Castellón presenta una Feria de la Magdalena 2026 de alto nivel`,
    image: "/images/castellon1.jpg",
    category: "Actualidad",
    date: "9 de Diciembre de 2025",
    fullContent: `La empresa Funtausa, dirigida por la **Casa Matilla**, ha hecho públicos los carteles de la **Feria de la Magdalena 2026**, un ciclo que reúne a figuras del toreo, nuevas promesas y algunas de las ganaderías más destacadas del elenco ganadero.

La feria abrirá el **8 de marzo con toros de La Quinta para Ginés Marín, Aarón Palacios y Javier Zulueta**.
El **9 de marzo será turno del rejoneo con Rui Fernandes, Diego Ventura y Lea Vicens**, que lidiarán reses de Los Espartales.

El **12 de marzo se celebrará una corrida de Montalvo con Miguel Ángel Perera, Tomás Rufo y Marco Pérez**, mientras que los carteles de máximo atractivo llegarían los próximos días, con combinaciones como **Manzanares, Roca Rey y Pablo Aguado** o **Sebastián Castella, Daniel Luque y Emilio de Justo**.

La feria concluirá el **15 de marzo con un esperado mano a mano entre Talavante y Juan Ortega**, como ya anunció este medio, poniendo el broche a una Magdalena que aspira a consolidarse entre las grandes citas del calendario taurino.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 304,
    title: `Nicolás Grande, el joven que reivindica la tauromaquia desde las redes: “Mi generación es el futuro de este arte”`,
    image: "/images/nicolas.jpg",
    category: "Entrevistas",
    date: "9 de Diciembre de 2025",
    fullContent: `Con apenas unos años de presencia en redes sociales, **Nicolás Grande** se ha convertido en una de las voces jóvenes más visibles en defensa de la tauromaquia. Estudiante de veterinaria y apasionado del toro, su discurso rompe clichés: no viene de una familia taurina ni creció rodeado de corridas, pero encontró en los sanfermines el inicio de una fascinación que marcaría su camino.

Por eso, desde Portal Tendido Digital hemos querido entrevistarle para conocerle algo más.

**Nicolás, estudias veterinaria. ¿Qué te llevó a interesarte por la tauromaquia, y cómo concilias ese amor por los animales con la defensa del espectáculo taurino?**

Mi verdadera pasión son los animales. El toro de lidia fue, desde el principio, lo que despertó mi interés por este espectáculo. Yo no vengo de una familia especialmente taurina, pero ver cada 7 de julio en las calles de Pamplona a esos animales majestuosos correr fue lo que me generó una fascinación enorme.
Respecto a la defensa de la tauromaquia, desde fuera puede parecer algo muy complejo. Sin embargo, cuando uno entiende la fiesta brava y se dedica a estudiarla, descubre un mar infinito de argumentos que la sustentan. Solo hace falta acercarse con la mente abierta.

**Has ganado visibilidad en Instagram/TikTok como joven defensor de la tauromaquia. ¿Cómo usas tus redes para comunicar tu visión? ¿Crees que las redes pueden cambiar la percepción de los toros entre la gente joven?**

Desde que empecé en redes no he parado de aprender. Me adentré en un mundo que desconocía por completo; de hecho, ni siquiera tenía TikTok: me lo descargué exclusivamente para empezar a crear contenido.
En un inicio quería hablar del mundo ganadero en general, ya que había trabajado en una ganadería de carne en Cantabria y me apasionaba la defensa del medio rural. Pero un día decidí subir un vídeo con argumentos a favor de la tauromaquia, y tuvo tanto éxito que me replanteó mi vocación.
Me di cuenta de que en redes faltaban creadores taurinos adaptados a los nuevos tiempos, capaces de llegar a un público joven. Ahí decidí enfocar mi contenido hacia una especie de “evangelización” de la tauromaquia desde un formato moderno.
Creo que antes era más fácil consumir tauromaquia, y que durante un tiempo se dejó de difundir este arte; pero gracias a las redes sociales puede volver a conectar con un público amplio.
Muchos asocian la tauromaquia con generaciones mayores.

**Tú representas una generación joven a favor del toreo. ¿Qué crees que puede aportar tu generación a la tauromaquia? ¿Qué interés ves hoy en jóvenes por este mundo?**

Mi generación es el futuro de todo. De nosotros depende la continuidad de nuestra cultura. Si no somos nosotros quienes ocupamos los tendidos, ¿quién lo hará?
Tenemos la responsabilidad de escuchar y aprender de nuestros mayores, de los toreros, de los escritores taurinos y de toda la sabiduría que ellos han acumulado, para en un futuro poder transmitirlo.
Aun así, hay un aspecto que me tranquiliza: los jóvenes empezamos a buscar referentes en una sociedad que muchas veces se percibe como vacía o sin héroes. En la tauromaquia muchos encuentran figuras valientes, personas que se juegan la vida por aquello que aman, mientras vemos a nuestros representantes políticos esconderse ante todo lo que no les beneficia.

**La tauromaquia está muy politizada, con defensores y detractores apasionados. ¿Cómo valoras ese contexto? ¿Piensas que hay una politización excesiva? ¿Qué espacio crees que ha de tener la tradición del toro en la sociedad actual? (Sobre todo por la zona de Barcelona)**

Es una pena que la cultura se politice. No ocurre solo con los toros: hoy en día prácticamente todo se usa para generar tensión y confrontación.
Existen numerosos ejemplos de personajes públicos que, independientemente de su ideología, acuden a las plazas. Por mencionar algunos, tanto Isabel Díaz Ayuso (del Partido Popular) como Joaquín Sabina (abiertamente socialista) disfrutan de la tauromaquia.
La fiesta no entiende de colores ni de partidos: es del pueblo y para el pueblo.
En cuanto a Barcelona, es triste ver cómo la familia Balañá sigue con su juego cobarde de mantener cerradas las plazas. Cataluña es taurina, y eso se refleja en los muchos pueblos de la comunidad donde se celebran festejos con más libertad que en la propia ciudad.
Aun así, tengo esperanza de que, con la ayuda de mi amigo Mario Vilau, logremos reabrir la Monumental.

**Si tuvieras que explicar a alguien que nunca ha visto un toro de lidia por qué te gusta la tauromaquia, ¿qué argumentos darías apelando a lo emocional, cultural o artístico?**

Le diría que es algo que, hasta que no lo vives, no lo puedes entender. Y aun viviéndolo, sigue siendo difícil de explicar.
Me gusta compararla con un cuadro abstracto: o tienes la sensibilidad para apreciar el arte que encierra, o simplemente no lo ves. No hay término medio. Puede hacerte vibrar en un buen natural, o puede parecerte solo un hombre con una capa roja.
Aun así, creo que cualquiera debería sentarse en un tendido al menos una vez para construirse una opinión real sobre los toros.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 305,
    title: `Sergio Rodríguez , sin apoderado`,
    image: "/images/abulense.jpg",
    category: "Actualidad",
    date: "9 de Diciembre de 2025",
    fullContent: `El matador de toros abulense Sergio Rodríguez se encuentra actualmente sin apoderado. Así lo ha comunicado el propio diestro en un post de Instagram en su cuenta oficial, anunciando así el fin de la relación profesional con Leandro Marcos y Manuel Canorea.

Una decisión que responde a lo expuesto en el comunicado tras no alcanzarse los objetivos establecidos al inicio del proyecto del apoderamiento, los cuales eran la base de la relación.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 306,
    title: `Tórtola de Henares acoge su 4º Coloquio Taurino el próximo 31 de enero`,
    image: "/images/tortola.jpg",
	imageCaption: "Por Eduardo Elvira",
    category: "Actualidad",
    date: "9 de Diciembre de 2025",
    fullContent: `**Tórtola de Henares** volverá a convertirse en punto de encuentro para los aficionados al mundo del toro con la celebración del **4º Coloquio Taurino**, que tendrá lugar el **sábado 31 de enero de 2026, a las 19:00 horas, en el Centro Municipal El Horno**, situado en la calle Narciso García Avellano, número 18.

El evento, organizado por **Pablo García Marcos** y con la colaboración del Ayuntamiento de Tórtola de Henares, reunirá a diversas figuras del ámbito taurino, desde matadores hasta novilleros y profesionales. Entre los participantes anunciados se encuentran el matador de toros **Jarocho**, el novillero con caballos **Daniel Moset**, el matador **David Galván**, el banderillero **Jorge Fuentes** y el presidente de la Escuela Taurina de Guadalajara, **José Antonio “Jota”**.

La mesa estará moderada por **Diego Cervera**, quien conducirá el diálogo y las reflexiones sobre la situación actual de la tauromaquia, la formación de nuevos talentos y los retos del sector.

El coloquio pretende fomentar la cercanía entre profesionales y aficionados, ofreciendo un espacio para el intercambio de opiniones y experiencias. La entrada será libre hasta completar aforo, por lo que se espera una notable asistencia de público.

Con esta cuarta edición, Tórtola de Henares consolida una iniciativa cultural que ya forma parte del calendario taurino provincial y que cada año atrae a un mayor número de gente.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 307,
    title: `La Feria de San Blas de Valdemorillo 2025 comienza a definirse con tres festejos y un mano a mano de alto interés`,
    image: "/images/sanblas.jpg",
	imageCaption: "Plaza de Toros Valdemorillo",
    category: "Actualidad",
    date: "8 de Diciembre de 2025",
fullContent: `La Feria de **San Blas de Valdemorillo, que se celebrará del 6 al 8 de febrero**, comienza a definir su estructura. El ciclo abrirá con **una novillada con picadores para seis novilleros**, recuperando el carácter de oportunidad que distingue a este inicio de temporada.

El segundo festejo será una corrida de **Torrealta con un cartel de corte clásico compuesto por Uceda Leal, Juan Ortega y Pablo Aguado**, combinación de estilos que apunta a una tarde de gran atractivo artístico.

Como cierre del abono, está previsto un mano a mano entre **Borja Jiménez y Tomás Rufo**, que lidiarán tres hierros distintos especialmente reseñados para la ocasión, en lo que se perfila como el plato fuerte de la feria.

Aunque la configuración aún es provisional, estos primeros avances muestran una programación equilibrada que volverá a situar a Valdemorillo en el centro del arranque taurino del año.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 308,
    title: `La FIT apuesta por Olivenza; 
Avance carteles 2026 `,
    image: "/images/fit.jpg",
    category: "Actualidad",
    date: "8 de Diciembre de 2025",
fullContent: `Los primeros rumores sobre los carteles de la **Feria Taurina de Olivenza 2026** empiezan a tomar forma, y todo apunta a que el ciclo experimentará un giro respecto al formato del año que termina. La empresa apostará por tres corridas de toros y una novillada con picadores, manteniendo la tradición del festejo inaugural del viernes, que en esta ocasión llevará el sello ganadero de **Alejandro Talavante**.

Según la información adelantada por el periodista **Vicente Zabala de la Serna**, la feria reforzará su apuesta por los jóvenes matadores, configurando un cartel matinal el domingo con **Borja Jiménez, David de Miranda y Víctor Hernández**, nombres que ya sonaban en los primeros esbozos de la programación.

La presencia del peruano **Roca Rey**, ausente en la última edición, será una de las grandes novedades. El torero está contratado en firme y encabezará el cartel estrella del **domingo 8 de marzo**, compartiendo paseíllo con **Alejandro Talavante y Emilio de Justo** ante toros de **Victoriano del Río**, en una cita que promete ser uno de los platos fuertes del serial.

Para el sábado, se anunciará una terna compuesta por **José María Manzanares, Daniel Luque y Juan Ortega**, quienes lidiarán un encierro de **Puerto de San Lorenzo**. El nombre de Daniel Luque también resalta por su continuidad en el ciclo, consolidándose como uno de los pilares del fin de semana.

En la matinal del domingo, todo indica que se lidiará una corrida de la prestigiosa divisa salmantina de **Domingo Hernández**, completando así un programa variado, equilibrado y con presencia de las ganaderías más destacadas del momento.

Aunque la estructura general de la feria parece encarrilada, el avance de los carteles sigue siendo provisional y susceptible de modificaciones. Sin embargo, todo apunta a que la línea definitiva de la edición 2026 ya está marcada: una feria que combina figuras, jóvenes emergentes y la recuperación de nombres esenciales para el aficionado, reforzando el peso de Olivenza como una de las plazas de referencia en el arranque de la temporada taurina.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 309,
    title: `Triunfo de la terna y Manuel de María que deslumbra en su debut en Alcaudete de la Jara`,
    image: "/images/triunfo.jpg",
    category: "Crónicas",
    date: "7 de Diciembre de 2025",
	footerImage1: "/images/foto1.jpg",
    footerImage1Caption: "Fotos de Luis Muñoz",
    footerImage2: "/images/foto2.jpg",
    footerImage3: "/images/foto3.jpg",
    footerImage4: "/images/foto4.jpg",
	plaza: "Plaza de toros de Alcaudete de La Jara (Toledo).",
	ganaderia: "Alcurrucen",
    torerosRaw: `Jesús Navalucillos (Escuela Taurina Domingo Ortega de Toledo) Dos Orejas 

Pablo Méndez (Escuela Taurina de Guadalajara)*Dos Orejas

Álvaro Sánchez (Escuela Taurina Domingo Ortega de Toledo) Dos orejas y rabo 

Manuel de María (Escuela Taurina José Cubero Yiyo de Madrid) Dos orejas y rabo.`,
fullContent: `En conjunto, los jóvenes alumnos mostraron su progreso, dejando patente su ilusión, entrega y buenas maneras ante los novillos de Alcurrucén. Cada uno, desde su propio momento de aprendizaje, logró conectar con los tendidos y ofrecer una tarde llena de espontaneidad y torería en formación.

Cerró el festejo **Manuel de María**, convirtiéndose en la sorpresa de la tarde en su debut. Con desparpajo, naturalidad y una serenidad impropia de su edad, conectó rápidamente con el público y dejó instantes de gran emoción.
**Su actuación fue una de las más celebradas del festejo y abrió un horizonte ilusionante.**

**Plaza de toros de Alcaudete de La Jara (Toledo)**. Clase práctica.
**Novillos de Alcurrucén**, de buen juego en su conjunto. Lleno en los tendidos.

**Jesús Navalcillos** (Escuela Taurina Domingo Ortega de Toledo) Dos Orejas
**Pablo Méndez** (Escuela Taurina de Guadalajara)*Dos Orejas
**Álvaro Sánchez** (Escuela Taurina Domingo Ortega de Toledo) Dos orejas y rabo
**Manuel de María** (Escuela Taurina José Cubero Yiyo de Madrid) Dos orejas y rabo.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 310,
    title: `Israel Guirao y Jaime Padilla, grandes triunfadores en el I Certamen Taurino “Linares, Cuna de Toreros”`,
    image: "/images/linares.jpg",
    category: "Crónicas",
    date: "6 de Diciembre de 2025",
	plaza: "Santa Margarita- Linares (Jaén)",
	ganaderia: "Apolinar Soriano (1º y 2º), Collado Ruiz, Sancho Dávila, Los Ronceles, Paco Sorando y El Añadio. Un encierro variado e importante por su comportamiento que resultó exigente y muy toreable en líneas generales.",
    torerosRaw: `MARTÍN MENDOZA, E.T. Camas; Ovación.

BLAS MÁRQUEZ, E.T. Linares; Oreja.

JAIME PADILLA, E.T. Málaga; Dos orejas y vuelta al ruedo al novillo.

JESÚS MOLINA, E.T. Linares; Oreja tras aviso.

DANIEL RIVAS, E.T. Linares; Oreja.

ISRAEL GUIRAO, E.T. Valencia; Dos orejas y rabo.

LISARES, E.T. Arles; Oreja.`,
fullContent: `El alumno de la escuela de Valencia cortó un rabo y el de Málaga dos orejas, ambos a hombros por la ‘Puerta Grande’



El emblemático Coso de Santa Margarita volvió a abrir sus puertas en plena festividad navideña, el sábado 6 de diciembre, para albergar el I Certamen Taurino “Linares, Cuna de Toreros”, un nuevo ciclo que nace con vocación de permanencia y que rinde tributo a dos figuras indispensables de la tauromaquia linarense: Apolinar Soriano y Pepe Luis Díaz. La ciudad, reconocida históricamente como auténtico semillero de toreros, reafirma así su compromiso con una tradición profundamente arraigada en su identidad cultural.

El certamen se concibe como un homenaje al legado taurino de Linares y, al mismo tiempo, como una apuesta decidida por el futuro del toreo. En esta primera edición, la plaza se convirtió en un escenario formativo de primer nivel, brindando una plataforma de proyección a 

jóvenes valores procedentes de distintas escuelas taurinas de España y del extranjero. La diversidad de procedencias y estilos enriqueció un encuentro en el que la cantera mostró solvencia, entrega y un notable nivel artístico.



Los alumnos participantes fueron: Martín Mendoza (Escuela Taurina de Camas); Blas Márquez, Jesús Molina y Daniel Rivas (Escuela Taurina de Linares); Jaime Padilla (Escuela Taurina de Málaga); Israel Guirao (Escuela Taurina de Valencia); y Lisares (Escuela Taurina de Arles). Se enfrentaron a un concurso de ganaderías compuesto por siete ejemplares de hierros 

de reconocido prestigio: Sorando, El Cotillo, Apolinar Soriano, Los Ronceles, Collado Ruiz, Sancho Dávila y El Añadío.



La jornada dejó una amplia variedad de matices y evoluciones artísticas



1º Martín Mendoza, ante “Urcola”, de Apolinar Soriano, abrió plaza con decisión, recibiendo a portagayola y cuajando un toreo al natural lleno de personalidad. La espada le privó de premio y recibió una ovación.

2º El linarense Blas Márquez, con “Presidiario”, también de Apolinar Soriano, firmó una faena clásica y cargada de gusto, destacando un luminoso toreo de capa. Cortó una oreja.

3º Jaime Padilla, con “Feroz”, de Collado Ruiz, protagonizó una de las actuaciones de mayor 

rotundidad. Su entrega, su expresividad y un espadazo perfecto le valieron dos orejas, mientras que el novillo fue premiado con la vuelta al ruedo.

4º Jesús Molina, ante “Lancito”, de Sancho Dávila, dejó una labor templada y armoniosa, iniciada de rodillas y construida con suavidad y expresión. Cortó una oreja, y el novillo fue premiado con vuelta al ruedo.

5º Daniel Rivas, con “Gobernante”, de Los Ronceles, demostró evolución y oficio ante un ejemplar que mejoró durante la lidia. Su faena, reposada y de buen trazo, fue premiada con unaoreja.

6º Israel Guirao, con “Labriego”, de Sorando, deslumbró por su madurez y firmeza. Su actuación, intensa y muy personal, culminó con un estoconazo que le abrió la puerta grande al cortar dos orejas y rabo.

7º Cerró la tarde Lisares, que recibió a portagayola a “Cabeza Loca”, de El Añadío. Pese a las complicaciones de su oponente, que buscó tablas con insistencia, el francés mostró raza, limpieza y capacidad, obteniendo una oreja.



El I Certamen Taurino “Linares, Cuna de Toreros” concluyó así con un balance altamente positivo, tanto por el nivel artístico de los participantes como por el ambiente de apoyo a la juventud taurina. Con esta iniciativa, Linares reafirma su papel fundamental en la historia del toreo y renueva su compromiso con la promoción y el impulso de nuevas generaciones que 

mantienen viva su tradición.

FICHA DEL FESTEJO:

Sábado 06 de diciembre de 2025

Plaza de Toros de Santa Margarita- Linares (Jaén)

I Certamen “Linares, cuna de toreros”

Entrada: Algo más de media plaza en tarde gris y fría.

Erales de varias ganaderías (por orden): Apolinar Soriano (1º y 2º), Collado Ruiz, Sancho Dávila, Los Ronceles, Paco Sorando y El Añadio. Un encierro variado e importante por su comportamiento que resultó exigente y muy toreable en líneas generales. Destacaron el 3º 

“Feroz” de Collado Ruiz, y el 4º “Lancito” de Sancho Dávila, premiados con la vuelta al ruedo. 
OBSERVACIONES: 

 Un evento que sirvió como homenaje póstumo a Apolinar Soriano y Pepe Luis Díaz,

figuras reconocidas del ámbito taurino local.

 Festejo en modalidad de ‘Clase Práctica’ y además Concurso de Ganaderías.

 Antes de romper sonó el Himno Nacional.

 Antes de comenzar el festejo se entregaron varios reconocimientos a los Ganaderos, 

Propiedad de la Plaza, Escuela Taurina de Linares y Canal Sur Tv. Todos recibieron 

una placa conmemorativa en presencia de la alcaldesa de Linares, Dña. María 

Auxiliadora del Olmo Ruiz. 

 Último festejo de la Temporada 2025 de las Escuelas y último también de las 

retransmisiones de Canal Sur Tv.

 El piso plaza se encontraba muy húmedo y con algunas zonas algo resbaladizas.

 Presidió el festejo en el palco D. José Luis Martín López`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 311,
    title: `Morenito de Aranda incorpora nuevas caras y consolida su cuadrilla de cara a la próxima temporada`,
    image: "/images/morenito1.jpg",
    category: "Actualidad",
    date: "6 de Diciembre de 2025",
    fullContent: `**Jesús Martínez “Morenito de Aranda”** ha cerrado definitivamente la composición de su cuadrilla para la próxima temporada, un año en el que el diestro burgalés inicia además una nueva etapa profesional bajo el apoderamiento de **Tito Fernández**, uno de los empresarios taurinos más relevantes de América y actual gestor del histórico Coso de Acho, en Lima.

En el apartado de picadores, Morenito de Aranda incorpora a **Adrián Majada**, quien formará tándem a caballo con **Héctor Piña**. En cuanto a los hombres de a pie, se mantiene el equipo habitual, aunque se suma **Jairo Pavón**, que actuará a las órdenes del torero burgalés en aquellas ocasiones en las que el madrileño **Iván García** no pueda hacerlo por la coincidencia de otros compromisos profesionales.

De este modo, la cuadrilla de Morenito de Aranda queda configurada de la siguiente forma:

**Picadores**
• Adrián Majada
• Héctor Piña

**Banderilleros**
• José Luis Triviño
• Iván García
• Pascual Mellinas
• Lidiador suplente: Jairo Pavón (intervendrá cuando no pueda actuar Iván García)

**Mozo de espadas**
• Antonio Pavón

**Apoderado**
• Tito Fernández`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 312,
    title: `Confirmada: La Goyesca de Madrid 2026`,
    image: "/images/goyesca1.jpg",
    category: "Actualidad",
    date: "6 de Diciembre de 2025",
    fullContent: `La temporada madrileña está a empezando a destapándose , la última notica que hemos conocido es el anuncio de otro de los carteles señaladas del inicio de temporada; la corrida Goyesca. 

Según ha confirmado el medio El Toril podemos saber que el cartel se compondrá de los toreros Curro Díaz , El Cid y Javier Cortés y la ganadería estaría todavía por definir. Un cartel muy propio para la afición madrileña y que se se propone como uno de los carteles de postín del inicio de la temporada .`,
  author: "Mario Ruiz Ruiz",
  authorLogo: "/images/mariorr.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 313,
    title: `El Museo Taurino Antonio Ortega homenajea a David Galván y presenta su nueva muestra sobre “Bohonero”`,
    image: "/images/museo.jpg",
    category: "Actualidad",
    date: "6 de Diciembre de 2025",
    fullContent: `El **Museo Taurino Antonio Ortega** celebró en la tarde de ayer, 5 de diciembre, un bonito homenaje al diestro gaditano **David Galván**, acto en el que además se presentó oficialmente la cabeza del toro “**Bohonero**”, ejemplar de **Victorino Martín**, al que el torero cuajó una gran faena en La Línea de la Concepción el pasado 20 de julio, logrando los máximos trofeos en la plaza de toros de El Arenal.

La obra que desde ayer pasa a formar parte de manera permanente de la colección del museo supone un testimonio de aquella tarde histórica, en la que Galván firmó una gran obra.

El acto reunió a destacadas personalidades del mundo taurino e institucional. Arropando al torero, estuvieron presentes el Maestro **Francisco Ruiz Miguel**; el también matador de toros y empresario del Coso del Arenal, **Curro Duarte**; el alcalde de La Línea, **Juan Franco**; el teniente alcalde y vicepresidente de Mancomunidad, **Juan Macías**; además de numerosos profesionales taurinos, aficionados y representantes de los medios de comunicación de la ciudad y la comarca.

Entre aplausos y palabras de reconocimiento, el homenaje se convirtió en un momento de especial significado para el torero, quien expresó su sincero agradecimiento por el cariño recibido. Y en un gesto torero, David Galván quiso donar al museo la muleta con la que lidió a “Bohonero”, una pieza que enriquece aún más el patrimonio cultural del Museo Antonio Ortega.`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 314,
    title: `Avance de Carteles de La Magdalena 2026; Un mano a mano como eje de la feria y ausencias importantes`,
    image: "/images/castellon.jpg",
	imageCaption: "Plaza de Toros de Castellón",
    category: "Actualidad",
    date: "5 de Diciembre de 2025",
    fullContent: `La **Casa Matilla** tiene muy avanzados —aunque aún sujetos a posibles ajustes fruto de las negociaciones— los carteles de la Feria de la Magdalena de Castellón, uno de los ciclos marcados en rojo en el arranque de la temporada taurina. Entre sus grandes atractivos, **destaca el mano a mano entre Alejandro Talavante y Juan Ortega, triunfador de la pasada edición**. Esta cita está prevista para el **domingo 16 de marzo** y contará con reses de **Domingo Hernández**, como ya avanzó este medio.

El mano a mano actuará como traca final de una feria cuya “mascletà” taurina se concentra entre el **14 y el 16 de marzo**.
Para el viernes, la empresa Funtasa prepara otro de los platos fuertes del abono con la presencia de **Roca Rey, que compartirá paseíllo con José María Manzanares y Pablo Aguado, en el regreso a Castellón de los toros de Hermanos García Jiménez**.

Según ha avanzado el periodista **Zabala de la Serna**, el **sábado 15** tomaría forma una combinación compuesta por **Sebastián Castella, Daniel Luque y Emilio de Justo, quienes lidiarían la corrida de Zalduendo**.
Por su parte, **Miguel Ángel Perera, Tomás Rufo y Marco Pérez harían lo propio con un encierro de Montalvo**, completando así un serial que, de confirmarse, supondría también la ausencia de la ganadería de **La Quinta**, protagonista en 2024 del indulto más recordado en esta plaza.

Más allá del atractivo de los carteles, el borrador de la feria deja tres ausencias especialmente llamativas: **Víctor Hernández, David de Miranda y Fernando Adrián no estarían anunciados en la Magdalena**. Tres nombres que llegan a este inicio de temporada con méritos más que suficientes para ocupar un hueco en una feria de esta categoría, tanto por sus triunfos recientes como por la proyección demostrada en los últimos meses.

Sus ausencias, de confirmarse, añadirían un punto de polémica a un ciclo que ya despierta gran expectación entre la afición.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 315,
    title: `Francisco José Porras , nuevo apoderado de Rafael Serna`,
    image: "/images/porras.jpg",
	imageCaption: "Foto ABC",
    category: "Actualidad",
    date: "5 de Diciembre de 2025",
    fullContent: `El matador sevillano Rafael Serna ha alcanzado un acuerdo verbal de apoderamiento con el diestro retirado Francisco José Porras para las próximas temporadas. Serna, considerado una de las mayores promesas del toreo sevillano, llega a este acuerdo tras su importante triunfo en Las Ventas durante la pasada Feria de San Isidro.

El torero se ha mostrado ilusionado con esta nueva etapa y asegura encontrarse en el mejor momento de su carrera. Porras, con experiencia como empresario y acompañante de otros toreros, afirma que Serna posee cualidades suficientes para hacerse un hueco destacado en el escalafón.

La alianza marca un paso clave para la proyección del matador de cara a la temporada 2026.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 316,
    title: `Curro Díaz y el empresario Jorge Buendía fin de apoderamiento`,
    image: "/images/curro.jpg",
	imageCaption: "Foto Plaza 1",
    category: "Actualidad",
    date: "5 de Diciembre de 2025",
    fullContent: `El matador de toros Curro Díaz y el empresario Jorge Buendía han decidido poner punto y final a la relación de apoderamiento que les mantenía unidos durante los últimos tres años. En un comunicado emitido a este medio, aseguran que ‘siempre guardarán los mejores recuerdos’.

El de Linares terminó 2025 con 16 festejos, entre los que destacó su regreso a la Feria de San Isidro de Madrid y a la Feria de Abril de Sevilla, así como sus triunfos en Jaén, Linares o Úbeda.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 317,
    title: `Alberto Aguilar , nuevo apoderado del francés Yon Lamothe`,
    image: "/images/aguilar.jpg",
    category: "Actualidad",
    date: "5 de Diciembre de 2025",
    fullContent: `El torero francés Yon Lamothe y el maestro madrileño Alberto Aguilar han llegado a un acuerdo de apoderamiento a partir de la temporada 2026 y por tiempo indefinido.

Alberto Aguilar decidió apostar por el joven torero francés que tomó la alternativa en Mont de Marsan en la temporada 2023 después de una importante etapa de novillero en Francia como en España.

Ambas partes se muestran muy ilusionadas por este nuevo proyecto común para potenciar la carrera del matador de toros galo.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 318,
    title: `La A.A.E.T. “Pedro Romero” presenta a la Junta de Andalucía su ‘Proyecto de Nuevos Valores del Toreo’ para la temporada 2026`,
    image: "/images/pedro.jpg",
    category: "Actualidad",
    date: "5 de Diciembre de 2025",
    fullContent: `La **Asociación Andaluza de Escuelas Taurinas “Pedro Romero”** ha presentado ante la **Junta de Andalucía** las bases de su proyecto anual de **Fomento de Nuevos Valores del Toreo**, iniciativa que se integra en el **Programa de Fomento de la Cultura Taurina de Andalucía 2026**.
Con esta planificación, las escuelas andaluzas buscan consolidar su labor formativa y fortalecer el relevo generacional dentro del toreo.

El encuentro tuvo lugar el pasado **miércoles 3 de diciembre** en la sede de la **Consejería de la Secretaría de Interior de la Junta de Andalucía**, ubicada en la **Isla de la Cartuja de Sevilla**. Durante la reunión, los representantes de la **Asociación** expusieron al Secretario General de Interior, **David Gil**, **las líneas maestras que marcarán el desarrollo de la temporada 2026**, desde la programación de actividades formativas hasta el diseño de los ciclos y certámenes destinados a los jóvenes aspirantes.

Además de la presentación del proyecto, la sesión permitió realizar un **análisis detallado del curso 2025**, recién concluido.
Los responsables de la **A.A.E.T. “Pedro Romero”** subrayaron la **buena salud de las Escuelas Andaluzas**, reflejada en la participación creciente y en la consolidación de sus programas formativos.
También se abordó el marco organizativo de la **Asamblea General de la Asociación**, prevista para los primeros días de 2026, donde se ratificarán los objetivos y directrices del nuevo ejercicio.

La reunión estuvo presidida por el Secretario General de Interior, **David Gil**, y contó con la participación del Coordinador General de la Secretaría de Interior, **Juan Manuel Pérez Alarcón**; el Jefe de Servicio de Espectáculos Públicos, **José Antonio Delgado**; el Presidente de la A.A.E.T. “Pedro Romero”, **Eduardo Ordóñez**; los vicepresidentes, **Francisco Ruiz Miguel** y **Miguel Serrano**; así como los miembros de la junta directiva **José Luis Galloso** y **Juan Carlos Landrove**.

La jornada concluyó con un compromiso compartido entre la administración autonómica y el colectivo de escuelas: **continuar promoviendo la formación, la excelencia y el talento joven, pilares esenciales para el futuro de la tauromaquia en Andalucía**.`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 319,
    title: `Brihuega ya tiene fecha para la tradicional corrida de Primavera de 2026`,
    image: "/images/brihuega.jpg",
    category: "Actualidad",
    date: "4 de Diciembre de 2025",
	excerpt: "El cartel se presentará el próximo 12 de Diciembre",
    fullContent: `La tradicional corrida de toros de primavera de Brihuega ya tiene fecha para su próxima edición, prevista para el mes de abril, en la que volverá a reunirse un cartel de primer nivel con tres de los toreros más destacados de la temporada , según ha podido saber este medio uno de ellos será **José María Manzanares** , el diestro alicantino. 

El festejo se celebrará el sábado 11 de abril, según ha anunciado la empresa Funtausa, consolidándose un año más como uno de los pilares fundamentales del calendario taurino en la provincia de Guadalajara.

Considerado uno de los grandes acontecimientos de la campaña europea, este evento sitúa cada año a Brihuega y a la provincia de Guadalajara como un referente para aficionados y visitantes, reforzando su atractivo cultural y taurino.

El cartel completo se dará a conocer oficialmente, salvo cambios de última hora, el próximo 12 de diciembre. Ese día, la empresa dirigida por Toño Matilla presentará la terna encargada de hacer el paseíllo y la ganadería protagonista en el coso de La Muralla.

La cita briocense se ha consolidado también como un importante escaparate social, reuniendo a numerosas personalidades del ámbito televisivo, deportivo y cultural, y aportando un notable brillo a uno de los eventos más esperados del calendario taurino en Guadalajara.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 320,
    title: `Ronda tendrá la tradicional Corrida Goyesca en 2026`,
    image: "/images/goyesca.jpg",
    category: "Actualidad",
    date: "4 de Diciembre de 2025",
    fullContent: `Después de un año en blanco respecto a los toros en Ronda el propio Francisco Rivera Ordóñez, empresario de esta plaza ha confirmado en entrevista en un podcast llamado “La Tasca” , sobre el posible cartel y las labores de restauración comentaba lo siguiente; “La Maestranza está haciendo una labor increíble, con prisa y con ganas para que la plaza esté perfecta para la reinauguración. A ver si somos capaces de estar a la altura, estamos en ello”.

Ronda es una plaza de toros más emblemáticas de nuestro país y su corrida Goyesca una de esas fechas marcadas por todos los aficionados y por la que han pasado figuras como Rafael de Paula , Morante de la Puebla o Antonio Ardoñez y que ha pasado unos años de vacío por las labores de restauración que se han estado realizando y que parece que van en muy buen camino.`,
  author: "Mario Ruiz Ruiz",
  authorLogo: "/images/mariorr.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 321,
    title: `ANOET presenta un completo estudio estadístico sobre los toros en Extremadura`,
    image: "/images/anoet1.jpg",
    category: "Actualidad",
    date: "4 de Diciembre de 2025",
	excerpt: "Muestra la evolución de los festejos en esta comunidad entre 2017 y 2024",
    fullContent: `La Asociación Nacional de Organizadores de Espectáculos Taurinos (ANOET) ha participado en el Consejo Asesor Taurino de Extremadura, que se reunió el pasado lunes en la finca Las Tiesas de Santa María, propiedad del ganadero Victorino Martin. En este encuentro, ANOET ha dado a conocer un completo estudio estadístico sobre la presencia del hecho taurino en esta Comunidad, que se une a los ya publicados de Andalucía, la Comunidad Foral de Navarra y Madrid. 

Con estos estudios, ANOET pretende dar a conocer la presencia de la Tauromaquia en nuestro país aportando numerosos datos sobre la celebración de festejos en las distintas comunidades autónomas. Estos trabajos por comunidades ofrecen además la posibilidad de estudiar la evolución de la Fiesta de los toros en las últimas décadas en cada una de ellas. 

De este modo, ANOET y la Junta de Extremadura han elaborado un informe estadístico de los festejos y reses lidiadas en esta comunidad que abarca un periodo de 8 años, en concreto de 2017 a 2024, que ofrece una interesante visión de la presencia y la evolución de la Tauromaquia en esta zona.
 
Con la colaboración de la Junta de Extremadura, el informe ha sido realizado por ANOET en un formato digital interactivo que permite introducir numerosas variables en las búsquedas. A través de este trabajo, el usuario puede acceder al número de festejos se celebraron en un año determinado, segmentarlos por localidades y dividirlos por tipología. También aporta tablas comparativas que permiten una visión por años, provincias, categoría de plazas, etc.
 
Estadística

Este informe sobre los toros en Extremadura se abre con un mapa que localiza la actividad taurina en esta comunidad, pudiéndose apreciar una amplia presencia. Como primer dato relevante aparece la cifra total de festejos celebrados, 4.103, repartidos del siguiente modo: 3.059 en la provincia de Cáceres y 1.044 en la de Badajoz. Por categoría, en este periodo de 8 años se celebraron 113 corridas de toros, 50 de rejones, 58 novilladas picadas y 35 sin picar, predominando muy por encima de estos, los festejos populares, de los que se celebraron 3.555 en total.  

Como ya hizo ANOET en el análisis de otras comunicades, el informe localiza estos festejos en el mapa de Extremadura y ofrece posibilidad de consulta por ciudades y municipios. La localidad que más festejos ha celebrado en este periodo ha sido Coria por su gran afición al festejo popular, mientras que el mayor número de corridas de toros lo tiene Badajoz con 21, seguida muy de cerca por Olivenza con 20.

De los festejos en plaza, fueron mayoría los celebrados en cosos portátiles, 702, seguidos de los de plazas de tercera con 473 y segunda con 114. En otros recintos se celebraron más de 2.800 festejos.
 
Evolución por años

Este trabajo estadístico permite ver la evolución a través de los años, en la que se observa una bajada en 2019 que lógicamente se acrecienta en pandemia y un repunte constante una vez superada ésta hasta 2024. El año que más festejos registró fue 2018 con 685, seguido de 2024 con 684, por lo que se puede afirmar que la recuperación es notable y Extremadura vive uno de sus mejores momentos taurinos.

Por provincias, fue Cáceres la que más festejos dio, alcanzando su cifra máxima en la temporada 2024 con 516 festejos seguidos de los 507 de 2023. Por su parte, Badajoz logró 186 festejos en 2018 seguidos de los 168 de 2024.

Atendiendo a la actividad taurina por meses en la Comunidad de Extremadura, agosto es el mes más taurino con 1.591 festejos, seguido de septiembre con 1.122. Por provincias, Badajoz da más festejos en septiembre mientras que Cáceres lo hace en agosto. 
 
Curva de evolución

En la pantalla 7 del informe aparece una curva de evolución de festejos en todos estos años. Colocando el cursor sobre ella, la cantidad de festejos aparece desglosada por su tipología sobre cada uno de los años, lo que permite una rápida consulta para ver cuándo se celebraron más corridas de toros, novilladas, rejones, etc.

Reses lidiadas

Este estudio presenta incluso una curva con la evolución por años en el número de reses lidiadas que muestra una uniformidad bastante notable, excepción hecha de los años de pandemia. El total de reses lidiada fue de 14.957, siendo 2022 el año que sobresale con 2.438.

Por último, este repaso estadístico a Extremadura permite conocer la población extremeña que ha tenido acceso a los toros en esta comunidad, ofreciendo datos también año por año. El mayor porcentaje de festejos se celebró en municipios de entre 1.000 y 5.000 habitantes, en concreto el 44,09 por ciento. 

Por provincias, en Cáceres el número de habitantes en municipios donde se celebran toros representa el 84,72% de la población. En más del 50% de los municipios de esta provincia se celebran toros. En Badajoz, por su parte, el número de habitantes a los que llegan los toros representa el 74,56%, celebrándose toros en el 37,58% de las localidades.`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 322,
    title: `Sanlúcar de Barrameda fija las fechas de sus grandes citas taurinas para 2026`,
    image: "/images/sanlucar.jpg",
    category: "Actualidad",
    date: "4 de Diciembre de 2025",
    fullContent: `El empresario de la Plaza de Toros de Sanlúcar de Barrameda, Carmelo García, ha dado a conocer las fechas que marcarán los “grandes acontecimientos de la temporada 2026”, tres citas que -según afirmó- volverán a situar al histórico Coso de El Pino en el centro de atención del mundo taurino por la calidad de sus carteles y ganaderías.

La temporada arrancará el sábado 11 de abril, cuando el ruedo sanluqueño acogerá la tradicional Corrida de la Primavera, que este año se celebrará en formato de Arte del Toreo a Caballo, una gran corrida de rejones llamada a reunir a los máximos exponentes de la disciplina.

Poco después, en pleno ambiente festivo, llegará la corrida de la Feria de la Manzanilla, programada para el domingo 7 de junio. Esta cita, integrada como cada año en la programación oficial de la feria sanluqueña, promete convertirse en uno de los momentos más esperados por la afición local y visitante.

La temporada alcanzará su punto culminante el domingo 16 de agosto con la celebración de la VIII Corrida Magallánica, un festejo que se ha consolidado como uno de los eventos taurinos más singulares y emblemáticos de la ciudad.

Al anunciar el calendario, Carmelo García subrayó el compromiso de la empresa gestora con la excelencia: “Estas tres citas que hemos definido serán carteles de máxima categoría, como es lo habitual en Sanlúcar. Nuestra prioridad es siempre buscar la máxima calidad en nuestras combinaciones”, afirmó el empresario.

Con esta planificación, Sanlúcar de Barrameda apuesta una vez más por una oferta taurina de primer nivel, reforzando su posición como uno de los enclaves más destacados del calendario nacional.`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 323,
    title: `Madrid configura su temporada 2026 con más de 20 ganaderías y la vuelta de Cuadri`,
    image: "/images/temporada.jpg",
    category: "Actualidad",
    date: "3 de Diciembre de 2025",
    fullContent: `Un año más, **Las Ventas** se consolidará como el gran escaparate del toro bravo, acogiendo **toros y novillos procedentes de 21 encastes y líneas de sangre distintas**. Este extenso abanico ganadero constituye un auténtico “fondo de armario” capaz de cubrir todas las necesidades de la plaza más exigente del mundo.

Gracias al trabajo adelantado en el campo, **Plaza 1 tiene ya reseñados los lotes de toros, novillos y sobreros no sólo para la Feria de San Isidro, sino para toda la temporada 2026**, una labor minuciosa que a menudo no recibe el reconocimiento que merece.

El dato del pasado año es significativo: en Las Ventas se lidiaron **384 reses —272 toros, 100 novillos y 12 erales— procedentes de 21 ganaderías distintas**. Sin la plaza de Madrid, muchas divisas de encastes no mayoritarios carecerían de una plataforma donde mostrar su trabajo. Por ello, Las Ventas es un auténtico pulmón para el campo bravo y un apoyo esencial para la preservación de encastes minoritarios.

Entre las ganaderías reseñadas, **Fuente Ymbro y Victoriano del Río** encabezan la nómina con mayor presencia: la primera aportará dos corridas de toros y dos novilladas, mientras que la segunda tendrá tres corridas reseñadas para distintos momentos del año. Con dos corridas de toros figuran también **Victorino Martín, Juan Pedro Domecq, Adolfo Martín, Alcurrucén, Pedraza de Yeltes y Puerto de San Lorenzo**.

La temporada ofrecerá además grandes novedades, como el regreso de la ganadería de **Cuadri**, adelantado por Rafael Garrido en las tertulias de la Asociación del Toro de Madrid, y la presencia de un encierro de **Ana Romero**, previsto para el tramo final del año siempre que la evolución del ganado sea la adecuada.

A cierre de la campaña actual, y como base para la confección de la temporada 2026, estas son las ganaderías vistas y consideradas por Las Ventas:

——

**CORRIDAS DE TOROS**
• Victoriano del Río
• Fuente Ymbro
• Alcurrucén
• Puerto de San Lorenzo
• Juan Pedro Domecq
• Pedraza de Yeltes
• Victorino Martín
• Adolfo Martín
• Garcigrande
• Conde de Mayalde
• Palha
• Dolores Aguirre
• José Escolar
• Saltillo
• Valdellán
• El Pilar
• Valdefresno
• José Enrique Fraile de Valdefresno
• La Quinta
• Araúz de Robles
• Jandilla
• Domingo Hernández
• El Parralejo
• Lagunajanda
• Cuadri
• Partido de Resina
• Juan Luis Fraile
• Montalvo
• Ana Romero

——

**NOVILLADAS CON PICADORES**
• Fuente Ymbro
• Montealto
• Conde de Mayalde
• El Retamar
• Partido de Resina
• Saltillo
• Los Maños
• Hermanos Sánchez Herrero`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 324,
    title: `Borja Jiménez volverá a ser protagonista en Azpeitia con dos paseíllos en 2026`,
    image: "/images/borjajimenez3.jpg",
	imageCamption: "Borja Jiménez en Guadalajara - Foto Firma Riofrio",
    category: "Actualidad",
    date: "2 de Diciembre de 2025",
    fullContent: `Borja Jiménez será una de las figuras destacadas en las Fiestas de San Ignacio 2026. El torero de Espartinas estará presente en dos de las tardes programadas en la próxima edición del ciclo taurino de Azpeitia, tal y como ha anunciado la Comisión Taurina presidida por Joxin Iriarte.

El diestro sevillano, uno de los protagonistas de la temporada actual y triunfador absoluto de la última edición del ciclo guipuzcoano, realizará dos paseíllos en un abono que la Comisión Taurina ya está perfilando y que volverá a ofrecer numerosos alicientes.

Hasta la fecha, Borja Jiménez ha actuado en cuatro ocasiones en la plaza de toros de Azpeitia, escenario en el que debutó en 2026. Con estas dos nuevas actuaciones, alcanzará un total de seis comparecencias en el coso situado a orillas del río Urola.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },	
	{ 
    id: 325,
    title: `Recepción institucional a los alumnos de la Escuela Taurina de Atarfe en el Ayuntamiento`,
    image: "/images/alumnos.jpg",
    category: "Actualidad",
    date: "2 de Diciembre de 2025",
    footerImage1: "/images/alumnos1.jpg",
    fullContent: `La alcaldesa **Yolanda Fernández** reafirma el compromiso del municipio con la tauromaquia y su cantera en un acto promovido por la **Plataforma de Novilleros de Andalucía**.

En la tarde de ayer tuvo lugar un emotivo acto en el salón de plenos del Ayuntamiento de Atarfe, donde la alcaldesa Yolanda Fernández recibió a los alumnos de la Escuela Taurina de Atarfe como cierre a una exitosa temporada 2025. La recepción, cargada de cercanía y simbolismo, permitió a los jóvenes toreros compartir sus experiencias y aspiraciones con la máxima representante municipal.

La alcaldesa expresó con claridad el apoyo del Ayuntamiento al presente y futuro de la tauromaquia en la localidad: “Es un placer escuchar cómo sueñan con ser toreros los niños de la Escuela Taurina de Atarfe. Para mí, como alcaldesa, es un orgullo poder facilitar para que lleguen a cumplir ese sueño. Además, creo que tenemos unas de las instalaciones más bonitas y mejor cuidadas, que son el sitio idóneo para que los alumnos se puedan formar, siempre bien atendidos y con buenos profesionales. Desde el Ayuntamiento siempre les animaremos a que cumplan su sueño”.

En el encuentro también estuvo presente **Víctor Almoha­no**, concejal de Festejos del Ayuntamiento, quien acompañó a los alumnos en esta jornada tan especial.

Durante la visita institucional, la alcaldesa compartió anécdotas con los más jóvenes, les habló de la riqueza cultural de la ciudad y les reiteró el firme compromiso del consistorio con la fiesta y con el futuro de la misma. Los alumnos, por su parte, explicaron cómo es su día a día en la Escuela Taurina, reflexionaron sobre su aprendizaje y realizaron un balance de la temporada 2025, además de comentar cómo compatibilizan su formación taurina con sus estudios académicos.
Una tarde que servirá para reconocer talento, afición y futuro, con Atarfe y Granada mostrando firmeza en su apuesta por la cantera taurina.

El acto culminó con una exhibición de toreo de salón por parte de los propios alumnos en el salón de plenos, bajo la atenta mirada de la alcaldesa y del concejal. Como broche final, ambos se animaron a tomar los trastos y lancear, generando uno de los momentos más especiales de la tarde.

Esta actividad ha sido impulsada y promovida por la **Plataforma de impulso a los Novilleros de Andalucía** de la Fundación Toro de Lidia, contando con la colaboración y el respaldo fundamental de la **Diputación de Granada**, institución clave en el fortalecimiento y promoción de la cantera taurina de la provincia.

La **Plataforma de Impulso a los Novilleros de Andalucía** nace con el objetivo de promocionar y potenciar las carreras de los novilleros en la comunidad, así como sus Escuelas Taurinas y certámenes. Un proyecto anual, impulsado por la Fundación Toro de Lidia y respaldado por la **Junta de Andalucía**, **Fundación Caja Rural del Sur**, **Fundación Cajasol**, **Instituto Andaluz de la Juventud**, **Real Maestranza de Caballería de Sevilla**, **Diputación de Málaga**, **Diputación de Huelva**, **Diputación de Córdoba**, **Diputación de Granada** y **Diputación de Cádiz**.`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
   { 
    id: 326,
    title: `Almadén de la Plata: Agustín de Antonio, 'La Piyaya' y Fernando Lovera, a hombros tras desorejar a sus respectivos novillos`,
    image: "/images/almaden1.jpg",
    category: "Crónicas",
    date: "2 de Diciembre de 2025",
	plaza: "Almadén de la Plata",
    ganaderia: "Albarreal",
	 torerosRaw: `
Agustín de Antonio: Dos Orejas Tras Aviso
Candela "La Piyaya": Dos Orejas
Fernando Lovera: Dos Orejas Tras Aviso
Armando Rojo: Oreja Con Petición de la Segunda Tras Aviso
Mario Torres: Oreja Tras Dos Avisos
Juan Manuel Viruez: Oreja Tras Aviso
`,
    fullContent: `La plaza de toros de **Almadén de la Plata** registró un lleno absoluto en la novillada sin picadores organizada con motivo de la **VIII Edición del Día del Jamón**, en la que se lidiaron reses bien presentadas y de juego variado de **Albarreal**, destacando el primero y el tercero.
La novillada dejó tres ‘Puertas Grandes’ y un notable nivel de las jóvenes promesas, confirmando a Almadén de la Plata como una cita clave para seguir la evolución de los nuevos valores del toreo. Tras el paseíllo sonó el Himno de España, antes de dar paso a una tarde en la que los seis actuantes mostraron oficio, entrega y personalidad.

**Agustín de Antonio** abrió la tarde con una faena templada y expresiva ante un novillo noble, logrando dos orejas tras aviso.
**Candela “La Piyaya”** resolvió con firmeza ante un astado áspero, aprovechando los momentos que permitió el lucimiento y cortando dos orejas.
El tercer triunfador fue **Fernando Lovera**, que brilló con una actuación muy templada y de gran profundidad, premiada igualmente con dos orejas tras aviso.
**Armando Rojo** se impuso a un novillo complicado con firmeza y buenos detalles, obteniendo una oreja con petición de segunda.
**Mario Torres**, muy seguro ante un quinto exigente, dejó los mejores momentos por la derecha y cortó una oreja tras dos avisos.
Cerró la tarde **Juan Manuel Viruez**, que mostró buen concepto y una importante personalidad para pasear una oreja tras aviso.

**FICHA DEL FESTEJO:**
Sábado, 29 de noviembre de 2025

Plaza de Toros El Coso – Almadén de la Plata (Sevilla)

Novillada Extraordinaria con motivo de la “**VIII Edición del Día del Jamón**”

Proyecto de Fomento de la Cultura Taurina de Andalucía 2025

Entrada: Lleno en tarde muy gélida.

Se lidiaron reses de **Albarreal**. Bien presentadas y de juego variado de Albarreal, destacando el primero y el tercero.

**AGUSTÍN DE ANTONIO**, (E.T. Sevilla); Dos orejas tras aviso.
**CANDELA ‘LA PIYAYA’**, (E.T.J.C. ‘Yiyo’-Madrid); Dos orejas.
**FERNANDO LOVERA**, (E.T. Camas); Dos orejas tras aviso.
**ARMANDO ROJO**, (E.T. Sevilla); Oreja con petición de segunda tras aviso.
**MARIO TORRES**, (E.T. Ubrique); Oreja tras dos avisos.
**JUAN MANUEL VIRUEZ**, (E.T. Ubrique); Oreja tras aviso.

**Observaciones:**
Tras el paseíllo sonó el Himno de España.
Presidió: D. Francisco Alonso, asesorado por Dña. Mª del Pilar Portillo, perteneciente a la UPTE (Unión de Presidentes de Plazas de Toros de España).
Asistió al festejo el Delegado del Gobierno de la Junta de Andalucía en Sevilla, D. Ricardo Sánchez Antúnez y el Alcalde de la localidad, D. Carlos Raigada Barrero.
Un festejo organizado por la Escuela de Sevilla, la Escuela de Ubrique y el propio Ayuntamiento de Almadén de la Plata.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 327,
    title: `Gran jornada de “Faena y Doma de Campo” en la Finca Heredade do Barroso, propiredad de D. José Luis Pereda López`,
    image: "/images/granjornada.jpg",
	imageCaption: "Foto Juan Antonio Caro",
    category: "Actualidad",
    date: "2 de Diciembre de 2025",
    footerImage1: "/images/jornada1.jpg",
    footerImage2: "/images/jornada2.jpg",
    footerImage3: "/images/jornada3.jpg",
    footerImage4: "/images/jornada4.jpg",
    footerImage4Caption: "Fotos Juan Antonio Caro",
    fullContent: `Al filo de las 12:00 horas del pasado –sábado, 29 de noviembre–, dio comienzo en la Finca Herdade do Barroso –propiedad de D. José Luis Pereda López y situada en la comarca portuguesa del Alentejo– una destacada jornada de disciplina hípica deportiva. Esta actividad, denominada actualmente ‘Faena y Doma de Campo’ y conocida tradicionalmente como ‘Acoso y Derribo’, congregó a un nutrido y cualificado grupo de participantes, subrayando el carácter histórico y señero de esta labor ganadera.

La cita reunió a **50 colleras de garrochistas, organizadas en 10 grupos**, que protagonizaron una intensa y coordinada faena campera.
Para el desarrollo de esta práctica ancestral de manejo de reses en el campo, el anfitrión, D. José Luis Pereda, dispuso **55 reses herradas con el hierro de su casa y con el hierro de Doña Clotilde López, madre del ganadero**.
A ello se sumaron **19 reses también corridas y derribadas procedentes de la ganadería invitada de D. Silvestre Macías**.
Todas las reses participantes fueron becerras y/o vacas cruzadas, conforme marca la tradición en este tipo de labores.

Entre los aproximadamente **100 garrochistas** asistentes se dieron cita reconocidos especialistas y una amplia nómina de Campeones de España, entre ellos: **Josele Cañaveral, José Luis Díez de la Cortina, Alfonso Carlos Fernández González, José María Fernández Fernández, Alfonso Martín García “El Pory”, Manuel Carrera Butrón “Carca”, entre otros destacados nombres de la disciplina**.

Asimismo, el encuentro contó con la presencia de personalidades que representan la fusión entre la cultura taurina y la hípica deportiva. Entre ellos destacaron la figura del matador de toros **Daniel Luque**; **los representantes de la familia Campos Peña, Ernesto y Manolo Campos Moreno**; **Javier Buendía**, hijo del gran maestro del rejoneo; **Manolo González**, hijo del reconocido ganadero; el **Campeón de España de Doma Vaquera José Ramón García “Chamo”**; **los picadores Diego Peña y Juan Francisco Peña**; así como el novillero con picadores **Sergio Domínguez “El Mella”**.

La jornada transcurrió en un ambiente de excelencia técnica y deportividad, en la que todos los intervinientes demostraron su pericia y habilidad. La supervisión técnica corrió a cargo de **D. Carlos Cid**, juez nacional de acoso y derribo, cuya labor garantizó el correcto desarrollo de la actividad en cada una de sus fases.

Finalmente, merece una mención especial el impecable trabajo organizativo del anfitrión D. José Luis Pereda y de Manuel Sevillano Torres, actual mayoral de la ganadería de Pereda, cuya dedicación resultó clave para el éxito de esta jornada que reafirma el valor cultural, deportivo y tradicional de la Faena y Doma de Campo.`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 328,
   title: `Algar: Mario Torres, Celso Ortega y Gabriel Moreno ‘El Calé’, abren la ‘Puerta Grande’ con dos orejas cada uno`,
    image: "/images/algar.jpg",
    category: "Crónicas",
    date: "2 de Diciembre de 2025",
	plaza: "Algar",
    ganaderia: "El Torero",
	 torerosRaw: `
Martín Marengo: Oreja Con Petición de Segunda
Adrián Olmedo: Palmas Tras Tres Avisos
Mario Torres: Dos Orejas Tras Aviso
Remy Lucas: Oreja Tras Aviso
Celso Ortega: Dos Orejas y Vuelta al Novillo
Javier Mena: Palmas Tras Tres Avisos
Gabriel Moreno 'El Calé': Dos Orejas Tras Aviso
`,
    fullContent: `La plaza de toros de Algar (Cádiz) se convirtió este fin de semana en el escenario de la **Gran Final de las Becerradas de la XIII Competición Provincial de las Escuelas Taurinas de Cádiz** —bajo el patrocinio de la Excma. Diputación de Cádiz— un festejo que, pese a la tarde desapacible y fría, registró un lleno absoluto en los tendidos del centenario coso gaditano.
La cita reunió a los jóvenes valores del toreo provincial, que demostraron capacidad, entrega y ambición ante un encierro variado de la ganadería de **El Torero**, cuyos astados ofrecieron desigual presentación y juego.
Destacó especialmente el quinto becerro, premiado con la vuelta al ruedo por su calidad y bravura.
Entre los noveles actuantes brillaron **Mario Torres, Celso Ortega y Gabriel Moreno ‘El Calé’**, quienes lograron cortar dos orejas cada uno y, con ello, abrir la ‘Puerta Grande’, culminando así una tarde cargada de emociones y evidentes muestras de futuro.

Abrió plaza **Martín Marengo**, de la Escuela Taurina Francisco Montes ‘Paquiro’ de Chiclana de la Frontera, que dejó detalles de buena colocación y temple, siendo premiado con una oreja con petición de segunda.
Le siguió **Adrián Olmedo**, de la Escuela Taurina Linense, que mostró firmeza y decisión pese a un complicado oponente; escuchó palmas tras tres avisos.
El tercer turno correspondió a **Mario Torres**, de la Escuela Taurina Comarcal de Ubrique, quien cuajó una actuación llena de oficio y serenidad. Su faena, rematada con una estocada tras aviso, fue reconocida con dos orejas.

El francés **Remy Lucas**, de la Escuela Taurina ‘Rafael Ortega’ de San Fernando, mostró elegancia y personalidad. A pesar del aviso, cortó una oreja.
Uno de los momentos más destacados llegó de la mano de **Celso Ortega**, representante de la Escuela de Tauromaquia ‘La Gallosina’ de El Puerto de Santa María. Su conexión con los tendidos y el buen entendimiento de la embestida del quinto, premiado con la vuelta al ruedo, le valieron dos orejas.
Posteriormente, **Javier Mena**, de la Escuela Municipal de Tauromaquia Miguel Mateo ‘Migue­lín’ de Algeciras, dejó pasajes de voluntad y buenas maneras, siendo ovacionado tras escuchar tres avisos.
Cerró el festejo **Gabriel Moreno ‘El Calé’**, de la Escuela Taurina ‘El Volapié’ de Sanlúcar de Barrameda, que hizo vibrar al público con una faena de entrega y prestancia gitana. Cortó dos orejas, también tras aviso, lo que le permitió acompañar a Torres y Ortega en la salida a hombros.

**FICHA DEL FESTEJO:**
Domingo, 30 de noviembre de 2025
Plaza de Toros de Algar – (Cádiz)

**Gran Final de las Becerradas de la XIII Competición Provincial de las Escuelas Taurinas de Cádiz**

Proyecto de Fomento de la Cultura Taurina de Andalucía 2025

Entrada: Lleno en tarde desapacible, amenazante y fría.

Se lidiaron reses de **El Torero**. Desiguales de presentación y juego.
Destacó especialmente el 5º, premiado con la vuelta al ruedo por su calidad y bravura.

**MARTÍN MAREN­GO**, (E.T.‘Paquiro’-Chiclana Ftra); Oreja con petición de segunda.
**ADRIÁN OLMEDO**, (E.T. Linense); Palmas tras tres avisos.
**MARIO TORRES**, (E.T. Ubrique); Dos orejas tras aviso.
**REMY LUCAS**, (E.T. ‘Rafael Ortega’ - S. Fdo.); Oreja tras aviso.
**CELSO ORTEGA**, (E.T. ‘La Gallosina’-Pto. Sta. Mª); Dos orejas y vuelta al novillo.
**JAVIER MENA**, (E.T. ‘Miguelín’-Algeciras); Palmas tras tres avisos.
**GABRIEL MORENO ‘EL CALÉ’**, (E.T. ‘El Volapié’ Sanlúcar Bdra.); Dos orejas tras aviso.

**Observaciones:**
Tras el paseíllo sonó el Himno de España.
Asistió al festejo el Primer Teniente de Alcalde de la localidad, D. Juan Manuel Guerra.
La XIII Competición Provincial de las Escuelas Taurinas de Cádiz ha contado con el patrocinio de la Excma. Diputación de Cádiz.

**PALCO:**
Presidió el Alcalde de Algar, D. José Carlos Sánchez.
Asesores: D. Juan Pedro Sánchez.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 329,
   title: `La Casa Matilla avanza en el elenco ganadero de la Magdalena 2025 marcada por coincidencias con Valencia`,
    image: "/images/matilla.jpg",
    category: "Actualidad",
    date: "2 de Diciembre de 2025",
    fullContent: `La **Casa Matilla** avanza en la confección de la **Feria de la Magdalena**, uno de los seriales taurinos de referencia en el inicio de la temporada. Este año, las dos grandes ferias del Levante —**Castellón y Valencia**— coincidirán **durante el fin de semana del 13, 14 y 15 de marzo, debido a la celebración de la Semana Santa, que comenzará el 29 de marzo**.

La empresa **Funtausa**, dirigida por Toño y Jorge Matilla prepara para esas fechas los principales alicientes de un ciclo que ya tiene prácticamente definido su elenco ganadero y que incluirá varias novedades. Entre ellas destaca el regreso de la divisa de **Hermanos García Jiménez**, que volverá a Castellón tras obtener todos los premios en 2024 gracias a una corrida de notable éxito, ganadería que pertenece a la familia Matilla.

Como segunda novedad, la ganadería de **Zalduendo** también estará presente en un plantel en el que figurarán, igualmente, los hierros de **Domingo Hernández y La Quinta**, esta última tras el indulto conseguido el pasado año. Son las primeras líneas maestras de una feria que se celebrará del **8 al 15 de marzo**.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 330,
    title: `Manuel Amador , nuevo apoderado de Samuel Navalon`,
    image: "/images/manuelamador.jpg",
    category: "Actualidad",
    date: "1 de Diciembre de 2025",
    fullContent: `El empresario y matador de toros **Manuel Amador** es el nuevo apoderado de **Samuel Navalón** tras llegar a un acuerdo de apoderamiento con el clásico apretón de manos y por tiempo indefinido. Una nueva etapa entre ambos con el objetivo de estar presentes en las ferias más importantes de la temporada.

Navalón se encuentra en el **proceso de recuperación** de la gravísima cornada que sufrió el pasado mes de septiembre en Algemesí después de una temporada 2025 con importantes triunfos. El valenciano destacó en plazas como **Madrid, Sevilla, Arles, Alicante, Albacete o Ciudad Real**, entre otras.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },	
	{ 
    id: 331,
    title: `Tauro Manía: la joven marca que une fe y la Tauromaquia`,
    image: "/images/tauromania.jpg",
    category: "Actualidad",
    date: "1 de Diciembre de 2025",
    fullContent: `Tauro Manía nació de una tarde inolvidable en Las Ventas. El 8 de junio, durante la corrida de la Hispanidad en la que Morante abrió la Puerta Grande, uno de los actuales fundadores quiso comprar una camiseta de José Antonio Morante de la Puebla , pero no encontró ninguna con buen diseño ni a un precio razonable. De esa decepción surgió una idea que, dos meses después, en agosto, comenzó a tomar forma hasta lanzar su primer modelo a principios de septiembre.

Detrás de la marca están dos chicos que acaban de cumplir la mayoría de edad y que han querido unir dos pilares importantes en su vida: la fe cristiana y la tauromaquia. Su objetivo es claro: dar visibilidad al toreo, acercarlo a más gente y ofrecer diseños significativos sin precios elevados. “Preferimos el reconocimiento antes que el dinero”, aseguran.

Con poco más de tres meses de recorrido, Tauro Manía quiere consolidarse y llegar a plazas de todo el mundo con ropa que represente valores taurinos y religiosos, soñando con marcar un antes y un después en la moda taurina juvenil. Los interesados ya pueden visitar su página web <a href="https://tauromania.es" target="_blank" rel="noopener noreferrer" class="text-red-600 font-semibold hover:underline">https://tauromania.es</a> y hacerse con sus camisetas.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
   { 
    id: 332,
    title: `Talavante, Roca Rey y Víctor Hernández encabezan la Beneficencia; Borja Jiménez, solo ante seis toros en la corrida In Memoriam`,
    image: "/images/varios5.jpg",
    category: "Actualidad",
    date: "1 de Diciembre de 2025",
    fullContent: `La plaza de Toros de las Ventas acogerá 2 carteles importantes para la temporada 2026.

Según a podido saber Tendido Digital, la empresa Plaza 1 tendría ya concretados dos carteles de máxima importancia en el serial taurino de San isidro 2026.
Los festejos tendrán lugar los días **7 y 14 de Junio**.
El primero de ellos: día de la beneficencia. Albergará un cartel que combina temple, taquilla y juventud con **Talavante, Roca Rey y Víctor Hernández** que lidiarán toros de **Victoriano del Río**, una de las grandes triunfadoras de la temporada pasada.

Por otra parte el coso madrileño se prepara para acoger una gesta histórica en la corrida **In Memorian a Rafael de Paula**, Borja Jiménez se encerrara en solitario con 6 toros de **Victoriano del Río y Garcigrande**.

A falta de confirmación oficial y cerca de dos meses antes del anuncio de las fechas, los carteles quedan de la siguiente manera:

Domingo, 7 de junio:
Toros de Victoriano del Río
– Talavante
– Roca Rey
– Víctor Hernández

Domingo, 14 de junio:
Corrida In Memorian Rafael de Paula
Toros de Victoriano del Río y Garcigrande

–Borja Jiménez como único espada`,
  author: "Arnau Argulló",
  authorLogo: "/images/tendidodigitallogosimple.png",
  showAuthorHeader: true
  },
	{ 
    id: 333,
    title: `Partido de Resina regresará por partida doble a Las Ventas en 2026 tras su rotundo triunfo en Madrid`,
    image: "/images/cabañito.jpg",
	imageCaption: "“Cabañito” de Partido de Resina lidiado el pasado 2023 en Las Ventas",
    category: "Actualidad",
    date: "1 de Diciembre de 2025",
    fullContent: `La ganadería de **Partido de Resina**, una de las grandes revelaciones de la temporada 2025 en **Las Ventas**, volverá al coso madrileño el próximo año con **una corrida de toros y una novillada ya reseñadas por el veedor de la plaza**, Antonio Cutiño. La corrida se anunciaría en la Feria de San Isidro, mientras que el lote de utreros se lidiaría a lo largo de la temporada.

El regreso de la histórica divisa supone una firme apuesta tras los éxitos alcanzados el **pasado septiembre, tanto en el desafío ganadero frente a Monteviejo como en la Corrida Concurso de Ganaderías**. En el desafío destacaron toros como “**Rosalero**”, de imponente presencia, con el que Luis Gerpe dio la vuelta al ruedo, y “**Higuerito**”, también muy comentado por su juego. En la corrida concurso, el jurado premió a “**Excitado**” como el toro más bravo del festejo, lidiado por Gómez del Pilar, que igualmente dio una vuelta al ruedo.

Partido de Resina mantiene la esencia del mítico encaste Pablo Romero: toros de morfología muy definida —el llamado “toro guapo”— y un comportamiento fogoso que transmite emoción. Tras décadas de altibajos, la ganadería vive una etapa de recuperación sustentada en un riguroso trabajo genético y sanitario.

Los buenos resultados no se limitaron a Madrid: este año también firmaron actuaciones destacadas en Cuéllar, con triunfos de Juan de Castilla y Jesús Enrique Colombo, y en Estella, donde Javier Castaño salió a hombros.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 334,
   title: `Julio Norte y Emiliano Osornio, los grandes protagonistas de el Vid de Oro en la entrega de premios de Arganda del Rey`,
    image: "/images/premios.jpg",
    category: "Actualidad",
    date: "1 de Diciembre de 2025",
    fullContent: `**Arganda del Rey** puso el broche de oro a la temporada taurina **2025** con la gala de entrega de los premios de la **XXXVI Vid de Oro**, celebrada en el Auditorio Montserrat Caballé, que volvió a llenarse para la ocasión. El acto, presentado por el periodista Javier Fernández-Mardomingo, se ha consolidado como una de las citas imprescindibles del circuito taurino nacional.

Durante la velada se reconocieron las actuaciones más destacadas de la feria del pasado mes de septiembre.
**Julio Norte recibió el premio al triunfador de la Feria de la Vid de Oro 2025**, mientras que **Emiliano Osornio fue distinguido con la faena más artística tras su importante actuación en la feria madrileña**.
**Saúl Jiménez Fortes** obtuvo el galardón **Detalle para el recuerdo de la temporada**.
También fueron premiados el banderillero **Marcos Prieto**, **Jesús Romero**, **Álvaro de Faranda**, la ganadería **El Retamar** y **Cristian Restrepo**, entre otros protagonistas que dejaron su sello en la plaza argandeña.

Los premios entregados durante la gala fueron los siguientes:
– Triunfador de la feria: **Julio Norte**
– Faena más artística: **Emiliano Osornio**
– Mejor par de banderillas: **Marcos Prieto**
– Mejor estocada: **Jesús Romero**
– Mejor brega: **Álvaro de Faranda**
– Mejor novillada: **Ganadería El Retamar**
– Novillo más bravo: **Nº 5 “General”, de El Retamar**
– Triunfador de la Novillada de Promoción “Vid de Plata”: **Cristian Restrepo**
– Mejor recortador: **Gonzalo Hernández “Guajiro”**
– Mejor corredor: **Manuel Martín Carmona**
– Corredor más arriesgado: **Javier Julián Alcázar**
– Mejor recortador joven: **Aitor Moreno Ortiz**
– Corredor revelación: **Rubén Vaquerizo**
– Personaje más significativo: **Nicolás Madrid**
– Detalle para el recuerdo de la temporada: **Saúl Jiménez Fortes**

La **XXXVI Vid de Oro** volvió a demostrar el arraigo y la vitalidad de la tradición taurina en **Arganda del Rey**, consolidándose como un evento de referencia que reconoce la excelencia y el esfuerzo de todos los profesionales y participantes que forman parte de su feria.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 335,
   title: `Daniel Luque perfila su cuadrilla para la próxima temporada`,
    image: "/images/danielluque1.jpg",
    category: "Actualidad",
    date: "1 de Diciembre de 2025",
    fullContent: `El torero de Gerena Daniel Luque ya tiene cerrada su cuadrilla para la próxima temporada 2026. En ella se incorpora el banderillero sevillano Antonio Manuel Punta.

Así queda la cuadrilla de Daniel Luque de cara a la temporada 2026:

Banderilleros, **Antonio Manuel Punta, Juan Contreras y ⁠Jesús Arruga.**

Picadores, **José Manuel García "El Patilla" y ⁠Javier García "Jabato hijo".**

Mozo de espadas, **Sergio Durán Luque**

Apoderado **Antonio Barrera**`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 336,
   title: `Espacio Nautalia 360 perfila los últimos detalles de los carteles de la Feria de Fallas`,
    image: "/images/espacio.jpg",
    category: "Actualidad",
    date: "30 de noviembre de 2025",
    fullContent: `La empresa **Espacio Nautalia 360** se encuentra en la fase definitiva de preparación de los carteles de la Feria de Fallas, el primer gran compromiso taurino del calendario. El ciclo, que se celebrará del **8 al 19 de marzo**, volverá a reunir a grandes nombres de la tauromaquia, entre ellos **Alejandro Talavante**, que hará doble presencia en el abono.

Uno de los focos principales del serial será la reaparición en Valencia de **Roca Rey**, prevista para el sábado **14 de marzo**, en uno de los carteles con más tirón de la feria. Compartirá paseíllo con Talavante y con **Samuel Navalón**, que volverá al coso valenciano ahora como matador de toros, después de la grave lesión sufrida en Algemesí.

El Día de **San José, 19 de marzo**, también presenta una de las combinaciones más atractivas. Los toros de **Núñez del Cuvillo** están reservados para **Talavante, Juan Ortega y Emilio de Justo**, una terna que despierta gran expectación. Por su parte, el domingo 15 será el turno de los astados de **Jandilla**, para un cartel formado por **Sebastián Castella, José María Manzanares y Pablo Aguado.**

Entre las novedades más comentadas figura el mano a mano entre **Borja Jiménez y Tomás Rufo**, que se anunciará casi con total seguridad con la corrida de **Santiago Domecq**, hierro que dejó una gran impresión en Valencia durante la Feria de Julio de 2024. El elenco ganadero se completará con **Puerto de San Lorenzo**, para los que suenan nombres como **Miguel Ángel Perera o Víctor Hernández**, y con la corrida de La Quinta, encargada de abrir el ciclo taurino fuerte el próximo 13 de marzo.

Salvo cambios derivados de las últimas negociaciones, la feria quedaría configurada así:

– **S 08/03**: Novillada con picadores
– **V 13/03**: Corrida de toros (La Quinta)
– **S 14/03**: Alejandro Talavante, Roca Rey y Samuel Navalón (Victoriano del Río)
– **D 15/03**: Sebastián Castella, José María Manzanares y Pablo Aguado (Jandilla)
– **L 16/03**: Novillada con picadores
– **M 17/03**: Corrida de toros
– **X 18/03**: Corrida de toros
– **J 19/03**: Alejandro Talavante, Emilio de Justo y Juan Ortega (Núñez del Cuvillo)`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 337,
   title: `Domingo López‑Chaves se incorpora al equipo de "El Fandi" para la temporada 2026`,
    image: "/images/domingo.jpg",
    category: "Actualidad",
    date: "30 de noviembre de 2025",
	excerpt: " El diestro será el encargado de acompañar al granadino en cada compromiso",
    fullContent: `El diestro, Domingo López - Chaves, se incorpora al equipo de David Fandila “El Fandi” para la temporada 2026, convirtiéndose en su hombre de confianza para acompañarle en cada compromiso.

López - Chaves ejercerá labores de campo y será su principal apoyo mientras que las tareas de despacho corresponderán a Alberto García, reciente apoderado del torero granadino.

“Me veo cerca de una figura del toreo y todo lo que pueda ofrecer y aportar de mi a David, lo tendrá”, ha asegurado López - Chaves.

Amigos desde hace años, ahora se convierten en un tándem profesional de éxito para seguir avanzando en sus trayectorias en el mundo del toro.

“Siempre has estado a mi lado por ser un ejemplo dentro y fuera de la plaza. Y ahora no puedo estar más feliz e ilusionado de que formes parte de este nuevo proyecto”, ha asegurado “El Fandi” en su cuenta de Instagram haciendo oficial la incorporación.`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 338,
       title: "Morante, Ignacio Candela, David Galván y Núñez del Cuvillo entre los premiados por la Junta de Andalucía en Cádiz",
    image: "/images/varios4.jpg",
    category: "Actualidad",
    date: "29 de noviembre de 2025",
    fullContent: `El jurado de los **Premios Taurinos de la Delegación del Gobierno de la Junta de Andalucía en Cádiz** ha concedido los premios correspondientes a la temporada  2025.

Desde su creación en 2021, esta es ya la quinta edición de estos galardones, instaurados con el propósito de distinguir las actuaciones más destacadas de la temporada taurina en la provincia y con ello el respaldo de la Junta de Andalucía a la tauromaquia.

Los ganadores de los V Premios Taurinos de la Delegación del Gobierno de la Junta de Andalucía en Cádiz.
 
-**Morante de la Puebla**, por su faena al 4º toro de la tarde en la Plaza de Toros de Jerez de la Frontera el pasado 23 de mayo
 
-**La Ganadería de Núñez del Cuvillo**
 
-**Ignacio Candelas**, mejor novillero con picadores de la temporada en la provincia
 
-**Manuel Rodríguez «Mambrú»**, mejor subalterno
 
-**La Peña Taurina Francisco Montes «Paquiro»** , de Chiclana de la Frontera, Premio a la Promoción, Difusión y Defensa de la Tauromaquia
 
Además, el jurado ha concedido la mención especial por unanimidad al diestro gaditano **David Galván**, como reconocimiento a la extraordinaria temporada realizada

Con este reconocimiento, la **Delegación del Gobierno en Cádiz** pone en valor la entrega y compromiso de la **Junta de Andalucía** con la tauromaquia`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
   { 
    id: 339,
       title: "El Club Taurino El Rabo rinde homenaje a Antonio González Sabio en su última tertulia del 2025",
    image: "/images/club.jpg",
    category: "Actualidad",
    date: "29 de noviembre de 2025",
    fullContent: `El Club Taurino El Rabo, de El Puerto de Santa María, cerró el pasado jueves su Ciclo de Tertulias 2025 con un emotivo homenaje a Antonio González Sabio, coincidiendo además con los 25 años de estas charlas que se han convertido en auténticas “corridas de invierno”, llenando de vida y conversación taurina los meses de parón de la temporada.
 
El concejal de la Plaza de Toros del Ayuntamiento de El Puerto, Carmelo Navarro, acompañó a la entidad, encabezada por su presidente Jesús Domínguez, en un acto que reunió al completo a toda la afición de El Puerto en la sede del Club en la calle Luis Mazzantini.
 
Junto a González Sabio, el ex presidente de la Plaza Real, Rafael Sestelo, repasando su trayectoria profesional y su papel como hombre de máxima confianza del maestro José Luis Galloso, al que acompañó durante toda su carrera.
 
El homenaje sirvió para reconocer no solo la trayectoria de un maestro de plata, sino también la nobleza, generosidad y cercanía humana de un portuense querido por todos. La cita contó con la presencia de sus hijos, profesionales y de numerosos aficionados que quisieron acompañarle en un momento tan especial.
 
Nacido el 31 de mayo de 1940, hijo de Don Francisco González, gran conocedor de la ganadería de José Luis Osborne Vázquez, Antonio reconoció que, si no hubiera sido por Galloso, probablemente habría sido mayoral como su padre.
 
Siendo niño con apenas 8 o 9 años, se puso por primera vez ante una becerra mansa y cuando Rafael Ortega lo vio no dudó en presentarlo ante todos los ganaderos de Andalucía. Su aventura torera comenzó en 1958 y debutó con picadores el 21 de septiembre de 1961 en Villamartín, logrando importantes triunfos que le llevaron a plazas importantes como Las Ventas de Madrid y la Monumental de Barcelona, así como a alcanzar grandes éxitos en El Puerto de Santa María.
 
En 1969 ingresó en las filas de subalterno y, poco después, se unió a la cuadrilla de José Luis Galloso, con quien compartió toda su carrera y a quien considera como un hermano: el octavo en una familia de siete hijos. Acompañó también en los paseíllos a los hermanos Emilio y Abel Oliva, a los novilleros Víctor Manuel y Marcos Cruz -también presente ayer, y a matadores como Rafael de Paula o Eduardo Dávila Miura. Gran conocedor del comportamiento del toro, exigente consigo mismo y con los demás, Antonio se mantuvo siempre fiel a Galloso, con quien compartió y comparte lazos afectivos profundos. Ayer recordaron juntos multitud de anécdotas y con especial emoción aquel festival celebrado el 15 de febrero de 1998 en la Plaza de El Puerto, que marcó el cierre de su carrera activa y en el que no faltaron Galloso, Celso Ortega -cuyo hijo y becerrista promesa de El Puerto también estaba ayer en primera fila-, Finito de Córdoba, El Litri, Rafael Camino, el Niño de la Capea, Victor Janeiro y Jesulín de Ubrique.
 
 Ya retirado, continúa cada temporada en su plaza, ocupando su mismo abono. Una noche cargada de recuerdos, de risas y de interpelación con Galloso, donde rememoraron juntos también su temporada en América, donde no era como ahora, sino que se convivía con la cuadrilla durante seis meses, compartiendo la vida como una auténtica familia. Reconoció ser mejor con el capote que con las banderillas, pero lo que está claro es que es ha sido un excelente maestro de plata con corazón de oro.
 
Carmelo Navarro felicitó a Antonio González Sabio por este merecido reconocimiento a toda una vida dedicada al mundo del toro, y al Club Taurino El Rabo por mantener viva la tradición taurina y por promover el reconocimiento a quienes han hecho grande nuestra historia taurina.`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 340,
       title: "“Expreso mi concepto bajo los cánones del clasicismo, con mi singularidad personal” - Entrevista a David Galván",
    image: "/images/entrevista.jpg",
    category: "Entrevistas",
    date: "29 de noviembre de 2025",
    fullContent: `**David Galván**
encara uno de los momentos más determinantes de su carrera. El matador gaditano, que con constancia, sensibilidad y una evolución silenciosa ha pasado de ser una promesa a convertirse en un nombre respetado dentro del escalafón, atraviesa un proceso de madurez profesional que despierta ilusión entre la afición.

Tras una temporada marcada por la solidez, actuaciones de gran calado y tardes en las que dejó patente la profundidad de su concepto, Galván ha logrado situarse como uno de los toreros con mayor poso y proyección. Su expresión clásica, su temple y una ambición cada vez más nítida lo consolidan como un perfil que merece ser escuchado.

**¿Cómo afronta usted la temporada que viene, teniendo en cuenta lo importante que ha sido esta?**

La temporada 2026 la afronto con la ilusión de dar mi mejor versión en cada actuación, mostrar mi personalidad en su máxima dimensión y seguir sintiendo a la afición ilusionada por ver a David Galván. 

**Se ha creado un movimiento “galvanista” ya que el buen publico, admira que un concepto tan puro como el suyo, no cambie con corridas duras. ¿Le gusta a usted que le encasillen con ese tipo de ganaderias o encastes? o preferiria torear corridas mas “comodas” y en otro tipo de carteles.**

Es muy bonito sentir ese movimiento “Galvanista” que he vivido este año y sigo viviendo. Recibo el entusiasmo constante de aficionados de todas las edades de la geografía europea y americana, lo que supone una gran felicidad para mí. 
Considero que no estoy encasillado en nada, no me pongo limitaciones, y es por este motivo que he conseguido desarrollar mi toreo y triunfar con todo tipo de ganaderías y encantes. 

**Perú y México, son dos paises con los que mantiene un idilio constante, y en los que se le espera con gran entusiasmo; ¿que opina de estos dos paises? ¿Y de los constantes ataques antitaurinos en mexico? ( se han vuelto a prohibir los toros en Ciudad Juarez)**

Tanto Perú como México son dos países que llevo en mi corazón. Me encanta torear en ellos y sentir el calor de sus aficiones. Siempre tendrán mi apoyo incondicional. 

**¿Como quiere que se le recuerde, cuales son sus mayores aspiraciones en este mundo?**

Como artista y como persona lo que más me llena es sentir que la gente se emociona y es feliz a través de mi expresión, esta es la mayor satisfacción y aspiración. 

 **Su concepto del toreo ha sido definido muchas veces como “clásico y eterno”. ¿Cree usted que en la actualidad, donde abundan estilos más efectistas, sigue habiendo espacio para ese clasicismo? ¿Qué mensaje quiere transmitir cada vez que se pone delante de un toro?**

Particularmente siento que los públicos si se identifican con mi toreo. Expreso mi concepto bajo los cánones del clasicismo, con mi singularidad personal. Me gusta la originalidad en el ruedo y que no haya nada previsible ni encorsetado.

**En España, la temporada pasada dejó tardes memorables en plazas de primera. ¿Qué importancia le da a triunfar en Madrid o Sevilla frente a otras plazas más pequeñas? ¿Considera que el público de cada ciudad entiende y valora de manera distinta su tauromaquia?**

Mi filosofía como torero pasa por expresar mi toreo con la misma entrega y compromiso independientemente de la categoría reglamentaria de la plaza. El público acude a la plaza y merece ver la mejor versión de uno mismo. 

En plazas de primera es cierto que ha habido faenas importantes en este año 2025, en las que he sentido el reconocimientos de aficiones que son exigentes y dan crédito. Inolvidables han sido las faenas en Sevilla y Málaga, el San Isidro de esta temporada o las tardes de capacidad en Dax y Albacete. 



**La juventud se acerca cada vez más al toreo, pero también se enfrenta a críticas sociales. ¿Qué consejo daría usted a los jóvenes que sueñan con ser toreros, y cómo cree que deberían afrontar las presiones externas que cuestionan la fiesta?**

Que persigan su sueño con fe, sin complejos y sintiéndose libres. 

**El toro bravo es el eje de todo este mundo. ¿Qué opinión tiene usted sobre la evolución de las ganaderías actuales? ¿Prefiere enfrentarse a hierros de máxima exigencia que ponen a prueba al torero, o cree que también es necesario buscar variedad para mostrar diferentes matices de su arte?**

El nivel de las ganaderías, cada una en su contexto y personalidad, en la actualidad es muy alto. Los ganaderos están haciendo una gran labor. 
Para el aficionado considero que causa mayor interés la variedad que la monotonía. Me preparo diariamente para tener registros suficientes para expresar mi toreo a todo tipo de toros independientemente de su condición o ganaderia, siempre fiel a mi sello personal.`,
  footerImage1: "/images/victorluengo.jpg",
  footerImage1Caption: "Fotos de Víctor Luengo",
  footerImage2: "/images/davidgalvan3.jpg",
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 341,
       title: "El torismo toma parte de la temporada 2026 en Las Ventas: Cuadri, Saltillo, Palha, Partido de Resina, Dolores Aguirre…",
    image: "/images/torismo.jpg",
    category: "Actualidad",
    date: "29 de noviembre de 2025",
    fullContent: `La comparecencia de Rafael García Garrido, presidente de Plaza 1, en el ciclo de tertulias invernales de la Asociación El Toro de Madrid dejó varios titulares relevantes. Entre ellos destacó el anuncio de algunas de las ganaderías que pisarán el ruedo de Las Ventas durante la próxima temporada, con una clara apuesta por el perfil más torista del campo bravo español.

Ganaderías como Cuadri, Saltillo, Palha, Partido de Resina o Dolores Aguirre figuran entre los hierros que formarán parte de la programación venteña en 2026, consolidando así un bloque ganadero de marcado carácter torista dentro de la estructura de la temporada.

García Garrido también confirmó la ausencia de algunos hierros emblemáticos debido a la falta de reses disponibles, entre ellos Miura, Santiago Domecq y Baltasar Ibán. En cuanto a Valdellán —cuya presencia generó interés durante la tertulia—, el empresario señaló que su participación continúa siendo una incógnita de cara al próximo año.`,
  author: "Tendido Digital",
  authorLogo: "/images/tendidodigitallogosimple.png",
  showAuthorHeader: true
  },
	{ 
    id: 342,
       title: "David de Miranda, un torero con alma de niño en el Colegio Montaigne Compañía de María de Jerez",
    image: "/images/reemplazo.jpg",
    category: "Actualidad",
    date: "29 de noviembre de 2025",
    fullContent: `En la mañana de ayer , viernes 28 de noviembre, el claustro mudéjar el Colegio Montaigne Compañía de María, en Jerez de la Frontera, se convirtió en el escenario de una jornada cargada de emoción, tradición y aprendizaje. En este histórico espacio, el torero David de Miranda ofreció una interesante charla a los estudiantes, compartiendo sus experiencias y reflexiones sobre el toreo, su vida y su carrera. El evento, que contó con la moderación del periodista Óscar Torres, de Onda Jerez, estuvo dirigido a niños y jóvenes de entre 3 y 17 años, quienes mostraron un notable interés por el mundo taurino.
 
La jornada se inició con la intervención de la profesora y aficionada taurina Elena Aguilar Valderas, quien, además de ser jurado del circuito de novilladas de las escuelas andaluzas, es docente en el colegio. Aguilar Valderas introdujo a los alumnos al mundo del toreo, destacando la
importancia de la cultura taurina en la ciudad de Jerez, considerada la Cuna del Toro Bravo. A continuación, Francisco Marín, director del colegio, expresó su satisfacción por poder contar con la presencia de un torero de la talla de David de Miranda, cuya historia inspira tanto a los jóvenes como a los adultos.
 
La charla, moderada por Óscar Torres, se centró en el universo del toreo y las vivencias de David de Miranda, quien se mostró cercano y sincero con los estudiantes. Durante su intervención, el torero de Trigueros destacó la importancia de la soledad en el ruedo, señalando que "el torero está solo frente al toro, pero esa soledad, aunque inquietante, es parte del rito, del sacrificio y del desafío". Con una mirada profunda, añadió que el miedo y la incertidumbre son inseparables del oficio, pero que "los sueños y las ilusiones son más fuertes y superan cualquier temor".
 
David repasó algunos de los momentos más destacados de su carrera, como su impresionante debut en la Plaza de Las Ventas, -Puerta Grande en su confirmación de Alternativa-, la Puerta de Príncipe de Sevilla, la histórica tarde de Málaga, así como otras tardes memorables como Linares, Almería, Soria, Pozoblanco...También compartió con los estudiantes la dura experiencia de la grave lesión que sufrió en Toro (Zamora), un accidente que marcó un antes y un después en su carrera. Sin embargo, el diestro destacó la resiliencia que le permitió superar ese difícil momento, y cómo el apoyo de su familia y de la afición le ayudó a recuperarse y seguir adelante.
 
El torero también habló con entusiasmo de su futuro en el toreo, mencionando su colaboración con el maestro Enrique Ponce, uno de los grandes referentes del toreo mundial. "Nadie me ha regalado nada", afirmó, "y eso es lo que me impulsa a seguir adelante con la misma mentalidad y actitud, tanto en lo profesional como en lo personal". Para David, el toreo es un arte único, al igual que la infancia, y en ese sentido, instó a los jóvenes a luchar por sus sueños para ser felices con las profesiones que elijan, sin rendirse ante las dificultades.
 
La jornada culminó con un emotivo acto en la Capilla de La Niña María, donde David de Miranda recibió la bendición de una medalla de la compañía de la Virgen, un regalo que le hicieron los alumnos del colegio. Después, el torero firmó numerosos capotes y muletas, y tuvo la oportunidad de torear "in situ" con los jóvenes de la escuela taurina del colegio, quienes demostraron una gran pericia en el manejo de los hábitos de torear. El onubense compartió esta experiencia con su hombre de plata Fernando Pereira que también aleccionó a varios jóvenes.
 
El Colegio Montaigne Compañía de María, con su escuela taurina en el patio-recreo, sigue cultivando el amor y respeto por la tradición taurina y esta jornada con David de Miranda fue una oportunidad única para que los niños y jóvenes del centro se acercaran de primera mano a la vida de un torero.
 
Al final, todos compartieron la sensación de que el toreo, más allá de ser un arte, es una pasión que se lleva en el corazón desde la infancia y que, como los sueños, nunca se debe dejar de perseguir.`,
  footerImage1: "/images/davidmiranda2.jpg",
  author: "Tendido Digital",
  authorLogo: "/images/tendidodigitallogosimple.png",
  showAuthorHeader: true
  },
	{ 
    id: 343,
       title: "El documental dedicado a la figura de ‘Mondeño’ se presenta el 3 de diciembre en Sanlúcar la Mayor, su ‘segundo’ pueblo",
    image: "/images/documental.jpg",
    category: "Actualidad",
    date: "28 de noviembre de 2025",
    fullContent: `Tras la emisión del documental en el mismo teatro se celebrará una mesa redonda en la que participarán el periodista Juan Belmonte, el poeta y compositor **José León, Ralf Bunger y el torero David de Miranda**.
 
El documental ‘Mondeño, el torero místico’ será presentado el próximo miércoles 3 de diciembre en el **centro municipal de cultura de Sanlúcar La Mayor a las 19,30 horas.**
 
Tras su estreno en Sevilla y su presentación en la Peña Francisco Montes ‘Paquiro’ de Chiclana, la elección de esta localidad no es casual. El torero descansa para siempre en este pueblo, donde pasó largas temporadas en su finca ubicada en el citado municipio junto a Ralf Bunger, su pareja sentimental hasta su muerte e hilo conductor del documental.

El proyecto, dirigido por Juan Belmonte y Rogelio M.Gordo, quiere ahora recalar en la que también consideraba su tierra con el fin de acercarle su vida a los que fueron sus vecinos. En concreto, sus últimos años los pasó entre Sanlúcar y París.
 
Juan García 'Modeño' no fue un torero al uso. Ni en el ruedo, ni en su día a día en la España franquista de los años 60. Sobre el albero fue considerado el eslabón entre la tauromaquia de Manolete con la de José Tomás.
 
Y fuera también tuvo una singular trayectoria pues cuando estaba en la cima del toreo sintió la llamada de Dios y se metió a monje. Su toma de hábitos se convirtió en un auténtico acontecimiento nacional aireada incluso por el Nodo.
 
En la obra, el propio Mondeño cuenta los pormenores de su vida, su relación con el mundo del toro, su decisión de entrar en una congregación dominica y su vida junto al que fuera su amor: Ralf Bunger.
 
A su vez, el documental recoge su faceta más familiar y la profesional, a través de numerosas fotografías, reportajes de sus actuaciones en diversas plazas y testimonios de toreros de la época como Curro Romero.
 
Tras su emisión, en el mismo teatro, se celebrará una mesa redonda en la que participarán el periodista Juan Belmonte, el poeta y compositor José León, el propio Ralf y el torero David de Miranda.
 
**En las próximas fechas este documental será emitido por Canal Sur Televisión, cadena que ha participado en la producción.**`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 344,
       title: "Enrique Ponce , nuevo apoderado de David de Miranda",
    image: "/images/enriqueponce.jpg",
    category: "Actualidad",
    date: "27 de noviembre de 2025",
    fullContent: `Los movimientos en el ámbito del apoderamiento taurino continúan. El matador de toros **David de Miranda y Enrique Ponce** han decidido unir sus caminos profesionales. 

El maestro de Chiva inicia así una nueva etapa al asumir el apoderamiento del diestro onubense, considerado uno de los nombres más destacados de la temporada 2025.

El acuerdo se cerró en el día de hoy tras una reunión mantenida entre todas las partes, quedando sellado con el tradicional apretón de manos y con carácter indefinido. El equipo de apoderamiento se completa con la participación de **Juan Ruiz Palomares “Hijo”**, quien seguirá desempeñando un papel fundamental en el desarrollo de la carrera de David de Miranda.

David de Miranda se ha consolidado como uno de los toreros más relevantes de la temporada 2025. 

Sus triunfos en plazas de primera categoría, como **Sevilla o Málaga**, lo sitúan entre los principales **protagonistas de la próxima campaña**. 

Tras finalizar su relación profesional con José Luis Pereda a finales de septiembre, el torero emprende ahora, de la mano de Enrique Ponce, un nuevo proyecto con la mirada puesta en 2026.`,
  author: "Tendido Digital",
  authorLogo: "/images/tendidodigitallogosimple.png",
  showAuthorHeader: true
  },
	{ 
    id: 345,
       title: "La renovación del toreo ha llegado",
    image: "/images/renovacion1.jpg",
    category: "Opinión",
    date: "27 de noviembre de 2025",
    fullContent: `En los últimos años la tauromaquia está sufriendo una transición en todos los aspectos, pero uno de los más notables está siendo la renovación notaria del escalafón, por el retiro de algunas de las figuras de las últimas décadas como El Juli en el 2023, Enrique Ponce en el 2024 y finalmente el acontecimiento de la pasada temporada, el retiro por sorpresa de José Antonio Morante de la Puebla.

Estas retiradas es verdad que han dejado un hueco importante en el escalafón, pero esta claro que este vacío ya se está empezando a cubrir con toreros jóvenes y muy prometedores que mantendrán la salud de la fiesta en los próximos años. Los ejemplos más claros de esta temporada han sido los nombres de Borja Jiménez y Víctor Hernández , Borja se ha conseguido consolidar como una de las figuras  consagradas con sus triunfos principales en las plazas más importantes como Madrid o Bilbao, mientras tanto Víctor ha sido la gran sorpresa de este año con esa buena imagen que dio en la feria de San Isidro y “poniendo la guinda” en esa tarde otoñal en la que inmortalizó algunos de los mejores naturales de la temporada, con los que consiguió que su nombre volviera a relucir en todas las tertulias de  aficionados y profesionales.
Todo esto sumado a otros toreros muy interesantes como Mario Navas con un estilo clásico, Jarocho con su renombre en Madrid y Aaron Palacio que, aunque hace poco que tomó la alternativa ya ha conseguido triunfar con las figuras en plazas de mucha importancia como en San Sebastián, a estos se suman otros como Samuel Navalón, Fernando Adrián, Javier Zulueta y Marco Pérez. Los novilleros en los cuales también recae el peso de la fiesta están dando un gran nivel, dentro del escalafón novilleril encontramos nombres como El Mene, Bruno Aloi y Tomás González, todos ellos están dando un muy buen nivel general y con la sensación de absoluto preparamiento para tomar una futura alternativa.

Esto nos lleva a poder decir que nos vienen años apasionantes para la fiesta de los toros en los que tendremos un panorama taurino muy interesante en los que todos los profesionales deberán “echar la pata palante” para que el aficionado pueda disfrutar de la tauromaquia en todo su esplendor .`,
  author: "Mario Ruiz Ruiz",
  authorLogo: "/images/mariorr.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 346,
    title: "David de Miranda emociona a Chiclana con una lección magistral de toreo y vida",
    image: "/images/david.jpg",
    category: "Actualidad",
    date: "27 de noviembre de 2025",
    fullContent: `La localidad gaditana vivió anoche -miércoles 26 de noviembre- una
de sus veladas más intensas y emotivas con la presencia del matador
onubense David de Miranda, protagonista del coloquio “El Resurgir de
un Torero”, celebrado en el emblemático espacio cultural La Embajada.

El encuentro, conducido magistralmente por el periodista jerezano Javier
Bocanegra, reunió a un aforo “de no hay localidades” y se convirtió en un
recorrido íntimo por la trayectoria humana y profesional de uno de los
grandes nombres de la tauromaquia actual.
Bocanegra destacó a De Miranda como “uno de los triunfadores de
la temporada”, recordando su histórica apertura de la Puerta del Príncipe
de Sevilla, la única lograda en la Real Maestranza durante todo el año 2025,
así como su brillante actuación en la Feria de Málaga. 

El público asistió a
un relato honesto y conmovedor donde el torero desgranó una carrera
marcada por la entrega, la superación y la verdad.
Tras la proyección de un vídeo que recogía sus mejores faenas en
Málaga y Sevilla, De Miranda confesó vivir aún con sorpresa sus propios
hitos: “A veces me cuesta creer en mí mismo, pero cuando veo estas
imágenes pienso en lo que he sido capaz de hacer”. Esta reflexión abrió
paso a una conversación sobre su futuro profesional y la elección de un
nuevo apoderado: “Antes no tenía nada, nadie llamaba. Ahora el teléfono
no deja de sonar. La decisión será difícil, pero siempre con todas las cartas
boca arriba”.

Uno de los momentos más sobrecogedores llegó al recordar la
gravísima cogida sufrida en Toro (Zamora), que lo dejó paralizado: “No
podía respirar y solo pensaba: ‘Por Dios, que no me vuelva a coger’”.

También evocó el frenazo que supuso la pandemia tras abrir la Puerta
Grande de Las Ventas en 2019, un golpe que interrumpió su ascenso y
obligó a reconstruirse desde dentro.
El coloquio permitió revivir la faena de 2024 en la Maestranza al toro
‘Tabarro’, de Santiago Domecq, que le devolvió la confianza, y su
consagración en Sevilla el 10 de mayo de 2025, cuando volvió a conquistar
el Coso del Baratillo. Sin embargo, lamentó la escasez de contratos
posteriores: “Abres la Puerta del Príncipe y solo te sale Málaga. Te
planteas muchas cosas, pero siempre he confiado en mí y sabía que tenía
que llegar”.

Precisamente en La Malagueta, el 19 de agosto, firmó una de las
actuaciones que ya forman parte de la memoria taurina contemporánea ante
‘Enamorado’, de Victoriano del Río. “Le vi en la mirada que, si le
aguantaba, tendría nobleza. Aposté por él”, confesó. Solo después, al ver
las imágenes, comprendió que aquel toro había marcado un antes y un
después en su vida.
La noche concluyó entre aplausos prolongados y emociones
compartidas. 

La presidenta de la Escuela Taurina Francisco Montes
“Paquiro”, Rocío Oliva, anfitriona del acto, afirmó que De Miranda “Será
una figura que marcará una gran época del toreo”. Sus palabras fueron
refrendadas por todos los alumnos de la escuela, que arroparon al diestro
onubense con admiración y máximo respeto.
El diálogo repasó también su alternativa de manos de José Tomás,
símbolo de confianza y destino. Desde entonces, David de Miranda ha
forjado una carrera “fiel a su tierra y a su afición”, especialmente en
Huelva, donde se le siente como un hijo que honra su origen a través del
toreo.
La velada en Chiclana de la Frontera quedó en la memoria colectiva
como una auténtica cátedra de vida y de tauromaquia, pronunciada por un
torero que ha sabido rehacerse a sí mismo desde la fe, la entrega y el amor
más absoluto a su profesión.`,
  footerImage1: "/images/david1.jpg",
  footerImage2: "/images/david2.jpg",
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 347,
       title: "El novillero Miguel Senent “Miguelito” cambia el oro por la plata",
    image: "/images/novillero.jpg",
    category: "Actualidad",
    date: "26 de noviembre de 2025",
	excerpt: "El novillero natural de valencia ha cambiado el oro por la plata para la temporada 2026",
    fullContent: `En un comunicado difundido por sus rrss el novillero Miguel Senent “Miguelito” ha querido comunicar la decisión de cambiar el traje de oro por el de plata y hacerse banderillero de cara a la próxima temporada

 

Comunicado íntegro de Miguel Senent “Miguelito”

Hoy me dirijo a todos vosotros con el corazón lleno de sentimientos encontrados. Después de mucho pensarlo, he tomado la decisión de poner fin a mi etapa como novillero con picadores. Han sido años de entrega absoluta, de sueños y de lucha constante por abrirme camino en este mundo tan grande y tan exigente como es el toreo. He dado todo lo que tenía dentro, pero a veces las cosas no salen como uno desea.

Quiero despedirme de toda mi gente: de quienes me han acompañado desde el principio, de los que han creído en mí incluso en los momentos más difíciles. A mi familia, mis amigos, mi cuadrilla, mi peña taurina y a todos los aficionados que me han regalado una palabra de ánimo, un abrazo o simplemente su presencia en la plaza… gracias. Sin vosotros este camino habría sido imposible.

El toreo me ha enseñado a caer, a levantarme y a seguir adelante. Y por eso, aunque cierro una etapa, no me marcho del mundo que me ha dado todo. A partir de ahora emprendo un nuevo rumbo: dejo el oro para vestir la plata. Empiezo una nueva vida como banderillero, con la misma ilusión, la misma entrega y el mismo respeto por esta profesión que siempre me ha guiado.

Ojalá nos sigamos encontrando en las plazas, desde otra posición, pero con el mismo compromiso y la misma pasión`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 348,
       title: "Miguel Abellan y Víctor Hernández nueva relación de apoderamiento",
    image: "/images/victor.jpg",
    category: "Actualidad",
    date: "26 de noviembre de 2025",
    fullContent: `Víctor Hernández ya cuenta con nuevo apoderado para la temporada 2026: **Miguel Abellán**. El matador de toros madrileño y exgerente del Centro de Asuntos Taurinos de la Comunidad de Madrid asumirá la gestión de la carrera del torero de Los Santos de la Humosa, según adelanta el periodista Vicente Zabala de la Serna.

Víctor Hernández se ha revelado como una de las grandes sorpresas de la temporada 2025, tras firmar dos destacadas actuaciones en Madrid que le han situado entre los diestros con mayor proyección de cara a 2026.

El equipo de apoderamiento se completará con **Roberto Ortega** , quien continuará al cargo del joven matador de toros.`,
  author: "Tendido Digital",
  authorLogo: "/images/tendidodigitallogosimple.png",
  showAuthorHeader: true
  },
	{ 
    id: 349,
       title: "La Casa de Misericordia anuncia el elenco ganadero de la Feria del Toro 2026",
    image: "/images/paseillo.jpg",
    category: "Actualidad",
    date: "26 de noviembre de 2025",
    fullContent: `**La Comisión Taurina de la Casa de Misericordia** de Pamplona ha dado a conocer los hierros que participarán en la **Feria del Toro 2026**, certamen que repetirá íntegramente el elenco ganadero de la pasada edición.

Regresarán a los Sanfermines los toros de **José Escolar**, cuya corrida fue distinguida con el premio Feria del Toro 2025. Asimismo, volverán a lidiarse los astados de **Cebada Gago, ganadores del premio Carriquiri con el toro Lioso**, galardón que compartieron ex aequo con Histórico, ejemplar del hierro de Jandilla, considerado también el mejor toro de la feria 2025.

Completan la nómina de ganaderías de lidia a pie **Fuente Ymbro, Miura, La Palmosilla, Victoriano del Río y Álvaro Núñez**, esta última repetirá presencia tras su debut en 2025, consolidándose como habitual en el ciclo sanferminero.

Para el festejo de rejones, la ganadería seleccionada vuelve a ser **El Capea – Carmen Lorenzo**, mientras que la novillada contará nuevamente con reses de la ganadería navarra de Pincha.

Con este anuncio, la Casa de Misericordia de Pamplona supera el primer hito organizativo de una feria taurina que gestiona de manera ininterrumpida desde 1922.`,
  author: "Tendido Digital",
  authorLogo: "/images/tendidodigitallogosimple.png",
  showAuthorHeader: true
  },
	{ 
    id: 350,
       title: "Almadén de la Plata (Sevilla) refuerza el 'Día del Jamón' con una novillada televisada por Canal Sur",
    image: "/images/almaden.jpg",
	footerImage1: "/images/cartel.jpg",
	footerImage1Caption: "Imagen del Cartel",
    category: "Actualidad",
    date: "25 de noviembre de 2025",
    fullContent: `Un festejo organizado a tres bandas por: la Escuela de Sevilla, la  Escuela de Ubrique y el propio consistorio de Almadén
 
La Torre del Reloj del municipio sevillano se convirtió en escenario de la presentación oficial del cartel de la novillada en clase práctica que tendrá lugar el próximo sábado 29 de noviembre, uno de los actos principales de la VIII edición del Día del Jamón, que se celebrará los días 28, 29 y 30 de este mes. El alcalde, Carlos Raigada, y el delegado del Gobierno de la Junta de Andalucía en Sevilla, Ricardo Sánchez, presidieron el acto, arropados por numerosas autoridades y vecinos.
 
Durante la presentación, que reunió a aficionados y representantes del mundo del toro, destacó la presencia del maestro Tomás Campuzano, encargado de apadrinar el evento. Junto a él se encontraba Eduardo Ordóñez, director de la Escuela Taurina de Ubrique y presidente de la Asociación Andaluza de Escuelas Taurinas ‘Pedro Romero’.
 
Raigada y Sánchez desvelaron oficialmente el cartel de la novillada sin picadores, programada para el sábado 29 de noviembre a las 17:30 horas en la plaza de toros municipal. El alcalde puso en valor la integración de la tauromaquia en la programación de este año, subrayando que la feria constituye “una apuesta por la gastronomía, la cultura, la naturaleza y la música, reforzada en esta edición con el impulso del toreo”.
 
Por su parte, el Delegado del Gobierno elogió la labor del ayuntamiento y la firme apuesta del equipo municipal por la promoción del turismo rural, destacando “el gran esfuerzo organizativo que ha permitido consolidar un evento que cada año atrae a más visitantes”.
 
El cartel: seis novilleros y una ganadería sevillana
 
La novillada contará con seis reses de la ganadería de Albarreal, que serán lidiadas por alumnos de distintas escuelas taurinas andaluzas y nacionales. Los jóvenes actuantes son:
 
Agustín de Antonio y Armando Rojo, de la Escuela de Tauromaquia de Sevilla.
Candela “La Piyaya”, de la Escuela Taurina de Madrid José Cubero “Yiyo”.
Fernando Lovera, de la Escuela Taurina de Camas.
Mario Torres y Juan Manuel Viruez, de la Escuela Taurina Comarcal de Ubrique.
 
Los seis novilleros estuvieron presentes en la presentación, donde pudieron compartir impresiones con las autoridades y con numerosos aficionados que se acercaron a la Torre del Reloj. Además del festejo del sábado, la organización ha previsto para el domingo 30 de noviembre a las 11:30 horas una clase de toreo de salón, protagonizada por alumnos de la escuela taurina del maestro Tomás Campuzano-Triana. Esta actividad tendrá lugar en el centro del pueblo y busca acercar el aprendizaje y la técnica taurina al público general.
 
La novillada será retransmitida por Canal Sur TV, lo que permitirá llevar el festejo a espectadores de toda Andalucía y aumentar la proyección del evento más allá del ámbito local. En el acto de presentación también participaron vecinos del municipio, entre los que el alcalde delegó la representación en el palco presidencial: Francisco Alonso y Antonio Suárez, acompañados por miembros del equipo de gobierno del Ayuntamiento de Almadén de la Plata.
 
El Día del Jamón, ya consolidado como uno de los principales referentes gastronómicos y culturales de la comarca, volverá a reunir durante tres jornadas degustaciones, música, naturaleza y demostraciones culinarias junto a esta apuesta renovada por la tauromaquia. Con la presentación del cartel taurino, Almadén de la Plata reafirma su voluntad de convertir esta celebración en una cita ineludible dentro del calendario festivo provincial.`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 351,
       title: "Las Ventas acogerá la final de la Copa Chenel 2026, consolidando el certamen como referente taurino nacional",
    image: "/images/copachenel1.jpg",
	imageCaption: "Plaza de Toros de las Ventas",
    category: "Actualidad",
    date: "24 de noviembre de 2025",
    fullContent: `**La Comunidad de Madrid, la Fundación Toro de Lidia y Plaza 1** han anunciado que la gran final de la **Copa Chenel 2026** se celebrará en la **Plaza de Toros de Las Ventas**, un paso decisivo que afianza al certamen como uno de los proyectos taurinos más relevantes del panorama nacional.

Plaza 1 reservará una fecha del calendario de la temporada 2026 para la celebración de esta final, **cuya jornada exacta se comunicará próximamente**. Como viene siendo habitual, el matador triunfador obtendrá un puesto en la tradicional corrida del Día de la Hispanidad.

El ciclo, que reúne a toreros emergentes con matadores consolidados y ganaderías de reconocido prestigio, culminará este año en el escenario más emblemático de la tauromaquia, **ofreciendo a los finalistas una oportunidad de máximo nivel y exigencia profesional.**

Con la designación de Las Ventas como sede de la final, la Copa Chenel reitera su compromiso con la promoción de los toreros, la diversidad ganadera y la difusión de la tauromaquia en toda la Comunidad de Madrid.`
  },
	{ 
    id: 352,
       title: "Tomás Rufo cierra su cuadrilla para 2026 con la incorporación del picador José María González",
    image: "/images/rufo.jpg",
    category: "Actualidad",
    date: "24 de noviembre de 2025",
    fullContent: `El matador de toros **Tomás Rufo** ha completado su cuadrilla para la temporada **2026**, sumando a sus filas al picador **José María González**, profesional de amplia trayectoria y reconocido por su destacada etapa junto al maestro Antonio Ferrera, entre otros toreros de primera línea.

Con esta incorporación, el equipo del diestro de Pepino queda configurado de la siguiente manera:
	•	**Picadores:** José María González y Rubén Sánchez
	•	**Banderilleros:** Sergio Blasco, Andrés Revuelta y Fernando Sánchez
	•	**Mozo de espadas:** Álvaro Santos
	•	**Apoderado:** Víctor Zabala

De este modo, Tomás Rufo encara la próxima campaña con una cuadrilla plenamente definida y reforzada para los compromisos taurinos del año venidero.`
  },
	{ 
    id: 353,
       title: "“Considero que soy un torero que tiene personalidad” - Entrevista con Sergio Rodríguez",
    image: "/images/sergior.jpg",
	imageCaption: "Sergio Rodríguez en la Final de la Copa Chenel",
	footerImage1: "/images/sergior1.jpg",
	footerImage1Caption: "Sergio Rodríguez el pasado 12 de Octubre en Las Ventas - Foto Plaza 1",
	footerImage2: "/images/sergior2.jpg",
    category: "Entrevistas",
    date: "24 de noviembre de 2025",
    fullContent: `A las puertas de una nueva campaña taurina, **Sergio Rodríguez** encara uno de los momentos más determinantes de su carrera. El matador abulense, que en apenas unos años ha pasado de promesa a nombre imprescindible del escalafón joven, vive un proceso de madurez profesional que ilusiona tanto al aficionado. 

**Tras una temporada marcada por la regularidad**, triunfos de peso y tardes en las que dejó constancia de su personalidad en la plaza, Sergio ha logrado posicionarse como uno de los toreros con mayor proyección del momento. Su concepto clásico, su valor sereno y una ambición cada vez más evidente lo convierten en un perfil que despierta interés.

**¿Qué significó para ti proclamarte triunfador de la Copa Chenel 2025 y cómo crees que ese triunfo puede cambiar tu carrera?**

“Bueno, pues aparte de la satisfacción que a uno le da triunfar y ganar, certámenes 
 tan importantes como puede ser la Copa Chenel, fue un poco la recompensa a muchos meses de entrenamiento, de disciplina, de entrega.
Entonces, pues bueno, significó mucho, tanto como parami torero como para la persona que soy.
Fue un antes y un después, sin duda.
Y bueno, pues espero que el año que viene me den un poco las oportunidades que este año no se me han dado y creo que merecía por los motivos que había dado en la plaza.
Creo que eso es un poco lo que más puedo esperar de cara al año que viene.”

**¿Cómo recuerdas tus primeros pasos en la tauromaquia, empezando desde que tenías 12 años en la escuela taurina de Las Navas del Marqués?**

“Pues son recuerdos muy bonitos, todos los recuerdo de una manera muy gratificante y muy feliz.
De hecho, hay muchos que los añoro, hay cosas que ya no van a volver por la inocencia de un niño que empieza, por un montón de cosas que se tienen cuando uno está empezando.
La verdad que las extraño.
Y bueno, fue una etapa muy bonita donde di mis primeros pasos en una escuela de aficionados.
Ni siquiera yo quería ser torero, pero bueno, ahí fue donde me entró ese veneno que decimos los toreros para querer dedicarme ya de una manera profesional al torero.”

**¿Cómo definirías tu estilo dentro del ruedo y qué toreros han influido en tu forma de torear?**

“Considero que soy un torero que tiene personalidad.
Interpreto el toreo de una manera muy personal.
Es cierto que siempre me he fijado mucho en el maestro José Tomás, en el maestro Morante, en el maestro Rafael de Paula , pero nunca he intentado copiar nada.
Siempre he buscado las cosas que más me han gustado de estos maestros y he intentado trasladarlo a mis formas y a mi concepto.”

	**¿Qué te gustaría que la afición recordara de ti dentro de unos años?**

“Bueno, pues me gustaría que me recordasen como un torero de época, un torero especial, con un concepto propio del toreo.
Y me encantaría intentar marcar la época en el torero y sobre todo ser torero de torero.
Creo que es lo más grande que hay y creo que es la mejor forma que se le pueda recordar a un torero, siendo torero de torero.”

**¿Cómo planteas la temporada que viene después de los triunfos logrados este año?**

“Pues la verdad que, bueno, la temporada del año que viene es un poco incógnita, no sé muy bien el que puede pararme, pero sí tengo claro lo que yo quiero y lo que me encantaría conseguir, por supuesto.
Me encantaría volver a Madrid, me encantaría que la afición de Madrid me viese como yo soy, aprovechar esa oportunidad que ahora mismo tanto necesito para hacerme un hueco dentro del escalafón.”

**¿Como afrontas tu compromiso en Perú , donde este próximo mes de diciembre torearás allí?**

“Bueno, pues la verdad que el compromiso de Perú lo afrontó con mucha ilusión.
Al final ha sido una inyección de moral.
Cuando uno tiende un poquito a relajarse una vez terminada la temporada, pues que le llamen para viajar a uno de los países que más en auge está en la actualidad en el mundo del toro, pues es muy bonito y también me viene la responsabilidad.
Quiero aprovechar esa oportunidad que se me ha brindado, que creo que es muy buena.
Y nada, pues me encanta conocer nuevos países, nuevas costumbres y sobre todo que conozca mi toreo en otros rincones del mundo.”`
  },
	{ 
    id: 354,
       title: "José María Garzón dirigirá la Real Maestranza de Sevilla durante los próximos cinco años",
    image: "/images/garzon.jpg",
    category: "Actualidad",
    date: "22 de noviembre de 2025",
    fullContent: `La Real Maestranza de Caballería de Sevilla ha anunciado oficialmente el nombramiento de José María Garzón como nuevo empresario de la Plaza de Toros de Sevilla para los próximos cinco años.
La designación, aprobada por la Junta General de la institución, supone el inicio de una nueva etapa en la gestión del coso sevillano y el cierre de una era histórica: la salida de la empresa Pagés tras más de 90 años al frente de la plaza.

Garzón asumirá el control bajo la estructura empresarial de Lances de Futuro, una empresa que en los últimos años se ha convertido en una de las gestoras taurinas más activas del país. La empresa, caracterizada por un enfoque moderno y una apuesta firme por la tauromaquia y con una buena política de precios como este medio ya dijo , ha dirigido plazas como Almería, Málaga o Algeciras, consolidando un modelo de gestión que combina el bien para el aficionado y el bien para el toreo. 

Una empresa en expansión
Fundada en 2006 , Lances de Futuro ha destacado por su estrategia de programación anual en las plazas que administra, integrando no solo festejos taurinos, sino también actividades divulgativas, conferencias y propuestas orientadas a la participación de jóvenes y aficionados.

Su presencia se reparte entre Andalucía , donde mantiene equipos especializados en administración, comunicación, producción y coordinación de eventos. Este perfil profesionalizado ha sido uno de los factores clave en la adjudicación de diferentes plazas de importancia en los últimos años.

La adjudicación de la plaza sevillana representa el mayor desafío en la trayectoria empresarial de Garzón. La Maestranza, considerada uno de los escenarios taurinos más prestigiosos del mundo, exige una programación de máxima calidad, estabilidad financiera y una gestión respetuosa, pero también abierta a la evolución del espectáculo.

Fuentes cercanas al sector apuntan a que la nueva dirección impulsará iniciativas para atraer a nuevos públicos, ajustar precios en determinados festejos y reforzar la presencia cultural de la tauromaquia en la ciudad.

Asimismo, se prevé una revisión de la estructura de ferias como la de Abril, con el objetivo de combinar figuras consagradas con talentos emergentes.

 La llegada de Lances de Futuro podría representar una renovación en la forma de concebir la temporada taurina, aunque el sector coincide en que el margen de maniobra requerirá equilibrio entre innovación y respeto por las formas sevillanas.`
  },
	{ 
    id: 355,
       title: "Borja Jiménez , Víctor Hernández , Fortes , Aaron Palacio , Jandilla… Premiados por el Real Casino de Madrid",
    image: "/images/premio.jpg",
    category: "Actualidad",
    date: "22 de noviembre de 2025",
    fullContent: `Borja Jiménez, uno de los grandes nombres de la pasada Feria de San Isidro, fue protagonista este viernes en el Real Casino de Madrid con motivo de la entrega de los Premios Taurinos 2025 de la institución. El diestro sevillano recibió el galardón a la Mejor Faena, un reconocimiento que premia su histórica obra ante Milhijas, de Victorino Martín, al que desorejó en la corrida In Memoriam del 15 de junio. Aquella actuación, ya inscrita en la memoria reciente de Las Ventas, consolidó su figura en la temporada.

En su vigésimo novena edición, el Real Casino proclamó como Triunfador de la Feria a José Antonio Morante Camacho, Morante de la Puebla, que sucede en el palmarés a Borja Jiménez (2024) y a otras figuras de primer nivel galardonadas en años anteriores: Sebastián Castella (2023, 2015 y 2007), Tomás Rufo (2022), Antonio Ferrera (2019), Alejandro Talavante (2018 y 2013), Ginés Marín (2017), Paco Ureña (2016), Miguel Ángel Perera (2014), José María Manzanares (2011), El Cid (2008, 2006 y 2005), Matías Tejela (2004), José Pacheco El Califa (2003 y 2000), Enrique Ponce (2002), Rafael de Julia (2001), José Tomás (1999 y 1997), Eugenio de Mora (1998), Víctor Puerto (1996) y César Rincón (1995), entre otros. En 2010 y 2012 el premio quedó desierto.

Los Premios Taurinos Real Casino de Madrid nacieron con el objetivo de reconocer las actuaciones más destacadas de la Feria de San Isidro y de contribuir, desde una entidad histórica y de profunda tradición, a la defensa y promoción de la tauromaquia. La entrega de galardones se celebró en una cena de gala en el Salón Real del emblemático edificio madrileño.

Premiados en los Premios Taurinos Real Casino de Madrid 2025
	•	Triunfador de la Feria: José Antonio Morante Camacho, Morante de la Puebla, por sus actuaciones del 28 de mayo (Prensa) y 8 de junio (Beneficencia).
	•	Mejor faena: Borja Jiménez, por su labor ante Milhijas, nº 104, de Victorino Martín (15 de junio, 6º).
	•	Torero revelación: Víctor Hernández, por su actuación del 10 de mayo frente a Busca-Oro, nº 961, de El Pilar.
	•	Ganadería más completa: Jandilla, por la corrida del 5 de junio.
	•	Toro más bravo: Milhijas, nº 104, de Victorino Martín (15 de junio).
	•	Mejor estocada: Emilio de Justo, por su estocada a Milhebras, nº 40, de Victorino Martín (15 de junio).
	•	Mejor par de banderillas: Víctor del Pozo, ante Calentito, nº 18, de José Escolar (3 de junio).
	•	Mejor novillero: Aarón Palacio, por su actuación del 13 de mayo con novillos de Alcurrucén.
	•	Mención especial “Una tarde para el recuerdo”: Saúl Jiménez Fortes (21 de mayo, Arauz de Robles).
	•	Mención especial al coraje y valor: Noé Gómez del Pilar (3 de junio, José Escolar).
	•	Mención especial al quite de riesgo: Morante de la Puebla, por su célebre “quite del vaso” del 28 de mayo, realizado a cuerpo limpio a su banderillero José María Amores ante Seminarista, nº 7, de Garcigrande.
	•	Mención especial al medio de comunicación: Radio Televisión Madrid, por su amplia cobertura y apoyo a la tauromaquia.`
  },
{ 
    id: 356,
       title: "La Feria de Fallas 2026 comienza a tomar forma con Talavante como eje del abono",
    image: "/images/feriafallas.jpg",
    category: "Actualidad",
    date: "22 de noviembre de 2025",
    fullContent: `El engranaje de la próxima Feria de Fallas 2026 de Valencia ha comenzado ya a tomar forma. Aunque aún estamos a finales de noviembre, este es el momento clave: la empresa gestora, Espacios Nautalia 360, debe tener perfilado el grueso de los carteles antes de Navidad, ya que está obligada a entregar la propuesta a la Diputación Provincial a comienzos del próximo año para su aprobación, tal y como exige el pliego de condiciones —recientemente prorrogado—.

Para la Feria de Fallas y la de Julio, la empresa tiene reseñadas, por el momento, corridas de Núñez del Cuvillo, Fuente Ymbro, Juan Pedro Domecq, La Quinta, Santiago Domecq, Jandilla, Victoriano del Río y El Puerto de San Lorenzo. A medida que se encajen las piezas del abono, se determinará en qué fechas irá cada encierro. En cuanto al festejo de rejones, está prevista una corrida de María Guiomar Cortés de Moura.

Un abono con nombres propios

En el capítulo de toreros, Alejandro Talavante apunta a ser el único matador que hará doblete. Tras encabezar el escalafón en 2025, recaerá sobre él el privilegio —y la responsabilidad— de abrir la temporada en una plaza de primera categoría actuando dos tardes.
Por su parte, Roca Rey, inicialmente presente una sola tarde, debe elegir todavía hierro: Jandilla, con el que mantiene una sólida trayectoria, o Victoriano del Río, con el que su vínculo histórico es aún mayor.

El día grande, San José (19 de marzo), ya tiene cerrado su cartel: Alejandro Talavante, Emilio de Justo y Juan Ortega lidiarán una corrida de Núñez del Cuvillo.

A partir de estas bases se perfilará un abono en el que también estarán, en los carteles de máxima categoría, Sebastián Castella, José María Manzanares, Pablo Aguado y Tomás Rufo. Asimismo, debe figurar en una de las combinaciones estelares Borja Jiménez, el gran nombre de la temporada 2025 junto a Morante.

La presencia valenciana

En cuanto al elenco local, destaca el nombre de Samuel Navalón, cuya inclusión en un cartel de figuras se considera un acto de justicia taurina. Además, el pliego de condiciones obliga a la empresa a garantizar un número mínimo de puestos para toreros valencianos a lo largo de la temporada.

Pendientes de compensación

Tampoco conviene olvidar uno de los episodios negativos de la Feria de 2025: la suspensión por lluvia de la corrida de El Parralejo, prevista el viernes de Fallas con Miguel Ángel Perera, Paco Ureña y Fernando Adrián. Los tres deberían tener una nueva oportunidad en el serial de 2026, al igual que Víctor Hernández y David de Miranda, que también han hecho méritos para estar presentes.

En los próximos días, la composición definitiva del abono comenzará a desvelarse conforme avancen las negociaciones entre Espacios Nautalia 360 y los distintos apoderados.`
  },
	{ 
    id: 357,
       title: "Rafael de Julia reaparecerá en 2026",
    image: "/images/rafael1.jpg",
	footerImage1: "/images/rafael2.jpg",
	footerImage1Caption: "Foto de Luis Miguel Sierra",
    category: "Actualidad",
    date: "22 de noviembre de 2025",
    fullContent: `Rafael de Julia ha confirmado en una entrevista a MundoToro que volverá a los ruedos en la temporada 2026, un año después de aquella tarde de marzo en Madrid que supuso un antes y un después en su carrera y en su vida. Lo que entonces pocos podían imaginar es que detrás de aquel bajón en su rendimiento se escondía una enfermedad silenciosa —la anorexia nerviosa— que fue debilitando, día a día, su cuerpo y su mente hasta obligarle a detenerse. Nueve meses más tarde, el torero madrileño ha vuelto a realizar tentaderos y asegura sentirse “fuerte y capaz delante de los animales”, un avance que él mismo valora como especialmente significativo en su recuperación.

En su conversación con MundoToro, De Julia reconoce que este periodo ha sido extremadamente complejo. Habla de “momentos de todo tipo”, de semanas especialmente duras, pero también del impulso que le ha supuesto marcar una fecha para su reaparición. Su regreso al campo, admite, ha superado sus propias expectativas: tras tantos meses sin poder entrenar con normalidad, ha vuelto a experimentar sensaciones que creía haber perdido. “De unas semanas a esta parte todo ha mejorado”, resume.

El matador insiste en que la clave del proceso ha estado en el ámbito psicológico. Define la anorexia como un deterioro profundo, visible en lo físico pero devastador en lo emocional. Explica que este tiempo le ha obligado a conocerse más, a moderar una autoexigencia que, reconoce, le condujo a situaciones límite. Aunque no se considera “curado”, asegura haber encontrado un equilibrio que considera esencial tanto para su día a día como para su forma de torear. Lo expresa con contundencia: le inquietaría más afirmar que está totalmente bien que reconocer que convive con la enfermedad, porque es precisamente esa consciencia la que le permite avanzar sin temor a recaídas.

El relato de De Julia impresiona por su sinceridad. Confiesa que tocó fondo el 23 de marzo, en la corrida de Adolfo Martín en Las Ventas. Aquel día fue un aviso, pero lo más duro llegó después, cuando comprendió que no podía presentarse a la corrida del 2 de mayo. Renunciar a esa fecha —por la que llevaba tiempo luchando para situarse de nuevo en los carteles importantes— fue un golpe especialmente doloroso. Ver tan cerca los puestos altos del escalafón y tener que apartarse por un problema de salud, admite, resulta difícil de asumir. Aun así, mantiene la convicción de que, recuperado, podrá volver a ocupar el espacio que ya tenía ganado.

Con la mirada puesta en 2026, el torero afronta su regreso con una motivación renovada: superar lo vivido y demostrar que es capaz no solo de volver, sino de hacerlo al máximo nivel. Sabe que el paso decisivo será regresar a Madrid y ofrecer a la afición —y también a sí mismo— una imagen distinta, la de un profesional que ha sido capaz de enfrentarse a una situación límite y salir fortalecido. “Devolver a la gente esa ilusión”, concluye, es hoy para él tan importante como cualquier triunfo en el ruedo.`
  },
	{ 
    id: 358,
       title: "Morenito de Aranda y Tito Fernández nueva relación de apoderamiento",
    image: "/images/morenito.jpg",
    category: "Actualidad",
    date: "21 de noviembre de 2025",
    fullContent: `Jesús Martínez ‘Morenito de Aranda’ y Tito Fernández han sellado a través de un apretón de manos una vinculación profesional que parte de la relación personal y humana ya existente entre ellos. En un comunicado emitido a esta redacción, ambos señalan que esta unión ‘nace con el objetivo de fortalecer la carrera del torero arandino, uno de los nombres propios de la temporada 2025 donde ha firmado obras importantes en plazas de primer rango, siendo un torero que goza del respaldo y el crédito de los aficionados’.

Morenito de Aranda toreó 21 corridas de toros en la temporada 2025, cortando 26 orejas. El burgalés destacó en plazas como Madrid, Dax, Bayona, Mont de Marsan, Vic, Burgos o Talavera de la Reina, entre otras.`
  },
	{ 
    id: 359,
       title: "Ginés Marín amplía su equipo de apoderamiento",
    image: "/images/amplia.jpg",
	imageCaption: "Gines Marín con Carlos y Joaquín Domínguez",
    category: "Actualidad",
    date: "20 de noviembre de 2025",
    fullContent: `El matador de toros Ginés Marín amplía su equipo de apoderamiento para la temporada 2026. De esta manera, los empresarios Joaquín Domínguez y Carlos Domínguez se unirán a Álvaro Polo para gestionar la carrera del matador de toros extremeño.

Una temporada, la del 2026, en la que se conmemora el 10º aniversario de la alternativa de Ginés Marín. El extremeño toreó en 2025 17 corridas de toros en las que cortó 28 orejas y un rabo.`
  },
	{ 
    id: 360,
       title: "Abierta la inscripción para la Copa Chenel 2026",
    image: "/images/copachenel.jpg",
	imageCaption: "Sergio Rodríguez actual ganador de la Copa Chenel 2025",
    category: "Actualidad",
    date: "19 de noviembre de 2025",
    fullContent: `La Fiesta del Toro de la Comunidad de Madrid ha comenzado a preparar la temporada 2026 y, con ella, la nueva edición del certamen más destacado que organiza la Fundación Toro de Lidia en colaboración con la Comunidad de Madrid: la Copa Chenel.

En este contexto, la Fundación Toro de Lidia ha abierto oficialmente el plazo de inscripción para los matadores de toros interesados en participar en la Copa Chenel 2026.

Podrá presentar su candidatura cualquier matador que cumpla los siguientes requisitos: haber tomado la alternativa después del 1 de enero de 2013; no haber finalizado la temporada 2025 entre los 20 primeros del escalafón; y no haber toreado en 2025 en cuatro o más plazas de primera categoría en España o Francia.

Una de las principales novedades respecto a ediciones anteriores es la eliminación de la restricción que impedía repetir participación. A partir de esta edición, tal y como recoge la licitación oficial, «podrán ser elegibles matadores que ya hubieran participado en ediciones anteriores de la Copa Chenel».

Asimismo, tendrán acceso directo al certamen aquellos matadores que, cumpliendo los requisitos previos, hayan resultado triunfadores en alguno de los circuitos de novilladas pertenecientes a la Liga Nacional de Novilladas.

De forma excepcional, el certamen podrá reservar hasta tres plazas para candidatos que no cumplan alguno de los requisitos establecidos. Estos casos deberán estar debidamente justificados y contarán con la valoración del Centro de Asuntos Taurinos de la Comunidad de Madrid.

El plazo de inscripción permanecerá abierto hasta el 10 de diciembre. La información detallada y los requisitos completos pueden consultarse en la web oficial de la Fundación Toro de Lidia.

Desde su creación en 2021, la Copa Chenel se ha afianzado como el gran circuito de oportunidades para matadores de toros. Sus triunfadores —Fernando Adrián, Francisco de Manuel, Isaac Fonseca, Víctor Hernández o Sergio Rodríguez— representan el impacto real del proyecto. En apenas cinco ediciones se han celebrado 58 corridas, con la participación de 91 matadores y 60 ganaderías, consolidándose como una plataforma imprescindible para el impulso de nuevas figuras del toreo.`
  },
	{ 
    id: 361,
    title: "Lances de Futuro, el impulso joven que sacude los cimientos de la fiesta y renueva el pulso del toreo",
    image: "/images/lances.jpg",
	imageCaption: "Plaza de Toros Santander - Foto Lances de Futuro",
    category: "Opinión",
    date: "19 de noviembre de 2025",
    fullContent: `Lances de Futuro se ha conseguido consolidar como una de las empresas gestoras de plazas más importantes del momento, actualmente, tiene en su propiedad plazas como Torrejón de Ardoz, Córdoba, Cáceres y Santander. Todas ellas, en diferente medida, han marcado la temporada taurina de 2025, como en aquella tarde de David De Miranda con ese toro de Victoriano del Río .

Esta empresa es liderada por el célebre empresario sevillano José María Garzón, que también ejerce su función como apoderado gestionando temporadas a toreros como Juan Ortega con el que tiene una relación profesional ya de tres años. Su propósito principal en estos últimos años ha sido la renovación de sus plazas a través de la imagen de la juventud en todos los ámbitos posibles, en el ámbit  lo o del público, implantó ventajas económicas en el coste de las entradas, como abonos con precios especiales para jóvenes o esos famosos tendidos jóvenes, con la función de intentar atraer ese público joven tan necesitado para la fiesta.

Por otra parte, esta empresa fomenta la introducción de toreros emergentes en sus ferias como los casos de Víctor Hernández en Torrejón o en Málaga. En esta última pudimos contemplar uno de los acontecimientos de la temporada con esa faena valiente de David de Miranda, que le ayudó a abrirse las puertas de nuevo en el mundillo, o la actuación de Jarocho en Santander y Manuel Román en Córdoba, todos ellos acompañados de toreros como Borja Jiménez y Fortes, claros protagonistas de esta temporada. Al fin de al cabo, estos son los toreros que el aficionado solicita en este momento y que se encargarán de dar un paso al frente para la renovación del escalafón en los siguientes años.

Todo esto sumado a el rumor que pone a esta empresa como nueva gestora de la plaza de toros de Sevilla y a la polémica por el concurso en la Malagueta, ya que la diputación no decidió renovar a esta empresa, pese al buen trabajo realizado, y que se rumorea que Simón Casas y Javier Conde podrían estar detrás de ella, pone a Lances de Futuro en boca de todos los aficionados como una empresa interesada por la salud de la fiesta y de el interés del aficionado. Por eso desde aquí les felicitamos y les apelamos a que continúen con el buen trabajo que están realizando.

Mario Ruiz 19/11/2025`
  },
	{ 
    id: 362,
       title: "El banderillero Juan Rojas queda libre para la próxima temporada",
    image: "/images/juanrojas.jpg",
    category: "Actualidad",
    date: "18 de noviembre de 2025",
    fullContent: `El banderillero Juan Rojas ha quedado libre de cara a la próxima temporada taurina. El torero de plata ha salido de las filas del matador gaditano David Galván, a cuyas órdenes ha permanecido durante varias campañas.

Por tanto, Juan Rojas, se encuentra disponible y abre su futuro profesional a nuevas cuadrillas, en búsqueda de un nuevo jefe de filas con el que afrontar la temporada venidera. Rojas encara con ilusión los proyectos que puedan surgir en esta nueva etapa.`
  },
	{ 
    id: 363,
    title: "Grave accidente del mayoral de Partido de Resina durante las labores en el campo",
    image: "/images/graveaccidente.jpg",
    category: "Actualidad",
    date: "18 de noviembre de 2025",
    fullContent: `El campo bravo ha vuelto a vivir un episodio de crudeza con un nuevo accidente, tal como ocurriera hace apenas unas semanas con el ganadero Julio de la Puerta. En esta ocasión, la ganadería de Partido de Resina ha sido el escenario de un serio percance en el que el mayoral de la casa, Julián Ruiz Quinta, resultó herido tras caer de su caballo y recibir una violenta patada en la cabeza.

“Gracias a Dios se encuentra estable y está ingresado en el Hospital Virgen del Rocío, donde ya le están realizando todas las pruebas necesarias. Es un milagro que no haya afectado al cráneo; parece que se centra únicamente en la reconstrucción de la mandíbula y del cuello”, señalan fuentes cercanas a la ganadería.

Según ha podido conocer este medio a través de Tico Morales hijo, los hechos ocurrieron durante las labores de apartado de unos utreros de la divisa sevillana. Uno de los ejemplares se arrancó de forma inesperada, sorprendiendo al caballo del mayoral y provocando una reacción brusca del animal. En pleno rebrinco, Julián perdió la montura y cayó al suelo, momento en el que recibió el impacto en la mandíbula.

Afortunadamente, cayó fuera del cercado donde se encontraba el utrero, lo que evitó un desenlace aún más grave. Aunque logró incorporarse por su propio pie, uno de sus compañeros intervino de inmediato para trasladarlo en un todoterreno hasta el cortijo, donde recibió una primera asistencia antes de su evacuación a la UCI del Hospital Virgen del Rocío, en Sevilla, donde continúa ingresado.

“Julián es un hombre muy fuerte y le queremos mucho; estoy convencido de que en nada volverá a estar con nosotros en las faenas de campo”, añade Tico Morales hijo.`
  },
  { 
    id: 364,
    title: "Fallece Álvaro Domecq Romero, figura del rejoneo y ganadero de Torrestrella",
    image: "/images/domecq.jpg",
    category: "Actualidad",
    date: "18 de noviembre de 2025",
	excerpt: "A los 85 años de edad",
    fullContent: `Álvaro Domecq Romero, figura histórica del rejoneo y ganadero al frente de la emblemática divisa de Torrestrella, ha fallecido esta madrugada a los 85 años de edad. Nacido en Jerez de la Frontera el 8 de abril de 1940, fue hijo del también mítico rejoneador y ganadero Álvaro Domecq Díez, de quien heredó no solo el nombre, sino también una profunda vocación por el toro bravo y el arte ecuestre.

Debutó en público el 13 de septiembre de 1959 en la plaza de toros de Ronda y tomó la alternativa el 1 de septiembre de 1960 en El Puerto de Santa María, apadrinado por su propio padre. Su despedida de los ruedos tuvo lugar el 12 de octubre de 1985 en Jerez de la Frontera, culminando una trayectoria extraordinaria en la que llegó a participar en más de 2.000 corridas, consolidándose como una de las figuras indiscutibles del toreo a caballo. Formó parte del célebre grupo de los “cuatro jinetes del Apoteosis”, junto a Ángel y Rafael Peralta y José Samuel Lupi, un conjunto que marcó una época dorada en el rejoneo.

Como ganadero, tomó las riendas de Torrestrella, una de las divisas más prestigiosas del campo bravo. Desde la finca de Los Alburejos, en Medina Sidonia —luego trasladada a El Carrascal—, Domecq mantuvo y potenció el concepto de bravura que convirtió a esta ganadería en referencia obligada de las principales ferias taurinas. Su labor se caracterizó por una visión moderna de la selección y la crianza del toro, uniendo tradición y rigor técnico.

En paralelo, su compromiso con la cultura ecuestre trascendió fronteras. En 1975 fundó la Real Escuela Andaluza del Arte Ecuestre, hoy considerada una institución de prestigio internacional. Asimismo, ideó espectáculos como Cómo Bailan los Caballos Andaluces y A Campo Abierto, que contribuyeron a difundir la excelencia del caballo andaluz y la tradición ecuestre de Jerez en los cinco continentes.

A lo largo de su vida recibió numerosos reconocimientos. En 2024 fue distinguido con la Medalla de Andalucía, galardón que se sumó al Caballo de Oro otorgado por la ciudad de Jerez —uno de los mayores reconocimientos ecuestres del país— y al título de Hijo Predilecto de su ciudad natal. Su figura deja una huella imborrable en el mundo del toro, la equitación y la cultura andaluza.`
  },
   { 
    id: 365,
    title: "El picador Pedro Iturralde se incorpora a la cuadrilla de Fernando Adrián",
    image: "/images/picador.jpg",
    category: "Actualidad",
    date: "18 de noviembre de 2025",
    fullContent: `Fernando Adrián, uno de los nombres propios de la temporada 2025, ya ha cerrado la composición de la cuadrilla que le acompañará durante la campaña taurina de 2026.

El torero estrenará como picador a Pedro Iturralde, quien compartirá filas con el joven guadalajareño Javier Díaz-Manrique. Como lidiadores continuarán el salmantino Roberto Blanco y Marcos Prieto, mientras que el puesto de tercero seguirá en manos del madrileño Diego Valladar.

La estructura de su equipo se completa con Francisco Javier Villalba como mozo de espadas; la gestión profesional del diestro será dirigida por su nuevo apoderado, Santiago Ellauri.

Fernando Adrián ha rubricado una temporada especialmente destacada, dejando actuaciones de gran repercusión en plazas de máxima categoría. Entre ellas, sobresalen Madrid —donde firmó una faena muy recordada al toro ‘Frenoso’, de Victoriano del Río, además de cortar una oreja en la Corrida de Beneficencia—, así como sus actuaciones en Pamplona, Arles, Bilbao, Zaragoza (en dos tardes), Albacete, Cuenca, Pontevedra, Guadalajara o Teruel, entre otras.`
  },
	{
    id: 366,
    title: "Escolar, Dolores Aguirre, Reta, Guardiola... las ganaderías de la Feria del Aficionado",
    image: "/images/escolar.jpg",
	imageCaption: "Foto Philippe Gil Mir",
    category: "Actualidad",
    date: "17 de noviembre de 2025",
	excerpt: "La comisión organizadora del serial ha presentado los hierros que estarán presentes en su feria del próximo año, así como la estructura de los festejos",
    fullContent: `El Club Taurino 3 Puyazos ha hecho públicas las ganaderías que conformarán la Feria del Aficionado 2026, un ciclo que volverá a celebrarse en la localidad madrileña de San Agustín del Guadalix y que reunirá a algunos de los hierros más representativos del campo bravo, especialmente del ámbito torista. La feria, integrada por tres festejos, se desarrollará los días 25 y 26 de abril y contará con una novillada con picadores y dos corridas de toros, todas ellas en formato de desafío ganadero.

La programación arrancará el sábado 25, a las 12:00 horas, con utreros de Salvador Guardiola e Isaías y Tulio Vázquez. Ese mismo día, a las 18:30 horas, será el turno de los astados de Prieto de la Cal y Reta de Casta Navarra, protagonistas de la primera corrida del ciclo.

El domingo 26, también a las 12:00 horas, se celebrará el último desafío ganadero, que enfrentará a las divisas de Dolores Aguirre y José Escolar.

La organización anunciará los carteles definitivos en próximas fechas.`
  },
	{ 
    id: 367,
    title: "Álvaro Alarcón y Carlos De la Rosa fin a la relación de apoderamiento",
    image: "/images/alarcon.jpg",
    category: "Actualidad",
    date: "17 de noviembre de 2025",
    fullContent: `El matador de toros Álvaro Alarcón y su hasta ahora apoderado, Carlos De la Rosa, han decidido de común acuerdo dar por concluida la relación profesional que les unía desde hace varias temporadas. La separación se produce en un clima de plena cordialidad, desde la amistad y el profundo respeto que ambos mantienen, una relación personal que —subrayan— permanece intacta pese al cierre de esta etapa.

El objetivo de este paso es que Álvaro Alarcón pueda encontrar a la persona idónea para impulsar su carrera y situarla en el lugar que, por méritos, consideran que merece. No hay que olvidar que sus dos primeras temporadas completas como matador han estado condicionadas por las lesiones.

Como novillero, Alarcón firmó una trayectoria destacada, con triunfos relevantes como el que protagonizó en la Feria de San Isidro de 2022, donde cortó tres orejas, además de sus salidas en hombros en plazas como Valencia, Mont-de-Marsan, El Puerto de Santa María y Dax. Estos éxitos le condujeron a tomar la alternativa en un cartel de máximo nivel en la Feria de San Isidro de 2023, apadrinado por Julián López “El Juli” y con Andrés Roca Rey como testigo, ante toros de La Quinta.

Ambas partes se desean la mayor de las suertes en sus respectivos caminos.`
  },
  { 
    id: 368,
    title: "David Galván refuerza su cuadrilla con tres nuevas incorporaciones para 2026",
    image: "/images/davidgalvan1.jpg",
    footerImage1: "/images/davidgalvan2.jpg",
    category: "Actualidad",
    date: "17 de noviembre de 2025",
    fullContent: `El matador gaditano David Galván ha cerrado la composición de su cuadrilla para la temporada 2026, un curso que afronta con gran ilusión y con la incorporación de tres nuevos profesionales que se suman a su equipo.

En el tercio de varas, se incorpora el picador Daniel López, quien ya acompañó al diestro en varios compromisos esta temporada y dejó muy buenas sensaciones, motivo por el que pasará a formar pareja con Juan Pablo Molina, que continuará un año más en la cuadrilla.

La lidia a pie experimenta una renovación profunda con la llegada de Raúl Ruiz y Manuel Larios, dos toreros de acreditada solvencia que afrontan este nuevo reto con responsabilidad y el entusiasmo propio de una temporada de máxima exigencia. El tercero David Pacheco seguirá formando parte del equipo.

Con estas incorporaciones, David Galván consolida una cuadrilla sólida y preparada para encarar con garantías una temporada que se presenta clave en su carrera.`
  },
	{ 
    id: 369,
    title: "Tomás González: el paso firme de un novillero diferente",
    image: "/images/tomas.jpg",
    category: "Actualidad",
    date: "15 de noviembre de 2025",
	excerpt: "El novillero aragonés ha concluido la temporada con 22 novilladas lidiadas y un balance de 29 orejas y un rabo",
    fullContent: `Tomás González ha dejado una marcada impronta en la temporada 2025, completando su primer año íntegro como novillero con picadores y consolidándose como un diestro de personalidad propia dentro de los cánones clásicos del toreo.
El novillero de Alcorisa ha sumado 22 novilladas con caballos, en las que ha obtenido un balance de 29 orejas y un rabo. Desde su primera actuación en Vinaroz —que anticipó la línea ascendente de su campaña— hasta las últimas comparecencias, como la realizada en la Feria del Pilar de Zaragoza, donde dio una vuelta al ruedo tras una faena de sello inconfundible, González ha mostrado evolución y madurez.

A lo largo de la temporada ha lidiado 23 ganaderías pertenecientes a 10 encastes distintos, dato que subraya la amplitud y versatilidad de su concepto del toreo.

Sus triunfos más destacados se han registrado en plazas como Vinaroz, Mejorada del Campo, Ayllón, Mojados, Azuqueca de Henares o El Burgo de Osma, entre otras. Una campaña de rodaje sólido que culminó con su presentación en Zaragoza y su debut americano como novillero, celebrado en la plaza de Viraco (Perú) el pasado mes de octubre.

Con la mirada puesta ya en 2026, Tomás González afronta un año clave, con el objetivo de dar un salto cualitativo y comparecer en plazas de mayor responsabilidad, donde espera refrendar la proyección mostrada durante este 2025.`
  },
	{ 
    id: 370,
    title: "El tribunal de recursos contractuales de la diputación de Málaga acepta la impugnación de Nautalia sobre la solvencia técnica",
    image: "/images/tribunal.jpg",
	imageCaption: "Plaza de Toros de Málaga",
    category: "Actualidad",
    date: "15 de noviembre de 2025",
    fullContent: `El Tribunal Administrativo de Recursos Contractuales de la Diputación de Málaga ha hecho caso a las alegaciones presentadas por la empresa Nautalia en relación a la licitación y el pliego para la organización de festejos taurinos en la plaza de toros de La Malagueta.

Según informa el medio Málaga Taurina, la impugnación del pliego actual ha sido relativa al Anexo 4.1.2 del Pliego de Cláusulas Administrativas Particulares, lo que afectaba a los requisitos de solvencia técnica y profesional de la empresa candidata. Esto ha obligado a anular la especificación de que la empresa candidata debía haber gestionado ‘en cada uno de los tres últimos años de al menos tres plazas de primera o segunda categoría’.

Una exigencia que no se correspondía con la capacidad empresarial de Nautalia y por la que el Tribunal Administrativo ha decidido la impugnación del pliego, además de la reformulación del mismo y de este apartado para que pueda ser nuevamente aprobado por el Pleno de la Diputación de Málaga y puesto en trámite administrativo nuevamente a partir del mes de noviembre o diciembre según su fecha de inclusión en pleno.`
  },
	{ 
    id: 371,
    title: "Álvaro Lorenzo y Jean François Piles nueva relación de apoderamiento",
    image: "/images/alvarolorenzo.jpg",
    category: "Actualidad",
    date: "14 de noviembre de 2025",
    fullContent: `El toledano Álvaro Lorenzo ha llegado a un acuerdo de apoderamiento con el taurino francés Jean François Piles que hará equipo con Manolo Campuzano, ligado al toledano desde 2024. En 2025 ha toreado 11 corridas de toros en las que ha cortado 21 orejas con el hito de la tarde del dos de mayo en Madrid, donde cortó una oreja y dio una vuelta al ruedo rozando la puerta grande de Las Ventas. Lorenzo afronta con ilusión la próxima temporada en la que cumple diez años de alternativa.

Álvaro Lorenzo en estos años ha logrado puntuar con fuerza en las principales plazas de primera categoría como Madrid (con seis orejas y cinco vueltas al ruedo), Sevilla, Pamplona, entre otras. El matador toledano quiere aprovechar este comunicado para agradecer a la empresa Puerta Grande Gestión su trabajo durante la pasada temporada al haber concluido su relación de apoderamiento de manera amistosa.`
  },
	{ 
    id: 372,
    title: "Israel Vicente y Diego Urdiales nueva relación de apoderamiento",
    image: "/images/urdiales.jpg",
    category: "Actualidad",
    date: "14 de noviembre de 2025",
    fullContent: `El matador de toros Diego Urdiales ha decidido que Israel Vicente sea su nuevo apoderado. Hijo del primer apoderado de Urdiales durante su etapa como novillero y primeros años de matador, David Vicente Iglesias, será el encargado de dirigir la carrera del diestro riojano a partir de esta temporada 2026.

Una noticia que ha saltado esta mañana tras las informaciones sobre su ruptura con Luis Miguel Villalpando anunciada la semana pasada.`
  },
	{ 
    id: 373,
    title: "El arte hecho torero: Pablo Aguado y la elegancia de un estilo propio",
    image: "/images/pabloaguado.jpg",
	imageCaption: "Foto BMF Toros",
    category: "Opinión",
    date: "13 de noviembre de 2025",
    fullContent: `El torero sevillano Pablo Aguado ha cumplido esta pasada temporada ocho años de alternativa, aquella que tomó en la Feria de San Miguel de Sevilla, donde nació un artista del toreo. Uno de esos elegidos a los que, según el recordado Rafael de Paula, les caen del cielo esas “bolitas de duende”. Toreros que poseen un compás distinto, un arte que no se puede explicar con palabras, solo sentir con la emoción profunda que llevamos dentro los aficionados y que nos hace vivir esta pasión de forma tan peculiar.

Aguado ha firmado una temporada 2025 de gran evolución y madurez. Ya no es solo ese torero artista al que hay que ver con el toro ideal, sino un torero completo, con recursos, capacidad y una personalidad asentada. A lo largo del año ha demostrado su concepto tan puro, tan torero y elegante frente a todo tipo de encastes.
Dejó momentos memorables, como aquella gran faena en el coso del Baratillo, los naturales eternos en Madrid con los que remontó la tarde del 24 de mayo y cortó una oreja, o las actuaciones de peso en Aranjuez, Colmenar Viejo y Pozoblanco, entre otras.

Su temporada también ha estado marcada por la comentada dupla artística junto a Juan Ortega, una pareja que muchos comparan con las históricas de Rafael y Curro o de Joselito y Belmonte. Ortega representa la hondura y la profundidad del toreo; Aguado, la naturalidad y la rectitud. Ambos comparten, sin embargo, el mismo lenguaje: el arte y el duende. Por eso, más que rivales, son dos almas complementarias dentro del mismo compás.

Todo ello ha sido posible gracias al trabajo discreto y eficaz de su equipo, encabezado por sus apoderados Antonio y Francisco Vázquez, que están sabiendo llevar con temple y acierto la carrera de un torero destinado a ocupar un lugar entre las figuras. También ha sido clave la orientación de Curro Vázquez, cuya experiencia y sabiduría taurina se han convertido en un pilar fundamental en su madurez profesional.

Con todo esto, se reafirma que Pablo Aguado es un torero distinto, de esos que parecen haber sido tocados por la gracia del arte, como los genios de la música, la poesía o la pintura. Un torero que hace soñar al aficionado cada vez que se pone delante del toro, y que mantiene viva esa llama del toreo clásico, eterno y puro.

Por eso, de cara a la próxima temporada, la afición espera con ilusión un triunfo grande del maestro, ese que consolide definitivamente su nombre entre los elegidos del toreo contemporáneo.

Mario Ruiz Ruiz 13/11/2025`
  },
	{ 
    id: 374,
    title: "El Ayuntamiento de Algeciras saca a licitación la gestión de la plaza de toros de Las Palomas",
    image: "/images/1.jpg",
    category: "Actualidad",
    date: "13 de noviembre de 2025",
    fullContent: `El Ayuntamiento de Algeciras ha sacado a licitación la gestión del coso de Las Palomas para los próximos tres años (2026, 2027 y 2028), con la posibilidad de prórroga por un año adicional. La nueva empresa adjudicataria será la encargada de organizar los espectáculos taurinos tras la finalización de la actual concesión, en manos del empresario Carmelo García desde 2021.

Según informa el diario Europa Sur, el nuevo pliego de condiciones introduce una novedad significativa respecto a licitaciones anteriores: se reduce la puntuación asignada al canon económico, fijado en un mínimo de 6.000 euros anuales, y se refuerzan los criterios artísticos y culturales. Con ello, el consistorio busca priorizar la calidad de los carteles y la diversidad ganadera frente a la mera oferta económica.

Las propuestas serán evaluadas por un comité de expertos integrado por tres empleados municipales. El contrato establece la obligatoriedad de programar al menos tres corridas de toros durante la Feria Real, aunque se valorará positivamente la organización de más festejos taurinos a lo largo del año.

Con este nuevo modelo de licitación, el Ayuntamiento pretende garantizar la continuidad y el nivel artístico de una de las ferias más destacadas del calendario andaluz.`
  },
	{ 
    id: 375,
    title: "Paco Ureña, Borja Jiménez, Marco Pérez, Emilio de Justo, El Parralejo…, premiados por el Real Club Taurino de Murcia",
    image: "/images/guillen.jpg",
	imageCaption: "Foto Plaza 1",
    category: "Actualidad",
    date: "13 de noviembre de 2025",
    fullContent: `El jurado encargado de conceder los Premios de la Feria Taurina de Murcia se reunió este miércoles, coincidiendo con la convocatoria de la Mesa Municipal del Toro, para fallar las distinciones correspondientes a la feria celebrada el pasado mes de septiembre en la plaza de toros de La Condomina.

El matador murciano Paco Ureña ha sido designado Triunfador de la Feria, mientras que Borja Jiménez ha obtenido el galardón a la mejor faena y Marco Pérez ha sido distinguido con el premio a la faena más artística.
El trofeo a la mejor estocada recayó en Emilio de Justo, y el de mejor rejoneador fue para Diego Ventura.
Completan el palmarés El Parralejo, Javier Zulueta, Juan Contreras, Juan Ortega y Cristian Romero, entre otros premiados.

Relación completa de premios de la Feria Taurina de Murcia 2025
	•	Premio del Ayuntamiento de Murcia al Triunfador de la Feria: Paco Ureña.
	•	Premio del Ayuntamiento de Murcia a la Faena más artística: Marco Pérez, por la realizada al 6.º toro de Juan Pedro Domecq.
	•	Premio Mariano Molina a la Mejor faena: Borja Jiménez, por la realizada al 3.º toro de Daniel Ruiz.
	•	Premio de la Comunidad Autónoma de la Región de Murcia al Mejor toreo de capote: Juan Ortega.
	•	Premio “Ángel Bernal Romero” a la Mejor estocada: Emilio de Justo, por la recetada al 5.º toro de Juan Pedro Domecq.
	•	Premio de la Agrupación Sardinera de Murcia al Mejor par de banderillas: Juan Contreras, de la cuadrilla de Daniel Luque.
	•	Premio del Colegio Oficial de Periodistas de Murcia al Triunfador de la Corrida de la Prensa: Marco Pérez.
	•	Premio “Ángel Bernal Manzanera” al Mejor rejoneador: Diego Ventura.
	•	Premio del Colegio Oficial de Periodistas de Murcia al Mejor novillero: Javier Zulueta.
	•	Premio del Real Club Taurino de Murcia al Mejor puyazo: Cristian Romero, de la cuadrilla de Paco Ureña.
	•	Premio del Real Club Taurino de Murcia a la Mejor corrida: El Parralejo.
	•	Premio del Real Club Taurino de Murcia al Mejor toro: Maestro, de El Parralejo.`
  },
	{ 
    id: 376,
    title: "Carlos Tirado y Enrique Peña nuevo acuerdo de apoderamiento",
    image: "/images/carlostirado.jpg",
    category: "Actualidad",
    date: "13 de noviembre de 2025",
	excerpt: "El onubense fue el triunfador del VI Circuito de Novilladas de Andalucía",
    fullContent: `El novillero onubense Carlos Tirado, natural de Ayamonte, ha alcanzado un acuerdo de apoderamiento con el matador de toros Enrique Peña. El compromiso, sellado a la antigua usanza con el clásico apretón de manos, se cerró este miércoles en Sevilla, tras una reunión en la que ambas partes mostraron su ilusión por afrontar un proyecto común.

La temporada 2024 ha sido especialmente significativa para Tirado, que se proclamó triunfador del VI Circuito de Novilladas de Andalucía, cuya final se celebró en la Real Maestranza de Caballería de Sevilla. Además, sumó otro importante éxito en las Colombinas de Huelva, consolidándose como uno de los nombres más prometedores del escalafón.

“Me llena de ilusión estar de la mano de un profesional de la talla de Enrique Peña y mantener esos diálogos para ir creciendo poco a poco desde el prisma de un matador de toros. Estoy contento y convencido de que vamos a dar mucho que hablar en una temporada con paso firme y muy importante para mí”,
destacó el joven novillero ayamontino.

Con este acuerdo, Carlos Tirado afronta una nueva etapa profesional en la que buscará afianzar su proyección y seguir dando pasos firmes hacia su alternativa.`
  },
	{ 
    id: 377,
    title: "El banderillero Raúl Ruiz sale de la cuadrilla de Fortes",
    image: "/images/banderillero2.jpg",
	imageCaption: "Foto Plaza 1",
    category: "Actualidad",
    date: "13 de noviembre de 2025",
	excerpt: "El madrileño, uno de los más destacados entre los de plata, queda libre para la temporada 2026",
    fullContent: `El banderillero Raúl Ruiz abandona la cuadrilla del matador de toros malagueño Fortes para la temporada 2026. El madrileño, uno de los más destacados entre los de plata, queda libre para la siguiente temporada después de estar a la órdenes del malagueño desde el año 2018. 

Raúl Ruiz ha querido, en un mensaje enviado a esta redacción, desear la mejor de las suertes a Fortes en su carrera.`
  },
	{ 
    id: 378,
    title: "Fernando Adrián y Santiago Ellauri nuevo acuerdo de apoderamiento",
    image: "/images/apoderamiento.jpg",
    category: "Actualidad",
    date: "13 de noviembre de 2025",
    fullContent: `El torero Fernando Adrián y el taurino sevillano Santiago Ellauri han cerrado un acuerdo de apoderamiento para la temporada 2026.  Ellauri, con una trayectoria consolidada como apoderado en el mundo del toro, será el encargado de coordinar las actuaciones, contratos y proyectos de Adrián, gestionando sus compromisos tanto en plazas nacionales como internacionales.

El torero madrileño llega a este nuevo proyecto tras una temporada destacada, en la que ha dejado su sello en plazas de primer nivel como Madrid —con la recordada faena al toro Frenoso, de Victoriano del Río, y la oreja paseada en la Corrida de Beneficencia—, Pamplona, Arles, Bilbao, Zaragoza (dos tardes), Cuenca, Pontevedra, Guadalajara o Teruel, entre otras.`
  },
	{ 
    id: 379,
    title: "Los maestrantes estudian un nuevo modelo de contrato de cara a la futura gestión de la Real Maestranza de Sevilla",
    image: "/images/maestrantes.jpg",
	imageCaption: "Foto ABC",
    category: "Actualidad",
    date: "13 de noviembre de 2025",
    fullContent: `La Real Maestranza de Caballería de Sevilla, propietaria de la emblemática plaza de toros, estaría analizando la redacción de un nuevo modelo de contrato para la gestión del coso durante los próximos años. Los maestrantes mantienen, sin embargo, su tradicional silencio institucional, sin confirmar ni desmentir los rumores que circulan sobre el futuro empresarial del ruedo sevillano.

La decisión, que deberá adoptar la Junta de Gobierno en los próximos días, llega justo cuando expira en 2025 el contrato con la empresa Pagés, dirigida por Ramón Valencia, actual gestora del coso del Baratillo.

Silencio y especulaciones
El hermetismo de la Real Maestranza —una de sus señas de identidad históricas— ha alimentado todo tipo de especulaciones en los mentideros taurinos. Aunque abundan los nombres y proyectos hipotéticos, ninguno cuenta con una base sólida. La única certeza es que, si Pagés continúa al frente, lo hará mediante un nuevo contrato ajustado a las condiciones que establezca la corporación nobiliaria.

Un contrato con cambios
De las escasas filtraciones conocidas, sí se desprende que el nuevo modelo incluirá cláusulas distintas a las vigentes, tanto en lo económico como en la duración del acuerdo. La empresa Pagés gestiona la plaza desde 1932, con sucesivos contratos, prórrogas y modificaciones, por lo que no existen precedentes claros sobre el modo en que la Maestranza elige o renueva a su arrendatario.

Decisión inminente
El tiempo juega en contra. La Junta prevista para el próximo día 22 de noviembre debería, al menos, definir el modelo contractual o las condiciones del nuevo arrendamiento. Todo apunta a que no se convocará un concurso público, dado que la plaza es de propiedad privada, por lo que la decisión podría tomarse de manera directa y discreta.

Sevilla, epicentro del toreo
La incertidumbre preocupa en el sector. Con un mundo taurino que ha cambiado sus dinámicas de trabajo, ganaderos y apoderados reclaman veedores y reseñas tempranas para planificar la próxima temporada. Sevilla, como referente mundial del toreo, debería estar ya construyendo los cimientos de su temporada 2026 y las siguientes.

El perfil bajo y la prudencia institucional de la Maestranza, virtud tradicional de la casa, se enfrentan ahora al desafío de compatibilizar la discreción con las exigencias del toreo moderno.`
  },
	{ 
    id: 380,
    title: "Luis Blázquez recibe el alta hospitalaria tras ser operado de una lesión que arrastraba durante la temporada",
    image: "/images/blazquez.jpg",
    category: "Actualidad",
    date: "12 de noviembre de 2025",
	excerpt: "El banderillero valenciano sufrió una rotura de peroné y del menisco de la rodilla izquierda",
    fullContent: `banderillero valenciano Luis Blázquez ha recibido el alta hospitalaria tras someterse el pasado sábado a una intervención quirúrgica para tratar una lesión que arrastraba desde el mes de agosto. El torero sufrió en Bilbao una rotura de peroné y del menisco de la rodilla izquierda, una dolencia que, pese a su gravedad, no le impidió continuar actuando durante la temporada, aunque mermado físicamente.

Durante la operación, a Blázquez se le ha colocado una placa con siete tornillos en el peroné. El torero continuará ahora el proceso de recuperación desde su domicilio. Si la evolución es favorable, los médicos prevén retirar las grapas la próxima semana y, aproximadamente dentro de 20 días, iniciar la fase de rehabilitación.`
  },
	{ 
    id: 381,
    title: "Valdemorillo define sus fechas y la estructura de la feria de San Blas 2026",
    image: "/images/valdemorillo.jpg",
    category: "Actualidad",
    date: "11 de noviembre de 2025",
    fullContent: `La temporada 2026 comienza a tomar forma, y Valdemorillo volverá a ser la primera gran cita del calendario taurino. La esperada Feria de San Blas y la Candelaria ya tiene fechas definidas y estructura cerrada: se celebrará los días 6, 7 y 8 de febrero y contará, como viene siendo habitual, con una novillada con picadores para abrir el abono y dos corridas de toros durante el fin de semana. A estos festejos se sumarán los tradicionales encierros y capeas, que mantienen viva la esencia popular y el espíritu taurino del municipio serrano.

El ciclo estará nuevamente organizado por la empresa Pueblos del Toreo, dirigida por Carlos Zúñiga y Víctor Zabala, que han logrado situar a Valdemorillo en una posición de privilegio dentro del arranque de la temporada europea. En los últimos años, su gestión ha revitalizado la Feria, atrayendo a figuras de primer nivel y convirtiéndola en una referencia obligada para los aficionados.

Fue precisamente en 2022 cuando la Feria dio un salto cualitativo con la presencia de Morante de la Puebla, en su primera actuación del año en España dentro de la temporada de las 100 corridas, compartiendo cartel con Diego Urdiales y Daniel Luque en un lleno histórico. Desde entonces, el serial no ha dejado de crecer: en 2023, el arte de Urdiales y Juan Ortega protagonizó un duelo con mucho eco, mientras que Perera, Cayetano y Ginés Marín completaron el ciclo. En 2025, nombres como Manzanares, Diego Ventura, Sebastián Castella, Emilio de Justo o Juan Ortega confirmaron el prestigio de una Feria que ya es sinónimo de calidad y expectación al inicio de cada temporada.`
  },
	{ 
    id: 382,
    title: "Nautalia y la Diputación de Valencia firman la prórroga del contrato de la plaza para 2026",
    image: "/images/nautalia2.jpg",
    category: "Actualidad",
    date: "11 de noviembre de 2025",
    fullContent: `La Diputació de València y la empresa Nautalia han firmado este martes la prórroga anual del contrato de arrendamiento la Plaza de Toros de la capital, por lo que la compañía continuará gestionando el recinto de la Calle Xàtiva durante todo el 2026. El presidente de la corporación provincial, Vicent Mompó, y el CEO de Nautalia, Rafael Gª Garrido, han sido los encargados de suscribir el acuerdo en un acto celebrado en la sede central de la institución.

El contrato de arrendamiento de la Plaza de Toros para la celebración de corridas de toros y demás espectáculos o festejos taurinos con la empresa Nautalia, que se firmó en noviembre de 2021, finalizaba el día 31 de diciembre de 2025, aunque contemplaba la posibilidad de acordar prórrogas anuales, hasta un máximo de tres, por lo que se hace uso de la primera de ellas. A ello hay que añadir que el contrato se vio interrumpido desde el pasado 1 de junio, y hasta la finalización de las obras de renovación de la plaza prevista para el primer trimestre de 2026, por lo que la vigencia del mismo se extiende durante el mismo periodo de duración de las obras.

El presidente de la Diputación, Vicent Mompó, ha destacado “que la prórroga asegura la gestión de la plaza durante todo el 2026, lo cual garantiza que cuando regrese la actividad al recinto, después de la rehabilitación que estamos acometiendo, lo hará con la grandeza y esplendor que merece esta joya arquitectónica”. Mompó ha añadido que “estamos trabajando ya en la redacción de los nuevos pliegos de condiciones de arrendamiento, que irán en la dirección que nos hemos marcado desde el principio: convertir la Plaza de Toros de Valencia en un referente nacional, tanto a nivel de infraestructura como a nivel de gestión”.

Renovación de la Plaza de Toros

Los trabajos para la renovación integral del sistema de iluminación de la Plaza de Toros de Valencia, que comenzaron el pasado mes de junio, avanzan según lo previsto con el objetivo de poder abrir el recinto propiedad de la Diputació de València antes de la próxima Feria de Fallas. Se trata de unas obras que han supuesto una inversión de casi 1 millón de euros, y que modernizarán uno de los espacios culturales más emblemáticos del Cap i Casal.

El proyecto contempla la sustitución de los equipos de iluminación en pasillos y escaleras, así como del sistema de proyectores del ruedo, que contará con cinco niveles lumínicos prestablecidos. Esta mejora permitirá alcanzar los estándares requeridos para la retransmisión televisiva en alta definición, reforzando al mismo tiempo la seguridad y el confort de los asistentes.`
  },
	{ 
    id: 383,
    title: "David de Miranda, Aguado, Urdiales, Ventura, Morante, Javier Conde…, premiados en la Gala de la Tauromaquia de Málaga",
    image: "/images/premiados.jpg",
    category: "Actualidad",
    date: "11 de noviembre de 2025",
    fullContent: `Málaga celebró este lunes la Gala de la Tauromaquia en un abarrotado auditorio Edgar Neville. El acto, presidido por Francisco Salado, presidente de la Diputación de Málaga, contó con la mayoría de los toreros y profesionales taurinos que han sido premiados este año en esta ceremonia con la que se cierra la temporada taurina en la provincia.

Salado puso de manifiesto que este año se han celebrado casi medio centenar de festejos en la provincia de Málaga, entre corridas de toros y rejones, novilladas, clases prácticas y festejos populares; se han reabierto plazas tan importantes como la de Fuengirola y se han retomado los festejos populares en pueblos como Arenas. ‘Seguiremos trabajando en esa dirección con la ayuda de los ayuntamientos y de la Junta de Andalucía en otros municipios que se vayan sumando a la gran familia del toro en Málaga‘, aseguró.

Javier Conde recibió un reconocimiento por su trayectoria profesional y artística, mientras que David de Miranda logró el Estoque de Plata Antonio Ordóñez a la mejor faena de la Feria de Agosto.

Diego Urdiales obtuvo el trofeo Paco Madrid a la mejor estocada y una mención especial por el quite providencial realizado al banderillero Javier Gómez Pascual. El trofeo Málaga Taurina al triunfador en las plazas de la provincia de Málaga recayó en Morante de la Puebla y el trofeo al mejor toreo de capote fue para Pablo Aguado, quien también fue premiado con el trofeo «Toros con la Luna Asociación Benéfica Hermanitas de los Pobres de Málaga» a la singularidad. Por su parte, Diego Ventura se alzó con el trofeo Francisco Mancebo al mejor rejoneador de la feria.

El resto de premiados fueron los siguientes: Ignacio Garibay, trofeo al triunfador del Certamen Internacional de Escuela Taurinas; Julio Méndez, trofeo al mejor novillero de la feria; Daniel Duarte, trofeo Manolo Ortiz a la mejor brega de la feria; Juan Francisco Peña, trofeo suerte de varas al mejor puyazo Pepillo de Málaga; y Juan Contreras, trofeo Alfonso Ordóñez al mejor torero de plata de la feria. Además, recibieron sendos reconocimientos el alumno de la Escuela de Tauromaquia de Valencia, Daniel Artazos, y la Real Unión de Criadores de Toros de Lidia.

El listado de premios fue el siguiente:

Estoque de Plata ‘Antonio Ordóñez’ a la mejor faena de la Feria Taurina de Málaga

Entrega: Presidente Diputación Provincial de Málaga.

Recibe: David de Miranda.

Trofeo al triunfador del Certamen Internacional de Escuela Taurinas

Entrega: Escuela Taurina Diputación de Málaga.

Recibe: Ignacio Garibay.

Trofeo al mejor novillero de la Feria Taurina de Málaga

Entrega: Diputación de Málaga.

Recibe: Julio Méndez.

Trofeo ‘Manolo Ortiz’ a la mejor brega de la Feria Taurina de Málaga

Entrega: Peña Taurina de Cártama.

Recibe: Daniel Duarte.

Trofeo suerte de varas al mejor puyazo ‘Pepillo de Málaga’

Entrega: Peña Taurina de Cártama.

Reciben: Juan Francisco Peña.

Trofeo ‘Toros con la Luna Asociación Benéfica Hermanitas de los Pobres de Málaga’ a la singularidad

Entrega: Representante Toros con la Luna y Hermanitas de los Pobres.

Recibe: Pablo Aguado

Trofeo ‘Alfonso Ordóñez’ al mejor torero de plata de la Feria Taurina de Málaga

Entrega: Asociación Cultural Taurina «La Torería».

Recibe: Juan Contreras

Trofeo ‘Málaga Taurina’ al triunfador en las plazas de la provincia de Málaga

Entrega: Málaga Taurina.

Recibe: Morante de la Puebla

Trofeo al Mejor toreo de capote

Entrega: Toroshopping.

Recibe: Pablo Aguado.

Trofeo ‘Francisco Mancebo’ al mejor rejoneador de la Feria Taurina de Málaga

Entrega: Peña Taurina de Cártama.

Recibe: Diego Ventura

Trofeo ‘Paco Madrid’ a la mejor estocada

Entrega: Peña Taurina de Cártama.

Recibe: Diego Urdiales.

Reconocimiento al alumno de la Escuela Taurina de Valencia Daniel Artazos

Entrega: Diputación de Málaga.

Recibe: Daniel Artazos.

Reconocimiento a la Real Unión de Criadores de Toros de Lidia

Entrega: Diputación de Málaga.

Recibe: Antonio Bañuelos, presidente de la RUCTL.

Mención especial al ‘Quite providencial’ realizado al banderillero Javier Gómez Pascual

Entrega: Peña Taurina de Cártama.

Recibe: Diego Urdiales.

Reconocimiento ‘Diputación de Málaga’ a la trayectoria profesional y artística en el arte de torear

Entrega: Diputación de Málaga.

Recibe: Javier Conde.`
  },
	{ 
    id: 384,
    title: "Sergio Pérez de Gregorio fin al apoderamiento junto a Alberto García y Rafael Peralta",
    image: "/images/gregoria.jpg",
    category: "Actualidad",
    date: "11 de noviembre de 2025",
	excerpt: "Alberto García y Rafael Peralta dejan de gestionar la carrera del rejoneador charro tras dos años de trabajo",
    fullContent: `El rejoneador Sergio Pérez de Gregorio y los profesionales Alberto García y Rafael Peralta han puesto fin, de mutuo acuerdo, a la relación profesional que les ha unido durante las dos últimas temporadas. La decisión se ha tomado en un clima de cordialidad, manteniendo intacta la amistad y el respeto que ha caracterizado su colaboración.

Durante los años 2024 y 2025, Pérez de Gregorio ha formado parte de los carteles de las principales ferias de segunda categoría, como Huesca, Valladolid, Burgos, Soria, Jaén o Zamora, consolidándose como uno de los rejoneadores jóvenes revelación por su proyección, capacidad y triunfos.

Tanto el jinete como sus hasta ahora representantes han expresado su agradecimiento mutuo por el trabajo compartido dentro y fuera de los ruedos, deseándose los mayores éxitos en sus respectivas trayectorias.`
  },
	{ 
    id: 385,
    title: "Andrés Sánchez, nuevo apoderado de Joselito de Córdoba",
    image: "/images/andres.jpg",
	imageCaption: "Joselito de Córdoba y Andrés Sánchez",
    category: "Actualidad",
    date: "10 de noviembre de 2025",
    fullContent: `El taurino salmantino Andrés Sánchez ha alcanzado un acuerdo de apoderamiento con el novillero cordobés Joselito de Córdoba, convirtiéndose en su nuevo representante. A partir de la próxima temporada, Sánchez asumirá la gestión de su carrera y compromisos profesionales, acompañando al joven espada en su proyección dentro del escalafón menor.

Con esta unión, Joselito de Córdoba refuerza su objetivo de afianzarse como una de las promesas más firmes de la novillería actual, mientras que Andrés Sánchez aportará su experiencia, criterio y conocimiento del sector para orientar la evolución del torero de cara a los retos de la campaña 2026.

El acuerdo se ha cerrado en un ambiente de plena sintonía y confianza mutua, con la intención de consolidar una trayectoria ascendente basada en la regularidad artística y la presencia en ferias de referencia.`
  },
	{ 
    id: 386,
    title: "Calasparra licita las obras de rehabilitación de su plaza de toros de La Caverina",
    image: "/images/calasparra.jpg",
	imageCaption: "Plaza de Toros Calasparra",
    category: "Actualidad",
    date: "10 de noviembre de 2025",
	excerpt: "El Ayuntamiento destinará más de dos millones de euros para el proyecto",
    fullContent: `El Ayuntamiento de Calasparra ha puesto en marcha el proceso de licitación para las obras de restauración y mejora de la plaza de toros de La Caverina, un proyecto que contará con un presupuesto superior a los dos millones de euros y un plazo de ejecución estimado de diez meses.

La actuación permitirá recuperar la actividad taurina en el histórico coso calasparreño, que en los últimos años había visto interrumpidos sus festejos debido al deterioro de las instalaciones, circunstancia que obligó a trasladar los espectáculos a una plaza portátil.

Con la remodelación, La Caverina se transformará en un espacio polivalente, preparado no solo para albergar festejos taurinos, sino también eventos culturales, educativos y de ocio, con una capacidad aproximada para 2.500 espectadores.

El proyecto supone un paso decisivo para la revitalización del patrimonio y la vida cultural de Calasparra, recuperando uno de los enclaves más emblemáticos de la localidad y de su tradición taurina.`
  },
	{ 
    id: 387,
    title: "Illescas define las fechas y la estructura de su Feria del Milagro 2026",
    image: "/images/illescas.jpg",
	imageCaption: "Plaza de Toros Illescas",
    category: "Actualidad",
    date: "10 de noviembre de 2025",
	excerpt: "El serial estará compuesto por corrida de toros y una de rejones",
    fullContent: `La Feria del Milagro de Illescas, uno de los seriales taurinos más esperados y de mayor relevancia en el arranque de la temporada europea, ya tiene fechas confirmadas. El ciclo se celebrará el fin de semana del 7 y 8 de marzo de 2026 y estará compuesto, como marca la tradición, por una corrida de toros y una corrida de rejones.

La empresa MaxiToro, gestora del coso toledano, trabaja ya en la confección de los carteles, que volverán a contar con la presencia de las principales figuras del toreo y las revelaciones más destacadas del escalafón. El objetivo, según fuentes de la organización, es mantener el alto nivel artístico y de repercusión que ha consolidado a Illescas como una cita de referencia en el inicio de la temporada.

En los últimos años, la Feria del Milagro se ha convertido en uno de los grandes atractivos del calendario taurino, tanto por la calidad de sus combinaciones como por el ambiente social y cultural que la rodea. La Corrida del Milagro, en particular, ha adquirido una aureola especial, reuniendo cada año en los tendidos del moderno coso toledano a personalidades del mundo de la cultura, la política y la sociedad.

La expectación ya empieza a crecer entre los aficionados, pendientes de conocer unos carteles que, un año más, reunirán en Illescas a los nombres más destacados del toreo a pie y a caballo.`
  },
	{ 
    id: 388,
    title: "Gines Marín: El rumor afianzando el toreo bueno",
    image: "/images/gines.jpg",
	imageCaption: "Gines Marin - Foto Javier Navarro",
    category: "Opinión",
    date: "9 de noviembre de 2025",
	excerpt: "El extremeño cierra una temporada de madurez y evolución que lo reafirma entre los nombres a seguir en 2026",
    fullContent: `
El torero extremeño Ginés Marín afronta el invierno con la determinación de seguir escalando posiciones tras una temporada 2025 marcada por el reencuentro y la madurez. Sin grandes triunfos numéricos, pero con una evolución evidente, el diestro ha recuperado sensaciones y ha reafirmado su sitio entre los nombres destacados del escalafón.

Desde su salida por la Puerta Grande de Las Ventas en el Día de la Hispanidad de 2022, su carrera atravesó altibajos por la falta de éxitos en plazas de primera, pese a su depurada técnica, su elegante mano izquierda y una forma de matar digna de las grandes figuras. La mala fortuna en los sorteos también le pasó factura.

El punto de inflexión llegó con la incorporación del empresario y ganadero Álvaro Polo como nuevo apoderado, un cambio que marcó el inicio de una etapa más sólida. En San Isidro mostró mayor serenidad y profundidad; en Albacete y la Feria de Otoño de Madrid volvió a medir su toreo con toros de Victorino, dejando una impresión de madurez.

El punto álgido de la temporada se vivió en San Sebastián de los Reyes, donde cortó dos orejas y salió a hombros tras una faena de temple y entrega. También brilló en la Feria de la Antigua de Guadalajara, en un mano a mano con Víctor Hernández, que dejó buen sabor entre los aficionados.

Aunque la suerte no le acompañó en Sevilla ni Madrid, Ginés Marín ha demostrado ambición, verdad y una evolución artística que lo sitúan nuevamente en la primera línea. Su temporada no ha sido de cantidad, sino de calidad. De cara a 2026, el objetivo está claro: consolidarse en las grandes ferias y mantener la línea de pureza y valor que ha recuperado.

Mario Ruiz Ruiz - 9/11/2025`
  },
	{ 
    id: 389,
    title: "Luis Blázquez, intervenido de una rotura de peroné y menisco de la rodilla izquierda",
    image: "/images/luisblazquez.jpg",
    category: "Actualidad",
    date: "9 de noviembre de 2025",
	excerpt: "El subalterno ha sido operado esta misma mañana de una lesión que arrastraba desde el mes de agosto",
    fullContent: `El banderilleros valenciano Luis Blázquez ha sido operado esta mañana de una rotura de peroné que arrastraba desde el pasado mes de agosto en las Corridas Generales de Bilbao, además de ser también operado del menisco de la pierna izquierda.

Tras la intervención, se le ha sido colocada una placa con siete tornillos en la zona del peroné. Dicha operación ha sido llevaba a cabo por el Doctor José Luis López Peris en el Hospital Quirón de Valencia.`
  },
	{ 
    id: 390,
    title: "La temporada en Las Ventas arrancará el 22 de marzo",
    image: "/images/lasventas.jpg",
	imageCaption: "Plaza de Toros de Las Ventas",
    category: "Actualidad",
    date: "9 de noviembre de 2025",
    fullContent: `La temporada en Las Ventas echará a andar el próximo domingo 22 de marzo y, salvo cambios de última hora, Madrid alzará el telón con una novillada. Posteriormente, se celebrarán dos corridas de toros con motivo del Domingo de Ramos y el Domingo de Resurrección, siguiendo la tradición de la plaza más importante del mundo.

El mes de abril volverá a estar marcado por la celebración de novilladas que servirán de antesala a la Feria de San Isidro. Todo este calendario fue adelantado por Rafael García Garrido, empresario de Plaza 1 junto a Simón Casas, a través de una publicación en su cuenta de Instagram.

La Feria de San Isidro comenzará el viernes 8 de mayo y se desarrollará de manera continuada -a excepción de los lunes de descanso- hasta el 7 de junio, día en el que se celebrará la emblemática corrida de la Beneficencia.

La corrida de In Memoriam será el 14 de junio, mientras que ese mes tendrá otra corrida de toros el 21, antes del inicio de las nocturnas el 25.

La primera corrida de toros de la temporada será, como viene siendo habitual, la del Domingo de Ramos y una semana antes -22 de marzo- dará comienzo la temporada con una novillada. Un calendario que, de no moverse, fija la Feria de Otoño del 1 al 4 de octubre y del 9 al 12, Día de la Hispanidad.`
  },
	{ 
    id: 391,
    title: "La Feria de San Isidro comenzará el 8 de mayo",
    image: "/images/feriasanisidro2.jpg",
	imageCaption: "Plaza de Toros de Las Ventas",
    category: "Actualidad",
    date: "9 de noviembre de 2025",
	excerpt: "El 7 de junio se celebrará la corrida de la Beneficencia, mientras que el 14 será turno de la corrida In Memoriam",
    fullContent: `La Feria de San Isidro ya tiene fechas. El serial más importante del toreo comenzará el viernes 8 de mayo y se desarrollará de manera continuada -a excepción de los lunes de descanso- hasta el 7 de junio, día en el que se celebrará la emblemática corrida de la Beneficencia. Así lo confirmó Rafael García Garrido, empresario junto a Simón Casas de Plaza 1, a través de una foto en su cuenta de Instagram.

La corrida de In Memoriam será el 14 de junio, mientras que ese mes tendrá otra corrida de toros el 21, antes del inicio de las nocturnas el 25.

La primera corrida de toros de la temporada será, como viene siendo habitual, la del Domingo de Ramos y una semana antes -22 de marzo- dará comienzo la temporada con una novillada. Un calendario que, de no moverse, fija la Feria de Otoño del 1 al 4 de octubre y del 9 al 12, Día de la Hispanidad.`
  },
	{ 
    id: 392,
    title: "José Carlos Venegas recibe el alta hospitalaria tras la grave cornada sufrida este martes en el campo",
    image: "/images/venegas2.jpg",
    category: "Actualidad",
    date: "8 de noviembre de 2025",
    fullContent: `El torero José Carlos Venegas ha recibido el alta este viernes de la Clínica Cristo Rey de Jaén, donde permanecía hospitalizado desde el pasado miércoles, tras el grave percance sufrido el día anterior mientras realizaba labores de alimentación con el ganado bravo en la ganadería Moragón, en la provincia de Jaén.

El torero fue intervenido quirúrgicamente por los doctores del centro médico de una ‘herida por asta de toro con entrada en la cara posterior del muslo derecho a nivel de tercio medio y salida por la cara externa del muslo en tercio distal, además de una herida inciso-contusa en la región torácica lateral derecha superficial’.

José Carlos Venegas ha explicado que: ‘Afortunadamente he tenido suerte de que el percance, dentro de la gravedad y el dramatismo de verme herido en el suelo y tener que practicarme yo mismo un torniquete, no causó daños mayores en arterias ni venas vitales, aunque me atravesó el muslo de un extremo a otro. Gracias a los cirujanos que me operaron y a la buena evolución -sin ningún contratiempo, sin fiebre, con drenajes positivos y la herida en buen aspecto- he podido recibir el alta’.

‘Ahora toca volver a casa y comenzar cuanto antes la rehabilitación para estar de nuevo frente al toro y prepararme a fondo para la bonita temporada que se me presenta de la mano de mis apoderados Juan Carlos Campillo y Lidia Rodríguez Bermejo’, asegura el diestro jienense.`
  },
	{ 
    id: 393,
    title: "La UTE Circuitos Taurinos-Pueblos del Toreo solicita tres años de prórroga en Palencia",
    image: "/images/ute.jpg",
    category: "Actualidad",
    date: "7 de noviembre de 2025",
    fullContent: `La UTE Circuitos Taurinos – Pueblos del Toreo, integrada por los empresarios Carlos Zúñiga (hijo) y Víctor Zabala, ha solicitado a la Diputación de Palencia la prórroga del contrato de gestión de la plaza de toros de Campos Góticos por tres años más, según informa Diario Palentino.

De aprobarse dicha prórroga, Zúñiga y Zabala continuarían al frente del coso palentino durante las tres próximas ferias de San Antolín, correspondientes a los años 2026, 2027 y 2028.

La diputada de Cultura y responsable de la plaza, Carolina Valbuena, ha valorado positivamente la labor de la actual empresa gestora:

«Estamos muy satisfechos con la gestión realizada en estos años. Han apostado por consolidar la afición, cuidar al abonado y reforzar la identidad de la plaza, además de prestar especial atención al diseño de los carteles y promover iniciativas como las corridas goyescas. Su continuidad sería beneficiosa para la provincia».

Según establece el pliego vigente, la empresa deberá programar durante la Feria de San Antolín un mínimo de tres corridas de toros y una de rejones.`
  },
	{ 
    id: 394,
    title: "Asociación Nacional de Organizadores de Espectáculos Taurinos (ANOET) impulsa una renovación operativa: su nueva junta directiva.",
    image: "/images/anoet.jpg",
    category: "Actualidad",
    date: "6 de noviembre de 2025",
    fullContent: `La Asociación Nacional de Organizadores de Espectáculos Taurinos (ANOET) ha llevado a cabo una reestructuración de su Junta Directiva con el objetivo de adaptarse a las nuevas necesidades del sector y dotar a la organización de una mayor agilidad y eficiencia en la toma de decisiones. La nueva dirección será más reducida y operativa, orientada a dinamizar la gestión interna y reforzar la capacidad ejecutiva de la asociación.

La Junta Directiva queda ahora conformada por Rafael Garrido, que asume la presidencia, acompañado por Ramón Valencia y Óscar Martínez Labiano como vicepresidentes. Completan el órgano directivo los vocales Nacho Lloret, Alberto García, Carmelo García y el empresario José María Garzón, quien se incorpora a ANOET en esta nueva etapa.

Con esta reorganización, ANOET establece una estructura integrada por un presidente, dos vicepresidentes y cuatro vocales. La asociación subraya que este modelo busca fortalecer el liderazgo interno, promover una participación más activa de sus socios y reforzar la cohesión dentro de la entidad, con el propósito de afrontar con mayor solidez los retos presentes y futuros del sector.`
  },
	{ 
    id: 395,
    title: "Carmelo García, un año más al frente de la plaza de toros de Osuna",
    image: "/images/osuna.jpg",
	imageCaption: "Plaza de Toros de Osuna",
    category: "Actualidad",
    date: "6 de noviembre de 2025",
	excerpt: "Una corrida de toros y otra de rejones que se celebrarán el 16 y 17 de mayo",
    fullContent: `Junta de Gobierno del Excmo. Ayuntamiento de Osuna ha aprobado la prórroga del contrato con la empresa Espectáculos Carmelo García para la gestión de la plaza de toros de Osuna durante un año más, tal y como se establecía en el acuerdo de adjudicación. De este modo, la empresa que dirige el empresario sanluqueño Carmelo García continuará organizando la Feria Taurina de Mayo 2026, consolidando así el trabajo iniciado en la pasada edición, en la que se recuperó el esplendor del histórico Coso de San Arcadio con carteles de gran atractivo y la presencia de destacadas figuras del toreo.

El Ayuntamiento ha valorado positivamente la gestión realizada por Espectáculos Carmelo García, ‘destacando la capacidad del empresario, para devolver al coso ursaonense el prestigio y la categoría que tradicionalmente han distinguido a su feria taurina’.

Por su parte, Carmelo García ha expresado su satisfacción por la confianza renovada: ‘Agradecemos a los responsables del Ayuntamiento la concesión de esta prórroga por un año. Es una enorme satisfacción que se haya valorado de forma positiva el trabajo realizado en la pasada feria. Esta nueva aprobación nos llena de ilusión de cara al futuro, con una Feria de Mayo 2026 que ya tiene fechas: el sábado 16 de mayo se celebrará una gran corrida de toros a pie, y el domingo 17 tendrá lugar un festejo de rejones de máximo nivel’, manifestó el empresario.

Con esta continuidad, Osuna reafirma su compromiso con la tradición taurina y con una programación que cada año atrae a numerosos aficionados, consolidando su Feria de Mayo como una de las citas más relevantes del calendario andaluz.`
  }, 
	{ 
    id: 396,
    title: "Fernando Adrián y Maximino Pérez ponen fin a su relación profesional",
    image: "/images/fin.jpg",
    category: "Actualidad",
    date: "5 de noviembre de 2025",
    fullContent: `El empresario taurino Maximino Pérez y el matador de toros Fernando Adrián han anunciado la conclusión de su relación de apoderamiento, que se venía manteniendo desde hace dos temporadas. Ambas partes han llegado a esta decisión de mutuo acuerdo, según han comunicado públicamente.

Durante este periodo, Fernando Adrián ha experimentado uno de los momentos más destacados de su carrera. Entre sus logros sobresalen tres Puertas Grandes consecutivas en la plaza de Las Ventas y un total de 25 Puertas Grandes encadenadas entre las temporadas 2023 y 2024, cifras que lo han situado como uno de los nombres más relevantes del toreo contemporáneo.

El comunicado oficial expresa un agradecimiento recíproco por el trabajo conjunto, así como los buenos deseos para el futuro profesional de ambas partes. Tanto el diestro como el empresario han subrayado la calidad de los logros alcanzados durante esta etapa y han manifestado su confianza en continuar cosechando éxitos y reconocimientos en sus respectivas trayectorias.`
  },
	{ 
    id: 397,
    title: "José Carlos Venegas sufre una grave cornada mientras realizaba labores de campo en su ganadería",
    image: "/images/venegas.jpg",
    category: "Actualidad",
    date: "5 de noviembre de 2025",
    fullContent: `El matador de toros José Carlos Venegas resultó herido este martes durante labores de campo en la ganadería de Moragón, en un accidente que le ocasionó una cornada de consideración. Según el parte médico, el diestro jienense sufrió una herida por asta en la cara posterior del muslo derecho, con trayectoria ascendente y salida por la cara externa del tercio distal, lo que provocó un importante sangrado.

El percance tuvo lugar cuando un toro lo sorprendió durante el manejo cotidiano del ganado. El animal lo embistió de manera súbita, ocasionándole no solo la herida penetrante, sino también diversos traumatismos por la violencia del golpe. En el momento del suceso, Venegas se encontraba solo; pese a ello, mantuvo la calma y la consciencia, y logró practicarse un torniquete para contener la hemorragia hasta la llegada de la ayuda.

El torero fue atendido de urgencia y trasladado para recibir tratamiento quirúrgico. A pesar de la gravedad inicial de la cornada, se encuentra fuera de peligro y evoluciona satisfactoriamente dentro de la normalidad prevista en este tipo de lesiones.`
  }, 
	{ 
    id: 398,
    title: "Juan Carlos Rey entra en la cuadrilla de Borja Jiménez",
    image: "/images/juancarlosrey.jpg",
    category: "Actualidad",
    date: "5 de noviembre de 2025",
	excerpt: "Las filas del diestro de Espartinas permanecerán sin cambios a excepción de la incorporación de Juan Carlos Rey",
    fullContent: `El matador de toros Borja Jiménez afrontará la temporada 2026 con la práctica totalidad de la cuadrilla que lo acompañó en su exitosa campaña anterior, introduciendo únicamente una modificación en sus filas. El banderillero Juan Carlos Rey se incorpora al equipo en sustitución de José Luis Barrero.

El resto de la cuadrilla se mantiene sin variaciones: continuarán los banderilleros Vicente Varela y Luis Blázquez como tercero, así como los picadores Tito Sandoval y Vicente González. Asimismo, repetirán funciones Sebastián Guerra como mozo de espadas y “Titi” como ayuda. La dirección artística y profesional seguirá a cargo de su apoderado Julián Guerra.

El torero de Espartinas iniciará la nueva campaña tras firmar una sobresaliente temporada 2025, en la que lidió 58 corridas de toros en Europa, cortó 102 orejas y 7 rabos, y dejó actuaciones de enorme repercusión que lo consolidaron en la segunda posición del escalafón.

Sus triunfos en Sevilla, Madrid y Bilbao constituyeron los hitos fundamentales de una temporada memorable. En la Feria de Abril, cortó dos orejas a un toro de Jandilla; en las Corridas Generales de Bilbao, logró el indulto de un ejemplar de La Quinta; y en Las Ventas, firmó su tercera Puerta Grande con una faena histórica al toro “Milhijas”, de Victorino Martín, considerada ya una de las más destacadas de la tauromaquia reciente.`
  }, 
	{ 
    id: 399,
    title: "Tomás González, una temporada de crecimiento y firmeza en 2025",
    image: "/images/tomasgonzalez2.jpg",
	imageCaption: "Tomás González en Yunquera de Henares",
    category: "Actualidad",
    date: "4 de noviembre de 2025",
    fullContent: `El novillero Tomás González ha completado en 2025 una temporada que marca un punto de inflexión en su trayectoria. Con 21 novilladas toreadas, el joven alcorisano ha demostrado regularidad, capacidad y un concepto de toreo muy definido, que ha llamado la atención tanto de la afición como de los profesionales.

A mitad de temporada, el novillero  sufrió una cornada en Marchamalo que le provocó un neumotórax y lo obligó a detener su ritmo. Sin embargo, su vuelta a los ruedos mostró a un torero más firme , evidenciando que la experiencia lo fortaleció en su toreo. 

Su toreo, caracterizado por la verticalidad, la serenidad y el trazo profundo, ha dejado momentos de notable expresión en plazas como Azuqueca de Henares , Zaragoza , Mojados… , donde rubricó unas actuaciones de peso. 

La temporada de Tomás González no se mide solo en cifras, sino en evolución, entrega y verdad, ingredientes que hoy lo sitúan como uno de los proyectos más serios del escalafón de cara a la temporada 2026.`
  }, 
	{ 
    id: 400,
    title: "Diego Urdiales y Luis Miguel Villalpando terminan su relación de apoderamiento",
    image: "/images/dos.jpg",
	imageCaption: "Diego Urdiales en Zaragoza",
    category: "Actualidad",
    date: "4 de noviembre de 2025",
    fullContent: `El matador de toros Diego Urdiales y su apoderado Luis Miguel Villalpando han decidido dar por concluida su relación de apoderamiento tras varias temporadas de colaboración. Ambas partes han expresado agradecimiento y respeto mutuo, destacando el trabajo realizado y los objetivos alcanzados durante este tiempo.

La ruptura, según se ha señalado, se produce de manera amistosa y responde a la evolución natural de sus respectivas trayectorias. Urdiales, referente del toreo clásico, afronta ahora una nueva etapa en la gestión de su carrera, mientras Villalpando continuará con sus proyectos en el ámbito taurino.`
  },
	{ 
    id: 401,
    title: "El banderillero José Luis Barrero queda libre de cara a la próxima temporada",
    image: "/images/banderillero.jpg",
    category: "Actualidad",
    date: "4 de noviembre de 2025",
    fullContent: `El banderillero José Luis Barrero afrontará libre la próxima temporada taurina de 2026, tras haber puesto fin a su etapa en las filas del matador Borja Jiménez, con quien ha compartido una gran campaña en 2025.

Después de una temporada llena de actuaciones destacadas, el torero de plata inicia una nueva etapa profesional, con la mirada puesta en seguir ejerciendo su profesión y continuar creciendo dentro del escalafón durante el próximo año taurino`
  }, 
	{ 
    id: 402,
    title: "La Feria de San Isidro 2026 se presentará el 5 de febrero y la corrida ‘In Memoriam’ será en memoria de Rafael de Paula",
    image: "/images/feriasanisidro.jpg",
    category: "Actualidad",
    date: "4 de noviembre de 2025",
	excerpt: "Una información adelantada en el programa Buenos Días Madrid de Onda Madrid, presentado por el periodista Javier Mardomingo",
    fullContent: `La temporada taurina 2026 de la plaza de toros de Las Ventas va dando sus primeros pasos. Según ha adelantado el programa de radio Buenos Días Madrid de Onda Madrid, dirigido por el periodista Javier Mardomingo, la gala de presentación de la Feria de San Isidro se celebrará el próximo jueves 5 de febrero a las 19:30 horas. El acto de presentación de los carteles dará a conocer las combinaciones de la feria más importante del mundo taurino.`
  }, 
	{ 
    id: 403,
    title: "Ignacio Candelas y Juan Manuel Moreno “Trebu” fin a la relación de apoderamiento",
    image: "/images/ignacio.jpg",
	imageCaption: "Foto Plaza 1 ©",
    category: "Actualidad",
    date: "4 de noviembre de 2025",
    fullContent: `El novillero con picadores Ignacio Candelas y su mentor Juan Manuel Moreno “Trebu” han decidido poner fin a su relación de apoderamiento, que se extendió entre las temporadas 2023 y 2025.

Ambos expresaron su agradecimiento mutuo por el trabajo y la dedicación compartidos, deseándose lo mejor en sus próximos compromisos. Con esta decisión, Candelas inicia una nueva etapa en su carrera taurina.`
  }, 
	{ 
    id: 404,
    title: "Polo Saiz, Félix San Román y Joel Ramírez, premiados en Trillo",
    image: "/images/varios3.jpg",
    category: "Actualidad",
    date: "3 de noviembre de 2025",
    fullContent: `El ganadero Polo Saiz y los novilleros Félix San Román y Joel Ramírez recibieron el pasado viernes los galardones que los distinguen como triunfadores del ciclo taurino celebrado en Trillo a lo largo de 2025. El acto, que contó con un interesante coloquio moderado por la periodista Vanesa Santos, estuvo presidido por el concejal de Festejos del Ayuntamiento de Trillo, Sergio Recuero, encargado de entregar los premios.

El novillero Joel Ramírez fue distinguido con el trofeo a la Mejor Faena por su brillante labor frente al novillo “Orca”, de la ganadería Polo Saiz, al que cortó los máximos trofeos.

Por su parte, Félix San Román fue proclamado Triunfador del Ciclo tras cortar un total de cuatro orejas a ejemplares de Polo Saiz y Hermanos Cambronell, rubricando así una destacada actuación.

Asimismo, el premio al Mejor Novillo recayó en “Orca”, número 12, de Polo Saiz, en reconocimiento a su bravura, clase y excelente juego durante la lidia.`
  }, 
	{ 
    id: 405,
    title: "Rafael Camino JR y Oscar de la Faya , nuevo equipo de apoderamiento del novillero Iván Rejas",
    image: "images/varios2.jpg",
    category: "Actualidad",
    date: "2 de noviembre de 2025",
    fullContent: `El novillero con picadores Iván Rejas ha anunciado a través de su perfil de Instagram su nuevo acuerdo de apoderamiento con Rafa Camino Jr. y Óscar de la Faya, con quienes comienza una nueva etapa en su carrera profesional.

En su comunicado, el torero definió esta unión como “un proyecto joven, nacido de la confianza, la ilusión y la convicción de que el trabajo, el esfuerzo y la verdad son la base para crecer”. Además, destacó que los tres comparten una misma forma de entender la profesión y un objetivo común: “avanzar, aprender y seguir construyendo futuro dentro del toreo”.

Con “compromiso y afición”, Rejas afronta esta nueva etapa que, según sus propias palabras, “motiva y une” a este nuevo equipo de trabajo.`
  }, 
	{ 
    id: 406,
    title: "Fallece Rafael de Paula a los 85 años",
    image: "images/rafaeldepaula.jpg",
    category: "Actualidad",
    date: "2 de noviembre de 2025",
    fullContent: `El maestro jerezano Rafael Soto Moreno, conocido universalmente como Rafael de Paula, ha fallecido a los 85 años de edad. Nacido en el Barrio de Santiago de Jerez de la Frontera el 11 de febrero de 1940, el torero se convirtió en una de las figuras más carismáticas y singulares de la historia del toreo. Su arte, elegancia y personalidad le granjearon un lugar de culto entre varias generaciones de aficionados.

Rafael de Paula debutó en público en Ronda, en mayo de 1957, en una plaza que años más tarde volvería a marcar su trayectoria. En ese mismo coso rondeño tomó la alternativa en 1960, de manos de Julio Robles y con Antonio Ordóñez como testigo. Su confirmación en Las Ventas llegó en mayo de 1974, con José Luis Galloso como padrino y el toro Andadoso, de José Luis Osborne, como testigo de aquella tarde.

Su carrera, marcada por los altibajos y por una relación casi mística con el arte, trascendió las estadísticas y las orejas. Paula fue, por encima de todo, un símbolo de pureza y autenticidad, un torero que hizo del temple y la hondura una forma de expresión.

Su despedida de los ruedos tuvo lugar el 18 de mayo del año 2000, en su querida Jerez, en una corrida cargada de emoción en la que, fiel a su esencia, no llegó a matar a sus toros y se cortó la coleta entre lágrimas y ovaciones. Fue su adiós a los ruedos, pero no al mito.

En 2002, el Ministerio de Cultura le concedió la Medalla de Oro al Mérito en las Bellas Artes, en reconocimiento a su excepcional aportación a la cultura española y a la tauromaquia.

Desde Tendido Digital, enviamos nuestro más sentido pésame a sus familiares, amigos y aficionados por la pérdida de un torero irrepetible. Se va un mito, pero su arte quedará para siempre en la memoria del toreo.`
  }, 
	{ 
    id: 407,
    title: "Carla Otero, nuevo nombre que se incorpora al profesorado de la Escuela taurina de Madrid",
    image: "images/carla.jpg",
    category: "Actualidad",
    date: "2 de noviembre de 2025",
    fullContent: `La novillera Carla Otero, novillera de Guadalajara con un recorrido marcado por la superación de numerosas adversidades,se ha incorporado recientemente a la Escuela Taurina de Madrid José Cubero “Yiyo”, según se comunicó el pasado 20 de octubre con el comienzo
 del nuevo curso. 

En esta etapa, su papel será guiar y acompañar a los alumnos más jóvenes y noveles, transmitiendo tanto la técnica como la pasión que han caracterizado su carrera en los ruedos. 

Esta experiencia supone un giro natural en su trayectoria, pasando de protagonista en plazas a formadora de nuevos talentos.

La carrera de Otero ha estado marcada por constantes pruebas y obstáculos. En septiembre de 2023 sufrió una cornada grave en la plaza de El Casar, que la obligó a retirarse temporalmente de los ruedos. Lejos de desanimarse, siempre tuvo la intención de regresar, algo que consiguió meses después, reapareciendo en Trillo, San Sebastián de los Reyes y, nuevamente, en El Casar, plaza que un año antes había supuesto un antes y un después en su carrera como novillera debido a aquella dura cornada. 

Esta resiliencia demuestra no solo su capacidad física, sino también su fortaleza mental y su amor por la tauromaquia.`
  }, 
	{ 
    id: 408,
    title: "“Soy torero no sobresaliente” - Entrevista con Enrique Martínez Chapurra",
    image: "images/enriquez.jpg",
    category: "Entrevistas",
    date: "1 de noviembre de 2025",
    fullContent: `Matador de toros desde 2003, natural de Andújar, ha encabezado durante años el escalafón de sobresalientes en plazas tan destacadas como Las Ventas, Vistalegre o Morón de la Frontera. A pesar de una carrera marcada por la dureza y las lesiones, sigue fiel a su pasión y a su forma de entender la vida: con afición, entrega y verdad.

—¿Qué significa para ti haber encabezado durante varios años el escalafón de sobresalientes en plazas tan importantes?
—Bueno, no tiene mucha importancia el torear más o menos de sobresaliente. Yo considero que lo importante es poder vivir de torero y poder vivir de tu profesión. Dado que esto está muy complicado, poder vivir del toreo no es tarea fácil, y me siento un privilegiado de poder seguir disfrutando de mi profesión. Siempre pienso que esto es un trampolín hacia una oportunidad que me pueda cambiar la vida.

—Tomaste la alternativa en 2003 en Andújar, pero no has logrado consolidarte como matador principal. ¿Cómo has vivido esa transición?
—Tomé la alternativa en mi pueblo hace bastante tiempo, y al principio no me gustaba torear de sobresaliente, pero vi que era una de las pocas posibilidades que tenía para seguir vistiéndome de torero y seguir luchando. Me lo tomé como si toreara cincuenta corridas por temporada, porque nunca he dejado de entrenar como al principio. A día de hoy sigo con la misma ilusión que cuando era un chaval.

—En 2022 sufriste una grave cornada en Estella. ¿Cómo fue esa experiencia?
—Sí, fue una cornada extremadamente grave. Al final tuve mucha suerte, porque si el pitón llega a profundizar un poco más —ya fueron 25 centímetros— estaríamos hablando de una tragedia gorda, porque me habría partido el hígado. Así que me considero un afortunado. Mi carrera ha sido muy dura: desde novillero tuve una cornada gravísima en el ano que me destrozó intestino delgado y grueso, con rotura de peritoneo, y estuve a punto de morir. Luego vinieron más: una en Ondara en 2005, otra lesión muy dura en 2019 con la rotura del tendón de Aquiles… Pero aquí sigo. Mi carrera ha sido muy dura, sí, pero también muy vivida.

—Eres conocido por tu afición y entrega. ¿Cuál es tu filosofía personal para mantenerte motivado?
—Mi filosofía en el toreo y en la vida es ir siempre recto. En el toreo hay que tener mucha afición y vivir para ello. A mí nunca me ha costado sacrificarme por mi profesión, porque me gusta y es mi pasión.

—¿Qué opinas sobre el papel de los sobresalientes en los festejos taurinos?
—La opinión que tengo es que uno no es sobresaliente: uno es torero. Me toca esto y es lo que me contratan, pero ante todo soy matador de toros, y sobre todo, soy torero.

—¿Cuáles son tus proyectos y objetivos para el futuro?
—Mi objetivo es seguir en mi profesión mientras las fuerzas y la ilusión me acompañen. Que venga lo que el destino quiera, pero yo lo único que quiero es ser feliz, y así lo soy con lo que hago.`
  }, 
	{ 
    id: 409,
    title: "El Gobierno de Aragón rectifica y permitirá la celebración de festejos taurinos bajo una serie de normas",
    image: "images/gobiernoaragon.jpg",
    category: "Actualidad",
    date: "1 de noviembre de 2025",
    fullContent: `El departamento de Agricultura, Ganadería y Alimentación del Gobierno de Aragón ha decidido a última hora de la tarde de este viernes que los festejos taurinos sí podrán celebrarse finalmente en todo este territorio tras haber modificado la citada resolución por la que habían sido suspendidos de forma cautelar en la mañana de este viernes. 

La nueva normativa establece que los espectáculos taurinos populares podrán celebrarse en todo el territorio aragonés siempre y cuando se cumplan varias rigurosas medidas sanitarias. De esta forma, para los espectáculos que se desarrollen en un único día o en varios consecutivos dentro de una misma localidad, todos los animales deberán proceder de la misma ganadería, garantizando así un mayor control sanitario, además de desinsectar las instalaciones donde se hayan ubicado las reses bravas una vez concluido el espectáculo taurino.

En cuanto a corridas de toros y novilladas con picadores, la nueva normativa establece que podrán efectuarse sin restricciones adicionales, manteniendo únicamente las medidas de desinsectación esenciales para evitar la difusión del virus.`
  }, 
	{ 
    id: 410,
    title: "Pablo Aguado y Miguel Ángel Perera llevan la tauromaquia, la salud mental y la fe a los jóvenes de la CEU",
    image: "images/varios.jpg",
    category: "Actualidad",
    date: "31 de Octubre de 2025",
    fullContent: `El salón de actos del Campus Universitario CEU Andalucía acogió una nueva sesión del ciclo Vida CEU, protagonizada por dos referentes de la tauromaquia actual: Pablo Aguado y Miguel Ángel Perera. Los diestros compartieron con los estudiantes su experiencia profesional y reflexionaron sobre temas como la preparación física, la salud mental, la fe y los valores del mundo del toro.

El encuentro estuvo presentado por Santiago López, responsable de Vida Universitaria, y moderado por José Enrique Moreno, director de Comunicación de la Empresa Pagés. El acto reunió a numerosos jóvenes procedentes de todos los centros CEU en Andalucía, evidenciando el interés que despierta la tauromaquia entre las nuevas generaciones.

Durante la jornada se presentó, además, el Club Taurino de la Universidad CEU Fernando III, impulsado por el alumno Fernando Pascual, con el propósito de fomentar la afición y abrir un espacio de diálogo y participación en torno al toreo a lo largo del curso académico.

Aguado: “El mejor psicólogo para un torero es otro torero”

El torero sevillano Pablo Aguado expresó su satisfacción al ver el auditorio lleno de jóvenes, subrayando que “es muy motivador ver a tantos niños y jóvenes en las plazas”. Sobre la preparación física, destacó que “cada torero tiene su propia rutina; lo importante es mantener la mente en el toreo. La preparación física ayuda mucho, sobre todo, en lo mental”.

Interpelado por el moderador acerca del miedo y la preparación psicológica, Aguado explicó que “la confianza en uno mismo es fundamental, y eso se trabaja día a día. Los toreros somos muy perfeccionistas y, a veces, no valoramos lo bueno que hacemos”. En relación con la salud mental, apuntó que “el mejor psicólogo para un torero es otro torero, porque ha vivido la misma situación y sabe cómo ayudarte a superarla”.

El sevillano también reflexionó sobre la fe y su conexión con la tauromaquia: “Soy una persona católica y practicante. Muchas veces me santiguo veinte veces antes de que salga el toro, y luego pienso que debería dar más gracias a Dios y no pedirle tanto”. Finalmente, defendió que “es fundamental que el mundo del toro se dé a conocer en entornos como las universidades”.

Perera: “La exigencia y el perfeccionismo te pueden llevar a la negatividad”

Por su parte, Miguel Ángel Perera manifestó su satisfacción por la iniciativa y por la numerosa presencia de jóvenes, felicitando a la Universidad CEU Fernando III por acercar el toreo al ámbito universitario. El diestro extremeño destacó la evolución en la preparación física desde sus inicios: “Hoy se ha profesionalizado mucho; antes era todo más básico. Yo necesito ser muy perfeccionista en mi rutina, porque eso me da confianza”.

Perera confesó que, pese a su amplia trayectoria, “por muchos años que lleves delante de un toro, siempre tienes nervios y la sensación de que podrías haberte preparado mejor”. En ese sentido, reflexionó: “La exigencia y el perfeccionismo te pueden llevar a la negatividad; yo trabajo cada día para quedarme con lo positivo”.

Sobre la fe, señaló que “soy practicante y le doy gracias a Dios por tener a mi gente cerca y con salud; lo tengo muy presente cada día”. Para concluir, reivindicó la dimensión cultural del toreo: “El toro sigue siendo un icono de la cultura española, una seña de identidad de muchos de nuestros pueblos. Debemos seguir trabajando para que se conozca y se valore más”.`
  }, 
  { 
    id: 411,
    title: "Borja Jiménez culmina una temporada histórica con 102 orejas, 7 rabos y 17 reconocimientos",
    image: "images/borjajimenez2.jpg",
    category: "Actualidad",
    date: "31 de Octubre de 2025",
    fullContent: `El nombre de Borja Jiménez resuena con fuerza en el epílogo de la temporada taurina 2025. El torero de Espartinas ha firmado un año de plenitud y madurez, consolidándose como una de las grandes figuras del escalafón y alcanzando la segunda posición del escalafón, solo por detrás de Morante de la Puebla. Su concepto clásico, la pureza de su toreo y la autenticidad de su expresión artística han calado profundamente en la afición y en las empresas, que lo han convertido en un torero de temporada completa.

A lo largo de 58 corridas en Europa, Jiménez ha cosechado 102 orejas y 7 rabos, un balance que refleja su regularidad, entrega y capacidad de adaptación en todo tipo de escenarios: 19 plazas de primera, 16 de segunda y 23 de tercera categoría. Su campaña ha dejado una huella indeleble en ferias de máxima relevancia. Triunfó en Sevilla, donde cortó dos orejas a un toro de Jandilla en la Feria de Abril; en Bilbao, donde indultó un ejemplar de La Quinta durante las Corridas Generales; y en Madrid, donde rubricó su tercera Puerta Grande en Las Ventas con una faena memorable al toro “Milhijas”, de Victorino Martín, ya considerada una de las páginas más brillantes de la tauromaquia reciente.

Con la temporada europea cerrada, el sevillano ha iniciado su periplo americano con una primera actuación en Latacunga (Ecuador), y en las próximas semanas afrontará compromisos en las plazas mexicanas de Aguascalientes, Guadalajara y Tlaxcala. Antes de cruzar definitivamente el Atlántico, Jiménez ha comenzado una intensa gira de actos para recoger los 17 reconocimientos que avalan su condición de triunfador absoluto de 2025.

Los 17 galardones de Borja Jiménez en 2025
	•	Real Casino de Madrid: Triunfador de la temporada en Madrid.
	•	Premio Chenel y Oro (Madrid): Faena más destacada del año al toro “Milhijas” de Victorino Martín.
	•	Soria: Triunfador de la Feria de San Juan.
	•	Manzanares: Triunfador de la Feria Taurina.
	•	Roquetas de Mar: Triunfador de la Feria.
	•	Azpeitia: Triunfador de la Feria.
	•	Santander (Palacio del Mar): Mejor faena de la Feria de Santiago.
	•	Santander: Mejor toreo a la verónica de la Feria.
	•	Bilbao: Mejor faena de la Feria.
	•	Béziers (Francia): Mejor faena de la Feria, por su labor ante un toro de Pedraza de Yeltes.
	•	Priego de Córdoba: Triunfador de la Feria.
	•	Club Taurino de Londres: Homenaje a su temporada 2025.
	•	Villafranca de los Barros: Triunfador de la temporada.
	•	Calasparra: Triunfador de la temporada.
	•	Cieza: Triunfador de la temporada.
	•	Herrera del Duque: Triunfador de la temporada.
	•	Guadalajara: Triunfador y autor de la mejor faena de la Feria de la Antigua.

Con estos reconocimientos, Borja Jiménez confirma que 2025 ha sido el año de su consagración definitiva, un curso en el que ha unido arte, verdad y regularidad, y que lo consolida como uno de los nombres imprescindibles del presente y futuro de la tauromaquia.`
  }, 
  { 
    id: 412,
    title: "Aragón suspende los festejos taurinos a consecuencia de la Dermatosis Nodular Contagiosa",
    image: "images/aragon.jpg",
    category: "Actualidad",
    date: "31 de Octubre de 2025",
    fullContent: `La Comunidad de Aragón ha suspendido todos los festejos taurinos populares a consecuencia de la Dermatosis Nodular Contagiosa. Tal y como recoge la cuenta de Instagram Torosocialgestión en un comunicado, queda suspendida toda la presencia de animales en ferias, concursos y cualquier evento en el que tomen participación salvo perros, gatos y animales de compañía.

Una decisión que atiende directamente a la Resolución de 27 de octubre de 2025 de la Dirección General de Calidad y Seguridad Alimentaria del Gobierno de Aragón, publicada en el Boletín Oficial de Aragón (BOA n° 210, de 30 de octubre de 2025) por la que se han adoptado medidas cautelares ante esta enfermedad que afecta a los festejos taurinos.

Ante esta decisión, todos los festejos ya autorizados pendientes de celebración serán suspendidos, al igual que las solicitudes pendientes y las nuevas no serán tramitadas hasta que se levante la prohibición`
  }, 
  { 
    id: 413,
    title: "Curro Vázquez, nuevo apoderado del novillero Emiliano Osornio",
    image: "images/currovazquez.jpg",
    category: "Actualidad",
    date: "30 de Octubre de 2025",
    fullContent: `El reconocido maestro Curro Vázquez ha decidido apoderar al novillero mexicano Emiliano Osornio, una decisión motivada por su compromiso con la necesaria aparición de nuevos valores y su deseo de respaldar el mundo de las novilladas y el toreo de México, que actualmente atraviesan por una situación complicada.

Emiliano Osornio se ha consolidado como uno de los nombres más destacados del escalafón de novilleros. Durante esta temporada ha dejado una grata impresión por la pureza y la personalidad de su toreo en plazas de importancia como Las Ventas, además de hacerse con los trofeos al Triunfador de las Ferias de Arnedo y Arganda del Rey.

Esta unión entre Curro Vázquez y Emiliano Osornio representa una apuesta decidida por el futuro del toreo y una muestra de confianza en la nueva generación de toreros mexicanos.`
  }, 
  { 
    id: 414,
    title: "Clément Albiol se suma al equipo de apoderamiento de Sánchez Vara",
    image: "images/albiol.jpg",
    category: "Actualidad",
    date: "29 de Octubre de 2025",
    fullContent: `El taurino Clément Albiol se incorpora al equipo de apoderamiento del matador de toros Sánchez Vara, asumiendo la gestión en la zona de Francia. Junto con Carlos Sánchez “Zapaterito”, conformarán un equipo sólido con el objetivo de afrontar una temporada de gran proyección y relevancia para el torero alcarreño.

Clément ha mostrado su satisfacción por esta nueva etapa profesional: “Sánchez Vara es un torero con una trayectoria admirable y una gran autenticidad en el ruedo. Afronto esta nueva responsabilidad con ilusión y compromiso para contribuir a una temporada importante”.

Por su parte, Carlos Sánchez “Zapaterito” destacó la importancia de esta incorporación: “La llegada de Clément refuerza el equipo y aporta una gran experiencia en el ámbito taurino francés. Estamos convencidos de que juntos alcanzaremos los objetivos marcados para la próxima temporada”.

Finalmente, Sánchez Vara expresó su agradecimiento y confianza en su equipo de trabajo: “Me siento muy ilusionado con la incorporación de Clément . Con Carlos y con él formamos un grupo unido, con muchas ganas y una gran fe en este proyecto. Afrontamos  la próxima temporada con ambición y compromiso con la afición”.`
  }, 
  {
    id: 415,
    title: "Daniel Luque inicia una nueva etapa de apoderamiento con Antonio Barrera como apoderado",
    image: "images/danielluque.jpg",
    category: "Actualidad",
    date: "28 de Octubre de 2025",
   excerpt: "El torero de Gerena confía su carrera a la FIT a través del exmatador sevillano, tras cerrar su relación con la Casa Lozano.",
    fullContent: `El torero sevillano Daniel Luque ha hecho oficial este martes, a través de un comunicado publicado en sus redes sociales, su nueva relación de apoderamiento con Antonio Barrera, quien dirigirá su carrera dentro de la estructura de la Fusión Internacional por la Tauromaquia (FIT).

El anuncio llega tras la reciente finalización de su vínculo profesional con Luis Manuel Lozano, con quien había trabajado durante la última temporada.

Con esta alianza, Luque abre una nueva etapa profesional con el objetivo de reforzar su proyección internacional y consolidar su posición en las principales ferias de la temporada 2026.

Antonio Barrera, exmatador y actual gestor taurino, forma parte del equipo directivo de la FIT, empresa que gestiona plazas de primer nivel como Olivenza, Badajoz, Salamanca, San Sebastián y Bilbao, entre otras. Su incorporación supone para Luque el respaldo de una estructura con gran influencia en el panorama taurino.`
  }, 
  {
    id: 416,
    title: "Adrián Henche se somete a un tratamiento de ozonoterapia cervicolumbálgica",
    image: "images/adrianhenche.jpg",
    category: "Actualidad",
    date: "28 de Octubre de 2025",
    fullContent: `El novillero con picadores Adrián Henche ha sido sometido recientemente a un tratamiento de ozonoterapia cervicolumbálgica, después de que diversas pruebas médicas confirmaran una lesión que lleva arrastrando desde hace años y que venía mermando su preparación. 

Según el parte médico difundido por el propio torero, los estudios realizados muestran cambios degenerativos en la zona cervical y lumbar de la columna vertebral, con signos de deshidratación discal y abombamientos en varios niveles cervicales —principalmente C3-C4, C4-C5 y C5-C6—, además de una hernia discal en el nivel L5-S1 que condiciona una leve estenosis foraminal izquierda. Afortunadamente, no se observan imágenes de estenosis de canal lumbar.

El tratamiento al que ha sido sometido el novillero tiene como objetivo reducir el dolor y las limitaciones físicas que estas lesiones le ocasionan desde hace tiempo. 
La ozonoterapia, aplicada en el ámbito médico-deportivo, busca mejorar la oxigenación y regeneración de los tejidos, aliviando la inflamación y facilitando la recuperación funcional.

Desde su entorno confían en que esta intervención permita a Henche retomar pronto su preparación física y taurina con total normalidad, tras una etapa marcada por molestias que dificultaban su día a día.`
  }, 
  {
    id: 417,
    title: "Morante de la Puebla: el adiós de un genio que transformó el toreo",
    image: "images/moranteretirada.jpg",
    category: "Opinión",
    date: "28 de Octubre de 2025",
    fullContent: `La retirada de Morante de la Puebla no es solo la noticia del adiós de un torero; es el cierre de un capítulo en la historia de la tauromaquia que marcó a toda una generación. 

Su decisión, anunciada tras cortar dos orejas en Las Ventas y simbolizada con el gesto de cortarse la coleta, es un acto de valentía. Todos aquellos 12 de Octubre pensábamos ¿Qué haremos sin Morante?

Morante no fue un torero al uso. Desde su debut en Madrid en 1995 hasta su consagración en los ruedos más importantes, su sello fue la búsqueda de la belleza, la plasticidad del gesto y la conexión emocional con el público. 

Cada muletazo suyo parecía una pincelada, un diálogo silencioso entre el hombre y el toro. En un mundo del toreo donde muchas veces prima el espectáculo sobre el arte, Morante recordó que la esencia de esta tradición radica en la armonía, la estética y la torería. 

Su retirada también nos recuerda la fragilidad del artista. Enfrentarse a problemas de salud mental, pausar su carrera y luego regresar a los ruedos es un testimonio de resiliencia. Pero el paso final de decir “basta” demuestra que incluso los más grandes saben reconocer sus límites, y que la dignidad reside en marcharse en el punto más alto, en lugar de prolongar lo inevitable.

El legado de Morante de la Puebla va más allá de los trofeos y los aplausos. Su influencia perdurará en jóvenes toreros, aficionados y críticos que aprenderán que el toreo no es solo técnica, sino expresión, sensibilidad y autenticidad. En un mundo donde todo se mide en números y récords, Morante enseñó que la verdadera grandeza se encuentra en la pasión que se imprime en cada faena.

Su adiós deja un vacío, pero también un recuerdo imborrable: el de un hombre que convirtió su toreo en algo diferente  y que, al despedirse, nos recuerda que la belleza no siempre necesita prolongarse, sino brillar con intensidad mientras dura.`
  }, 
  {
    id: 418,
    title: "El matador de toros 'Juanito' deja la profesión",
    image: "images/juanito.jpg",
    category: "Actualidad",
    date: "27 de Octubre de 2025",
   excerpt: "El portugués así lo ha comunicado a través de una publicación en su perfil de Instagram",
    fullContent: `El matador de toros portugués João Silva ‘Juanito’, ha tomado la decisión de retirarse y dejar la profesión tras toda una vida dedicada al toro. 

A través de un emotivo comunicado en su perfil de Instragram, el luso ha querido poner fin a esta etapa de su vida y agradecer a su familia, a todos lo que le han acompañado en este viaje y al toro bravo como eje de su vida. Este es el comunicado
íntegro de Juanito en redes:

Hoy, 27 de Octubre de 2025, he tomado la decisión de dejar lo que hasta ahora ha sido mi vida y a la que he dedicado desde los 6 años cada gota de sudor, cada sangre, cada lágrima. 

Ha sido una etapa muy bonita que concluye y pone su fin, la de torear como matador de toros, porque torero es y siempre serálo que seré. 

En cada tarde he dado lo mejor de mí y toda mí alma lo cual me reconforta y hace que esta decisión sea tomada tranquilo con uno mismo. 

Muy agradecido eternamente a mi familia, a todas esas personas y amigos que me han llevado a ser mejor y a la vida y al destino por haberme hecho matador de toros y haber podido competir con todas las máximas figuras del toreo y con casi todos los toreros. 

Agradecerle sobretodo al toro, a ese animal bello que me ha hecho ser la persona que soy y a sentir, pensar y hacerme vivir diferente al resto de los mortales. 

Juanito.`
  },
  {
    id: 419,
    title: "Tomás Rufo, Daniel Luque, Aarón Palacio y Cristiano Torres, protagonistas de la segunda edición de los Premios Nicanor Villalta",
    image: "images/premiosnicanor.jpg",
    category: "Actualidad",
    date: "28 de Octubre de 2025",
    fullContent: `La segunda edición de los Premios Nicanor Villalta, impulsados por el Gobierno de Aragón, reconoció este lunes a Tomás Rufo, Daniel Luque, Aarón Palacio y Cristiano Torres como protagonistas de la temporada taurina 2025.
La ceremonia, celebrada en la Sala de la Corona del Edificio Pignatelli, reunió a autoridades y profesionales del mundo del toro en un acto que sirvió también para reivindicar el valor cultural y social de la tauromaquia.

El presidente aragonés, Jorge Azcón, definió a los galardonados como “cuatro toreros que han emocionado a los aficionados aragoneses esta temporada”, y subrayó que “la fiesta de los toros —por mucho que a algunos les pese— es arte, historia, cultura, tradición, economía y defensa de la España rural”.

Por segundo año consecutivo, el jurado distinguió a Tomás Rufo por su extraordinaria faena al sexto toro de la tarde del 13 de agosto en la Feria de la Albahaca de Huesca. En la Feria del Pilar de Zaragoza, el reconocimiento recayó en Daniel Luque, premiado por su actuación ante el quinto toro del 11 de octubre.

Asimismo, el jurado otorgó ex aequo el galardón a la nueva generación de toreros aragoneses a Aarón Palacio y Cristiano Torres, quienes tomaron la alternativa durante la temporada 2025.

Durante su intervención, Azcón felicitó a los premiados y destacó su contribución al toreo aragonés. “Tomás, el año que viene tienes que ir a por la mejor faena en Teruel y ser el primer torero que logra este premio en las tres provincias”, señaló. Sobre Luque, afirmó que “su compromiso con Zaragoza es innegable; es un torero de esta tierra y tiene a la afición entregada”. 

En cuanto a los jóvenes premiados, aseguró que “Aarón y Cristiano representan la ilusión de una nueva etapa dorada para el toreo aragonés”.

El presidente aprovechó la gala para reafirmar el apoyo institucional del Ejecutivo autonómico a la tauromaquia, recordando la recuperación de las retransmisiones taurinas en Aragón TV, con 53 festejos emitidos y una cuota media de audiencia del 19,1%, casi el doble de la media de la cadena autonómica, que cerró 2024 con un récord histórico del 11,6%.

Azcón evocó también la figura de Nicanor Villalta, considerado “el torero aragonés más ilustre”, y propuso organizar una corrida goyesca especial en 2027 para conmemorar el bicentenario de la muerte de Francisco de Goya.
Además, dedicó unas palabras de reconocimiento a Morante de la Puebla, recientemente retirado tras más de tres décadas de trayectoria, a quien definió como “uno de los grandes toreros de la historia”.

Como cierre de la velada, la Asociación de Informadores Taurinos de Aragón otorgó la Pluma de Oro al Gobierno de Aragón por la creación de estos galardones, en reconocimiento a su impulso y compromiso con la fiesta. El premio fue recogido por Jorge Azcón y la vicepresidenta Mar Vaquero, en una jornada que reafirmó la vigencia y el orgullo de la tradición taurina en Aragón.`
  }, 
  {
    id: 420,
    title: "Alberto García, nuevo apoderado de El Fandi",
    image: "images/albertogarcia.jpg",
    category: "Actualidad",
    date: "27 de Octubre de 2025",
    fullContent: `El matador de toros David Fandila ‘El Fandi’ será apoderado por el empresario Alberto García, CEO de Tauroemocion, durante la temporada 2026. Un acuerdo de apoderamiento que el diestro granadino ha anunciado a través de un comunicado.

En el mismo, El Fandi anuncia una nueva etapa profesional de la mano de Alberto García ‘cargada de ilusión y compromiso, basada en la entrega por ambas partes’.

Cabe recordar que este cambio en la carrera de El Fandi llega después de estar más de 20 años ligado a la Casa Matilla.

El diestro granadino ha sido el triunfador esta temporada en ferias de la importancia de Burgos, Valladolid o Jaén.`
  }, 
  {
    id: 421,
    title: "La Diputación de Málaga anula el concurso de La Malagueta por un error técnico y convocará un nuevo proceso en 30 días",
    image: "images/lamalagueta.jpg",
    category: "Actualidad",
    date: "27 de Octubre de 2025",
    fullContent: `La Diputación de Málaga ha decidido anular el concurso público para la gestión de la plaza de toros de La Malagueta tras detectar un error técnico en la configuración de los sobres del procedimiento, según adelantó la periodista Patricia Navarro en La Razón. Este defecto de forma afectó al sistema de carga de la documentación requerida, lo que impidió que los licitadores pudieran completar correctamente sus solicitudes.

Como consecuencia, el anuncio publicado el pasado 7 de octubre de 2025 ha quedado sin efecto, y la institución provincial abrirá una nueva convocatoria en el plazo de 30 días, con el fin de garantizar un proceso limpio y transparente.

No obstante, esta decisión no resuelve la impugnación presentada por la empresa Nautalia, actual gestora de las plazas de Valencia y Las Ventas, que había cuestionado los requisitos de solvencia técnica del pliego por considerarlos restrictivos y contrarios a la libre competencia. En concreto, el documento exigía haber gestionado durante los tres últimos años tres plazas de primera o segunda categoría con un mínimo de quince festejos por temporada, una condición que excluía a importantes operadores del sector.

El criterio dejaba fuera, entre otras, a la propia Nautalia y a la Empresa Pagés, responsable de la plaza de toros de Sevilla, generando un debate en el sector sobre la proporcionalidad de las condiciones impuestas. Con la anulación del concurso, el futuro de la gestión de La Malagueta queda en suspenso a la espera de la publicación del nuevo pliego.`
  }, 
  {
    id: 422,
    title: "El silencio que suena a triunfo: la verdad de Víctor Hernández",
    image: "images/victorhernandez.jpg",
    category: "Opinión",
    date: "26 de Octubre de 2025",
    fullContent: `El nombre de Víctor Hernández empieza a pronunciarse con fuerza en los mentideros taurinos. No es casualidad. En un momento en que el toreo busca hueco en el escalafón, el madrileño ha demostrado que posee el oficio, la cabeza y la sensibilidad necesarios para abrirse camino en un escalafón cada vez más exigente.

Su temporada 2025 ha sido un ejercicio de crecimiento constante. Desde los primeros compromisos hasta sus tardes estelares en plazas de primera, Víctor Hernández ha dejado una impronta de torero puro, con un concepto clásico y una actitud que honra la profesión. No hay en él gestos impostados ni necesidad de ruido: su toreo habla por sí solo.

En la Feria de San Isidro en Plaza de Toros de Las Ventas, el 10 de mayo de 2025, Victor cortó una oreja de mucho peso al tercer toro de la tarde, de la ganadería El Pilar, en una actuación cargada de firmeza y valor ante un encierro complicado.  Ese triunfo le valió además el título de “torero revelación” del ciclo isidril.

Tiempo después, también en Madrid, en la misma plaza pero en otro momento, Victor volvió a mostrar argumento serio: ante un toro de la ganadería Fuente Ymbro logró una oreja tras faena completa, donde Madrid rugió con la mano izquierda. 

En La Malagueta, donde reaparecía tras ese grave percance en Torrejón de Ardoz ,  que le tuvo fuera un tiempo , se presentó con intención: ante un excelente toro de la ganadería Juan Manuel Criado cortó una oreja que dejó huella. Otra faena completa , que por el mal uso de los aceros se llevó los triunfos. 

Este cúmulo de actuaciones confirma que este torero no es un torero más de los que vienen, sino uno que reclama su sitio.  En una época en la que abunda el efectismo y el cambio de cromos, este torero reivindica la pureza. Y eso, en el toreo actual, es un valor en alza.

Quienes le han visto en plazas coinciden en lo mismo: hay torero. Lo hay por forma y por fondo. Tiene colocación, valor seco y un concepto asentado sobre la naturalidad. Pero, sobre todo, tiene algo que no se enseña: verdad. Esa verdad que no se grita, pero que se siente desde el tendido.

El sistema, tan dado a las prisas y a los nombres de siempre, debería detenerse en su caso. Porque mientras algunos despachan compromisos con oficio frío, Hernández torea de verdad. 

El toreo necesita figuras, sí, pero también necesita cimientos. Y en toreros como Víctor Hernández está la base sobre la que se puede construir el futuro. La juventud no debería ser excusa para relegarlo, sino motivo para apostar por él. Su toreo , su entrega y su pureza merecen sitio en las ferias que presumen de categoría.

Ojalá empresarios y apoderados entiendan el mensaje. Ojalá el invierno sirva para abrir puertas y no para cerrarlas. Porque mientras haya toreros que quieran decir algo desde la verdad, el toreo seguirá teniendo futuro.
Víctor Hernández lo ha demostrado: no hace falta ruido para hacerse notar. Basta con torear bien.`
  },
  {
    id: 423,
    title: "Borja Jiménez Triunfador de la Feria de la Antigua de Guadalajara y Premio a la Mejor Faena",
    image: "images/borjajimenez1.jpg",
    category: "Actualidad",
    date: "24 de Octubre de 2025",
    fullContent: `La Feria de la Antigua de Guadalajara 2025 ya tiene triunfador. Según ha podido saber este medio , el jurado ha proclamado a Borja Jiménez como triunfador de la feria, además de reconocerle la mejor faena de la misma, premiando la labor realizada al toro n.º 32, “Jabalí”, de la ganadería de El Capea.

El torero de Espartinas ha dejado en el coso alcarreño una de las actuaciones más destacadas de la temporada, demostrando el gran momento  profesional por el que atraviesa. 

Con este galardón, Borja Jiménez se consolida como una de las figuras más firmes del escalafón, firmando su nombre en la Feria de la Antigua de Guadalajara , una de las ferias de mayor importancia a nivel nacional. 

Los premios se entregarán el próximo 24 de Enero de 2026 en la IV Gala de Premios de ProGuadaTauro 2025 en el Teatro Auditorio Buero Vallejo.`
  },
  {
    id: 424,
    title: "Roca Rey inicia una nueva etapa profesional de la mano de Luis Manuel Lozano",
    image: "images/rocarey.jpg",
    category: "Actualidad",
    date: "24 de Octubre de 2025",
    excerpt: "El torero peruano inicia un nuevo proyecto profesional tras cerrar su etapa de apoderamiento junto a su hermano Fernando Roca Rey",
    fullContent: `El matador de toros Andrés Roca Rey ha hecho oficial la relación de apoderamiento con Luis Manuel Lozano a través de un comunicado remitido a los medios de comunicación.

El comunicado es el siguiente:

‘El matador de toros Andrés Roca Rey afronta una nueva etapa en su carrera profesional y anuncia que a partir de este momento será apoderado por Luis Manuel Lozano.

Con esta nueva alianza, Roca Rey inicia un ilusionante proyecto que combina juventud, ambición y experiencia. 
El objetivo común es continuar escribiendo páginas importantes en la historia del toreo, con el compromiso, la entrega y la autenticidad que siempre han definido al diestro limeño.

El torero peruano encara con renovada motivación los próximos compromisos de su temporada americana, que continuará el próximo 2 de noviembre en Lima, en una cita muy especial en la que estoqueará seis toros en solitario, uno de los hitos más esperados de su carrera’.`
  }, 
  {
    id: 425,
    title: "Daniel Luque y Luis Manuel Lozano finalizan el apoderamiento",
    image: "images/danielyluis.jpg",
    category: "Actualidad",
    date: "23 de Octubre de 2025",
    fullContent: `El torero sevillano Daniel Luque y el apoderado Luis Manuel Lozano han decidido poner fin a la relación profesional que les ha unido durante la temporada 2025. 

La noticia, adelantada el día de ayer por la periodista Rosario Pérez en el diario ABC, marca el cierre de una etapa que ambas partes emprendieron en octubre de 2024.

Durante esta campaña, Luque ha vuelto a ser protagonista en plazas de máxima exigencia. La colaboración con Luis Manuel Lozano —miembro de una de las casas empresariales más influyentes del toreo— supuso un paso importante en la planificación y desarrollo de su temporada, especialmente tras las importantes actuaciones que el de Gerena venía firmando en años anteriores.

Este es el comunicado oficial del diestro de Gerena:

El matador de toros Daniel Luque y Luis Manuel Lozano han decidido romper la relación de apoderamiento que les ha unido durante la temporada 2025. Un año en el que Daniel Luque ha toreado 33 corridas de toros, cortando 56 orejas y sumando 19 Puertas Grandes.

Ambas partes se desean suerte en un futuro.`
  },
  {
    id: 426,
    title: "Andrés Roca Rey y Fernando Roca Rey dan por finalizada su relación de apoderamiento",
    image: "images/andresyfernando.jpg",
    category: "Actualidad",
    date: "22 de Octubre de 2025",
    fullContent: `"Ambos crecimos soñando con llegar juntos hasta aquí, y poder hacerlo realidad ha sido una de las mayores satisfacciones de mi vida", señala el torero en un comunicado.

Andrés Roca Rey y su hermano Fernando han dado por finalizada la relación de apoderamiento , cumpliendo así una promesa que se hicieron hace años, toda vez que la temporada europea 2025 ha echado el cierre. 

En un comunicado remitido a esta redacción por parte del equipo de comunicación del torero, señalan que "lo que comenzó como un sueño compartido se convirtió en una experiencia que los ha unido más allá del ruedo y que deja una huella imborrable en la trayectoria del torero".

Roca Rey continuará ahora su temporada americana, con su próxima cita el 2 de noviembre en Lima (Perú), donde estoqueará seis toros en solitario, cumpliendo así otro de los hitos más esperados de su carrera.

"Este año ha tenido un sentido muy especial para mí. Fernando y yo crecimos soñando con llegar juntos hasta aquí, y poder hacerlo realidad ha sido una de las mayores satisfacciones de mi vida. 

Compartir la temporada de mi décimo aniversario con mi hermano fue un regalo que nos debíamos desde hace tiempo. 

Vivimos cada tarde con la ilusión de los comienzos y con la serenidad que da el camino recorrido. Hoy cierro esta etapa con gratitud, con orgullo y con un profundo respeto por todo lo que juntos hemos construido", afirma el torero en el comunicado.`
  },
  {
    id: 427,
    title: "Nautalia impugna el pliego de licitación de La Malagueta",
    image: "images/nautalia.jpg",
    category: "Actualidad",
    date: "22 de Octubre de 2025",
    fullContent: `La empresa Nautalia, accionista mayoritario de la sociedad Plaza 1 —gestora de la Plaza de Toros de Las Ventas—, ha presentado una impugnación formal contra el pliego de condiciones del concurso público para la gestión de la plaza de toros de Málaga. 

La información fue adelantada este miércoles por el periodista Vicente Zabala de la Serna a través de su cuenta en X (anteriormente Twitter).
La impugnación se centra en los criterios de solvencia técnica y profesional exigidos en el pliego, que, según Nautalia, restringen injustificadamente el acceso a empresas del sector con trayectoria contrastada. 

En concreto, el documento licitatorio establece que únicamente podrán participar aquellas sociedades que hayan gestionado, durante al menos tres temporadas recientes, tres plazas de toros de primera o segunda categoría, con un mínimo de quince festejos anuales en cada una.

Este umbral ha dejado fuera a operadores relevantes del ámbito taurino como la propia Nautalia o la Empresa Pagés, responsable de la gestión de la Real Maestranza de Caballería de Sevilla, una de las plazas de mayor prestigio del país.

De acuerdo con estos requisitos, tan solo seis empresas estarían en condiciones de concurrir al proceso de licitación: el productor francés Simón Casas —que lo haría en alianza con el torero Javier Conde—, la empresa Tauroemoción, el empresario Carlos Zúñiga, la UTE BMF, Lances de Futuro y la Casa Matilla. Todas ellas cuentan con experiencia reciente en la gestión de recintos taurinos del nivel exigido.

Este panorama reduce notablemente la competencia en uno de los concursos más codiciados del circuito taurino nacional, perfilando una pugna empresarial que se anticipa como una de las más reñidas e influyentes de los últimos años en el sector.`
  }, 
  {
    id: 428,
    title: "Tomás González por Miguel Serrano en Viraco",
    image: "images/tomasgonzalez1.jpg",
    category: "Actualidad",
    date: "21 de Octubre de 2025",
    fullContent: `El alcorisano Tomás González será el encargado de sustituir a Miguel Serrano en la Feria en Honor a Santa Úrsula en Viraco (Perú).

Tomás González hará el paseíllo en el coso peruano el próximo jueves 23 de Octubre junto a los mexicanos César Ruiz y Joaquín Caro , lidiando un encierro de diferentes ganaderías.`
  },
  {
    id: 429,
    title: "Nemesio Matías da por concluida su etapa junto a Samuel Navalón",
    image: "images/namesiomatias.jpg",
    category: "Actualidad",
    date: "21 de Octubre de 2025",
    fullContent: `El apoderado taurino Nemesio Matías ha decidido poner fin a su relación profesional con el torero Samuel Navalón, tras dejar sin efecto el contrato que los unía por dos temporadas más. 

La decisión, según ha confirmado el propio Matías a este medio, responde al cumplimiento de los objetivos marcados al inicio de su colaboración.

Matías apostó por Navalón cuando este aún era novillero sin picadores, y en apenas 13 meses, ambos completaron una etapa de notable progresión: la evolución como novillero con picadores, la triunfal alternativa en Albacete en septiembre de 2024 y la posterior confirmación en Las Ventas, donde el joven torero cortó una oreja.

Durante su primera temporada completa como matador de toros, Samuel Navalón ha sumado 16 festejos en plazas de relevancia, logrando importantes triunfos en escenarios de la talla de Sevilla, Madrid, Alicante, Ciudad Real, Albacete y Arlés, entre otros.

Con estos hitos alcanzados, Nemesio Matías considera cumplido un ciclo profesional y ha optado por cerrar esta etapa, al tiempo que ha querido expresar públicamente su reconocimiento al torero: «Estoy contrariado por dejar a un gran torero y a una gran persona, pero entiendo que este es el momento adecuado para cerrar una etapa que ha sido muy positiva», señala el comunicado.

La decisión se produce mientras Samuel Navalón continúa con su proceso de recuperación del percance sufrido el pasado 28 de septiembre en la plaza de toros de Algemesí.`
  },
  {
    id: 430,
    title: "Emilio de Justo se alza con el premio a la mejor faena de la Feria de Salamanca",
    image: "images/emiliodejusto1.jpg",
    category: "Actualidad",
    date: "21 de Octubre de 2025",
    fullContent: `El torero extremeño Emilio de Justo ha sido distinguido por unanimidad con el premio a la ‘Mejor Faena’ de la pasada Feria Taurina de Salamanca, un prestigioso reconocimiento que otorga el Ayuntamiento de la ciudad desde 1998.

El jurado, presidido por el alcalde Carlos García Carbayo, ha valorado especialmente la lidia realizada por el diestro el pasado 14 de septiembre en la plaza de toros de La Glorieta, frente al toro ‘Buenasuerte’, de la ganadería Garcigrande, que fue indultado tras una actuación memorable.

Los miembros del jurado han subrayado el rotundo triunfo de Emilio de Justo y su "faena apasionada", ejecutada con temple y dominio, aprovechando la bravura y la clase excepcionales del astado. Cabe destacar que el toro ‘Buenasuerte’ fue también reconocido con el premio ‘Toro de Oro’ que concede la Junta de Castilla y León, lo que refuerza la relevancia del momento vivido en el ruedo.

La entrega del galardón tendrá lugar el próximo 19 de noviembre durante la Gala Cultural Taurina, organizada por el Ayuntamiento de Salamanca en colaboración con la Federación de Peñas Taurinas ‘Helmántica’, y se celebrará en el Teatro Liceo de la capital salmantina.`
  },
  {
    id: 431,
    title: "Emilio de Justo define una cuadrilla de categoría para 2026 con dos nuevas incorporaciones",
    image: "images/emilio.jpg",
    category: "Actualidad",
    date: "20 de Octubre de 2025",
    fullContent: `El matador de toros Emilio de Justo ha definido ya la composición de su cuadrilla para la temporada 2026, apostando por la solidez, la experiencia y la calidad contrastada. 

El torero extremeño incorpora a su equipo dos nombres de peso: el banderillero Antonio Chacón, considerado uno de los subalternos más completos del escalafón y que en los últimos años formó parte de la cuadrilla de Roca Rey; y el picador José Antonio Barroso, que se suma al equipo de varilargueros.

Con estas incorporaciones, la cuadrilla queda conformada de la siguiente manera: en el tercio de varas, actuarán los picadores José Antonio Barroso y Juan Bernal; mientras que en las filas de los hombres de plata estarán Abraham Neiro ‘El Algabeño’, Antonio Chacón y José Manuel Pérez Valcarce.

De esta forma, Emilio de Justo refuerza su cuadrilla con profesionales de primer nivel, en un momento especialmente relevante de su carrera. Tras protagonizar una temporada 2025 marcada por el éxito, el diestro logró su quinta Puerta Grande en Las Ventas durante la pasada Feria de Otoño, en una tarde épica que lo ha confirmado como uno de los nombres imprescindibles del escalafón de cara a las grandes ferias del próximo año.`
  },
  {
    id: 432,
    title: "Mario Vilau se alza como triunfador de la Liga Nacional de Novilladas",
    image: "images/mariovilau.jpg",
    category: "Actualidad",
    date: "19 de Octubre de 2025",
    excerpt: "El catalán conquista la final con “Guardes” de Fuente Ymbro, logrando dos orejas, rabo y la vuelta al ruedo del novillo",
    fullContent: `Sanlúcar de Barrameda fue escenario de la Final de la Liga Nacional de Novilladas 2025, donde el catalán Mario Vilau, natural de L’Hospitalet de Llobregat (Barcelona), se proclamó ganador de la competición gracias a una actuación magistral frente al novillo “Guardes”, de Fuente Ymbro, que fue premiado con la vuelta al ruedo.

A la puerta de chiqueros, Vilau recibió al cuarto novillo, salvando el trance con autoridad antes de un gran saludo a la verónica de rodillas, templando y vaciando la embestida del de Fuente Ymbro. En los medios, y de rodillas nuevamente, comenzó su actuación aprovechando la noble y cadenciosa embestida del animal para construir la mejor faena de la tarde. Al natural, la faena subió un tono, logrando varias tandas de muchísima suavidad. La cumbre de la actuación llegó con unas milimétricas bernadinas. A pesar de que el público pidió el indulto, Vilau entró a matar, dejando una gran estocada a la segunda, logrando dos orejas y rabo y la vuelta al ruedo del novillo.

La ovación del público cerró una final que será recordada por la calidad del novillo y la actuación del novillero catalán, coronándolo como ganador de la Liga Nacional de Novilladas 2025.`
  },
  {
    id: 433,
    title: "El Fandi, El Cid y Victorino Martín, premiados en la feria de Jaén",
    image: "images/fandiycid.jpg",
    category: "Actualidad",
    date: "19 de Octubre de 2025",
    fullContent: `Una vez concluida la Feria de San Lucas de Jaén 2025, se han fallado los premios que reconocen lo más destacado del ciclo taurino. 

El gran triunfador ha sido El Fandi, quien se alzó con el máximo reconocimiento tras cortar tres orejas y un rabo en el festejo inaugural, celebrado el pasado 12 de octubre.

El galardón a la mejor faena ha recaído en Manuel Jesús ‘El Cid’ por la labor realizada al toro Mercenario, de la ganadería de Victorino Martín, lidiado en segundo lugar durante la corrida del sábado. Este ejemplar ha sido distinguido, además, como el mejor toro de la feria.

En cuanto a los premios destinados a las cuadrillas, Juan Carlos García, de la cuadrilla de Curro Díaz, ha sido designado mejor banderillero del serial, mientras que Manuel Jesús Ruiz ‘Espartaco’, de la cuadrilla de El Cid, ha sido reconocido como mejor picador.`
  },
  {
    id: 434,
    title: "Borja Jiménez redondea una temporada para enmarcar",
    image: "images/borjajimenez.jpg",
    category: "Actualidad",
    date: "18 de Octubre de 2025",
    excerpt: "El torero de Espartinas paseó una oreja de cada toro de su lote en un triunfal cierre de temporada en España",
    fullContent: `Borja Jiménez brindó su primer toro a César Jiménez, tras un episodio de alta tensión en el que Fernando Sánchez protagonizó un quite milagroso a José Luis Barrero, luego de una comprometida salida en un arriesgado par de banderillas. 

Fue clave el juego de Ideólogo-80, del hierro de La Ventana del Puerto, un toro con movilidad y codicia, que repitió con entrega en la muleta. El sevillano supo entenderlo desde el inicio: muleta baja, toques firmes y siempre colocada. 

La respuesta del astado fue de nobleza y acometividad.
Destacó un soberbio cambio de mano y, especialmente, un pase de pecho amplio y templado, que describió una circunferencia plena de compás y torería. 

La faena, de notable pulso y conexión, concluyó con un pinchazo hondo que obligó a recurrir al verduguillo en dos ocasiones.

En el quinto, con el hierro de El Puerto de San Lorenzo, Borja Jiménez salió decidido a no quedarse atrás en el marcador artístico. Recibió al toro con una larga cambiada de rodillas, declaración clara de intenciones. Ante un animal de escasa entrega, al que hubo que buscar y exigir, el diestro compuso una faena de gran entrega que caló en los tendidos. 

La estocada, certera y efectiva, llegó en los mismos terrenos de chiqueros. La oreja conquistada le abrió, con justicia, la Puerta Grande.`
  },
  {
    id: 435,
    title: "El Fandi y la Casa Matilla rompen su relación de apoderamiento",
    image: "images/elfandi.jpg",
    category: "Actualidad",
    date: "18 de Octubre de 2025",
    excerpt: "Después de veinte años de relación profesional",
    fullContent: `David Fandila “El Fandi” y la Casa Matilla han decidido dar por finalizada su relación de apoderamiento, una vinculación profesional que se ha mantenido de forma ininterrumpida durante los últimos 20 años.

Ambas partes cierran esta etapa con agradecimiento mutuo y el deseo de que el futuro les depare nuevos éxitos. La relación entre el torero granadino y la reconocida casa taurina ha sido una de las más estables y duraderas del toreo reciente, marcada por la confianza, el respeto y una sólida trayectoria conjunta.

Tanto “El Fandi” como la Casa Matilla han querido expresar públicamente su respeto y reconocimiento por todos estos años de trabajo compartido.`
  },
  {
    id: 436,
    title: "Francisco de Manuel y Diego Robles ponen fin a su relación de apoderamiento",
    image: "images/franciscoydiego.jpg",
    category: "Actualidad",
    date: "17 de Octubre de 2025",
    fullContent: `El diestro madrileño Francisco de Manuel y su hasta ahora apoderado, Diego Robles, han decidido dar por finalizada, de mutuo acuerdo, la relación de apoderamiento que les ha unido durante las tres últimas temporadas.

La ruptura se ha producido en términos cordiales, con el mayor respeto y reconocimiento mutuo. Tanto el torero como su apoderado han expresado su agradecimiento por la confianza compartida, la colaboración mantenida y las experiencias vividas durante esta etapa conjunta, que ambos valoran como un periodo de importante crecimiento profesional y personal.

Francisco de Manuel y Diego Robles se desean recíprocamente el mayor de los éxitos en sus respectivos proyectos futuros.`
  },
  {
    id: 437,
    title: "Valencia reabrirá su plaza de toros para las Fallas 2026 bajo gestión de Nautalia",
    image: "images/valencia.jpg",
    category: "Actualidad",
    date: "17 de Octubre de 2025",
    fullContent: `presidente de la Diputación de Valencia, Vicent Mompó, anunció durante la gala de entrega de los Premios Taurinos de Valencia que la Plaza de Toros reabrirá sus puertas con motivo de la Feria de Fallas de 2026, una vez finalicen los trabajos de renovación integral del sistema de iluminación, iniciados el pasado mes de junio.

La empresa Nautalia continuará al frente de la gestión del coso taurino durante una temporada más, mientras la Diputación trabaja en la elaboración de un nuevo pliego de condiciones. 

El objetivo es revalorizar la Plaza de Toros como un espacio cultural, social y turístico de referencia en la ciudad.

Mompó subrayó la relevancia del inmueble, al que definió como “un símbolo de la ciudad y del mundo taurino”, y aseguró que se está trabajando intensamente para que la plaza recupere "todo su esplendor" de cara a su reapertura en marzo de 2026.`
  },
    {
    id: 438,
    title: "Las Ventas cierra la temporada 2025 superando el millón de espectadores título",
    image: "images/lasventas1.jpg",
    category: "Actualidad",
    date: "17 de Octubre de 2025",
    fullContent: `La Plaza de Toros de Las Ventas concluyó el pasado domingo 12 de octubre una temporada histórica al superar, por primera vez, la simbólica barrera del millón de espectadores. 

A lo largo de los 62 espectáculos celebrados este año, el coso madrileño ha congregado a un total de 1.008.226 asistentes, con una media de 16.261 personas por festejo, consolidando su posición como epicentro de la tauromaquia mundial.

El impacto de esta campaña se refleja también en los 18 llenos absolutos con el cartel de “No hay billetes”, una cifra que triplica la registrada en 2024, y en las 30 tardes que superaron los 18.000 espectadores, prácticamente la mitad del total. En ese contexto de auge, la Feria de Otoño cerró con 19.428 abonados, el mejor dato de los últimos quince años.

Éxitos artísticos y consolidación de nuevos nombres
En lo artístico, el público venteño ha presenciado cinco salidas a hombros por la Puerta Grande, protagonizadas por Alejandro Talavante (9 de mayo), Morante de la Puebla (8 de junio y 12 de octubre), Borja Jiménez (15 de junio) y Emilio de Justo (3 de octubre). La temporada se salda además con cuatro faenas premiadas con dos orejas y veintiocho con un trofeo.

El coso madrileño ha reafirmado su papel como escenario clave para la proyección de nuevas figuras: veinte matadores confirmaron su alternativa en Las Ventas y dieciocho novilleros hicieron su presentación en el coso madrileño. 

En total, se lidiaron 384 reses, de las cuales 18 fueron sobreros, pertenecientes a 21 encastes distintos, lo que confirma el compromiso de la programación venteña con la variedad de encastes. 

Dos toros fueron premiados con la vuelta al ruedo: “Brigadier”, de Pedraza de Yeltes, lidiado por Isaac Fonseca el 14 de mayo; y “Milhijas”, de Victorino Martín, lidiado por Borja Jiménez el 15 de junio.

Una temporada para el recuerdo
La temporada 2025 quedará marcada como un año de cifras récord, consolidación de figuras, descubrimiento de jóvenes promesas y reivindicación del toro en su plenitud. 

La afición respondió con una entrega pocas veces vista en las últimas décadas, situando a Las Ventas —una vez más— como el eje indiscutible del toreo contemporáneo.`
  }, 
  {
    id: 439,
    title: "Entrevista a Carlos Zúñiga: “Soy una persona ambiciosa y la vida me ha enseñado a saber esperar”",
    image: "images/carloszuñiga.jpg",
    category: "Entrevistas",
    date: "17 de Octubre de 2025",
    fullContent: `Carlos, en un momento donde la tauromaquia enfrenta tantos desafíos sociales y políticos, ¿qué significa para usted seguir apostando por este sector como empresario? 

Para mi es una forma de vida, una vocación. Yo no sé hacer otra cosa. Vivo 24 h para por y para el toro en su máxima expresión y no concibo el día a día sin ilusionarme y pensar en la confección de una feria. Creo que a veces puedo ser demasiado cansino en el día a día pero hasta ahora, esa "fórmula" no me ha ido mal. Seguiré peleando por y para el toreo y espero no desfallecer.

Gestiona plazas tan emblemáticas como El Puerto, Gijón o Aranjuez. ¿Qué criterios considera esenciales para que una feria taurina sea rentable y atractiva para el público? 

Creo que el secreto es dar al público de cada lugar lo que busca. Yo no me considero ni un Séneca ni un salvador del toreo, pero intento tener mi sello de calidad buscando la excelencia en el espectáculo. Me gusta un determinado tipo de toro e intento no perder nunca el rigor y el trapío acorde a cada plaza. En Gijón, por ejemplo, llevo casi 25 años con esa fórmula y la Feria de Begoña está más consolidada que nunca.

¿Qué le diría hoy a los políticos que impulsan prohibiciones o trabas a la celebración de festejos taurinos en España?

Simple y llanamente que respeten nuestras traiciones y las salvaguarden como garantes de un Bien declarado Patrimonio Cultural Inmaterial, por mucho que partidos radicales hayan tratado de boicotear.

¿Qué plaza sueña con gestionar algún día, y qué aportaría usted como empresario para devolverle o mantenerle su prestigio?

Bueno, imagínese, uno siempre sueña con volar lo más alto posible y en ese horizonte como no están Sevilla y Madrid. Quien sabe si el futuro me deparará algún día algo bonito. Lo que aportaría, me lo guardo para entonces.

La retirada de Morante de la Puebla marca un punto de inflexión en la tauromaquia actual. También porque usted siempre lo ha contratado siempre que ha podido este año en plazas como El Puerto de Santa María , Aranjuez….
Desde el punto de vista empresarial, ¿cómo afecta la ausencia de una figura así en la confección de carteles y en la atracción del público?

Reitero una vez más mi agradecimiento públicamente a Morante. Creo que ha sido el toreo más grandioso que mis ojos han tenido la oportunidad de ver y que seguramente vayan a ver. Ha sido muy generoso con la Fiesta y especialmente con los empresarios. Con su apoyo y el de El Juli, he crecido profesionalmente y sus faenas históricas en mis plazas me han aportado un plus de calidad que nunca olvidaré. Le echaremos mucho de menos como lo hemos hecho estos 2 años con Julián.

¿Como plantea la temporada que viene de cara a nuevas plazas? ¿Tiene en mente alguna? 

Estoy muy contento y muy feliz con las 9 o 10 plazas que gestiono actualmente pero soy una persona ambiciosa y además la vida me ha enseñado a saber esperar. Desde luego, y no lo voy a ocultar, mi objetivo es poder seguir creciendo pero siempre con la clarividencia de estudiar los pliegos y la situación de cada plaza. Quién sabe, si el futuro, nos deparará alguna sorpresa. También es bonito soñar...`
  },
  {
    id: 440,
    title: "Antonio Chacón queda libre tras salir de la cuadrilla de Roca Rey",
    image: "images/antoniochacon.jpg",
    category: "Actualidad",
    date: "17 de Octubre de 2025",
    fullContent: `Uno de los banderilleros más destacados de las últimas temporadas, Antonio Chacón, ha quedado sorpresivamente libre tras su salida de la cuadrilla del matador peruano Andrés Roca Rey.

El propio Chacón ha confirmado de forma oficial que, por el momento, no tiene compromisos de cara a la temporada 2026.

Durante la presente campaña, Chacón ha estado a las órdenes del torero limeño, desempeñando un papel clave en su equipo. 

Esta noticia se suma a los movimientos que comienzan a producirse en las cuadrillas con vistas a la próxima temporada, algunos de ellos, como este, totalmente inesperados.`
  },
  {
    id: 441,
    title: "Alberto Álvarez se retira después de su paso por la Misericordia",
    image: "images/albertoalvarez.jpg",
    category: "Actualidad",
    date: "16 de Octubre de 2025",
    fullContent: `La temporada taurina 2025 ha concluido con un tono especialmente emotivo, marcado por la retirada de destacadas figuras del toreo. 

El mundo del toro ha sido 
testigo de varias despedidas significativas, tanto de matadores como de hombres de plata y del castoreño, que han puesto fin a sus respectivas trayectorias profesionales.

Sin duda, la retirada más impactante y conmovedora ha sido la de Morante de la Puebla, una figura indiscutible que ha dejado una huella imborrable en la historia reciente de la tauromaquia. 

Junto a él, también dijo adiós a los ruedos Fernando Robleño, torero de gran dignidad y autenticidad, que eligió el pasado 12 de octubre para cerrar su carrera, una fecha simbólica en la que compartió la emoción del adiós con la afición.

A estas despedidas se sumó la del también matador Cayetano Rivera, quien se retiró en el mes de septiembre, poniendo fin a una trayectoria marcada por el peso del legado familiar y una constante evolución artística.

La afición también vio la retirada del picador Salvador Núñez y del banderillero Agustín Serrano, dos profesionales muy respetados en sus filas, que han contribuido durante años al festejo taurino con entrega, conocimiento y seriedad.

Asimismo, el torero aragonés Alberto Álvarez puso punto final a su carrera el pasado 12 de octubre en la plaza de toros de Zaragoza, durante la tradicional corrida del Día del Pilar en La Misericordia. Con una trayectoria larga y honesta, marcada por el esfuerzo.

Álvarez no tuvo el cierre soñado. Su lote, perteneciente a la ganadería de Salvador Gavira, no ofreció opciones de lucimiento, obligándole a abreviar en sus dos toros y dejando un sabor agridulce en una tarde que merecía haber sido más redonda para despedirse ante su afición.

Con estas despedidas, la temporada 2025 pasará a la historia como un punto de inflexión, no solo por el adiós de grandes nombres, sino también por el reflejo de una generación que cierra su ciclo, dejando paso a nuevos valores que habrán de tomar el testigo en los años venideros.`
  },
  {
    id: 442,
    title: "Sergio Sánchez rompe con su hasta ahora apoderado Jacinto Ortiz",
    image: "images/sergiosanchez.jpg",
    category: "Actualidad",
    date: "16 de Octubre de 2025",
    fullContent: `El novillero con picadores Sergio Sánchez y su hasta ahora apoderado Jacinto Ortiz han decidido, de mutuo acuerdo, dar por finalizada la relación de apoderamiento que comenzaron al inicio de la temporada 2025.

Durante esta campaña, Sergio Sánchez ha tenido una destacada actuación en plazas de gran relevancia, entre las que destaca su paso por la plaza de toros de Las Ventas, donde ha hecho el paseíllo en tres ocasiones. Asimismo, ha actuado en otros cosos de primera categoría como Bilbao, Olivenza, Almería, así como en diversas ferias de importancia del circuito taurino nacional.

Ambas partes han querido expresarse públicamente el agradecimiento mutuo y los mejores deseos para sus respectivas trayectorias profesionales.`
  },
  {
    id: 443,
	title: "César Jiménez reaparece por un día en Arenas de San Pedro",
    image: "images/cesarjimenez.jpg",
    category: "Actualidad",
    date: "15 de Octubre de 2025",
    fullContent: `La plaza de toros de Arenas de San Pedro vivirá este sábado 18 de octubre a las 17:30 horas una tarde de gran atractivo con la reaparición por un día del maestro César Jiménez, figura clave del toreo en los años 2000. El torero madrileño, vuelve a los ruedos en una cita muy especial que ha despertado gran interés entre los aficionados.

El cartel lo completan dos nombres de peso en el escalafón actual. Por un lado, el sevillano Borja Jiménez, uno de los triunfadores de la temporada 2025, que ha dejado importantes actuaciones en plazas de primera. Por otro, Tomás Rufo, joven figura consagrada, que continúa consolidando su sitio entre los toreros más destacados del momento.

Se lidiarán toros de El Puerto de San Lorenzo y La Ventana del Puerto, ganaderías de procedencia Atanasio-Lisardo , ganadería presente en las grandes ferias. 

La reaparición de César Jiménez, aunque puntual, tiene el sabor de las grandes ocasiones, y adquiere especial significado al compartir cartel con dos toreros en plenitud. 

Arenas de San Pedro se convierte así en el escenario de una tarde de especial interés.`,
  },
  {
    id: 444,
    title: "Emilio de Justo, dos cambios en su cuadrilla para 2026",
    image: "images/emiliodejusto.jpg",
    category: "Actualidad",
    date: "16 de Octubre de 2025",
    excerpt: "De BMF toros",
    fullContent: `El matador de toros extremeño **Emilio de Justo** afrontará la próxima temporada con cambios significativos en su cuadrilla. Tras una larga trayectoria junto al diestro, el picador *Germán González* pone fin a una etapa de nueve años de colaboración, mientras que el banderillero *Morenito de Arlés* también se desvincula del equipo tras siete temporadas de trabajo conjunto.

Ambos profesionales quedarán, por el momento, libres para la temporada 2026.

Cabe recordar que Emilio de Justo ha dado por concluida su campaña 2025 luego de sufrir la fractura de dos costillas en el costado izquierdo, consecuencia de una cogida en la Plaza de Toros de Las Ventas, en Madrid.

Pese a este desafortunado incidente, el torero ha sido uno de los grandes triunfadores de la temporada, cosechando importantes éxitos en distintas plazas de España y Francia.`,
  },
 {
    id: 445,
    title: "Jorge Martínez y Ruiz Manuel rompen la relación de apoderamiento",
    image: "images/bmftoros.jpg",
    category: "Actualidad",
    date: "15 de Octubre de 2025",
    fullContent: `El matador de toros Jorge Martínez y su apoderado Ruiz Manuel han decidido dar por finalizada su relación profesional de apoderamiento. Ambos han coincidido en destacar que la ruptura se ha producido de manera totalmente amistosa y en los mejores términos.

Natural de la localidad murciana de Totana, Jorge Martínez ha desarrollado la mayor parte de su carrera en Almería, bajo la dirección de Ruiz Manuel. Debutó con picadores en Galapagar (Jaén) y tomó la alternativa en la Plaza de Toros de Almería en el año 2023, confirmando su doctorado en Madrid al año siguiente. Su vínculo profesional se remonta a 2021, año en que iniciaron este proyecto conjunto.`,
  },
     {
    id: 446,
    title: "Román y Eduardo Martínez ponen fin a su relación de apoderamiento",
    image: "images/romanyedu.jpg",
    category: "Actualidad",
    date: "15 de Octubre de 2025",
    fullContent: `El matador de toros Román y su hasta ahora apoderado, Eduardo Martínez, han decidido poner fin, de mutuo acuerdo, a la relación profesional que les ha vinculado durante esta etapa.

La decisión se ha tomado en un clima de cordialidad, con absoluto respeto y reconocimiento mutuo tanto en lo personal como en lo profesional. Ambas partes agradecen sinceramente el trabajo compartido, la confianza depositada y los logros alcanzados a lo largo del camino recorrido juntos.

Román y Eduardo se desean el mayor de los éxitos en sus respectivos proyectos futuros, manteniendo intacto el respeto y la cordialidad.`,
  },
     {
    id: 447,
    title: "David Galván reaparecerá este sábado en Jaén tras su percance en Las Ventas",
    image: "images/davidgalvan.jpg",
    category: "Actualidad",
    date: "15 de Octubre de 2025",
    fullContent: `Tan solo cuatro días después de la aparatosa cogida sufrida el pasado 11 de octubre en la plaza de toros de Las Ventas, el diestro gaditano David Galván ha confirmado su reaparición este sábado en la Feria de San Lucas de Jaén. 

Lo hará ante una corrida del hierro de Victorino Martín, el mismo hierro ante el que resultó herido en Madrid, en un gesto de firme compromiso y valentía.

Este regreso adquiere además un valor simbólico muy especial: Galván volverá al Coso de la Alameda 12 años después de la grave cornada sufrida en 2013 en esa misma plaza, que le ocasionó una severa lesión en el antebrazo derecho y lo mantuvo apartado de los ruedos durante una prolongada recuperación.

El cartel del sábado 18 de octubre lo completan El Cid, Curro Díaz y David Galván, quienes lidiarán una exigente corrida de Victorino Martín.

Con esta reaparición, Galván reafirma su entrega a la tauromaquia y su compromiso con la afición, que ha seguido con atención su evolución tras el reciente percance.`,
  },
  {
    id: 448,
    title: "Morante de la Puebla; El adiós a una sublime carrera",
    image: "images/moranteretirada.jpg",
    category: "Actualidad",
    date: "15 de Octubre de 2025",
    excerpt: "Morante de la Puebla se corta la coleta en Madrid tras una faena para la historia",
    fullContent: `Morante de la Puebla, con las dos orejas en las manos y una faena para el recuerdo , anuncio su adios de los ruedos en el centro de Las Ventas de Madrid , cortandose la coleta por sorpresa.

El torero Sevillano de La Puebla del Rio , finalizando una temporada que quedara en las memorias de muchos aficionados , firmo asi una de las escenas mas emotivas que se recuerdan en el coso venteño.

Los tendidos , puestos en pie rompieron de forma unanime clamor de "torero torero".
Una despedida a la altura del mito que ha marcado este torero.`,
  },
  {
    id: 449,
    title: "Florito el mayoral de Las Ventas dice adiós: El adiós a una leyenda de los corrales",
    image: "images/florito.jpg",
    category: "Actualidad",
    date: "14 de Octubre de 2025",
    fullContent: `El 12 de Octubre quedará grabado en la memoria taurina no solo por lo sucedido en el ruedo, sino también por lo ocurrido en los corrales. Aquel día, mientras la emoción inundaba la plaza de Madrid, Florencio Fernández Castillo, ‘Florito’, ponía fin a casi cuatro décadas de dedicación como mayoral de Las Ventas, cerrando una etapa importante. 

Nacido en la plaza de toros de Talavera de la Reina, donde su padre trabajaba como conserje, Florito vivió el toro desde la cuna. Fue novillero en su juventud con el apodo de “El Niño de la Plaza”, hasta que en 1981 decidió abandonar los ruedos. En febrero de 1986.

Condecorado en 2012 con la Cruz de la Orden del 2 de Mayo de la Comunidad de Madrid, Florito deja tras de sí un legado de profesionalidad y cariño hacia el toro y la afición. Ahora, el testigo pasa a su hijo Álvaro Fernández, ingeniero aeroespacial, quien decidió dejar lo que estudiaba será el que asumirá el cargo de mayoral del coso venteño, aunque sin desempeñar la función de veedor que también ejercía su padre.

Una nueva etapa comienza en Las Ventas, pero el nombre de Florito quedará grabado para siempre entre los aficionados.`
  },
    {
id: 450,
title: "Busco torear lo más despacio posible: Entrevista al novillero Tomás González",
image: "images/tomasgonzalez.jpg",
category: "Entrevistas",
date: "14 de Octubre de 2025",
fullContent: `
La temporada del joven novillero alcorisano Tomás González ha sido un punto de inflexión, uno de los novilleros que ha demostrado con argumentos que puede estar en las ferias.

Cuenta con buenas actuaciones a lo largo de la temporada Vinaroz, Burgo de Osma, Mojados, Azuqueca de Henares, Zaragoza…

En esta entrevista repasa su evolución, sus momentos más señalados del año y las metas que lo motivan a seguir avanzando de cara a la temporada que viene.

1. ¿Qué balances haces de tu temporada con importantes triunfos?

Ha sido una temporada muy importante, he crecido mucho como torero, que es lo más importante para mí. Hemos avanzado mucho, he encontrado la base de lo que quiero que sea mi toreo, que es algo fundamental.

2. ¿Si tuvieras que señalar una faena y una plaza de este año, dónde sería y por qué?

Me quedaría por diferentes razones con la faena de mi primer novillo de Zaragoza. Un pinchazo previo a la estocada se llevó el doble trofeo; me queda esa espina pero sentí cosas muy bonitas e importantes en esa faena, me entregué y expresé. Aunque ha habido faenas muy especiales, como las de Mojados, Marchamalo, Azuqueca, etc…

3. ¿Qué te ha enseñado esta temporada como torero y como persona?

He aprendido muchas cosas: que cada paso lleva un proceso muy largo detrás y que todo cuesta mucho de conseguir; por eso hay que apreciar y saborear el proceso en el que te encuentras. Ser torero y poder materializarlo es un privilegio grandioso al que no le damos la relevancia que verdaderamente tiene. También me ha ayudado a conocerme a mí mismo; esta temporada se han vivido momentos realmente duros, que han hecho reafirmarme en mi vocación torera como nunca.

4. ¿Cuál es tu estilo o qué estilo buscas?

No me gusta hablar de estilos, más bien de conceptos. Mi intención es la de torear como siento: encajado, relajado, lo más despacio posible. Al final creo que es lo que más lleva arriba, siendo siempre fiel a la personalidad de uno.

5. ¿Cómo fue tu paso por Zaragoza tras una gran faena a un novillo de Pincha? ¿Qué sentiste?

La tarde de Zaragoza fue muy especial; es la plaza en la que más veces he estado en mi vida. Me sentí realmente a gusto, disfruté, y eso en una plaza de esa relevancia es complicado. Creo que lo transmití arriba.

6. ¿Cómo planteas tu próxima temporada?

Ahora es momento de reflexión, tomar conciencia de lo que ha ido sucediendo durante la temporada y utilizarlo para mejorar en el invierno. Aunque desde ya, esperando la temporada venidera y que venga cargada de tardes importantes.
`
}
];

// Crónicas taurinas
const chronicles: Chronicle[] = [
	{ 
    id: 5000,
    title: `Óscar Campos se impone en el IV Certamen de Invierno de Escuelas Taurinas de la Comunidad de Madrid`,
    image: "/images/novillero1.jpg",
    category: "Crónicas",
    date: "28 de Diciembre de 2025",
    imageCaption: "Plaza de Toros Venta del Batán",
	plaza: "Plaza de Toros Venta del Batán.",
	ganaderia: "Toros de la Plata y Zacarías Moreno",
	torerosRaw: `Andreo Sánchez (E.T. Navas del Rey), vuelta al ruedo 

Pablo Jurado (E.T. Fundación El Juli), vuelta al ruedo 

José Huelves (E.T. Colmenar Viejo), dos orejas 

Brahian Osorio ‘Carrita’ (E.T. Galapagar), vuelta al ruedo 

Óscar Campos (E.T. Yiyo), dos orejas 

Kevin Montiel (E.T. CITAR-Anchuelo), silencio`,
  fullContent: `El novillero Óscar Campos ha ganado el IV Certamen de Invierno de Escuelas Taurinas de la Comunidad de Madrid, que como cada Navidad ha tenido lugar este mediodía en la plaza de tientas de la Venta del Batán. El alumno de la Escuela José Cubero Yiyo ha cortado dos orejas simbólicas, igual que José Huelves, de Colmenar Viejo, que también ha dejado momentos muy destacados. 

Campos, que cuajó a su novillo de Toros de la Plata el mejor saludo capotero de la mañana, brilló sobre todo por el modo de componer y de expresarse, así como en los remates, sobre todo en los cambios de mano. Huelves por su parte evidenció quietud, mano baja y buen juego cintura frente a un buen ejemplar de Zacarías Moreno al que extrajo naturales de mucho peso y plomada. 

Más voluntariosos anduvieron el resto de actuantes, que dieron una vuelta al ruedo al concluir su actuación. El festejo sirvió además para rendir homenaje a Tomás Serrano Guío por su labor como Presidente del Patronato de Escuela de Tauromaquia de Madrid.

Con excelente ambiente en una mañana soleada y fría se han lidiado ejemplares de Toros de la Plata y dos (2º y 3º) de Zacarías Moreno, de buen juego en términos generales. El resultado de los novilleros ha sido el siguiente: 

Andreo Sánchez (E.T. Navas del Rey), vuelta al ruedo 

Pablo Jurado (E.T. Fundación El Juli), vuelta al ruedo 

José Huelves (E.T. Colmenar Viejo), dos orejas 

Brahian Osorio ‘Carrita’ (E.T. Galapagar), vuelta al ruedo 

Óscar Campos (E.T. Yiyo), dos orejas 

Kevin Montiel (E.T. CITAR-Anchuelo), silencio`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 5001,
    title: `Triunfo de la terna y Manuel de María que deslumbra en su debut en Alcaudete de la Jara`,
    image: "/images/triunfo.jpg",
    category: "Crónicas",
    date: "7 de Diciembre de 2025",
	footerImage1: "/images/foto1.jpg",
    footerImage1Caption: "Fotos de Luis Muñoz",
    footerImage2: "/images/foto2.jpg",
    footerImage3: "/images/foto3.jpg",
    footerImage4: "/images/foto4.jpg",
	plaza: "Plaza de toros de Alcaudete de La Jara (Toledo).",
	ganaderia: "Alcurrucen",
    torerosRaw: `Jesús Navalucillos (Escuela Taurina Domingo Ortega de Toledo) Dos Orejas 

Pablo Méndez (Escuela Taurina de Guadalajara)*Dos Orejas

Álvaro Sánchez (Escuela Taurina Domingo Ortega de Toledo) Dos orejas y rabo 

Manuel de María (Escuela Taurina José Cubero Yiyo de Madrid) Dos orejas y rabo.`,
fullContent: `En conjunto, los jóvenes alumnos mostraron su progreso, dejando patente su ilusión, entrega y buenas maneras ante los novillos de Alcurrucén. Cada uno, desde su propio momento de aprendizaje, logró conectar con los tendidos y ofrecer una tarde llena de espontaneidad y torería en formación.

Cerró el festejo **Manuel de María**, convirtiéndose en la sorpresa de la tarde en su debut. Con desparpajo, naturalidad y una serenidad impropia de su edad, conectó rápidamente con el público y dejó instantes de gran emoción.
**Su actuación fue una de las más celebradas del festejo y abrió un horizonte ilusionante.**

**Plaza de toros de Alcaudete de La Jara (Toledo)**. Clase práctica.
**Novillos de Alcurrucén**, de buen juego en su conjunto. Lleno en los tendidos.

**Jesús Navalcillos** (Escuela Taurina Domingo Ortega de Toledo) Dos Orejas
**Pablo Méndez** (Escuela Taurina de Guadalajara)*Dos Orejas
**Álvaro Sánchez** (Escuela Taurina Domingo Ortega de Toledo) Dos orejas y rabo
**Manuel de María** (Escuela Taurina José Cubero Yiyo de Madrid) Dos orejas y rabo.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 6000,
    title: `Israel Guirao y Jaime Padilla, grandes triunfadores en el I Certamen Taurino “Linares, Cuna de Toreros”`,
    image: "/images/linares.jpg",
    category: "Crónicas",
    date: "6 de Diciembre de 2025",
	plaza: "Santa Margarita- Linares (Jaén)",
	ganaderia: "Apolinar Soriano (1º y 2º), Collado Ruiz, Sancho Dávila, Los Ronceles, Paco Sorando y El Añadio. Un encierro variado e importante por su comportamiento que resultó exigente y muy toreable en líneas generales.",
    torerosRaw: `MARTÍN MENDOZA, E.T. Camas; Ovación.

BLAS MÁRQUEZ, E.T. Linares; Oreja.

JAIME PADILLA, E.T. Málaga; Dos orejas y vuelta al ruedo al novillo.

JESÚS MOLINA, E.T. Linares; Oreja tras aviso.

DANIEL RIVAS, E.T. Linares; Oreja.

ISRAEL GUIRAO, E.T. Valencia; Dos orejas y rabo.

LISARES, E.T. Arles; Oreja.`,
fullContent: `El alumno de la escuela de Valencia cortó un rabo y el de Málaga dos orejas, ambos a hombros por la ‘Puerta Grande’



El emblemático Coso de Santa Margarita volvió a abrir sus puertas en plena festividad navideña, el sábado 6 de diciembre, para albergar el I Certamen Taurino “Linares, Cuna de Toreros”, un nuevo ciclo que nace con vocación de permanencia y que rinde tributo a dos figuras indispensables de la tauromaquia linarense: Apolinar Soriano y Pepe Luis Díaz. La ciudad, reconocida históricamente como auténtico semillero de toreros, reafirma así su compromiso con una tradición profundamente arraigada en su identidad cultural.

El certamen se concibe como un homenaje al legado taurino de Linares y, al mismo tiempo, como una apuesta decidida por el futuro del toreo. En esta primera edición, la plaza se convirtió en un escenario formativo de primer nivel, brindando una plataforma de proyección a 

jóvenes valores procedentes de distintas escuelas taurinas de España y del extranjero. La diversidad de procedencias y estilos enriqueció un encuentro en el que la cantera mostró solvencia, entrega y un notable nivel artístico.



Los alumnos participantes fueron: Martín Mendoza (Escuela Taurina de Camas); Blas Márquez, Jesús Molina y Daniel Rivas (Escuela Taurina de Linares); Jaime Padilla (Escuela Taurina de Málaga); Israel Guirao (Escuela Taurina de Valencia); y Lisares (Escuela Taurina de Arles). Se enfrentaron a un concurso de ganaderías compuesto por siete ejemplares de hierros 

de reconocido prestigio: Sorando, El Cotillo, Apolinar Soriano, Los Ronceles, Collado Ruiz, Sancho Dávila y El Añadío.



La jornada dejó una amplia variedad de matices y evoluciones artísticas



1º Martín Mendoza, ante “Urcola”, de Apolinar Soriano, abrió plaza con decisión, recibiendo a portagayola y cuajando un toreo al natural lleno de personalidad. La espada le privó de premio y recibió una ovación.

2º El linarense Blas Márquez, con “Presidiario”, también de Apolinar Soriano, firmó una faena clásica y cargada de gusto, destacando un luminoso toreo de capa. Cortó una oreja.

3º Jaime Padilla, con “Feroz”, de Collado Ruiz, protagonizó una de las actuaciones de mayor 

rotundidad. Su entrega, su expresividad y un espadazo perfecto le valieron dos orejas, mientras que el novillo fue premiado con la vuelta al ruedo.

4º Jesús Molina, ante “Lancito”, de Sancho Dávila, dejó una labor templada y armoniosa, iniciada de rodillas y construida con suavidad y expresión. Cortó una oreja, y el novillo fue premiado con vuelta al ruedo.

5º Daniel Rivas, con “Gobernante”, de Los Ronceles, demostró evolución y oficio ante un ejemplar que mejoró durante la lidia. Su faena, reposada y de buen trazo, fue premiada con unaoreja.

6º Israel Guirao, con “Labriego”, de Sorando, deslumbró por su madurez y firmeza. Su actuación, intensa y muy personal, culminó con un estoconazo que le abrió la puerta grande al cortar dos orejas y rabo.

7º Cerró la tarde Lisares, que recibió a portagayola a “Cabeza Loca”, de El Añadío. Pese a las complicaciones de su oponente, que buscó tablas con insistencia, el francés mostró raza, limpieza y capacidad, obteniendo una oreja.



El I Certamen Taurino “Linares, Cuna de Toreros” concluyó así con un balance altamente positivo, tanto por el nivel artístico de los participantes como por el ambiente de apoyo a la juventud taurina. Con esta iniciativa, Linares reafirma su papel fundamental en la historia del toreo y renueva su compromiso con la promoción y el impulso de nuevas generaciones que 

mantienen viva su tradición.

FICHA DEL FESTEJO:

Sábado 06 de diciembre de 2025

Plaza de Toros de Santa Margarita- Linares (Jaén)

I Certamen “Linares, cuna de toreros”

Entrada: Algo más de media plaza en tarde gris y fría.

Erales de varias ganaderías (por orden): Apolinar Soriano (1º y 2º), Collado Ruiz, Sancho Dávila, Los Ronceles, Paco Sorando y El Añadio. Un encierro variado e importante por su comportamiento que resultó exigente y muy toreable en líneas generales. Destacaron el 3º 

“Feroz” de Collado Ruiz, y el 4º “Lancito” de Sancho Dávila, premiados con la vuelta al ruedo. 
OBSERVACIONES: 

 Un evento que sirvió como homenaje póstumo a Apolinar Soriano y Pepe Luis Díaz,

figuras reconocidas del ámbito taurino local.

 Festejo en modalidad de ‘Clase Práctica’ y además Concurso de Ganaderías.

 Antes de romper sonó el Himno Nacional.

 Antes de comenzar el festejo se entregaron varios reconocimientos a los Ganaderos, 

Propiedad de la Plaza, Escuela Taurina de Linares y Canal Sur Tv. Todos recibieron 

una placa conmemorativa en presencia de la alcaldesa de Linares, Dña. María 

Auxiliadora del Olmo Ruiz. 

 Último festejo de la Temporada 2025 de las Escuelas y último también de las 

retransmisiones de Canal Sur Tv.

 El piso plaza se encontraba muy húmedo y con algunas zonas algo resbaladizas.

 Presidió el festejo en el palco D. José Luis Martín López`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
	{ 
    id: 6001,
   title: `Algar: Mario Torres, Celso Ortega y Gabriel Moreno ‘El Calé’, abren la ‘Puerta Grande’ con dos orejas cada uno`,
    image: "/images/algar.jpg",
    category: "Crónicas",
    date: "2 de Diciembre de 2025",
	plaza: "Algar",
    ganaderia: "El Torero",
	 torerosRaw: `
Agustín de Antonio: Dos Orejas Tras Aviso
Candela "La Piyaya": Dos Orejas
Fernando Lovera: Dos Orejas Tras Aviso
Armando Rojo: Oreja Con Petición de la Segunda Tras Aviso
Mario Torres: Oreja Tras Dos Avisos
Juan Manuel Viruez: Oreja Tras Aviso
`,
    fullContent: `La plaza de toros de Algar (Cádiz) se convirtió este fin de semana en el escenario de la **Gran Final de las Becerradas de la XIII Competición Provincial de las Escuelas Taurinas de Cádiz** —bajo el patrocinio de la Excma. Diputación de Cádiz— un festejo que, pese a la tarde desapacible y fría, registró un lleno absoluto en los tendidos del centenario coso gaditano.
La cita reunió a los jóvenes valores del toreo provincial, que demostraron capacidad, entrega y ambición ante un encierro variado de la ganadería de **El Torero**, cuyos astados ofrecieron desigual presentación y juego.
Destacó especialmente el quinto becerro, premiado con la vuelta al ruedo por su calidad y bravura.
Entre los noveles actuantes brillaron **Mario Torres, Celso Ortega y Gabriel Moreno ‘El Calé’**, quienes lograron cortar dos orejas cada uno y, con ello, abrir la ‘Puerta Grande’, culminando así una tarde cargada de emociones y evidentes muestras de futuro.

Abrió plaza **Martín Marengo**, de la Escuela Taurina Francisco Montes ‘Paquiro’ de Chiclana de la Frontera, que dejó detalles de buena colocación y temple, siendo premiado con una oreja con petición de segunda.
Le siguió **Adrián Olmedo**, de la Escuela Taurina Linense, que mostró firmeza y decisión pese a un complicado oponente; escuchó palmas tras tres avisos.
El tercer turno correspondió a **Mario Torres**, de la Escuela Taurina Comarcal de Ubrique, quien cuajó una actuación llena de oficio y serenidad. Su faena, rematada con una estocada tras aviso, fue reconocida con dos orejas.

El francés **Remy Lucas**, de la Escuela Taurina ‘Rafael Ortega’ de San Fernando, mostró elegancia y personalidad. A pesar del aviso, cortó una oreja.
Uno de los momentos más destacados llegó de la mano de **Celso Ortega**, representante de la Escuela de Tauromaquia ‘La Gallosina’ de El Puerto de Santa María. Su conexión con los tendidos y el buen entendimiento de la embestida del quinto, premiado con la vuelta al ruedo, le valieron dos orejas.
Posteriormente, **Javier Mena**, de la Escuela Municipal de Tauromaquia Miguel Mateo ‘Migue­lín’ de Algeciras, dejó pasajes de voluntad y buenas maneras, siendo ovacionado tras escuchar tres avisos.
Cerró el festejo **Gabriel Moreno ‘El Calé’**, de la Escuela Taurina ‘El Volapié’ de Sanlúcar de Barrameda, que hizo vibrar al público con una faena de entrega y prestancia gitana. Cortó dos orejas, también tras aviso, lo que le permitió acompañar a Torres y Ortega en la salida a hombros.

**FICHA DEL FESTEJO:**
Domingo, 30 de noviembre de 2025
Plaza de Toros de Algar – (Cádiz)

**Gran Final de las Becerradas de la XIII Competición Provincial de las Escuelas Taurinas de Cádiz**

Proyecto de Fomento de la Cultura Taurina de Andalucía 2025

Entrada: Lleno en tarde desapacible, amenazante y fría.

Se lidiaron reses de **El Torero**. Desiguales de presentación y juego.
Destacó especialmente el 5º, premiado con la vuelta al ruedo por su calidad y bravura.

**MARTÍN MAREN­GO**, (E.T.‘Paquiro’-Chiclana Ftra); Oreja con petición de segunda.
**ADRIÁN OLMEDO**, (E.T. Linense); Palmas tras tres avisos.
**MARIO TORRES**, (E.T. Ubrique); Dos orejas tras aviso.
**REMY LUCAS**, (E.T. ‘Rafael Ortega’ - S. Fdo.); Oreja tras aviso.
**CELSO ORTEGA**, (E.T. ‘La Gallosina’-Pto. Sta. Mª); Dos orejas y vuelta al novillo.
**JAVIER MENA**, (E.T. ‘Miguelín’-Algeciras); Palmas tras tres avisos.
**GABRIEL MORENO ‘EL CALÉ’**, (E.T. ‘El Volapié’ Sanlúcar Bdra.); Dos orejas tras aviso.

**Observaciones:**
Tras el paseíllo sonó el Himno de España.
Asistió al festejo el Primer Teniente de Alcalde de la localidad, D. Juan Manuel Guerra.
La XIII Competición Provincial de las Escuelas Taurinas de Cádiz ha contado con el patrocinio de la Excma. Diputación de Cádiz.

**PALCO:**
Presidió el Alcalde de Algar, D. José Carlos Sánchez.
Asesores: D. Juan Pedro Sánchez.`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
{ 
    id: 6002,
    title: `Almadén de la Plata: Agustín de Antonio, 'La Piyaya' y Fernando Lovera, a hombros tras desorejar a sus respectivos novillos`,
    image: "/images/almaden1.jpg",
    category: "Crónicas",
    date: "2 de Diciembre de 2025",
	plaza: "Almadén de la Plata",
    ganaderia: "El Torero",
	 torerosRaw: `
Agustín de Antonio: Dos Orejas Tras Aviso
Candela "La Piyaya": Dos Orejas
Fernando Lovera: Dos Orejas Tras Aviso
Armando Rojo: Oreja Con Petición de la Segunda Tras Aviso
Mario Torres: Oreja Tras Dos Avisos
Juan Manuel Viruez: Oreja Tras Aviso
`,
    fullContent: `La plaza de toros de **Almadén de la Plata** registró un lleno absoluto en la novillada sin picadores organizada con motivo de la **VIII Edición del Día del Jamón**, en la que se lidiaron reses bien presentadas y de juego variado de **Albarreal**, destacando el primero y el tercero.
La novillada dejó tres ‘Puertas Grandes’ y un notable nivel de las jóvenes promesas, confirmando a Almadén de la Plata como una cita clave para seguir la evolución de los nuevos valores del toreo. Tras el paseíllo sonó el Himno de España, antes de dar paso a una tarde en la que los seis actuantes mostraron oficio, entrega y personalidad.

**Agustín de Antonio** abrió la tarde con una faena templada y expresiva ante un novillo noble, logrando dos orejas tras aviso.
**Candela “La Piyaya”** resolvió con firmeza ante un astado áspero, aprovechando los momentos que permitió el lucimiento y cortando dos orejas.
El tercer triunfador fue **Fernando Lovera**, que brilló con una actuación muy templada y de gran profundidad, premiada igualmente con dos orejas tras aviso.
**Armando Rojo** se impuso a un novillo complicado con firmeza y buenos detalles, obteniendo una oreja con petición de segunda.
**Mario Torres**, muy seguro ante un quinto exigente, dejó los mejores momentos por la derecha y cortó una oreja tras dos avisos.
Cerró la tarde **Juan Manuel Viruez**, que mostró buen concepto y una importante personalidad para pasear una oreja tras aviso.

**FICHA DEL FESTEJO:**
Sábado, 29 de noviembre de 2025

Plaza de Toros El Coso – Almadén de la Plata (Sevilla)

Novillada Extraordinaria con motivo de la “**VIII Edición del Día del Jamón**”

Proyecto de Fomento de la Cultura Taurina de Andalucía 2025

Entrada: Lleno en tarde muy gélida.

Se lidiaron reses de **Albarreal**. Bien presentadas y de juego variado de Albarreal, destacando el primero y el tercero.

**AGUSTÍN DE ANTONIO**, (E.T. Sevilla); Dos orejas tras aviso.
**CANDELA ‘LA PIYAYA’**, (E.T.J.C. ‘Yiyo’-Madrid); Dos orejas.
**FERNANDO LOVERA**, (E.T. Camas); Dos orejas tras aviso.
**ARMANDO ROJO**, (E.T. Sevilla); Oreja con petición de segunda tras aviso.
**MARIO TORRES**, (E.T. Ubrique); Oreja tras dos avisos.
**JUAN MANUEL VIRUEZ**, (E.T. Ubrique); Oreja tras aviso.

**Observaciones:**
Tras el paseíllo sonó el Himno de España.
Presidió: D. Francisco Alonso, asesorado por Dña. Mª del Pilar Portillo, perteneciente a la UPTE (Unión de Presidentes de Plazas de Toros de España).
Asistió al festejo el Delegado del Gobierno de la Junta de Andalucía en Sevilla, D. Ricardo Sánchez Antúnez y el Alcalde de la localidad, D. Carlos Raigada Barrero.
Un festejo organizado por la Escuela de Sevilla, la Escuela de Ubrique y el propio Ayuntamiento de Almadén de la Plata.`,
  author: "Manolo Herrera",
  authorLogo: "/images/manoloherrera.jpg",
  showAuthorHeader: true
  },
];

  // Entrevistas taurinas
const entrevistas: NewsItem[] = [
	{ 
    id: 500,
       title: "“Expreso mi concepto bajo los cánones del clasicismo, con mi singularidad personal” - Entrevista a David Galván",
    image: "/images/entrevista.jpg",
    category: "Entrevistas",
    date: "29 de noviembre de 2025",
    fullContent: `**David Galván**
encara uno de los momentos más determinantes de su carrera. El matador gaditano, que con constancia, sensibilidad y una evolución silenciosa ha pasado de ser una promesa a convertirse en un nombre respetado dentro del escalafón, atraviesa un proceso de madurez profesional que despierta ilusión entre la afición.

Tras una temporada marcada por la solidez, actuaciones de gran calado y tardes en las que dejó patente la profundidad de su concepto, Galván ha logrado situarse como uno de los toreros con mayor poso y proyección. Su expresión clásica, su temple y una ambición cada vez más nítida lo consolidan como un perfil que merece ser escuchado.

**¿Cómo afronta usted la temporada que viene, teniendo en cuenta lo importante que ha sido esta?**

La temporada 2026 la afronto con la ilusión de dar mi mejor versión en cada actuación, mostrar mi personalidad en su máxima dimensión y seguir sintiendo a la afición ilusionada por ver a David Galván. 

**Se ha creado un movimiento “galvanista” ya que el buen publico, admira que un concepto tan puro como el suyo, no cambie con corridas duras. ¿Le gusta a usted que le encasillen con ese tipo de ganaderias o encastes? o preferiria torear corridas mas “comodas” y en otro tipo de carteles.**

Es muy bonito sentir ese movimiento “Galvanista” que he vivido este año y sigo viviendo. Recibo el entusiasmo constante de aficionados de todas las edades de la geografía europea y americana, lo que supone una gran felicidad para mí. 
Considero que no estoy encasillado en nada, no me pongo limitaciones, y es por este motivo que he conseguido desarrollar mi toreo y triunfar con todo tipo de ganaderías y encantes. 

**Perú y México, son dos paises con los que mantiene un idilio constante, y en los que se le espera con gran entusiasmo; ¿que opina de estos dos paises? ¿Y de los constantes ataques antitaurinos en mexico? ( se han vuelto a prohibir los toros en Ciudad Juarez)**

Tanto Perú como México son dos países que llevo en mi corazón. Me encanta torear en ellos y sentir el calor de sus aficiones. Siempre tendrán mi apoyo incondicional. 

**¿Como quiere que se le recuerde, cuales son sus mayores aspiraciones en este mundo?**

Como artista y como persona lo que más me llena es sentir que la gente se emociona y es feliz a través de mi expresión, esta es la mayor satisfacción y aspiración. 

 **Su concepto del toreo ha sido definido muchas veces como “clásico y eterno”. ¿Cree usted que en la actualidad, donde abundan estilos más efectistas, sigue habiendo espacio para ese clasicismo? ¿Qué mensaje quiere transmitir cada vez que se pone delante de un toro?**

Particularmente siento que los públicos si se identifican con mi toreo. Expreso mi concepto bajo los cánones del clasicismo, con mi singularidad personal. Me gusta la originalidad en el ruedo y que no haya nada previsible ni encorsetado.

**En España, la temporada pasada dejó tardes memorables en plazas de primera. ¿Qué importancia le da a triunfar en Madrid o Sevilla frente a otras plazas más pequeñas? ¿Considera que el público de cada ciudad entiende y valora de manera distinta su tauromaquia?**

Mi filosofía como torero pasa por expresar mi toreo con la misma entrega y compromiso independientemente de la categoría reglamentaria de la plaza. El público acude a la plaza y merece ver la mejor versión de uno mismo. 

En plazas de primera es cierto que ha habido faenas importantes en este año 2025, en las que he sentido el reconocimientos de aficiones que son exigentes y dan crédito. Inolvidables han sido las faenas en Sevilla y Málaga, el San Isidro de esta temporada o las tardes de capacidad en Dax y Albacete. 



**La juventud se acerca cada vez más al toreo, pero también se enfrenta a críticas sociales. ¿Qué consejo daría usted a los jóvenes que sueñan con ser toreros, y cómo cree que deberían afrontar las presiones externas que cuestionan la fiesta?**

Que persigan su sueño con fe, sin complejos y sintiéndose libres. 

**El toro bravo es el eje de todo este mundo. ¿Qué opinión tiene usted sobre la evolución de las ganaderías actuales? ¿Prefiere enfrentarse a hierros de máxima exigencia que ponen a prueba al torero, o cree que también es necesario buscar variedad para mostrar diferentes matices de su arte?**

El nivel de las ganaderías, cada una en su contexto y personalidad, en la actualidad es muy alto. Los ganaderos están haciendo una gran labor. 
Para el aficionado considero que causa mayor interés la variedad que la monotonía. Me preparo diariamente para tener registros suficientes para expresar mi toreo a todo tipo de toros independientemente de su condición o ganaderia, siempre fiel a mi sello personal.`,
  footerImage1: "/images/victorluengo.jpg",
  footerImage1Caption: "Fotos de Víctor Luengo",
  footerImage2: "/images/davidgalvan3.jpg",
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
	 {
    id: 501,
    title: "Busco torear lo más despacio posible: Entrevista al novillero Tomás González",
    image: "images/tomasgonzalez.jpg",
    category: "Entrevistas",
    date: "14 de Octubre de 2025",
    fullContent: `
La temporada del joven novillero alcorisano Tomás González ha sido un punto de inflexión, uno de los novilleros que ha demostrado con argumentos que puede estar en las ferias.

Cuenta con buenas actuaciones a lo largo de la temporada Vinaroz, Burgo de Osma, Mojados, Azuqueca de Henares, Zaragoza…

En esta entrevista repasa su evolución, sus momentos más señalados del año y las metas que lo motivan a seguir avanzando de cara a la temporada que viene.

1. ¿Qué balances haces de tu temporada con importantes triunfos?

Ha sido una temporada muy importante, he crecido mucho como torero, que es lo más importante para mí. Hemos avanzado mucho, he encontrado la base de lo que quiero que sea mi toreo, que es algo fundamental.

2. ¿Si tuvieras que señalar una faena y una plaza de este año, dónde sería y por qué?

Me quedaría por diferentes razones con la faena de mi primer novillo de Zaragoza. Un pinchazo previo a la estocada se llevó el doble trofeo; me queda esa espina pero sentí cosas muy bonitas e importantes en esa faena, me entregué y expresé. Aunque ha habido faenas muy especiales, como las de Mojados, Marchamalo, Azuqueca, etc…

3. ¿Qué te ha enseñado esta temporada como torero y como persona?

He aprendido muchas cosas: que cada paso lleva un proceso muy largo detrás y que todo cuesta mucho de conseguir; por eso hay que apreciar y saborear el proceso en el que te encuentras. Ser torero y poder materializarlo es un privilegio grandioso al que no le damos la relevancia que verdaderamente tiene. También me ha ayudado a conocerme a mí mismo; esta temporada se han vivido momentos realmente duros, que han hecho reafirmarme en mi vocación torera como nunca.

4. ¿Cuál es tu estilo o qué estilo buscas?

No me gusta hablar de estilos, más bien de conceptos. Mi intención es la de torear como siento: encajado, relajado, lo más despacio posible. Al final creo que es lo que más lleva arriba, siendo siempre fiel a la personalidad de uno.

5. ¿Cómo fue tu paso por Zaragoza tras una gran faena a un novillo de Pincha? ¿Qué sentiste?

La tarde de Zaragoza fue muy especial; es la plaza en la que más veces he estado en mi vida. Me sentí realmente a gusto, disfruté, y eso en una plaza de esa relevancia es complicado. Creo que lo transmití arriba.

6. ¿Cómo planteas tu próxima temporada?

Ahora es momento de reflexión, tomar conciencia de lo que ha ido sucediendo durante la temporada y utilizarlo para mejorar en el invierno. Aunque desde ya, esperando la temporada venidera y que venga cargada de tardes importantes.
`
  },
	{
    id: 502,
    title: "Entrevista a Carlos Zúñiga: “Soy una persona ambiciosa y la vida me ha enseñado a saber esperar”",
    image: "images/carloszuñiga.jpg",
    category: "Entrevistas",
    date: "17 de Octubre de 2025",
    fullContent: `Carlos, en un momento donde la tauromaquia enfrenta tantos desafíos sociales y políticos, ¿qué significa para usted seguir apostando por este sector como empresario? 

Para mi es una forma de vida, una vocación. Yo no sé hacer otra cosa. Vivo 24 h para por y para el toro en su máxima expresión y no concibo el día a día sin ilusionarme y pensar en la confección de una feria. Creo que a veces puedo ser demasiado cansino en el día a día pero hasta ahora, esa "fórmula" no me ha ido mal. Seguiré peleando por y para el toreo y espero no desfallecer.

Gestiona plazas tan emblemáticas como El Puerto, Gijón o Aranjuez. ¿Qué criterios considera esenciales para que una feria taurina sea rentable y atractiva para el público? 

Creo que el secreto es dar al público de cada lugar lo que busca. Yo no me considero ni un Séneca ni un salvador del toreo, pero intento tener mi sello de calidad buscando la excelencia en el espectáculo. Me gusta un determinado tipo de toro e intento no perder nunca el rigor y el trapío acorde a cada plaza. En Gijón, por ejemplo, llevo casi 25 años con esa fórmula y la Feria de Begoña está más consolidada que nunca.

¿Qué le diría hoy a los políticos que impulsan prohibiciones o trabas a la celebración de festejos taurinos en España?

Simple y llanamente que respeten nuestras traiciones y las salvaguarden como garantes de un Bien declarado Patrimonio Cultural Inmaterial, por mucho que partidos radicales hayan tratado de boicotear.

¿Qué plaza sueña con gestionar algún día, y qué aportaría usted como empresario para devolverle o mantenerle su prestigio?

Bueno, imagínese, uno siempre sueña con volar lo más alto posible y en ese horizonte como no están Sevilla y Madrid. Quien sabe si el futuro me deparará algún día algo bonito. Lo que aportaría, me lo guardo para entonces.

La retirada de Morante de la Puebla marca un punto de inflexión en la tauromaquia actual. También porque usted siempre lo ha contratado siempre que ha podido este año en plazas como El Puerto de Santa María , Aranjuez….
Desde el punto de vista empresarial, ¿cómo afecta la ausencia de una figura así en la confección de carteles y en la atracción del público?

Reitero una vez más mi agradecimiento públicamente a Morante. Creo que ha sido el toreo más grandioso que mis ojos han tenido la oportunidad de ver y que seguramente vayan a ver. Ha sido muy generoso con la Fiesta y especialmente con los empresarios. Con su apoyo y el de El Juli, he crecido profesionalmente y sus faenas históricas en mis plazas me han aportado un plus de calidad que nunca olvidaré. Le echaremos mucho de menos como lo hemos hecho estos 2 años con Julián.

¿Como plantea la temporada que viene de cara a nuevas plazas? ¿Tiene en mente alguna? 

Estoy muy contento y muy feliz con las 9 o 10 plazas que gestiono actualmente pero soy una persona ambiciosa y además la vida me ha enseñado a saber esperar. Desde luego, y no lo voy a ocultar, mi objetivo es poder seguir creciendo pero siempre con la clarividencia de estudiar los pliegos y la situación de cada plaza. Quién sabe, si el futuro, nos deparará alguna sorpresa. También es bonito soñar...`
  },
{ 
    id: 503,
    title: "“Soy torero no sobresaliente” - Entrevista con Enrique Martínez Chapurra",
    image: "images/enriquez.jpg",
    category: "Entrevistas",
    date: "1 de noviembre de 2025",
    fullContent: `Matador de toros desde 2003, natural de Andújar, ha encabezado durante años el escalafón de sobresalientes en plazas tan destacadas como Las Ventas, Vistalegre o Morón de la Frontera. A pesar de una carrera marcada por la dureza y las lesiones, sigue fiel a su pasión y a su forma de entender la vida: con afición, entrega y verdad.

—¿Qué significa para ti haber encabezado durante varios años el escalafón de sobresalientes en plazas tan importantes?
—Bueno, no tiene mucha importancia el torear más o menos de sobresaliente. Yo considero que lo importante es poder vivir de torero y poder vivir de tu profesión. Dado que esto está muy complicado, poder vivir del toreo no es tarea fácil, y me siento un privilegiado de poder seguir disfrutando de mi profesión. Siempre pienso que esto es un trampolín hacia una oportunidad que me pueda cambiar la vida.

—Tomaste la alternativa en 2003 en Andújar, pero no has logrado consolidarte como matador principal. ¿Cómo has vivido esa transición?
—Tomé la alternativa en mi pueblo hace bastante tiempo, y al principio no me gustaba torear de sobresaliente, pero vi que era una de las pocas posibilidades que tenía para seguir vistiéndome de torero y seguir luchando. Me lo tomé como si toreara cincuenta corridas por temporada, porque nunca he dejado de entrenar como al principio. A día de hoy sigo con la misma ilusión que cuando era un chaval.

—En 2022 sufriste una grave cornada en Estella. ¿Cómo fue esa experiencia?
—Sí, fue una cornada extremadamente grave. Al final tuve mucha suerte, porque si el pitón llega a profundizar un poco más —ya fueron 25 centímetros— estaríamos hablando de una tragedia gorda, porque me habría partido el hígado. Así que me considero un afortunado. Mi carrera ha sido muy dura: desde novillero tuve una cornada gravísima en el ano que me destrozó intestino delgado y grueso, con rotura de peritoneo, y estuve a punto de morir. Luego vinieron más: una en Ondara en 2005, otra lesión muy dura en 2019 con la rotura del tendón de Aquiles… Pero aquí sigo. Mi carrera ha sido muy dura, sí, pero también muy vivida.

—Eres conocido por tu afición y entrega. ¿Cuál es tu filosofía personal para mantenerte motivado?
—Mi filosofía en el toreo y en la vida es ir siempre recto. En el toreo hay que tener mucha afición y vivir para ello. A mí nunca me ha costado sacrificarme por mi profesión, porque me gusta y es mi pasión.

—¿Qué opinas sobre el papel de los sobresalientes en los festejos taurinos?
—La opinión que tengo es que uno no es sobresaliente: uno es torero. Me toca esto y es lo que me contratan, pero ante todo soy matador de toros, y sobre todo, soy torero.

—¿Cuáles son tus proyectos y objetivos para el futuro?
—Mi objetivo es seguir en mi profesión mientras las fuerzas y la ilusión me acompañen. Que venga lo que el destino quiera, pero yo lo único que quiero es ser feliz, y así lo soy con lo que hago.`
  }, 
 { 
    id: 504,
       title: "“Considero que soy un torero que tiene personalidad” - Entrevista con Sergio Rodríguez",
    image: "/images/sergior.jpg",
	imageCaption: "Sergio Rodríguez en la Final de la Copa Chenel",
	footerImage1: "/images/sergior1.jpg",
	footerImage1Caption: "Sergio Rodríguez el pasado 12 de Octubre en Las Ventas - Foto Plaza 1",
	footerImage2: "/images/sergior2.jpg",
    category: "Entrevistas",
    date: "24 de noviembre de 2025",
    fullContent: `A las puertas de una nueva campaña taurina, **Sergio Rodríguez** encara uno de los momentos más determinantes de su carrera. El matador abulense, que en apenas unos años ha pasado de promesa a nombre imprescindible del escalafón joven, vive un proceso de madurez profesional que ilusiona tanto al aficionado. 

**Tras una temporada marcada por la regularidad**, triunfos de peso y tardes en las que dejó constancia de su personalidad en la plaza, Sergio ha logrado posicionarse como uno de los toreros con mayor proyección del momento. Su concepto clásico, su valor sereno y una ambición cada vez más evidente lo convierten en un perfil que despierta interés.

**¿Qué significó para ti proclamarte triunfador de la Copa Chenel 2025 y cómo crees que ese triunfo puede cambiar tu carrera?**

“Bueno, pues aparte de la satisfacción que a uno le da triunfar y ganar, certámenes 
 tan importantes como puede ser la Copa Chenel, fue un poco la recompensa a muchos meses de entrenamiento, de disciplina, de entrega.
Entonces, pues bueno, significó mucho, tanto como parami torero como para la persona que soy.
Fue un antes y un después, sin duda.
Y bueno, pues espero que el año que viene me den un poco las oportunidades que este año no se me han dado y creo que merecía por los motivos que había dado en la plaza.
Creo que eso es un poco lo que más puedo esperar de cara al año que viene.”

**¿Cómo recuerdas tus primeros pasos en la tauromaquia, empezando desde que tenías 12 años en la escuela taurina de Las Navas del Marqués?**

“Pues son recuerdos muy bonitos, todos los recuerdo de una manera muy gratificante y muy feliz.
De hecho, hay muchos que los añoro, hay cosas que ya no van a volver por la inocencia de un niño que empieza, por un montón de cosas que se tienen cuando uno está empezando.
La verdad que las extraño.
Y bueno, fue una etapa muy bonita donde di mis primeros pasos en una escuela de aficionados.
Ni siquiera yo quería ser torero, pero bueno, ahí fue donde me entró ese veneno que decimos los toreros para querer dedicarme ya de una manera profesional al torero.”

**¿Cómo definirías tu estilo dentro del ruedo y qué toreros han influido en tu forma de torear?**

“Considero que soy un torero que tiene personalidad.
Interpreto el toreo de una manera muy personal.
Es cierto que siempre me he fijado mucho en el maestro José Tomás, en el maestro Morante, en el maestro Rafael de Paula , pero nunca he intentado copiar nada.
Siempre he buscado las cosas que más me han gustado de estos maestros y he intentado trasladarlo a mis formas y a mi concepto.”

	**¿Qué te gustaría que la afición recordara de ti dentro de unos años?**

“Bueno, pues me gustaría que me recordasen como un torero de época, un torero especial, con un concepto propio del toreo.
Y me encantaría intentar marcar la época en el torero y sobre todo ser torero de torero.
Creo que es lo más grande que hay y creo que es la mejor forma que se le pueda recordar a un torero, siendo torero de torero.”

**¿Cómo planteas la temporada que viene después de los triunfos logrados este año?**

“Pues la verdad que, bueno, la temporada del año que viene es un poco incógnita, no sé muy bien el que puede pararme, pero sí tengo claro lo que yo quiero y lo que me encantaría conseguir, por supuesto.
Me encantaría volver a Madrid, me encantaría que la afición de Madrid me viese como yo soy, aprovechar esa oportunidad que ahora mismo tanto necesito para hacerme un hueco dentro del escalafón.”

**¿Como afrontas tu compromiso en Perú , donde este próximo mes de diciembre torearás allí?**

“Bueno, pues la verdad que el compromiso de Perú lo afrontó con mucha ilusión.
Al final ha sido una inyección de moral.
Cuando uno tiende un poquito a relajarse una vez terminada la temporada, pues que le llamen para viajar a uno de los países que más en auge está en la actualidad en el mundo del toro, pues es muy bonito y también me viene la responsabilidad.
Quiero aprovechar esa oportunidad que se me ha brindado, que creo que es muy buena.
Y nada, pues me encanta conocer nuevos países, nuevas costumbres y sobre todo que conozca mi toreo en otros rincones del mundo.”`
  },
 	{ 
    id: 505,
    title: `Nicolás Grande, el joven que reivindica la tauromaquia desde las redes: “Mi generación es el futuro de este arte”`,
    image: "/images/nicolas.jpg",
    category: "Entrevistas",
    date: "9 de Diciembre de 2025",
    fullContent: `Con apenas unos años de presencia en redes sociales, **Nicolás Grande** se ha convertido en una de las voces jóvenes más visibles en defensa de la tauromaquia. Estudiante de veterinaria y apasionado del toro, su discurso rompe clichés: no viene de una familia taurina ni creció rodeado de corridas, pero encontró en los sanfermines el inicio de una fascinación que marcaría su camino.

Por eso, desde Portal Tendido Digital hemos querido entrevistarle para conocerle algo más.

**Nicolás, estudias veterinaria. ¿Qué te llevó a interesarte por la tauromaquia, y cómo concilias ese amor por los animales con la defensa del espectáculo taurino?**

Mi verdadera pasión son los animales. El toro de lidia fue, desde el principio, lo que despertó mi interés por este espectáculo. Yo no vengo de una familia especialmente taurina, pero ver cada 7 de julio en las calles de Pamplona a esos animales majestuosos correr fue lo que me generó una fascinación enorme.
Respecto a la defensa de la tauromaquia, desde fuera puede parecer algo muy complejo. Sin embargo, cuando uno entiende la fiesta brava y se dedica a estudiarla, descubre un mar infinito de argumentos que la sustentan. Solo hace falta acercarse con la mente abierta.

**Has ganado visibilidad en Instagram/TikTok como joven defensor de la tauromaquia. ¿Cómo usas tus redes para comunicar tu visión? ¿Crees que las redes pueden cambiar la percepción de los toros entre la gente joven?**

Desde que empecé en redes no he parado de aprender. Me adentré en un mundo que desconocía por completo; de hecho, ni siquiera tenía TikTok: me lo descargué exclusivamente para empezar a crear contenido.
En un inicio quería hablar del mundo ganadero en general, ya que había trabajado en una ganadería de carne en Cantabria y me apasionaba la defensa del medio rural. Pero un día decidí subir un vídeo con argumentos a favor de la tauromaquia, y tuvo tanto éxito que me replanteó mi vocación.
Me di cuenta de que en redes faltaban creadores taurinos adaptados a los nuevos tiempos, capaces de llegar a un público joven. Ahí decidí enfocar mi contenido hacia una especie de “evangelización” de la tauromaquia desde un formato moderno.
Creo que antes era más fácil consumir tauromaquia, y que durante un tiempo se dejó de difundir este arte; pero gracias a las redes sociales puede volver a conectar con un público amplio.
Muchos asocian la tauromaquia con generaciones mayores.

**Tú representas una generación joven a favor del toreo. ¿Qué crees que puede aportar tu generación a la tauromaquia? ¿Qué interés ves hoy en jóvenes por este mundo?**

Mi generación es el futuro de todo. De nosotros depende la continuidad de nuestra cultura. Si no somos nosotros quienes ocupamos los tendidos, ¿quién lo hará?
Tenemos la responsabilidad de escuchar y aprender de nuestros mayores, de los toreros, de los escritores taurinos y de toda la sabiduría que ellos han acumulado, para en un futuro poder transmitirlo.
Aun así, hay un aspecto que me tranquiliza: los jóvenes empezamos a buscar referentes en una sociedad que muchas veces se percibe como vacía o sin héroes. En la tauromaquia muchos encuentran figuras valientes, personas que se juegan la vida por aquello que aman, mientras vemos a nuestros representantes políticos esconderse ante todo lo que no les beneficia.

**La tauromaquia está muy politizada, con defensores y detractores apasionados. ¿Cómo valoras ese contexto? ¿Piensas que hay una politización excesiva? ¿Qué espacio crees que ha de tener la tradición del toro en la sociedad actual? (Sobre todo por la zona de Barcelona)**

Es una pena que la cultura se politice. No ocurre solo con los toros: hoy en día prácticamente todo se usa para generar tensión y confrontación.
Existen numerosos ejemplos de personajes públicos que, independientemente de su ideología, acuden a las plazas. Por mencionar algunos, tanto Isabel Díaz Ayuso (del Partido Popular) como Joaquín Sabina (abiertamente socialista) disfrutan de la tauromaquia.
La fiesta no entiende de colores ni de partidos: es del pueblo y para el pueblo.
En cuanto a Barcelona, es triste ver cómo la familia Balañá sigue con su juego cobarde de mantener cerradas las plazas. Cataluña es taurina, y eso se refleja en los muchos pueblos de la comunidad donde se celebran festejos con más libertad que en la propia ciudad.
Aun así, tengo esperanza de que, con la ayuda de mi amigo Mario Vilau, logremos reabrir la Monumental.

**Si tuvieras que explicar a alguien que nunca ha visto un toro de lidia por qué te gusta la tauromaquia, ¿qué argumentos darías apelando a lo emocional, cultural o artístico?**

Le diría que es algo que, hasta que no lo vives, no lo puedes entender. Y aun viviéndolo, sigue siendo difícil de explicar.
Me gusta compararla con un cuadro abstracto: o tienes la sensibilidad para apreciar el arte que encierra, o simplemente no lo ves. No hay término medio. Puede hacerte vibrar en un buen natural, o puede parecerte solo un hombre con una capa roja.
Aun así, creo que cualquiera debería sentarse en un tendido al menos una vez para construirse una opinión real sobre los toros.`,
  author: "Eduardo Elvira",
  authorLogo: "/images/edu4.jpg",
  showAuthorHeader: true
  },
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
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const p = params.get('p');

  if (p) {
    try {
      // Rellenar base64 solo si hace falta
      let padded = p;
      while (padded.length % 4 !== 0) padded += "=";

      const decoded = atob(padded);
      const idString = decoded.replace("news-", "");
      const id = parseInt(idString, 10);

      const allPosts = [...featuredNews, ...latestNews];
      const selected = allPosts.find((n) => n.id === id);

      if (selected) {
        setSelectedNews(selected);
        setIsNewsModalOpen(true);
       document.body.style.overflow = "hidden";
       document.body.style.position = "fixed";
       document.body.style.width = "100%";
      }
    } catch (error) {
      console.error("Error decodificando parámetro p:", error);
    }
  }
}, []);
  
// Abrir modal de noticia
const openNewsModal = (news: NewsItem | OpinionArticle) => {
  setSelectedNews(news);
  setIsNewsModalOpen(true);
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
};

// Cerrar modal de noticia
const closeNewsModal = () => {
  setIsNewsModalOpen(false);
  setSelectedNews(null);
  document.body.style.overflow = "auto";
  document.body.style.position = "";
  document.body.style.width = "";
};

// En tu componente del modal, asegúrate de que tenga estos estilos:
const modalStyles = {
  overflowY: "auto", // Habilita desplazamiento vertical
  overflowX: "hidden", // Deshabilita desplazamiento horizontal
  maxHeight: "100vh", // O la altura que prefieras
  WebkitOverflowScrolling: "touch", // Para scroll suave en dispositivos táctiles
};
	
// Función para abrir modal de crónica
const openChronicleModal = (chronicle: Chronicle) => {
setSelectedChronicle(chronicle);
setIsChronicleModalOpen(true);
document.body.style.overflow = "hidden";
document.body.style.position = "fixed";
document.body.style.width = "100%";
};

// Función para cerrar modal de crónica
const closeChronicleModal = () => {
setIsChronicleModalOpen(false);
setSelectedChronicle(null);
document.body.style.overflow = "auto";
document.body.style.position = "";
document.body.style.width = "";
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

const SponsorBanner = () => (
  <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col items-center justify-center my-8 cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
    <a
      href="https://tauromania.es"
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center justify-center space-y-3"
    >
      <img
        src="/images/tauromania.png"
        alt="TauroManía logo"
        className="w-52 md:w-64 object-contain"
      />
      <p className="text-gray-700 font-medium text-sm text-center">
        Colaboración <span className="font-bold text-yellow-600">- TauroManía</span>
      </p>
    </a>
  </div>
);
	
  if (activeTab === "entrevistas") {
    const entrevistas = latestNews.filter((item) =>
      item.title.toLowerCase().includes("entrevista")
    );

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* --------- Cabecera --------- */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Entrevistas
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">
            Conversaciones exclusivas con protagonistas del mundo taurino
          </p>
        </div>

        {/* --------- Grid de entrevistas --------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {entrevistas.length > 0 ? (
            entrevistas.map((news) => (
              <a
                key={news.id}
                href={`/entrevistas/${news.slug || news.id}`}
                className="group block"
              >
                <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-100">
                  {/* Imagen */}
                  <div className="relative overflow-hidden">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-48 md:h-56 object-cover object-top group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg backdrop-blur-sm">
                        {news.category}
                      </span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-6">
                    <span className="text-gray-500 text-sm block mb-2">
                      {news.date}
                    </span>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300 leading-tight">
                      {news.title}
                    </h3>
                    {news.excerpt && (
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {news.excerpt}
                      </p>
                    )}
                    <span className="text-red-600 hover:text-red-700 font-bold text-sm flex items-center">
                      Leer entrevista
                      <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform duration-300"></i>
                    </span>
                  </div>
                </article>
              </a>
            ))
          ) : (
             // --------- Si no hay entrevistas ---------
            <div className="text-center py-16">
              <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
                <i className="ri-chat-smile-line text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No hay entrevistas disponibles
                </h3>
                <p className="text-gray-600 mb-6">
                  Pronto publicaremos nuevas entrevistas exclusivas
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
	
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
{savedPostsList.length > 0
  ? `Tienes ${savedPostsList.length} noticias guardadas`
  : 'No tienes noticias guardadas aún'}
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
              
              {/* Título principal */}
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 group-hover:text-red-600 transition-colors duration-300 leading-tight">
                {chronicle.title.split('||')[1]?.trim() || chronicle.title}
              </h3>
              
              {/* Grid con imagen y contenido */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Imagen */}
                <div className="lg:col-span-1">
  <div className="relative overflow-hidden rounded-xl shadow-sm">
    {chronicle.video ? (
      <video
        controls
        playsInline
        preload="metadata"
        poster={chronicle.image}
        className="rounded-xl w-full h-auto max-h-[500px] object-cover shadow-sm"
      >
        <source src={chronicle.video} type="video/mp4" />
        Tu navegador no soporta la reproducción de vídeo.
      </video>
    ) : (
     <div className="bg-black flex items-center justify-center h-48 md:h-56 overflow-hidden">
 <img
  src={chronicle.image}
  alt={chronicle.title}
    className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105"
  />
</div>
    )}
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
                  
                  {/* Resumen */}
<div className="bg-red-50 rounded-xl p-4 border-l-4 border-red-500">
  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
    <i className="ri-file-text-line mr-2 text-red-600"></i>
    Resumen de la corrida
  </h4>
  <div className="text-gray-700 text-sm leading-relaxed">
    {renderArticleContent(
      chronicle.detalles || chronicle.fullContent || chronicle.excerpt
    )}
  </div>
</div>
					
{/* Resultados de los toreros */}
{(chronicle.toreros || []).length > 0 && (
  <div className="space-y-3 mt-6">
    <h4 className="font-bold text-gray-900 text-lg mb-3 flex items-center">
      <i className="ri-award-line mr-2 text-red-600"></i> Resultados
    </h4>
    {(chronicle.toreros || []).map((torero, index) => (
      <div
        key={index}
        className="flex items-start bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-lg mb-1">{torero}</p>
          <p className="text-gray-700 text-sm">
            {chronicle.resultado?.[index] || ""}
          </p>
        </div>
      </div>
    ))}
  </div>
)}

</div>
</div>
				
              {/* Footer con acciones */}
<div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
  <div className="flex items-center space-x-4">
    <button
      onClick={(e) => toggleSave(chronicle.id, e)}
      className={`transition-all duration-300 p-2 rounded-full ${
        savedPosts.has(chronicle.id)
          ? "text-yellow-600 bg-yellow-50"
          : "text-gray-500 hover:text-yellow-600 hover:bg-yellow-50"
      }`}
      aria-label={
        savedPosts.has(chronicle.id) ? "Quitar de guardados" : "Guardar crónica"
      }
    >
      <i
        className={`${
          savedPosts.has(chronicle.id)
            ? "ri-bookmark-fill"
            : "ri-bookmark-line"
        } text-xl`}
      ></i>
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
    <section
  id="inicio"
  className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden flex items-center justify-center bg-white"
>
      {featuredNews.map((news, index) => (
        <div
          key={news.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
<img
  src={news.image}
  alt={news.title}
  className="absolute inset-0 w-full h-full object-cover"
  loading="lazy"
/>

          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent pointer-events-none"></div>

          <div className="absolute inset-x-0 bottom-8 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 flex justify-center px-4 sm:px-8 text-center">
            <div className="max-w-3xl">
              <div className="flex items-center justify-center mb-4 space-x-3">
                <span className="inline-flex items-center bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg backdrop-blur-sm">
                  <i className="ri-fire-line mr-2"></i>
                  {news.category}
                </span>
                <span className="text-gray-500 text-sm">{formatTimeAgo(news.date)}</span>
              </div>

             <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight tracking-tight drop-shadow-lg">
             {news.title}
             </h1>

              {news.excerpt && (
                <p className="text-base sm:text-lg text-gray-200 mb-6 leading-relaxed drop-shadow-md">
                  {news.excerpt}
                </p>
              )}

              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <button
                  onClick={() => openNewsModal(news)}
                  className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-full font-bold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-lg cursor-pointer text-sm sm:text-base"
                >
                  Leer noticia completa
                </button>
                <button
                  onClick={() => scrollToSection('actualidad')}
                  className="bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold hover:bg-white/40 transition duration-300 text-sm sm:text-base"
                >
                  Ver más noticias
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-3 bg-black/40 p-3 rounded-full backdrop-blur-md">
        {featuredNews.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white scale-125 shadow-lg"
                : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>

    {/* Flecha izquierda */}
<button
  onClick={() =>
    setCurrentSlide(
      currentSlide === 0 ? featuredNews.length - 1 : currentSlide - 1
    )
  }
  className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-20 
             p-3 sm:p-4 rounded-full bg-black/40 hover:bg-black/70 
             text-white transition-all duration-300 backdrop-blur-sm 
             focus:outline-none focus:ring-2 focus:ring-white/70"
>
  <i className="ri-arrow-left-line text-lg sm:text-2xl"></i>
</button>

{/* Flecha derecha */}
<button
  onClick={() =>
    setCurrentSlide((currentSlide + 1) % featuredNews.length)
  }
  className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-20 
             p-3 sm:p-4 rounded-full bg-black/40 hover:bg-black/70 
             text-white transition-all duration-300 backdrop-blur-sm 
             focus:outline-none focus:ring-2 focus:ring-white/70"
>
  <i className="ri-arrow-right-line text-lg sm:text-2xl"></i>
</button>

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
  onClick={() => setNewsFilter('actualidad')}
  className={`px-6 md:px-8 py-3 md:py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer whitespace-nowrap font-semibold text-sm md:text-base ${
    newsFilter === 'actualidad' 
      ? 'bg-gradient-to-r from-red-600 to-red-500 text-white border border-red-400/20' 
      : 'text-gray-700 border-2 border-gray-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50'
  }`}
>
  Actualidad
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
    onClick={() => setNewsFilter('entrevistas')}
    className={`px-6 md:px-8 py-3 md:py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer whitespace-nowrap font-semibold text-sm md:text-base ${
      newsFilter === 'entrevistas' 
        ? 'bg-gradient-to-r from-red-600 to-red-500 text-white border border-red-400/20' 
        : 'text-gray-700 border-2 border-gray-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50'
    }`}
  >
    Entrevistas
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
{getFilteredNews()
  .slice(0, visibleNewsCount)
  .map((news, index) => (
    <React.Fragment key={news.id}>
      <article
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
          <span className="text-gray-500 text-sm">{formatExactDate(news.date)}</span>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300 leading-tight tracking-tight">
            {news.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{news.excerpt}</p>
          <button className="text-red-600 hover:text-red-700 font-bold text-sm cursor-pointer whitespace-nowrap flex items-center group">
            Leer más <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform duration-300"></i>
          </button>
        </div>
      </article>
      {(index + 1) % 3 === 0 && <SponsorBanner />}
    </React.Fragment>
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

{/* Social Media */}
<div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-lg border border-gray-700">
  <h3 className="text-xl font-bold mb-6 text-center tracking-tight">Síguenos</h3>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

    {/* Instagram */}
    <a
      href="https://www.instagram.com/portaltendidodigital?igsh=MWZrYWZkN2dnc2dzMg=="
      target="_blank"
      rel="noopener noreferrer"
      className="bg-pink-600 hover:bg-pink-700 p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 cursor-pointer border border-pink-500/20"
    >
      <i className="ri-instagram-fill text-2xl mb-2 block"></i>
      <span className="text-sm font-medium">Instagram</span>
    </a>

    {/* TikTok */}
    <a
      href="https://www.tiktok.com/@portaltendidodigital"
      target="_blank"
      rel="noopener noreferrer"
      className="bg-black hover:bg-gray-900 p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 cursor-pointer border border-gray-700"
    >
      <i className="ri-tiktok-fill text-2xl mb-2 block"></i>
      <span className="text-sm font-medium">TikTok</span>
    </a>

    {/* X (Twitter) */}
    <a
      href="https://x.com/ptendidodigital"
      target="_blank"
      rel="noopener noreferrer"
      className="bg-blue-600 hover:bg-blue-700 p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 cursor-pointer border border-blue-500/20"
    >
      <i className="ri-twitter-x-fill text-2xl mb-2 block"></i>
      <span className="text-sm font-medium">X (Twitter)</span>
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
<footer className="bg-white text-gray-800 relative overflow-hidden border-t border-gray-200 shadow-inner">
  <div className="absolute inset-0 bg-gradient-to-r from-red-50/30 to-yellow-50/30"></div>
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="md:col-span-2">
        <div
          onClick={() => {
            setIsNewsModalOpen(false);
            setSelectedNews(null);
            document.body.style.overflow = "auto";
            document.body.style.position = "";
            document.body.style.width = "";
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center cursor-pointer group"
        >
          <img
            src="/images/tendidodigitallogosimple.png"
            alt="Tendido Digital"
            className="h-12 w-auto opacity-90 group-hover:opacity-100 transition-transform duration-300 group-hover:scale-105"
          />
          <span className="ml-3 text-lg font-bold bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent group-hover:brightness-125">
            TENDIDO DIGITAL
          </span>
        </div>

        <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
          Portal taurino de referencia en España. Noticias, crónicas, entrevistas y toda la actualidad del mundo del toro con rigor periodístico y pasión por la tradición.
        </p>

        {/* Social icons */}
<div className="flex space-x-4">
  {[
    {
      key: 'instagram',
      url: 'https://www.instagram.com/portaltendidodigital?igsh=MWZrYWZkN2dnc2dzMg==',
      icon: 'ri-instagram-fill',
      color: 'hover:text-pink-400'
    },
    {
      key: 'tiktok',
      url: 'https://www.tiktok.com/@portaltendidodigital',
      icon: 'ri-tiktok-fill',
      color: 'hover:text-gray-100'
    },
    {
      key: 'x',
      url: 'https://x.com/ptendidodigital',
      icon: 'ri-twitter-x-fill',
      color: 'hover:text-blue-400'
    }
  ].map((social) => (
    <a
      key={social.key}
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.key}
      className={`text-gray-400 ${social.color} transition-all duration-300 transform hover:scale-125 cursor-pointer p-2 rounded-full hover:bg-gray-800 flex items-center justify-center`}
    >
      <i className={`${social.icon} text-[1.6rem]`} />
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
}

return (
<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
{/* Header */}
<header className={`bg-white/98 backdrop-blur-md shadow-lg sticky top-0 z-50 transition-all duration-300 border-b border-gray-100 ${scrollY > 50 ? 'shadow-xl bg-white' : ''}`}>
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between items-center h-16 md:h-20">
<div className="flex items-center group">
<div className="relative">
<img
  src="/images/tendidodigitallogosimple.png"
  alt="Tendido Digital"
  className="h-12 w-auto opacity-100 brightness-100 transition-transform duration-300 group-hover:scale-105"
  style={{ mixBlendMode: "multiply" }}
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
  onClick={() => { setActiveTab('inicio'); setNewsFilter('todas'); scrollToSection('actualidad'); }}
  className={`relative font-semibold transition-all duration-300 cursor-pointer group text-sm lg:text-base tracking-wide ${
    newsFilter === 'todas' ? 'text-red-600' : 'text-gray-900 hover:text-red-600'
  }`}
>
  Todas
  <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-300 ${
    newsFilter === 'todas' ? 'w-full' : 'w-0 group-hover:w-full'
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
  onClick={() => setActiveTab('entrevistas')} 
  className={`relative font-semibold transition-all duration-300 cursor-pointer group text-sm lg:text-base tracking-wide ${
    activeTab === 'entrevistas' ? 'text-red-600' : 'text-gray-900 hover:text-red-600'
  }`}
>
  Entrevistas
  <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-300 ${
    activeTab === 'entrevistas' ? 'w-full' : 'w-0 group-hover:w-full'
  }`}></span>
</button>
          <button 
  onClick={() => { setActiveTab('inicio'); setNewsFilter('opinion'); scrollToSection('actualidad'); }}
  className={`relative font-semibold transition-all duration-300 cursor-pointer group text-sm lg:text-base tracking-wide ${
    newsFilter === 'opinion' ? 'text-red-600' : 'text-gray-900 hover:text-red-600'
  }`}
>
  Opinión
  <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-300 ${
    newsFilter === 'opinion' ? 'w-full' : 'w-0 group-hover:w-full'
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
  onClick={() => { setActiveTab('inicio'); setNewsFilter('todas'); scrollToSection('actualidad'); }} 
  className="block w-full text-left px-4 py-3 text-gray-900 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 cursor-pointer font-medium"
>
  Todas
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
  onClick={() => setActiveTab('entrevistas')} 
  className="block w-full text-left px-4 py-3 text-gray-900 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 cursor-pointer font-medium"
>
  Entrevistas
</button>
          <button 
  onClick={() => { setActiveTab('inicio'); setNewsFilter('opinion'); scrollToSection('actualidad'); }} 
  className="block w-full text-left px-4 py-3 text-gray-900 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 cursor-pointer font-medium"
>
  Opinión
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
  <div
    className="fixed inset-0 bg-white z-50 overflow-y-auto"
    style={{
      overflowX: "hidden",
      overflowY: "auto",
      maxHeight: "100vh",
      WebkitOverflowScrolling: "touch"
    }}
  >
	  {/* TOREROS - SI LA NOTICIA TAMBIÉN LOS TIENE */}
{selectedNews?.torerosRaw && (
  <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 shadow-sm">
    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
      <i className="ri-user-star-line text-red-600 mr-2"></i>
      Resultados
    </h3>

    <div className="space-y-3">
      {selectedNews.torerosRaw
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line, i) => {
          const [nombre, resultado] = line.split(":").map(s => s.trim());
          return (
            <div key={i} className="flex items-start bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="font-bold text-gray-900">{nombre}</p>
                <p className="text-gray-700 text-sm">{resultado}</p>
              </div>
            </div>
          );
        })}
    </div>
  </div>
)}
	  
    {/* Header del modal */}
    <div className="sticky top-0 bg-white backdrop-blur-md z-10 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a
  href="/"
  className="flex items-center group cursor-pointer"
  onClick={() => {
    // Por si estás en un modal, lo cerramos también
    setIsNewsModalOpen(false);
    setSelectedNews(null);
    document.body.style.overflow = "auto";
    document.body.style.position = "";
    document.body.style.width = "";
  }}
>
  <img
    src="/images/tendidodigitallogosimple.png"
    alt="Tendido Digital"
    className="h-12 w-auto opacity-80 group-hover:opacity-100 transition-transform duration-300 group-hover:scale-110"
  />
  <span className="ml-3 text-lg font-bold bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent group-hover:brightness-125">
    TENDIDO DIGITAL
  </span>
</a>
        </div>
      </div>
    </div>

    {/* Imagen principal */}
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
      <div className="flex flex-col items-center">
        <img
          src={selectedNews.image}
          alt={selectedNews.title}
          className="w-full h-auto rounded-md"
        />
        {selectedNews.imageCaption && (
          <p className="text-gray-500 text-xs italic text-right w-full mt-1">
            {selectedNews.imageCaption}
          </p>
        )}
      </div>
    </div>

    {/* Contenido del artículo */}
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {selectedNews.showAuthorHeader ? (
  <div className="flex items-center mb-8 space-x-3">
    {selectedNews.authorLogo && (
      <img
        src={selectedNews.authorLogo}
        alt={selectedNews.author}
        className="h-8 w-8 rounded-full object-cover"
      />
    )}
    <p className="text-gray-500 text-sm flex items-center flex-wrap">
      <span className="mr-1">por</span>
      <span className="text-red-600 font-bold mr-2">
        {selectedNews.author || "Tendido Digital"}
      </span>
      <span className="text-gray-400">— {selectedNews.date}</span>
    </p>
  </div>
) : (
  // Por si no se activa showAuthorHeader, se mantiene el pequeño bloque original con la fecha
  <div className="flex items-center mb-6">
    <span className="text-gray-500 text-sm font-medium">{selectedNews.date}</span>
  </div>
)}
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
          {selectedNews.title}
        </h1>

        {selectedNews.excerpt && (
          <p className="text-xl text-gray-600 leading-relaxed mb-12 font-medium">
            {selectedNews.excerpt}
          </p>
        )}
{/* Contenido de la crónica o noticia */}
{selectedNews.category === "Crónicas" ? (
  <>
    {/* Datos principales */}
    <div className="bg-gray-50 rounded-xl p-6 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
        <p>
          <span className="font-semibold text-gray-900">Plaza: </span>
          <span className="text-gray-800">{selectedNews.plaza || "No especificada"}</span>
        </p>
        <p>
          <span className="font-semibold text-gray-900">Ganadería: </span>
          <span className="text-red-600 font-semibold">{selectedNews.ganaderia || "No indicada"}</span>
        </p>
      </div>
    </div>

{/* Resumen o cuerpo (separado en párrafos) */}
<div className="bg-red-50 rounded-xl p-6 border-l-4 border-red-500 mb-10 shadow-sm">
  <h3 className="font-bold text-gray-900 flex items-center mb-3">
    <i className="ri-file-text-line text-red-600 mr-2"></i>
    Resumen de la corrida
  </h3>

{/* Resultados (ahora sí, después del resumen) */}
{(chronicle.toreros || []).length > 0 && (
  <div className="space-y-3 mt-6">
    <h4 className="font-bold text-gray-900 text-lg mb-3 flex items-center">
      <i className="ri-award-line mr-2 text-red-600"></i> Resultados
    </h4>
    {(chronicle.toreros || []).map((torero, index) => (
      <div key={index} className="flex items-start bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
        <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-lg mb-1">{torero}</p>
          <p className="text-gray-700 text-sm">{chronicle.resultado?.[index] || ""}</p>
        </div>
      </div>
    ))}
  </div>
)}

  {/* Cuerpo separado en párrafos y con **bold** convertido */}
  <div className="text-gray-700 text-lg leading-relaxed">
    {renderArticleContent(
      // si hay fullContent lo usamos, si no usamos excerpt o detalles
      (selectedNews.fullContent || selectedNews.excerpt || selectedNews.detalles || "")
        .replace ? (selectedNews.fullContent || selectedNews.excerpt || selectedNews.detalles || "").replace(/(\*{1,2})(.*?)\1/g, "**$2**") : (selectedNews.fullContent || selectedNews.excerpt || selectedNews.detalles || "")
    )}
  </div>
</div>

  </>
) : (
  /* Formato normal para noticias */
  <div className="prose prose-xl max-w-none">
    <div
      className={`text-gray-700 leading-relaxed text-lg space-y-4 ${
        selectedNews.boldContent ? "font-bold" : ""
      }`}
    >
{renderArticleContent(selectedNews.fullContent)}
    </div>
  </div>
)}
		  
        {/* Imágenes finales tipo portada */}
<div className="mt-12 space-y-10 flex flex-col items-center">
  {selectedNews.footerImage1 && (
    <div className="flex flex-col items-center">
      <img
        src={selectedNews.footerImage1}
        alt={selectedNews.footerImage1Caption || selectedNews.title}
        className="w-full max-w-4xl rounded-md"
      />
      {selectedNews.footerImage1Caption && (
        <p className="text-gray-500 text-xs italic text-right w-full mt-1 max-w-4xl">
          {selectedNews.footerImage1Caption}
        </p>
      )}
    </div>
  )}

  {selectedNews.footerImage2 && (
    <div className="flex flex-col items-center">
      <img
        src={selectedNews.footerImage2}
        alt={selectedNews.footerImage2Caption || selectedNews.title}
        className="w-full max-w-4xl rounded-md"
      />
      {selectedNews.footerImage2Caption && (
        <p className="text-gray-500 text-xs italic text-right w-full mt-1 max-w-4xl">
          {selectedNews.footerImage2Caption}
        </p>
      )}
    </div>
  )}

	  {selectedNews.footerImage3 && (
    <div className="flex flex-col items-center">
      <img
        src={selectedNews.footerImage3}
        alt={selectedNews.footerImage3Caption || selectedNews.title}
        className="w-full max-w-4xl rounded-md"
      />
      {selectedNews.footerImage3Caption && (
        <p className="text-gray-500 text-xs italic text-right w-full mt-1 max-w-4xl">
          {selectedNews.footerImage3Caption}
        </p>
      )}
    </div>
  )}

	  {selectedNews.footerImage4 && (
    <div className="flex flex-col items-center">
      <img
        src={selectedNews.footerImage4}
        alt={selectedNews.footerImage4Caption || selectedNews.title}
        className="w-full max-w-4xl rounded-md"
      />
      {selectedNews.footerImage4Caption && (
        <p className="text-gray-500 text-xs italic text-right w-full mt-1 max-w-4xl">
          {selectedNews.footerImage4Caption}
        </p>
      )}
    </div>
  )}
</div>
		  
        {/* Acciones del artículo */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between mt-4">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => toggleSave(selectedNews.id)}
              className={`flex items-center space-x-2 transition-all duration-300 p-3 rounded-full ${
                savedPosts.has(selectedNews.id)
                  ? "text-yellow-600 bg-yellow-50"
                  : "text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
              }`}
            >
              <i className={`${savedPosts.has(selectedNews.id) ? "ri-bookmark-fill" : "ri-bookmark-line"} text-xl`}></i>
              <span className="font-medium hidden sm:block">
                {savedPosts.has(selectedNews.id) ? "Guardado" : "Guardar"}
              </span>
            </button>

            <button
              onClick={() => openShareModal(selectedNews)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 p-3 rounded-full hover:bg-blue-50"
            >
              <i className="ri-share-line text-xl"></i>
              <span className="font-medium hidden sm:block">Compartir</span>
            </button>
          </div>

          <div className="w-full sm:w-auto text-center">
            <button
  onClick={closeNewsModal}
  className="text-gray-800 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition-all duration-300"
  aria-label="Cerrar modal"
>
  <i className="ri-close-line text-2xl"></i>
</button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* Modal de Crónica - Pantalla Completa */}
{isChronicleModalOpen && selectedChronicle && (
 <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
    <div className="min-h-screen">
		{/* TOREROS + RESULTADOS (solo crónicas) */}
{selectedChronicle?.torerosRaw && (
  <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 shadow-sm">
    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
      <i className="ri-user-star-line text-red-600 mr-2"></i>
      Resultados
    </h3>

    <div className="space-y-3">
      {selectedChronicle.torerosRaw
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line, i) => {
          const [nombre, resultado] = line.split(":").map(s => s.trim());
          return (
            <div
              key={i}
              className="flex items-start bg-red-50 border border-red-200 p-4 rounded-lg"
            >
              <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="font-bold text-gray-900">{nombre}</p>
                <p className="text-gray-700 text-sm">{resultado}</p>
              </div>
            </div>
          );
        })}
    </div>
  </div>
)}
		
      {/* Header */}
      <div className="sticky top-0 bg-white backdrop-blur-md z-10 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="/images/tendidodigitallogosimple.png"
                alt="Tendido Digital"
                className="h-12 w-auto opacity-60 hover:opacity-100 transition-all duration-300 group-hover:scale-110 filter brightness-125"
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

      {/* Contenido */}
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
		  <div className="text-gray-700">
		  {renderArticleContent(selectedChronicle.fullContent || selectedChronicle.detalles)}
		  </div>
		  </div>
	
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => toggleSave(selectedChronicle.id)}
                className={`flex items-center space-x-2 transition-all duration-300 p-3 rounded-full ${
                  savedPosts.has(selectedChronicle.id)
                    ? "text-yellow-600 bg-yellow-50"
                    : "text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
                }`}
                aria-label={savedPosts.has(selectedChronicle.id) ? "Quitar de guardados" : "Guardar crónica"}
              >
                <i className={`${savedPosts.has(selectedChronicle.id) ? "ri-bookmark-fill" : "ri-bookmark-line"} text-xl`}></i>
                <span className="font-medium">
                  {savedPosts.has(selectedChronicle.id) ? "Guardado" : "Guardar"}
                </span>
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
        <button onClick={shareToWhatsApp} className="w-full flex items-center justify-center space-x-3 bg-green-500 hover:bg-green-600 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-105">
          <i className="ri-whatsapp-line text-xl"></i>
          <span className="font-medium">Compartir en WhatsApp</span>
        </button>

        <button onClick={shareToTwitter} className="w-full flex items-center justify-center space-x-3 bg-sky-500 hover:bg-sky-600 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-105">
          <i className="ri-twitter-fill text-xl"></i>
          <span className="font-medium">Compartir en Twitter</span>
        </button>

        <button onClick={shareToFacebook} className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-105">
          <i className="ri-facebook-fill text-xl"></i>
          <span className="font-medium">Compartir en Facebook</span>
        </button>

        <button onClick={copyLink} className="w-full flex items-center justify-center space-x-3 bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-105">
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
