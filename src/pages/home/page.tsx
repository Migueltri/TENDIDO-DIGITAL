import { useState, useEffect } from 'react';

// Interfaces unificadas para evitar duplicados y errores
interface BaseArticle {
  id: number;
  title: string;
  plaza?: string;
  date: string;
  category?: string;
  toreros?: string[];
  ganaderia?: string;
  resultado?: string[];
  image: string;
  imageCaption?: string;
  video?: string;
  resumen?: string;
  detalles?: string;
  fullContent?: string;
  author?: string;
  excerpt?: string;
}
type NewsItem = BaseArticle;
type OpinionArticle = BaseArticle;
type Chronicle = BaseArticle;

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

const featuredNews: NewsItem[] = [
    {
    id: 1000,
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
    id: 1001,
    title: "Andrés Roca Rey y Fernando Roca Rey dan por finalizada su relación de apoderamiento",
    image: "images/andresyfernando.jpg",
    category: "Actualidad",
    date: "22 de Octubre de 2025",
    fullContent: `Ambos crecimos soñando con llegar juntos hasta aquí, y poder hacerlo realidad ha sido una de las mayores satisfacciones de mi vida", señala el torero en un comunicado.

Andrés Roca Rey y su hermano Fernando han dado por finalizada la relación de apoderamiento , cumpliendo así una promesa que se hicieron hace años, toda vez que la temporada europea 2025 ha echado el cierre. 

En un comunicado remitido a esta redacción por parte del equipo de comunicación del torero, señalan que "lo que comenzó como un sueño compartido se convirtió en una experiencia que los ha unido más allá del ruedo y que deja una huella imborrable en la trayectoria del torero".

Roca Rey continuará ahora su temporada americana, con su próxima cita el 2 de noviembre en Lima (Perú), donde estoqueará seis toros en solitario, cumpliendo así otro de los hitos más esperados de su carrera.

"Este año ha tenido un sentido muy especial para mí. Fernando y yo crecimos soñando con llegar juntos hasta aquí, y poder hacerlo realidad ha sido una de las mayores satisfacciones de mi vida. 

Compartir la temporada de mi décimo aniversario con mi hermano fue un regalo que nos debíamos desde hace tiempo. 

Vivimos cada tarde con la ilusión de los comienzos y con la serenidad que da el camino recorrido. Hoy cierro esta etapa con gratitud, con orgullo y con un profundo respeto por todo lo que juntos hemos construido", afirma el torero en el comunicado.`
  },
  {
    id: 1002,
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
    id: 1003,
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
  }
];

