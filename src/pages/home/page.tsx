import { useState, useEffect } from 'react';
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
  footerImage1?: string;
  footerImage1Caption?: string;
  footerImage2?: string;
  footerImage2Caption?: string;
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

const featuredNews: NewsItem[] = [
	{ 
    id: 1000,
       title: "“Considero que soy un torero que tiene personalidad” - Entrevista con Sergio Rodríguez",
    image: "/images/sergior.jpg",
	imageCaption: "Sergio Rodríguez en la Final de la Copa Chenel",
	footerImage1: "/images/sergior1.jpg",
	footerImage1Caption: "Sergio Rodríguez el pasado 12 de Octubre en Las Ventas - Foto Plaza 1",
	footerImage2: "/images/sergior2.jpg",
    category: "Entrevistas",
    date: "24 de noviembre de 2025",
    fullContent: `**A las puertas de una nueva campaña taurina, Sergio Rodríguez encara uno de los momentos más determinantes de su carrera**. El matador abulense, que en apenas unos años ha pasado de promesa a nombre imprescindible del escalafón joven, vive un proceso de madurez profesional que ilusiona tanto al aficionado. 

Tras una temporada marcada por la regularidad, triunfos de peso y tardes en las que dejó constancia de su personalidad en la plaza, Sergio ha logrado posicionarse como uno de los toreros con mayor proyección del momento. Su concepto clásico, su valor sereno y una ambición cada vez más evidente lo convierten en un perfil que despierta interés.

¿Qué significó para ti proclamarte triunfador de la Copa Chenel 2025 y cómo crees que ese triunfo puede cambiar tu carrera?

“Bueno, pues aparte de la satisfacción que a uno le da triunfar y ganar, certámenes 
 tan importantes como puede ser la Copa Chenel, fue un poco la recompensa a muchos meses de entrenamiento, de disciplina, de entrega.
Entonces, pues bueno, significó mucho, tanto como parami torero como para la persona que soy.
Fue un antes y un después, sin duda.
Y bueno, pues espero que el año que viene me den un poco las oportunidades que este año no se me han dado y creo que merecía por los motivos que había dado en la plaza.
Creo que eso es un poco lo que más puedo esperar de cara al año que viene.”

¿Cómo recuerdas tus primeros pasos en la tauromaquia, empezando desde que tenías 12 años en la escuela taurina de Las Navas del Marqués?

“Pues son recuerdos muy bonitos, todos los recuerdo de una manera muy gratificante y muy feliz.
De hecho, hay muchos que los añoro, hay cosas que ya no van a volver por la inocencia de un niño que empieza, por un montón de cosas que se tienen cuando uno está empezando.
La verdad que las extraño.
Y bueno, fue una etapa muy bonita donde di mis primeros pasos en una escuela de aficionados.
Ni siquiera yo quería ser torero, pero bueno, ahí fue donde me entró ese veneno que decimos los toreros para querer dedicarme ya de una manera profesional al torero.”

¿Cómo definirías tu estilo dentro del ruedo y qué toreros han influido en tu forma de torear?

“Considero que soy un torero que tiene personalidad.
Interpreto el toreo de una manera muy personal.
Es cierto que siempre me he fijado mucho en el maestro José Tomás, en el maestro Morante, en el maestro Rafael de Paula , pero nunca he intentado copiar nada.
Siempre he buscado las cosas que más me han gustado de estos maestros y he intentado trasladarlo a mis formas y a mi concepto.”

	¿Qué te gustaría que la afición recordara de ti dentro de unos años?

“Bueno, pues me gustaría que me recordasen como un torero de época, un torero especial, con un concepto propio del toreo.
Y me encantaría intentar marcar la época en el torero y sobre todo ser torero de torero.
Creo que es lo más grande que hay y creo que es la mejor forma que se le pueda recordar a un torero, siendo torero de torero.”

¿Cómo planteas la temporada que viene después de los triunfos logrados este año?

“Pues la verdad que, bueno, la temporada del año que viene es un poco incógnita, no sé muy bien el que puede pararme, pero sí tengo claro lo que yo quiero y lo que me encantaría conseguir, por supuesto.
Me encantaría volver a Madrid, me encantaría que la afición de Madrid me viese como yo soy, aprovechar esa oportunidad que ahora mismo tanto necesito para hacerme un hueco dentro del escalafón.”

¿Como afrontas tu compromiso en Perú , donde este próximo mes de diciembre torearás allí?

“Bueno, pues la verdad que el compromiso de Perú lo afrontó con mucha ilusión.
Al final ha sido una inyección de moral.
Cuando uno tiende un poquito a relajarse una vez terminada la temporada, pues que le llamen para viajar a uno de los países que más en auge está en la actualidad en el mundo del toro, pues es muy bonito y también me viene la responsabilidad.
Quiero aprovechar esa oportunidad que se me ha brindado, que creo que es muy buena.
Y nada, pues me encanta conocer nuevos países, nuevas costumbres y sobre todo que conozca mi toreo en otros rincones del mundo.”`
  }
];

const latestNews: NewsItem[] = [
  	{ 
    id: 1,
       title: "“Considero que soy un torero que tiene personalidad” - Entrevista con Sergio Rodríguez",
    image: "/images/sergior.jpg",
	imageCaption: "Sergio Rodríguez en la Final de la Copa Chenel",
	footerImage1: "/images/sergior1.jpg",
	footerImage1Caption: "Sergio Rodríguez el pasado 12 de Octubre en Las Ventas - Foto Plaza 1",
	footerImage2: "/images/sergior2.jpg",
    category: "Entrevistas",
    date: "24 de noviembre de 2025",
    fullContent: `**A las puertas de una nueva campaña taurina, Sergio Rodríguez encara uno de los momentos más determinantes de su carrera**. El matador abulense, que en apenas unos años ha pasado de promesa a nombre imprescindible del escalafón joven, vive un proceso de madurez profesional que ilusiona tanto al aficionado. 

Tras una temporada marcada por la regularidad, triunfos de peso y tardes en las que dejó constancia de su personalidad en la plaza, Sergio ha logrado posicionarse como uno de los toreros con mayor proyección del momento. Su concepto clásico, su valor sereno y una ambición cada vez más evidente lo convierten en un perfil que despierta interés.

¿Qué significó para ti proclamarte triunfador de la Copa Chenel 2025 y cómo crees que ese triunfo puede cambiar tu carrera?

“Bueno, pues aparte de la satisfacción que a uno le da triunfar y ganar, certámenes 
 tan importantes como puede ser la Copa Chenel, fue un poco la recompensa a muchos meses de entrenamiento, de disciplina, de entrega.
Entonces, pues bueno, significó mucho, tanto como parami torero como para la persona que soy.
Fue un antes y un después, sin duda.
Y bueno, pues espero que el año que viene me den un poco las oportunidades que este año no se me han dado y creo que merecía por los motivos que había dado en la plaza.
Creo que eso es un poco lo que más puedo esperar de cara al año que viene.”

¿Cómo recuerdas tus primeros pasos en la tauromaquia, empezando desde que tenías 12 años en la escuela taurina de Las Navas del Marqués?

“Pues son recuerdos muy bonitos, todos los recuerdo de una manera muy gratificante y muy feliz.
De hecho, hay muchos que los añoro, hay cosas que ya no van a volver por la inocencia de un niño que empieza, por un montón de cosas que se tienen cuando uno está empezando.
La verdad que las extraño.
Y bueno, fue una etapa muy bonita donde di mis primeros pasos en una escuela de aficionados.
Ni siquiera yo quería ser torero, pero bueno, ahí fue donde me entró ese veneno que decimos los toreros para querer dedicarme ya de una manera profesional al torero.”

¿Cómo definirías tu estilo dentro del ruedo y qué toreros han influido en tu forma de torear?

“Considero que soy un torero que tiene personalidad.
Interpreto el toreo de una manera muy personal.
Es cierto que siempre me he fijado mucho en el maestro José Tomás, en el maestro Morante, en el maestro Rafael de Paula , pero nunca he intentado copiar nada.
Siempre he buscado las cosas que más me han gustado de estos maestros y he intentado trasladarlo a mis formas y a mi concepto.”

	¿Qué te gustaría que la afición recordara de ti dentro de unos años?

“Bueno, pues me gustaría que me recordasen como un torero de época, un torero especial, con un concepto propio del toreo.
Y me encantaría intentar marcar la época en el torero y sobre todo ser torero de torero.
Creo que es lo más grande que hay y creo que es la mejor forma que se le pueda recordar a un torero, siendo torero de torero.”

¿Cómo planteas la temporada que viene después de los triunfos logrados este año?

“Pues la verdad que, bueno, la temporada del año que viene es un poco incógnita, no sé muy bien el que puede pararme, pero sí tengo claro lo que yo quiero y lo que me encantaría conseguir, por supuesto.
Me encantaría volver a Madrid, me encantaría que la afición de Madrid me viese como yo soy, aprovechar esa oportunidad que ahora mismo tanto necesito para hacerme un hueco dentro del escalafón.”

¿Como afrontas tu compromiso en Perú , donde este próximo mes de diciembre torearás allí?

“Bueno, pues la verdad que el compromiso de Perú lo afrontó con mucha ilusión.
Al final ha sido una inyección de moral.
Cuando uno tiende un poquito a relajarse una vez terminada la temporada, pues que le llamen para viajar a uno de los países que más en auge está en la actualidad en el mundo del toro, pues es muy bonito y también me viene la responsabilidad.
Quiero aprovechar esa oportunidad que se me ha brindado, que creo que es muy buena.
Y nada, pues me encanta conocer nuevos países, nuevas costumbres y sobre todo que conozca mi toreo en otros rincones del mundo.”`
  },
	{ 
    id: 2,
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
    id: 3,
       title: "Borja Jiménez , Víctor Hernández , Fortes , Aaron Palacio , Jandilla… Premiados por el Real Casino de Madrid",
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
    id: 4,
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
    id: 5,
       title: "Rafael de Julia reaparecerá en 2026",
    image: "/images/rafael1.jpg",
	footerImage: "/images/rafael2.jpg",
	footerImageCaption: "Foto de Luis Miguel Sierra",
    category: "Actualidad",
    date: "22 de noviembre de 2025",
    fullContent: `Rafael de Julia ha confirmado en una entrevista a MundoToro que volverá a los ruedos en la temporada 2026, un año después de aquella tarde de marzo en Madrid que supuso un antes y un después en su carrera y en su vida. Lo que entonces pocos podían imaginar es que detrás de aquel bajón en su rendimiento se escondía una enfermedad silenciosa —la anorexia nerviosa— que fue debilitando, día a día, su cuerpo y su mente hasta obligarle a detenerse. Nueve meses más tarde, el torero madrileño ha vuelto a realizar tentaderos y asegura sentirse “fuerte y capaz delante de los animales”, un avance que él mismo valora como especialmente significativo en su recuperación.

En su conversación con MundoToro, De Julia reconoce que este periodo ha sido extremadamente complejo. Habla de “momentos de todo tipo”, de semanas especialmente duras, pero también del impulso que le ha supuesto marcar una fecha para su reaparición. Su regreso al campo, admite, ha superado sus propias expectativas: tras tantos meses sin poder entrenar con normalidad, ha vuelto a experimentar sensaciones que creía haber perdido. “De unas semanas a esta parte todo ha mejorado”, resume.

El matador insiste en que la clave del proceso ha estado en el ámbito psicológico. Define la anorexia como un deterioro profundo, visible en lo físico pero devastador en lo emocional. Explica que este tiempo le ha obligado a conocerse más, a moderar una autoexigencia que, reconoce, le condujo a situaciones límite. Aunque no se considera “curado”, asegura haber encontrado un equilibrio que considera esencial tanto para su día a día como para su forma de torear. Lo expresa con contundencia: le inquietaría más afirmar que está totalmente bien que reconocer que convive con la enfermedad, porque es precisamente esa consciencia la que le permite avanzar sin temor a recaídas.

El relato de De Julia impresiona por su sinceridad. Confiesa que tocó fondo el 23 de marzo, en la corrida de Adolfo Martín en Las Ventas. Aquel día fue un aviso, pero lo más duro llegó después, cuando comprendió que no podía presentarse a la corrida del 2 de mayo. Renunciar a esa fecha —por la que llevaba tiempo luchando para situarse de nuevo en los carteles importantes— fue un golpe especialmente doloroso. Ver tan cerca los puestos altos del escalafón y tener que apartarse por un problema de salud, admite, resulta difícil de asumir. Aun así, mantiene la convicción de que, recuperado, podrá volver a ocupar el espacio que ya tenía ganado.

Con la mirada puesta en 2026, el torero afronta su regreso con una motivación renovada: superar lo vivido y demostrar que es capaz no solo de volver, sino de hacerlo al máximo nivel. Sabe que el paso decisivo será regresar a Madrid y ofrecer a la afición —y también a sí mismo— una imagen distinta, la de un profesional que ha sido capaz de enfrentarse a una situación límite y salir fortalecido. “Devolver a la gente esa ilusión”, concluye, es hoy para él tan importante como cualquier triunfo en el ruedo.`
  },
	{ 
    id: 10,
       title: "Morenito de Aranda y Tito Fernández nueva relación de apoderamiento",
    image: "/images/morenito.jpg",
    category: "Actualidad",
    date: "21 de noviembre de 2025",
    fullContent: `Jesús Martínez ‘Morenito de Aranda’ y Tito Fernández han sellado a través de un apretón de manos una vinculación profesional que parte de la relación personal y humana ya existente entre ellos. En un comunicado emitido a esta redacción, ambos señalan que esta unión ‘nace con el objetivo de fortalecer la carrera del torero arandino, uno de los nombres propios de la temporada 2025 donde ha firmado obras importantes en plazas de primer rango, siendo un torero que goza del respaldo y el crédito de los aficionados’.

Morenito de Aranda toreó 21 corridas de toros en la temporada 2025, cortando 26 orejas. El burgalés destacó en plazas como Madrid, Dax, Bayona, Mont de Marsan, Vic, Burgos o Talavera de la Reina, entre otras.`
  },
	{ 
    id: 15,
       title: "Ginés Marín amplía su equipo de apoderamiento",
    image: "/images/amplia.jpg",
	imageCaption: "Gines Marín con Carlos y Joaquín Domínguez",
    category: "Actualidad",
    date: "20 de noviembre de 2025",
    fullContent: `El matador de toros Ginés Marín amplía su equipo de apoderamiento para la temporada 2026. De esta manera, los empresarios Joaquín Domínguez y Carlos Domínguez se unirán a Álvaro Polo para gestionar la carrera del matador de toros extremeño.

Una temporada, la del 2026, en la que se conmemora el 10º aniversario de la alternativa de Ginés Marín. El extremeño toreó en 2025 17 corridas de toros en las que cortó 28 orejas y un rabo.`
  },
	{ 
    id: 16,
       title: "Abierta la inscripción para la Copa Chenel 2026",
    image: "/images/copachenel.jpg",
	imageCaption: "Sergio Rodríguez actual ganador de la Copa Chenel 2025",
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
    id: 17,
    title: "Lances de Futuro, el impulso joven que sacude los cimientos de la fiesta y renueva el pulso del toreo",
    image: "/images/lances.jpg",
	imageCaption: "Plaza de Toros Santander - Foto Lances de Futuro",
    category: "Opinión",
    date: "19 de noviembre de 2025",
    fullContent: `Lances de Futuro se ha conseguido consolidar como una de las empresas gestoras de plazas más importantes del momento, actualmente, tiene en su propiedad plazas como Torrejón de Ardoz, Córdoba, Cáceres y Santander. Todas ellas, en diferente medida, han marcado la temporada taurina de 2025, como en aquella tarde de David De Miranda con ese toro de Victoriano del Río .

Esta empresa es liderada por el célebre empresario sevillano José María Garzón, que también ejerce su función como apoderado gestionando temporadas a toreros como Juan Ortega con el que tiene una relación profesional ya de tres años. Su propósito principal en estos últimos años ha sido la renovación de sus plazas a través de la imagen de la juventud en todos los ámbitos posibles, en el ámbit  lo o del público, implantó ventajas económicas en el coste de las entradas, como abonos con precios especiales para jóvenes o esos famosos tendidos jóvenes, con la función de intentar atraer ese público joven tan necesitado para la fiesta.

Por otra parte, esta empresa fomenta la introducción de toreros emergentes en sus ferias como los casos de Víctor Hernández en Torrejón o en Málaga. En esta última pudimos contemplar uno de los acontecimientos de la temporada con esa faena valiente de David de Miranda, que le ayudó a abrirse las puertas de nuevo en el mundillo, o la actuación de Jarocho en Santander y Manuel Román en Córdoba, todos ellos acompañados de toreros como Borja Jiménez y Fortes, claros protagonistas de esta temporada. Al fin de al cabo, estos son los toreros que el aficionado solicita en este momento y que se encargarán de dar un paso al frente para la renovación del escalafón en los siguientes años.

Todo esto sumado a el rumor que pone a esta empresa como nueva gestora de la plaza de toros de Sevilla y a la polémica por el concurso en la Malagueta, ya que la diputación no decidió renovar a esta empresa, pese al buen trabajo realizado, y que se rumorea que Simón Casas y Javier Conde podrían estar detrás de ella, pone a Lances de Futuro en boca de todos los aficionados como una empresa interesada por la salud de la fiesta y de el interés del aficionado. Por eso desde aquí les felicitamos y les apelamos a que continúen con el buen trabajo que están realizando.

Mario Ruiz 19/11/2025`
  },
	{ 
    id: 18,
       title: "El banderillero Juan Rojas queda libre para la próxima temporada",
    image: "/images/juanrojas.jpg",
    category: "Actualidad",
    date: "18 de noviembre de 2025",
    fullContent: `El banderillero Juan Rojas ha quedado libre de cara a la próxima temporada taurina. El torero de plata ha salido de las filas del matador gaditano David Galván, a cuyas órdenes ha permanecido durante varias campañas.

Por tanto, Juan Rojas, se encuentra disponible y abre su futuro profesional a nuevas cuadrillas, en búsqueda de un nuevo jefe de filas con el que afrontar la temporada venidera. Rojas encara con ilusión los proyectos que puedan surgir en esta nueva etapa.`
  },
	{ 
    id: 19,
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
    id: 20,
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
    id: 21,
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
    id: 22,
    title: "Escolar, Dolores Aguirre, Reta, Guardiola... las ganaderías de la Feria del Aficionado",
    image: "/images/escolar.jpg",
	imageCaption: "Foto Philippe Gil Mir",
    category: "Actualidad",
    date: "17 de noviembre de 2025",
	excerpt: "La comisión organizadora del serial ha presentado los hierros que estarán presentes en su feria del próximo año, así como la estructura de los festejos",
    fullContent: `El Club Taurino 3 Puyazos ha hecho públicas las ganaderías que conformarán la Feria del Aficionado 2026, un ciclo que volverá a celebrarse en la localidad madrileña de San Agustín del Guadalix y que reunirá a algunos de los hierros más representativos del campo bravo, especialmente del ámbito torista. La feria, integrada por tres festejos, se desarrollará los días 25 y 26 de abril y contará con una novillada con picadores y dos corridas de toros, todas ellas en formato de desafío ganadero.

La programación arrancará el sábado 25, a las 12:00 horas, con utreros de Salvador Guardiola e Isaías y Tulio Vázquez. Ese mismo día, a las 18:30 horas, será el turno de los astados de Prieto de la Cal y Reta de Casta Navarra, protagonistas de la primera corrida del ciclo.

El domingo 26, también a las 12:00 horas, se celebrará el último desafío ganadero, que enfrentará a las divisas de Dolores Aguirre y José Escolar.

La organización anunciará los carteles definitivos en próximas fechas.`
  },
	{ 
    id: 23,
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
    id: 24,
    title: "David Galván refuerza su cuadrilla con tres nuevas incorporaciones para 2026",
    image: "/images/davidgalvan1.jpg",
    footerImage: "/images/davidgalvan2.jpg",
    category: "Actualidad",
    date: "17 de noviembre de 2025",
    fullContent: `El matador gaditano David Galván ha cerrado la composición de su cuadrilla para la temporada 2026, un curso que afronta con gran ilusión y con la incorporación de tres nuevos profesionales que se suman a su equipo.

En el tercio de varas, se incorpora el picador Daniel López, quien ya acompañó al diestro en varios compromisos esta temporada y dejó muy buenas sensaciones, motivo por el que pasará a formar pareja con Juan Pablo Molina, que continuará un año más en la cuadrilla.

La lidia a pie experimenta una renovación profunda con la llegada de Raúl Ruiz y Manuel Larios, dos toreros de acreditada solvencia que afrontan este nuevo reto con responsabilidad y el entusiasmo propio de una temporada de máxima exigencia. El tercero David Pacheco seguirá formando parte del equipo.

Con estas incorporaciones, David Galván consolida una cuadrilla sólida y preparada para encarar con garantías una temporada que se presenta clave en su carrera.`
  },
	{ 
    id: 25,
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
    id: 26,
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
    id: 27,
    title: "Álvaro Lorenzo y Jean François Piles nueva relación de apoderamiento",
    image: "/images/alvarolorenzo.jpg",
    category: "Actualidad",
    date: "14 de noviembre de 2025",
    fullContent: `El toledano Álvaro Lorenzo ha llegado a un acuerdo de apoderamiento con el taurino francés Jean François Piles que hará equipo con Manolo Campuzano, ligado al toledano desde 2024. En 2025 ha toreado 11 corridas de toros en las que ha cortado 21 orejas con el hito de la tarde del dos de mayo en Madrid, donde cortó una oreja y dio una vuelta al ruedo rozando la puerta grande de Las Ventas. Lorenzo afronta con ilusión la próxima temporada en la que cumple diez años de alternativa.

Álvaro Lorenzo en estos años ha logrado puntuar con fuerza en las principales plazas de primera categoría como Madrid (con seis orejas y cinco vueltas al ruedo), Sevilla, Pamplona, entre otras. El matador toledano quiere aprovechar este comunicado para agradecer a la empresa Puerta Grande Gestión su trabajo durante la pasada temporada al haber concluido su relación de apoderamiento de manera amistosa.`
  },
	{ 
    id: 28,
    title: "Israel Vicente y Diego Urdiales nueva relación de apoderamiento",
    image: "/images/urdiales.jpg",
    category: "Actualidad",
    date: "14 de noviembre de 2025",
    fullContent: `El matador de toros Diego Urdiales ha decidido que Israel Vicente sea su nuevo apoderado. Hijo del primer apoderado de Urdiales durante su etapa como novillero y primeros años de matador, David Vicente Iglesias, será el encargado de dirigir la carrera del diestro riojano a partir de esta temporada 2026.

Una noticia que ha saltado esta mañana tras las informaciones sobre su ruptura con Luis Miguel Villalpando anunciada la semana pasada.`
  },
	{ 
    id: 29,
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
    id: 30,
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
    id: 35,
    title: "Paco Ureña, Borja Jiménez, Marco Pérez, Emilio de Justo, El Parralejo…, premiados por el Real Club Taurino de Murcia",
    image: "/images/guillen.jpg",
	imageCaption: "Foto Plaza 1",
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
    id: 36,
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
    id: 37,
    title: "El banderillero Raúl Ruiz sale de la cuadrilla de Fortes",
    image: "/images/banderillero2.jpg",
	imageCaption: "Foto Plaza 1",
    category: "Actualidad",
    date: "13 de noviembre de 2025",
	excerpt: "El madrileño, uno de los más destacados entre los de plata, queda libre para la temporada 2026",
    fullContent: `El banderillero Raúl Ruiz abandona la cuadrilla del matador de toros malagueño Fortes para la temporada 2026. El madrileño, uno de los más destacados entre los de plata, queda libre para la siguiente temporada después de estar a la órdenes del malagueño desde el año 2018. 

Raúl Ruiz ha querido, en un mensaje enviado a esta redacción, desear la mejor de las suertes a Fortes en su carrera.`
  },
	{ 
    id: 38,
    title: "Fernando Adrián y Santiago Ellauri nuevo acuerdo de apoderamiento",
    image: "/images/apoderamiento.jpg",
    category: "Actualidad",
    date: "13 de noviembre de 2025",
    fullContent: `El torero Fernando Adrián y el taurino sevillano Santiago Ellauri han cerrado un acuerdo de apoderamiento para la temporada 2026.  Ellauri, con una trayectoria consolidada como apoderado en el mundo del toro, será el encargado de coordinar las actuaciones, contratos y proyectos de Adrián, gestionando sus compromisos tanto en plazas nacionales como internacionales.

El torero madrileño llega a este nuevo proyecto tras una temporada destacada, en la que ha dejado su sello en plazas de primer nivel como Madrid —con la recordada faena al toro Frenoso, de Victoriano del Río, y la oreja paseada en la Corrida de Beneficencia—, Pamplona, Arles, Bilbao, Zaragoza (dos tardes), Cuenca, Pontevedra, Guadalajara o Teruel, entre otras.`
  },
	{ 
    id: 39,
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
    id: 40,
    title: "Luis Blázquez recibe el alta hospitalaria tras ser operado de una lesión que arrastraba durante la temporada",
    image: "/images/blazquez.jpg",
    category: "Actualidad",
    date: "12 de noviembre de 2025",
	excerpt: "El banderillero valenciano sufrió una rotura de peroné y del menisco de la rodilla izquierda",
    fullContent: `banderillero valenciano Luis Blázquez ha recibido el alta hospitalaria tras someterse el pasado sábado a una intervención quirúrgica para tratar una lesión que arrastraba desde el mes de agosto. El torero sufrió en Bilbao una rotura de peroné y del menisco de la rodilla izquierda, una dolencia que, pese a su gravedad, no le impidió continuar actuando durante la temporada, aunque mermado físicamente.

Durante la operación, a Blázquez se le ha colocado una placa con siete tornillos en el peroné. El torero continuará ahora el proceso de recuperación desde su domicilio. Si la evolución es favorable, los médicos prevén retirar las grapas la próxima semana y, aproximadamente dentro de 20 días, iniciar la fase de rehabilitación.`
  },
	{ 
    id: 45,
    title: "Valdemorillo define sus fechas y la estructura de la feria de San Blas 2026",
    image: "/images/valdemorillo.jpg",
    category: "Actualidad",
    date: "11 de noviembre de 2025",
    fullContent: `La temporada 2026 comienza a tomar forma, y Valdemorillo volverá a ser la primera gran cita del calendario taurino. La esperada Feria de San Blas y la Candelaria ya tiene fechas definidas y estructura cerrada: se celebrará los días 6, 7 y 8 de febrero y contará, como viene siendo habitual, con una novillada con picadores para abrir el abono y dos corridas de toros durante el fin de semana. A estos festejos se sumarán los tradicionales encierros y capeas, que mantienen viva la esencia popular y el espíritu taurino del municipio serrano.

El ciclo estará nuevamente organizado por la empresa Pueblos del Toreo, dirigida por Carlos Zúñiga y Víctor Zabala, que han logrado situar a Valdemorillo en una posición de privilegio dentro del arranque de la temporada europea. En los últimos años, su gestión ha revitalizado la Feria, atrayendo a figuras de primer nivel y convirtiéndola en una referencia obligada para los aficionados.

Fue precisamente en 2022 cuando la Feria dio un salto cualitativo con la presencia de Morante de la Puebla, en su primera actuación del año en España dentro de la temporada de las 100 corridas, compartiendo cartel con Diego Urdiales y Daniel Luque en un lleno histórico. Desde entonces, el serial no ha dejado de crecer: en 2023, el arte de Urdiales y Juan Ortega protagonizó un duelo con mucho eco, mientras que Perera, Cayetano y Ginés Marín completaron el ciclo. En 2025, nombres como Manzanares, Diego Ventura, Sebastián Castella, Emilio de Justo o Juan Ortega confirmaron el prestigio de una Feria que ya es sinónimo de calidad y expectación al inicio de cada temporada.`
  },
	{ 
    id: 50,
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
    id: 51,
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
    id: 52,
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
    id: 53,
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
    id: 54,
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
    id: 55,
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
    id: 56,
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

Mario Ruiz Ruiz - 9/11/2025`
  },
	{ 
    id: 57,
    title: "Luis Blázquez, intervenido de una rotura de peroné y menisco de la rodilla izquierda",
    image: "/images/luisblazquez.jpg",
    category: "Actualidad",
    date: "9 de noviembre de 2025",
	excerpt: "El subalterno ha sido operado esta misma mañana de una lesión que arrastraba desde el mes de agosto",
    fullContent: `El banderilleros valenciano Luis Blázquez ha sido operado esta mañana de una rotura de peroné que arrastraba desde el pasado mes de agosto en las Corridas Generales de Bilbao, además de ser también operado del menisco de la pierna izquierda.

Tras la intervención, se le ha sido colocada una placa con siete tornillos en la zona del peroné. Dicha operación ha sido llevaba a cabo por el Doctor José Luis López Peris en el Hospital Quirón de Valencia.`
  },
	{ 
    id: 58,
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
    id: 59,
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
    id: 60,
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
    id: 65,
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
    id: 66,
    title: "Asociación Nacional de Organizadores de Espectáculos Taurinos (ANOET) impulsa una renovación operativa: su nueva junta directiva.",
    image: "/images/anoet.jpg",
    category: "Actualidad",
    date: "6 de noviembre de 2025",
    fullContent: `La Asociación Nacional de Organizadores de Espectáculos Taurinos (ANOET) ha llevado a cabo una reestructuración de su Junta Directiva con el objetivo de adaptarse a las nuevas necesidades del sector y dotar a la organización de una mayor agilidad y eficiencia en la toma de decisiones. La nueva dirección será más reducida y operativa, orientada a dinamizar la gestión interna y reforzar la capacidad ejecutiva de la asociación.

La Junta Directiva queda ahora conformada por Rafael Garrido, que asume la presidencia, acompañado por Ramón Valencia y Óscar Martínez Labiano como vicepresidentes. Completan el órgano directivo los vocales Nacho Lloret, Alberto García, Carmelo García y el empresario José María Garzón, quien se incorpora a ANOET en esta nueva etapa.

Con esta reorganización, ANOET establece una estructura integrada por un presidente, dos vicepresidentes y cuatro vocales. La asociación subraya que este modelo busca fortalecer el liderazgo interno, promover una participación más activa de sus socios y reforzar la cohesión dentro de la entidad, con el propósito de afrontar con mayor solidez los retos presentes y futuros del sector.`
  },
	{ 
    id: 67,
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
    id: 68,
    title: "Fernando Adrián y Maximino Pérez ponen fin a su relación profesional",
    image: "/images/fin.jpg",
    category: "Actualidad",
    date: "5 de noviembre de 2025",
    fullContent: `El empresario taurino Maximino Pérez y el matador de toros Fernando Adrián han anunciado la conclusión de su relación de apoderamiento, que se venía manteniendo desde hace dos temporadas. Ambas partes han llegado a esta decisión de mutuo acuerdo, según han comunicado públicamente.

Durante este periodo, Fernando Adrián ha experimentado uno de los momentos más destacados de su carrera. Entre sus logros sobresalen tres Puertas Grandes consecutivas en la plaza de Las Ventas y un total de 25 Puertas Grandes encadenadas entre las temporadas 2023 y 2024, cifras que lo han situado como uno de los nombres más relevantes del toreo contemporáneo.

El comunicado oficial expresa un agradecimiento recíproco por el trabajo conjunto, así como los buenos deseos para el futuro profesional de ambas partes. Tanto el diestro como el empresario han subrayado la calidad de los logros alcanzados durante esta etapa y han manifestado su confianza en continuar cosechando éxitos y reconocimientos en sus respectivas trayectorias.`
  },
	{ 
    id: 69,
    title: "José Carlos Venegas sufre una grave cornada mientras realizaba labores de campo en su ganadería",
    image: "/images/venegas.jpg",
    category: "Actualidad",
    date: "5 de noviembre de 2025",
    fullContent: `El matador de toros José Carlos Venegas resultó herido este martes durante labores de campo en la ganadería de Moragón, en un accidente que le ocasionó una cornada de consideración. Según el parte médico, el diestro jienense sufrió una herida por asta en la cara posterior del muslo derecho, con trayectoria ascendente y salida por la cara externa del tercio distal, lo que provocó un importante sangrado.

El percance tuvo lugar cuando un toro lo sorprendió durante el manejo cotidiano del ganado. El animal lo embistió de manera súbita, ocasionándole no solo la herida penetrante, sino también diversos traumatismos por la violencia del golpe. En el momento del suceso, Venegas se encontraba solo; pese a ello, mantuvo la calma y la consciencia, y logró practicarse un torniquete para contener la hemorragia hasta la llegada de la ayuda.

El torero fue atendido de urgencia y trasladado para recibir tratamiento quirúrgico. A pesar de la gravedad inicial de la cornada, se encuentra fuera de peligro y evoluciona satisfactoriamente dentro de la normalidad prevista en este tipo de lesiones.`
  }, 
	{ 
    id: 70,
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
    id: 75,
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
    id: 76,
    title: "Diego Urdiales y Luis Miguel Villalpando terminan su relación de apoderamiento",
    image: "/images/dos.jpg",
	imageCaption: "Diego Urdiales en Zaragoza",
    category: "Actualidad",
    date: "4 de noviembre de 2025",
    fullContent: `El matador de toros Diego Urdiales y su apoderado Luis Miguel Villalpando han decidido dar por concluida su relación de apoderamiento tras varias temporadas de colaboración. Ambas partes han expresado agradecimiento y respeto mutuo, destacando el trabajo realizado y los objetivos alcanzados durante este tiempo.

La ruptura, según se ha señalado, se produce de manera amistosa y responde a la evolución natural de sus respectivas trayectorias. Urdiales, referente del toreo clásico, afronta ahora una nueva etapa en la gestión de su carrera, mientras Villalpando continuará con sus proyectos en el ámbito taurino.`
  },
	{ 
    id: 77,
    title: "El banderillero José Luis Barrero queda libre de cara a la próxima temporada",
    image: "/images/banderillero.jpg",
    category: "Actualidad",
    date: "4 de noviembre de 2025",
    fullContent: `El banderillero José Luis Barrero afrontará libre la próxima temporada taurina de 2026, tras haber puesto fin a su etapa en las filas del matador Borja Jiménez, con quien ha compartido una gran campaña en 2025.

Después de una temporada llena de actuaciones destacadas, el torero de plata inicia una nueva etapa profesional, con la mirada puesta en seguir ejerciendo su profesión y continuar creciendo dentro del escalafón durante el próximo año taurino`
  }, 
	{ 
    id: 78,
    title: "La Feria de San Isidro 2026 se presentará el 5 de febrero y la corrida ‘In Memoriam’ será en memoria de Rafael de Paula",
    image: "/images/feriasanisidro.jpg",
    category: "Actualidad",
    date: "4 de noviembre de 2025",
	excerpt: "Una información adelantada en el programa Buenos Días Madrid de Onda Madrid, presentado por el periodista Javier Mardomingo",
    fullContent: `La temporada taurina 2026 de la plaza de toros de Las Ventas va dando sus primeros pasos. Según ha adelantado el programa de radio Buenos Días Madrid de Onda Madrid, dirigido por el periodista Javier Mardomingo, la gala de presentación de la Feria de San Isidro se celebrará el próximo jueves 5 de febrero a las 19:30 horas. El acto de presentación de los carteles dará a conocer las combinaciones de la feria más importante del mundo taurino.`
  }, 
	{ 
    id: 79,
    title: "Ignacio Candelas y Juan Manuel Moreno “Trebu” fin a la relación de apoderamiento",
    image: "/images/ignacio.jpg",
	imageCaption: "Foto Plaza 1 ©",
    category: "Actualidad",
    date: "4 de noviembre de 2025",
    fullContent: `El novillero con picadores Ignacio Candelas y su mentor Juan Manuel Moreno “Trebu” han decidido poner fin a su relación de apoderamiento, que se extendió entre las temporadas 2023 y 2025.

Ambos expresaron su agradecimiento mutuo por el trabajo y la dedicación compartidos, deseándose lo mejor en sus próximos compromisos. Con esta decisión, Candelas inicia una nueva etapa en su carrera taurina.`
  }, 
	{ 
    id: 80,
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
    id: 85,
    title: "Rafael Camino JR y Oscar de la Faya , nuevo equipo de apoderamiento del novillero Iván Rejas",
    image: "images/varios2.jpg",
    category: "Actualidad",
    date: "2 de noviembre de 2025",
    fullContent: `El novillero con picadores Iván Rejas ha anunciado a través de su perfil de Instagram su nuevo acuerdo de apoderamiento con Rafa Camino Jr. y Óscar de la Faya, con quienes comienza una nueva etapa en su carrera profesional.

En su comunicado, el torero definió esta unión como “un proyecto joven, nacido de la confianza, la ilusión y la convicción de que el trabajo, el esfuerzo y la verdad son la base para crecer”. Además, destacó que los tres comparten una misma forma de entender la profesión y un objetivo común: “avanzar, aprender y seguir construyendo futuro dentro del toreo”.

Con “compromiso y afición”, Rejas afronta esta nueva etapa que, según sus propias palabras, “motiva y une” a este nuevo equipo de trabajo.`
  }, 
	{ 
    id: 86,
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
    id: 87,
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
    id: 88,
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
    id: 89,
    title: "El Gobierno de Aragón rectifica y permitirá la celebración de festejos taurinos bajo una serie de normas",
    image: "images/gobiernoaragon.jpg",
    category: "Actualidad",
    date: "1 de noviembre de 2025",
    fullContent: `El departamento de Agricultura, Ganadería y Alimentación del Gobierno de Aragón ha decidido a última hora de la tarde de este viernes que los festejos taurinos sí podrán celebrarse finalmente en todo este territorio tras haber modificado la citada resolución por la que habían sido suspendidos de forma cautelar en la mañana de este viernes. 

La nueva normativa establece que los espectáculos taurinos populares podrán celebrarse en todo el territorio aragonés siempre y cuando se cumplan varias rigurosas medidas sanitarias. De esta forma, para los espectáculos que se desarrollen en un único día o en varios consecutivos dentro de una misma localidad, todos los animales deberán proceder de la misma ganadería, garantizando así un mayor control sanitario, además de desinsectar las instalaciones donde se hayan ubicado las reses bravas una vez concluido el espectáculo taurino.

En cuanto a corridas de toros y novilladas con picadores, la nueva normativa establece que podrán efectuarse sin restricciones adicionales, manteniendo únicamente las medidas de desinsectación esenciales para evitar la difusión del virus.`
  }, 
	{ 
    id: 90,
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
    id: 95,
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
    id: 96,
    title: "Aragón suspende los festejos taurinos a consecuencia de la Dermatosis Nodular Contagiosa",
    image: "images/aragon.jpg",
    category: "Actualidad",
    date: "31 de Octubre de 2025",
    fullContent: `La Comunidad de Aragón ha suspendido todos los festejos taurinos populares a consecuencia de la Dermatosis Nodular Contagiosa. Tal y como recoge la cuenta de Instagram Torosocialgestión en un comunicado, queda suspendida toda la presencia de animales en ferias, concursos y cualquier evento en el que tomen participación salvo perros, gatos y animales de compañía.

Una decisión que atiende directamente a la Resolución de 27 de octubre de 2025 de la Dirección General de Calidad y Seguridad Alimentaria del Gobierno de Aragón, publicada en el Boletín Oficial de Aragón (BOA n° 210, de 30 de octubre de 2025) por la que se han adoptado medidas cautelares ante esta enfermedad que afecta a los festejos taurinos.

Ante esta decisión, todos los festejos ya autorizados pendientes de celebración serán suspendidos, al igual que las solicitudes pendientes y las nuevas no serán tramitadas hasta que se levante la prohibición`
  }, 
  { 
    id: 97,
    title: "Curro Vázquez, nuevo apoderado del novillero Emiliano Osornio",
    image: "images/currovazquez.jpg",
    category: "Actualidad",
    date: "30 de Octubre de 2025",
    fullContent: `El reconocido maestro Curro Vázquez ha decidido apoderar al novillero mexicano Emiliano Osornio, una decisión motivada por su compromiso con la necesaria aparición de nuevos valores y su deseo de respaldar el mundo de las novilladas y el toreo de México, que actualmente atraviesan por una situación complicada.

Emiliano Osornio se ha consolidado como uno de los nombres más destacados del escalafón de novilleros. Durante esta temporada ha dejado una grata impresión por la pureza y la personalidad de su toreo en plazas de importancia como Las Ventas, además de hacerse con los trofeos al Triunfador de las Ferias de Arnedo y Arganda del Rey.

Esta unión entre Curro Vázquez y Emiliano Osornio representa una apuesta decidida por el futuro del toreo y una muestra de confianza en la nueva generación de toreros mexicanos.`
  }, 
  { 
    id: 98,
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
    id: 99,
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
    id: 100,
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
    id: 105,
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
    id: 106,
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
    id: 107,
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
    id: 108,
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
    id: 109,
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
    id: 110,
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
    id: 115,
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
    id: 116,
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
    id: 117,
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
    id: 118,
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
    id: 119,
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
    id: 120,
    title: "Tomás González por Miguel Serrano en Viraco",
    image: "images/tomasgonzalez1.jpg",
    category: "Actualidad",
    date: "21 de Octubre de 2025",
    fullContent: `El alcorisano Tomás González será el encargado de sustituir a Miguel Serrano en la Feria en Honor a Santa Úrsula en Viraco (Perú).

Tomás González hará el paseíllo en el coso peruano el próximo jueves 23 de Octubre junto a los mexicanos César Ruiz y Joaquín Caro , lidiando un encierro de diferentes ganaderías.`
  },
  {
    id: 125,
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
    id: 126,
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
    id: 127,
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
    id: 128,
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
    id: 129,
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
    id: 130,
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
    id: 135,
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
    title: "Francisco de Manuel y Diego Robles ponen fin a su relación de apoderamiento",
    image: "images/franciscoydiego.jpg",
    category: "Actualidad",
    date: "17 de Octubre de 2025",
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
    id: 204,
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

Con estas despedidas, la temporada 2025 pasará a la historia como un punto de inflexión, no solo por el adiós de grandes nombres, sino también por el reflejo de una generación que cierra su ciclo, dejando paso a nuevos valores que habrán de tomar el testigo en los años venideros.`
  },
  {
    id: 206,
    title: "Sergio Sánchez rompe con su hasta ahora apoderado Jacinto Ortiz",
    image: "images/sergiosanchez.jpg",
    category: "Actualidad",
    date: "16 de Octubre de 2025",
    fullContent: `El novillero con picadores Sergio Sánchez y su hasta ahora apoderado Jacinto Ortiz han decidido, de mutuo acuerdo, dar por finalizada la relación de apoderamiento que comenzaron al inicio de la temporada 2025.

Durante esta campaña, Sergio Sánchez ha tenido una destacada actuación en plazas de gran relevancia, entre las que destaca su paso por la plaza de toros de Las Ventas, donde ha hecho el paseíllo en tres ocasiones. Asimismo, ha actuado en otros cosos de primera categoría como Bilbao, Olivenza, Almería, así como en diversas ferias de importancia del circuito taurino nacional.

Ambas partes han querido expresarse públicamente el agradecimiento mutuo y los mejores deseos para sus respectivas trayectorias profesionales.`
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
    date: "16 de Octubre de 2025",
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
    id: 212,
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
    id: 213,
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
];

  // Entrevistas taurinas
const entrevistas: NewsItem[] = [
    {
    id: 500,
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
  src="/images/tendidodigitallogosimple.jpg"
  alt="Tendido Digital"
  className="h-12 w-auto opacity-100 brightness-100 transition-transform duration-300 group-hover:scale-105"
  style={{ mixBlendMode: "multiply" }}
/>

                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg backdrop-blur-sm">
                    {news.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
              <span className="text-gray-500 text-sm">{formatTimeAgo(news.date)}</span>
               {formatTimeAgo(news.date)}
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
    <section
      id="inicio"
      className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden flex items-center justify-center bg-black"
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
<div className="flex items-center text-gray-500 text-sm space-x-2">
  <span>{formatExactDate(news.date)}</span>
  <span>•</span>
  <span>{formatTimeAgo(news.date)}</span>
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
<footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-yellow-500/10"></div>
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="md:col-span-2">
        <div className="flex items-center mb-6 group">
          <img
            src="/images/tendidodigitallogosimple.jpg"
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
  src="/images/tendidodigitallogosimple.jpg"
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
    className="fixed inset-0 bg-black z-50 overflow-y-auto"
    style={{
      overflowX: "hidden",
      overflowY: "auto",
      maxHeight: "100vh",
      WebkitOverflowScrolling: "touch",
    }}
  >
    {/* Header del modal */}
    <div className="sticky top-0 bg-black/90 backdrop-blur-md z-10 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img
              src="/images/tendidodigitallogosimple.jpg"
              alt="Tendido Digital"
              className="h-12 w-auto opacity-60 hover:opacity-100 transition-all duration-300 group-hover:scale-110 filter brightness-125"
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

        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
          {selectedNews.title}
        </h1>

        {selectedNews.excerpt && (
          <p className="text-xl text-gray-600 leading-relaxed mb-12 font-medium">
            {selectedNews.excerpt}
          </p>
        )}

<div className="prose prose-xl max-w-none">
  <div className="text-gray-700 leading-relaxed text-lg space-y-4 font-bold">
    {selectedNews.fullContent
      ?.split("\n\n")
      .map((paragraph, i) => (
        <p dangerouslySetInnerHTML={{ __html: 'texto' }}
  __html: paragraph
    .replace(/(\*{1,2})(.*?)\1/g, "<strong>$2</strong>")
    .trim(),
/>
}}
  </div>
</div>

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
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-full font-bold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-xl cursor-pointer whitespace-nowrap text-sm border border-red-400/20 flex justify-center items-center"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              <span>Volver a noticias</span>
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
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-md z-10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="/images/tendidodigitallogosimple.jpg"
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
            <p className="text-gray-700">{selectedChronicle.detalles}</p>
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