const latestNews: NewsItem[] = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
    title: "Tomás González por Miguel Serrano en Viraco",
    image: "images/tomasgonzalez1.jpg",
    category: "Actualidad",
    date: "21 de Octubre de 2025",
    fullContent: `El alcorisano Tomás González será el encargado de sustituir a Miguel Serrano en la Feria en Honor a Santa Úrsula en Viraco (Perú).

Tomás González hará el paseíllo en el coso peruano el próximo jueves 23 de Octubre junto a los mexicanos César Ruiz y Joaquín Caro , lidiando un encierro de diferentes ganaderías.`
  },
  {
    id: 5,
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
    id: 6,
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
    id: 10,
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
    id: 11,
    title: "Mario Vilau se alza como triunfador de la Liga Nacional de Novilladas",
    image: "images/mariovilau.jpg",
    category: "Actualidad",
    date: "20 de Octubre de 2025",
    excerpt: "El catalán conquista la final con “Guardes” de Fuente Ymbro, logrando dos orejas, rabo y la vuelta al ruedo del novillo",
    fullContent: `Sanlúcar de Barrameda fue escenario de la Final de la Liga Nacional de Novilladas 2025, donde el catalán Mario Vilau, natural de L’Hospitalet de Llobregat (Barcelona), se proclamó ganador de la competición gracias a una actuación magistral frente al novillo “Guardes”, de Fuente Ymbro, que fue premiado con la vuelta al ruedo.

A la puerta de chiqueros, Vilau recibió al cuarto novillo, salvando el trance con autoridad antes de un gran saludo a la verónica de rodillas, templando y vaciando la embestida del de Fuente Ymbro. En los medios, y de rodillas nuevamente, comenzó su actuación aprovechando la noble y cadenciosa embestida del animal para construir la mejor faena de la tarde. Al natural, la faena subió un tono, logrando varias tandas de muchísima suavidad. La cumbre de la actuación llegó con unas milimétricas bernadinas. A pesar de que el público pidió el indulto, Vilau entró a matar, dejando una gran estocada a la segunda, logrando dos orejas y rabo y la vuelta al ruedo del novillo.

La ovación del público cerró una final que será recordada por la calidad del novillo y la actuación del novillero catalán, coronándolo como ganador de la Liga Nacional de Novilladas 2025.`
  },
  {
    id: 12,
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
    id: 13,
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
    id: 14,
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
    id: 200,
    title: "Francisco de Manuel y Diego Robles ponen fin a su relación de apoderamiento",
    image: "images/franciscoydiego.jpg",
    category: "Actualidad",
    date: "18 de Octubre de 2025",
    fullContent: `El diestro madrileño Francisco de Manuel y su hasta ahora apoderado, Diego Robles, han decidido dar por finalizada, de mutuo acuerdo, la relación de apoderamiento que les ha unido durante las tres últimas temporadas.

La ruptura se ha producido en términos cordiales, con el mayor respeto y reconocimiento mutuo. Tanto el torero como su apoderado han expresado su agradecimiento por la confianza compartida, la colaboración mantenida y las experiencias vividas durante esta etapa conjunta, que ambos valoran como un periodo de importante crecimiento profesional y personal.

Francisco de Manuel y Diego Robles se desean recíprocamente el mayor de los éxitos en sus respectivos proyectos futuros.`
  },
  {
    id: 201,
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
    id: 202,
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
    id: 203,
    title: "Entrevista a Carlos Zúñiga: “Soy una persona ambiciosa y la vida me ha enseñado a saber esperar”",
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
    id: 204,
    title: "Antonio Chacón queda libre tras salir de la cuadrilla de Roca Rey",
    image: "images/antoniochacon.jpg",
    category: "Actualidad",
    date: "17 de Octubre de 2025",
    fullContent: `Uno de los banderilleros más destacados de las últimas temporadas, Antonio Chacón, ha quedado sorpresivamente libre tras su salida de la cuadrilla del matador peruano Andrés Roca Rey.

El propio Chacón ha confirmado de forma oficial que, por el momento, no tiene compromisos de cara a la temporada 2026.

Durante la presente campaña, Chacón ha estado a las órdenes del torero limeño, desempeñando un papel clave en su equipo. 

Esta noticia se suma a los movimientos que comienzan a producirse en las cuadrillas con vistas a la próxima temporada, algunos de ellos, como este, totalmente inesperados.`
  },
  {
    id: 205,
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

Con estas despedidas, la temporada 2025 pasará a la historia como un punto de inflexión, no solo por el adiós de grandes nombres, sino también por el reflejo de una generación que cierra su ciclo, dejando paso a nuevos valores que habrán de tomar el testigo en los años venideros.`
  },
  {
    id: 206,
    title: "Sergio Sánchez rompe con su hasta ahora apoderado Jacinto Ortiz",
    image: "images/sergiosanchez.jpg",
    category: "Actualidad",
    date: "16 de Octubre de 2025",
    fullContent: `El novillero con picadores Sergio Sánchez y su hasta ahora apoderado Jacinto Ortiz han decidido, de mutuo acuerdo, dar por finalizada la relación de apoderamiento que comenzaron al inicio de la temporada 2025.

Durante esta campaña, Sergio Sánchez ha tenido una destacada actuación en plazas de gran relevancia, entre las que destaca su paso por la plaza de toros de Las Ventas, donde ha hecho el paseíllo en tres ocasiones. Asimismo, ha actuado en otros cosos de primera categoría como Bilbao, Olivenza, Almería, así como en diversas ferias de importancia del circuito taurino nacional.

Ambas partes han querido expresarse públicamente el agradecimiento mutuo y los mejores deseos para sus respectivas trayectorias profesionales.`
  },
  {
    id: 207,
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
    id: 208,
    title: "Emilio de Justo, dos cambios en su cuadrilla para 2026",
    image: "images/emiliodejusto.jpg",
    category: "Actualidad",
    date: "15 de Octubre de 2025",
    excerpt: "De BMF toros",
    fullContent: `El matador de toros extremeño **Emilio de Justo** afrontará la próxima temporada con cambios significativos en su cuadrilla. Tras una larga trayectoria junto al diestro, el picador *Germán González* pone fin a una etapa de nueve años de colaboración, mientras que el banderillero *Morenito de Arlés* también se desvincula del equipo tras siete temporadas de trabajo conjunto.

Ambos profesionales quedarán, por el momento, libres para la temporada 2026.

Cabe recordar que Emilio de Justo ha dado por concluida su campaña 2025 luego de sufrir la fractura de dos costillas en el costado izquierdo, consecuencia de una cogida en la Plaza de Toros de Las Ventas, en Madrid.

Pese a este desafortunado incidente, el torero ha sido uno de los grandes triunfadores de la temporada, cosechando importantes éxitos en distintas plazas de España y Francia.`,
  },
 {
    id: 209,
    title: "Jorge Martínez y Ruiz Manuel rompen la relación de apoderamiento",
    image: "images/bmftoros.jpg",
    category: "Actualidad",
    date: "15 de Octubre de 2025",
    fullContent: `El matador de toros Jorge Martínez y su apoderado Ruiz Manuel han decidido dar por finalizada su relación profesional de apoderamiento. Ambos han coincidido en destacar que la ruptura se ha producido de manera totalmente amistosa y en los mejores términos.

Natural de la localidad murciana de Totana, Jorge Martínez ha desarrollado la mayor parte de su carrera en Almería, bajo la dirección de Ruiz Manuel. Debutó con picadores en Galapagar (Jaén) y tomó la alternativa en la Plaza de Toros de Almería en el año 2023, confirmando su doctorado en Madrid al año siguiente. Su vínculo profesional se remonta a 2021, año en que iniciaron este proyecto conjunto.`,
  },
     {
    id: 210,
    title: "Román y Eduardo Martínez ponen fin a su relación de apoderamiento",
    image: "images/romanyedu.jpg",
    category: "Actualidad",
    date: "15 de Octubre de 2025",
    fullContent: `El matador de toros Román y su hasta ahora apoderado, Eduardo Martínez, han decidido poner fin, de mutuo acuerdo, a la relación profesional que les ha vinculado durante esta etapa.

La decisión se ha tomado en un clima de cordialidad, con absoluto respeto y reconocimiento mutuo tanto en lo personal como en lo profesional. Ambas partes agradecen sinceramente el trabajo compartido, la confianza depositada y los logros alcanzados a lo largo del camino recorrido juntos.

Román y Eduardo se desean el mayor de los éxitos en sus respectivos proyectos futuros, manteniendo intacto el respeto y la cordialidad.`,
  },
     {
    id: 211,
    title: "David Galván reaparecerá este sábado en Jaén tras su percance en Las Ventas",
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
    id: 212,
    title: "Morante de la Puebla; El adiós a una sublime carrera",
    image: "images/moranteretirada.jpg",
    category: "Actualidad",
    date: "12 de Octubre de 2025",
    excerpt: "Morante de la Puebla se corta la coleta en Madrid tras una faena para la historia",
    fullContent: `Morante de la Puebla, con las dos orejas en las manos y una faena para el recuerdo , anuncio su adios de los ruedos en el centro de Las Ventas de Madrid , cortandose la coleta por sorpresa.

El torero Sevillano de La Puebla del Rio , finalizando una temporada que quedara en las memorias de muchos aficionados , firmo asi una de las escenas mas emotivas que se recuerdan en el coso venteño.

Los tendidos , puestos en pie rompieron de forma unanime clamor de "torero torero".
Una despedida a la altura del mito que ha marcado este torero.`,
  },
  {
    id: 213,
    title: "Florito el mayoral de Las Ventas dice adiós: El adiós a una leyenda de los corrales",
    image: "images/florito.jpg",
    category: "Actualidad",
    date: "14 de Octubre de 2025",
    fullContent: `El 12 de Octubre quedará grabado en la memoria taurina no solo por lo sucedido en el ruedo, sino también por lo ocurrido en los corrales. Aquel día, mientras la emoción inundaba la plaza de Madrid, Florencio Fernández Castillo, ‘Florito’, ponía fin a casi cuatro décadas de dedicación como mayoral de Las Ventas, cerrando una etapa importante. 

Nacido en la plaza de toros de Talavera de la Reina, donde su padre trabajaba como conserje, Florito vivió el toro desde la cuna. Fue novillero en su juventud con el apodo de “El Niño de la Plaza”, hasta que en 1981 decidió abandonar los ruedos. En febrero de 1986.

Condecorado en 2012 con la Cruz de la Orden del 2 de Mayo de la Comunidad de Madrid, Florito deja tras de sí un legado de profesionalidad y cariño hacia el toro y la afición. Ahora, el testigo pasa a su hijo Álvaro Fernández, ingeniero aeroespacial, quien decidió dejar lo que estudiaba será el que asumirá el cargo de mayoral del coso venteño, aunque sin desempeñar la función de veedor que también ejercía su padre.

Una nueva etapa comienza en Las Ventas, pero el nombre de Florito quedará grabado para siempre entre los aficionados.`
  },
    {
id: 214,
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
    id: 400,
    title: "",
    plaza: "",
    date: "",
    toreros: ["", "", ""],
    ganaderia: "",
    resultado: ["", "", ""],
    image: "",
    video: "",
    detalles: ``,
    fullContent: "",
    excerpt: ""
  }
];

  // Entrevistas taurinas
const entrevistas: NewsItem[] = [
    {
    id: 500,
    title: "Entrevista a Carlos Zúñiga: “Soy una persona ambiciosa y la vida me ha enseñado a saber esperar”",
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
      }
    } catch (error) {
      console.error("Error decodificando parámetro p:", error);
    }
  }
}, []);
  
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

  if (activeTab === 'entrevistas') {
  const entrevistas = latestNews.filter(item => 
    item.title.toLowerCase().includes('entrevista')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mb-4 tracking-tight">
          Entrevistas
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full mx-auto mb-6"></div>
        <p className="text-gray-600 text-lg">
          Conversaciones exclusivas con protagonistas del mundo taurino
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {entrevistas.length > 0 ? (
          entrevistas.map((news) => (
            <article 
              key={news.id} 
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer group border border-gray-100"
              onClick={() => openNewsModal(news)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-48 object-cover object-top group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg backdrop-blur-sm">
                    {news.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <span className="text-gray-500 text-sm">{news.date}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300">
                  {news.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{news.excerpt}</p>
                <button className="text-red-600 hover:text-red-700 font-bold text-sm cursor-pointer whitespace-nowrap flex items-center group">
                  Leer entrevista
                  <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform duration-300"></i>
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
              <i className="ri-chat-smile-line text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No hay entrevistas disponibles</h3>
              <p className="text-gray-600 mb-6">Pronto publicaremos nuevas entrevistas exclusivas</p>
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
              {/* Header con categoría */}
              <div className="flex items-center justify-between mb-4">
                <span className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm uppercase tracking-wide">
                  {chronicle.plaza?.split('(')[0].trim() || 'Plaza no especificada'}
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
    src={news.image}
    alt={news.title}
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
                  
                  {/* Resultados de los toreros */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 text-lg mb-3">Resultados:</h4>
{(chronicle.toreros || []).map((torero, index) => (
  <div key={index} className="flex items-start bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
    <div className="flex-1">
      <p className="font-bold text-gray-900 text-lg mb-1">{torero}</p>
      <p className="text-gray-700 text-sm">{chronicle.resultado?.[index] || ''}</p>
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
    <section id="inicio" className="relative min-h-[400px] md:min-h-[600px] flex items-center justify-center bg-black overflow-hidden">
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
          className="w-full h-full object-contain bg-black"
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

          {/* Social Media */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-6 text-center tracking-tight">Síguenos</h3>
            <div className="grid grid-cols-1 gap-1">
              <a href="https://www.instagram.com/portaltendidodigital?igsh=MWZrYWZkN2dnc2dzMg==" target="_blank" rel="noopener noreferrer" className="bg-pink-600 hover:bg-pink-700 p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 cursor-pointer border border-pink-500/20">
                <i className="ri-instagram-fill text-2xl mb-2 block"></i>
                <span className="text-sm font-medium">Instagram</span>
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
                src="public/images/tendidodigitallogosimple.jpg" 
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
                { icon: 'ri-instagram-fill', color: 'hover:text-pink-400', url: 'https://www.instagram.com/portaltendidodigital?igsh=MWZrYWZkN2dnc2dzMg==' }
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
<img src="images/tendidodigitallogosimple.jpg" alt="Tendido Digital" className="h-10 md:h-14 w-auto transition-transform duration-300 group-hover:scale-110 drop-shadow-sm" />
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
    <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
      <div className="min-h-screen">
        {/* Header del modal */}
        <div className="sticky top-0 bg-black/90 backdrop-blur-md z-10 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <img 
                  src="public/images/tendidodigitallogosimple.jpg" 
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
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
  <div className="flex flex-col items-center">
    <img
      src={selectedNews.image}
      alt={selectedNews.title}
      className="w-full h-auto rounded-md"
    />

    {/* Pie de foto, estilo Cultoro */}
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
             <div className="text-gray-700 leading-relaxed text-lg space-y-4">
  {selectedNews.fullContent
    ?.split("\n\n") // divide el texto en párrafos usando doble salto de línea
    .map((paragraph, i) => (
      <p
        key={i}
        className="whitespace-pre-line"
dangerouslySetInnerHTML={{
  __html: paragraph
    // Convierte *texto* o **texto** en <strong>texto</strong>
    .replace(/(\*{1,2})(.*?)\1/g, '<strong>$2</strong>')
    .trim(),
}}
      />
    ))}
</div>
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
                  src="public/images/tendidodigitallogosimple.jpg" 
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
