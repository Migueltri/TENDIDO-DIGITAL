import { useParams } from "react-router-dom";

export default function NoticiaPage() {
  const { id } = useParams<{ id: string }>();

  // Aquí deberías importar o acceder a tus noticias
  // Si están en page.tsx, lo ideal es mover ese array a un archivo aparte (ej: data/news.ts).
  // Por simplicidad, te muestro el esquema:
  const allNews = [
    {
      id: 1,
      title: "Morante de la Puebla triunfa en Las Ventas con una faena histórica",
      image: "/images/morante.jpg",
      date: "15 Enero 2025",
      category: "Actualidad",
      excerpt: "Una tarde inolvidable en la catedral del toreo...",
      fullContent: "El maestro Morante de la Puebla protagonizó una tarde histórica..."
    },
    {
      id: 2,
      title: "Morante de la Puebla triunfa en Las Ventas con una faena histórica",
      image: "/images/morante.jpg",
      category: "Actualidad",
      date: "15 Enero 2025",
      excerpt: "Una tarde inolvidable en la catedral del toreo donde Morante demostró su maestría",
      fullContent: "El maestro Morante de la Puebla protagonizó una tarde histórica en Las Ventas, demostrando una vez más por qué es considerado uno de los toreros más importantes de la actualidad. Con una faena llena de temple y arte, el diestro de La Puebla del Río logró conectar con el público madrileño de una manera extraordinaria. La corrida, que contó con toros de la ganadería de Victorino Martín, fue el escenario perfecto para que Morante desplegara todo su repertorio artístico. Desde los primeros pases con el capote hasta la faena de muleta, el torero demostró una técnica depurada y una comprensión profunda del arte del toreo. El público, entregado desde el primer momento, premió su actuación con una ovación que se prolongó durante varios minutos."
    },
    {
      id: 3,
      title: "Temporada 2025: Las figuras del toreo se preparan para la Feria de San Isidro",
      image: "/images/temporada.jpg",
      category: "Agenda",
      date: "14 Enero 2025",
      excerpt: "Los mejores toreros del mundo confirman su presencia en la feria más importante",
      fullContent: "La Feria de San Isidro 2025 promete ser una de las más emocionantes de los últimos años. Las principales figuras del toreo han confirmado ya su participación en la cita más importante del calendario taurino español. Entre los nombres confirmados destacan Morante de la Puebla, El Juli, José María Manzanares, Roca Rey y Cayetano Rivera, quienes se alternarán en los carteles más esperados. La empresa Las Ventas ha trabajado intensamente para ofrecer una programación variada que incluye corridas de toros, novilladas picadas y festivales benéficos. Los aficionados ya pueden adquirir sus localidades a través de la página web oficial, donde se espera una gran demanda como cada año."
    },
    {
      id: 4,
      title: "Entrevista exclusiva: José Tomás habla sobre su regreso a los ruedos",
      image: "/images/josetomas.jpeg",
      category: "Entrevistas",
      date: "13 Enero 2025",
      excerpt: "El torero de Galapagar revela sus planes para esta temporada",
      fullContent: "En una entrevista exclusiva para Tendido Digital, José Tomás ha revelado sus planes para la temporada 2025. El torero de Galapagar, conocido por su estilo único y su capacidad para emocionar al público, ha confirmado que está preparando su regreso a los ruedos después de un período de reflexión. 'El toreo es mi vida y siento que aún tengo mucho que dar', declaró el diestro durante la conversación. José Tomás también habló sobre la importancia de mantener viva la tradición taurina y su compromiso con las nuevas generaciones de aficionados. Sus apariciones serán limitadas pero prometedoras, con especial atención a las plazas más importantes de España y América."
    },
    {
      id: 5,
      title: "El Cid corta dos orejas en la plaza de toros de Sevilla",
       image: "/images/elcid.jpg",
      category: "Crónicas",
      date: "15 Enero 2025",
      excerpt: "Una tarde memorable en la Maestranza sevillana donde El Cid demostró su arte y valentía ante un público entregado.",
      fullContent: "El Cid protagonizó una tarde triunfal en la Real Maestranza de Caballería de Sevilla, cortando dos orejas en una actuación que quedará grabada en la memoria de los aficionados. El diestro demostró una vez más su capacidad para emocionar y su dominio técnico ante toros de la ganadería de Miura. La faena al quinto toro fue especialmente brillante, con una serie de naturales que arrancaron los olés del respetable sevillano. El público, conocedor y exigente, premió su actuación con una ovación cerrada que se prolongó durante varios minutos. Esta actuación consolida a El Cid como una de las figuras más sólidas del panorama taurino actual."
    },
    {
      id: 6,
      title: "Análisis: Las claves del éxito en la temporada taurina 2025",
      image: "/images/analisis.jpg",
      category: "Opinión",
      date: "14 Enero 2025",
      excerpt: "Expertos analizan las tendencias y figuras que marcarán el año taurino en España y América.",
      fullContent: "La temporada taurina 2025 se presenta con grandes expectativas y varios factores que determinarán su éxito. Según los expertos consultados, la renovación generacional será uno de los aspectos más destacados, con jóvenes figuras que buscan consolidarse junto a los maestros consagrados. La programación de las principales plazas muestra una apuesta decidida por la calidad, tanto en los carteles como en las ganaderías seleccionadas. América Latina también jugará un papel importante, con un creciente interés por el toreo español y la organización de eventos de gran nivel. Los aficionados esperan una temporada rica en emociones y momentos memorables."
    },
    {
      id: 7,
      title: "Novillada en Madrid: Triunfo de los jóvenes valores",
      image: "/images/novilladaenmadrid.jpg",
      category: "Novilladas",
      date: "13 Enero 2025",
      excerpt: "La cantera taurina española demuestra su calidad en una tarde llena de emoción y arte.",
      fullContent: "La plaza de Las Ventas fue testigo de una extraordinaria novillada que puso de manifiesto la excelente salud de la cantera taurina española. Los tres novilleros que actuaron demostraron técnica, valor y arte, ingredientes fundamentales para el futuro del toreo. La tarde comenzó con gran expectación y se desarrolló con un nivel artístico muy alto. Los jóvenes diestros supieron aprovechar las oportunidades que les brindaron los novillos, ofreciendo faenas llenas de emoción y momentos de gran belleza. El público madrileño, siempre exigente, supo reconocer la calidad de lo visto y premió con generosidad a estos valores emergentes del toreo."
    },
    {
      id: 8,
      title: "Feria de Sevilla 2025: Confirmados los primeros carteles",
      image: "/images/feriadesevilla.jpg",
      category: "Ferias",
      date: "12 Enero 2025",
      excerpt: "Los aficionados ya pueden conocer los primeros nombres que pisarán el albero de la Maestranza.",
      fullContent: "La Real Maestranza de Caballería de Sevilla ha hecho públicos los primeros carteles de la Feria de Abril 2025, generando gran expectación entre los aficionados. Los nombres confirmados incluyen a las principales figuras del toreo actual, garantizando tardes de gran nivel artístico. La programación combina experiencia y juventud, con carteles que prometen emociones fuertes y momentos memorables. Las ganaderías seleccionadas son de reconocido prestigio, lo que augura corridas de gran calidad. Los abonos ya están disponibles y la demanda está siendo muy alta, como es habitual en una de las ferias más importantes del calendario taurino mundial."
    },
    {
      id: 9,
      title: "Ganadería de Miura: Tradición y bravura en 2025",
      image: "/images/ganaderiademiura.jpeg",
      category: "Ganaderías",
      date: "11 Enero 2025",
      excerpt: "Un recorrido por una de las ganaderías más prestigiosas del panorama taurino español.",
      fullContent: "La ganadería de Miura continúa siendo una referencia en el mundo taurino, manteniendo la tradición y la bravura que la han caracterizado durante generaciones. En 2025, la divisa sevillana seguirá presente en las principales plazas de España, ofreciendo toros de gran calidad y trapío. Los responsables de la ganadería han trabajado intensamente en la selección y mejora del ganado, manteniendo las características que han hecho famosos a los toros de Miura en todo el mundo. Su presencia en los carteles siempre genera expectación, tanto entre los toreros como entre los aficionados, que saben que se enfrentarán a reses de gran nobleza y bravura."
    },
    {
      id: 10,
      title: "Escuela Taurina de Madrid: Formando a las futuras figuras",
      image: "/images/escuelataurinademadrid.jpg",
      category: "Formación",
      date: "10 Enero 2025",
      excerpt: "La cantera madrileña trabaja intensamente para preparar a los toreros del futuro.",
      fullContent: "La Escuela Taurina de Madrid continúa su labor formativa, preparando a las futuras figuras del toreo con un programa integral que combina técnica, teoría y práctica. Los jóvenes aspirantes reciben formación de maestros experimentados que transmiten los conocimientos fundamentales del arte del toreo. Las instalaciones de la escuela permiten un aprendizaje progresivo y seguro, con especial atención a los aspectos técnicos y de seguridad. Muchos de los toreros que actualmente triunfan en las principales plazas han pasado por esta institución, que se ha convertido en un referente en la formación taurina. El compromiso con la excelencia y la tradición garantiza la continuidad del arte del toreo."
    },
    {
      id: 11,
      title: "Temporada americana: El toreo español conquista México",
      image: "/images/temporadaamericana.jpg",
      category: "Internacional",
      date: "9 Enero 2025",
      excerpt: "Las principales figuras españolas confirman su participación en la temporada mexicana.",
      fullContent: "La temporada taurina mexicana 2025 contará con la presencia de las principales figuras del toreo español, consolidando los lazos entre ambos países en el arte del toreo. Plazas emblemáticas como la México y la Monumental de Aguascalientes recibirán a toreros de la talla de Morante de la Puebla, El Juli y José María Manzanares. Esta colaboración internacional fortalece la tradición taurina y permite el intercambio cultural entre España y México. Los aficionados mexicanos podrán disfrutar del más alto nivel artístico, mientras que los toreros españoles tendrán la oportunidad de demostrar su arte ante públicos conocedores y exigentes."
    },
    {
      id: 12,
      title: "Revolución en Las Ventas: Nuevas medidas de seguridad",
      image: "/images/revolucionenlasventas.jpg",
      category: "Actualidad",
      date: "8 Enero 2025",
      excerpt: "La plaza madrileña implementa innovadores sistemas para garantizar la seguridad de toreros y público.",
      fullContent: "La plaza de toros de Las Ventas ha anunciado la implementación de nuevas medidas de seguridad que revolucionarán la experiencia taurina sin comprometer la esencia del espectáculo. Estas innovaciones incluyen sistemas de monitoreo avanzado, protocolos de emergencia mejorados y tecnología de última generación para garantizar la seguridad tanto de los toreros como del público asistente. La dirección de la plaza ha trabajado en colaboración con expertos en seguridad y veterinarios especializados para desarrollar estos protocolos. Estas medidas sitúan a Las Ventas a la vanguardia en materia de seguridad taurina a nivel mundial."
    },
    {
      id: 13,
      title: "El arte del capote: Masterclass con figuras consagradas",
      image: "/images/elartedelcapote.jpeg",
      category: "Formación",
      date: "7 Enero 2025",
      excerpt: "Maestros del toreo comparten sus secretos en una jornada única de enseñanza.",
      fullContent: "Una jornada excepcional reunió a algunas de las figuras más respetadas del toreo para compartir sus conocimientos sobre el arte del capote. Esta masterclass, dirigida tanto a jóvenes aspirantes como a aficionados, abordó desde los fundamentos básicos hasta las técnicas más avanzadas del manejo del capote. Los maestros explicaron la importancia del temple, la colocación y el timing en cada lance, transmitiendo décadas de experiencia acumulada en los ruedos más importantes del mundo. Esta iniciativa forma parte de un programa más amplio destinado a preservar y transmitir los conocimientos tradicionales del arte del toreo."
    },
    {
      id: 14,
      title: "El futuro de la tauromaquia en el siglo XXI",
      author: "Carlos Mendoza",
      excerpt: "Un análisis profundo sobre los retos y oportunidades que enfrenta el mundo del toro en la actualidad.",
      date: "14 Enero 2025",
      image: "/images/elfuturodelatauromaquia.jpg",
      fullContent: "El siglo XXI presenta desafíos únicos pero también oportunidades extraordinarias para la tauromaquia. En este análisis profundo, exploramos cómo la tradición taurina puede adaptarse a los tiempos modernos sin perder su esencia. La globalización, las nuevas tecnologías y los cambios sociales exigen una reflexión seria sobre el futuro de este arte milenario. Es fundamental encontrar el equilibrio entre la preservación de la tradición y la necesaria adaptación a los nuevos tiempos."
     },
     {
     id: 15,
     title: "La importancia de las escuelas taurinas",
     author: "María González",
     excerpt: "Reflexiones sobre la formación de nuevos toreros y la preservación de la tradición.",
     date: "13 Enero 2025",
     image: "/images/escuelastaurinas.jpg",
     fullContent: "Las escuelas taurinas son el corazón de la formación de las futuras figuras del toreo. Su papel va más allá de la enseñanza técnica, abarcando la transmisión de valores, tradiciones y el respeto por el arte del toreo. En estas instituciones se forman no solo los toreros del mañana, sino también los guardianes de una tradición centenaria. La calidad de la enseñanza y el compromiso de los maestros son fundamentales para garantizar la continuidad y excelencia del toreo."
   },
   {
    id: 16,
     title: "Las plazas históricas y su legado",
     author: "Antonio Ruiz",
     excerpt: "Un recorrido por las catedrales del toreo y su importancia cultural.",
     date: "12 Enero 2025",
     image: "/images/lasplazashistoricas.jpg",
     fullContent: "Las plazas de toros históricas son mucho más que simples edificios; son catedrales del toreo que albergan siglos de historia, tradición y arte. Cada una tiene su propia personalidad y ha sido testigo de momentos inolvidables que han marcado la historia de la tauromaquia. Desde Las Ventas en Madrid hasta la Maestranza de Sevilla, estas plazas representan el alma del toreo y constituyen un patrimonio cultural invaluable que debe ser preservado para las futuras generaciones."
    },
    {
    id: 17,           
     title: "La ganadería brava: Selección y crianza",
     author: "Fernando López",
     excerpt: "Los secretos detrás de la cría del toro bravo y su importancia en el espectáculo.",
     date: "11 Enero 2025",
     image: "/images/laganaderiabrava.jpeg",
     fullContent: "La ganadería brava es el pilar fundamental sobre el que se sustenta el espectáculo taurino. La selección, crianza y cuidado del toro bravo requieren conocimientos ancestrales transmitidos de generación en generación. Los ganaderos dedican años a perfeccionar sus reses, buscando el equilibrio perfecto entre bravura, nobleza y trapío. Este artículo explora los métodos tradicionales y las innovaciones modernas en la cría del toro bravo, así como su impacto en la calidad del espectáculo taurino."
     },
     {
     id: 18,
     title: "El toreo femenino: Rompiendo barreras",
     author: "Isabel Martín",
     excerpt: "El papel de la mujer en la tauromaquia moderna y su evolución histórica.",
     date: "10 Enero 2025",
     image: "/images/eltoreofemenino.jpeg",
     fullContent: "El toreo femenino ha experimentado una evolución notable en las últimas décadas, rompiendo barreras tradicionales y ganando reconocimiento en el mundo taurino. Las toreras han demostrado que el arte del toreo no tiene género, aportando su propia sensibilidad y técnica al ruedo. Este análisis examina la trayectoria de las principales figuras femeninas del toreo, los desafíos que han enfrentado y su contribución al enriquecimiento del arte taurino. Su presencia ha abierto nuevos horizontes y ha demostrado que la pasión por el toreo trasciende cualquier barrera."
     },
     {
     id: 19,
     title: "Tradición vs. Modernidad en el toreo",
     author: "Miguel Ángel Sánchez",
     excerpt: "El equilibrio entre mantener las tradiciones y adaptarse a los nuevos tiempos.",
     date: "9 Enero 2025",
     image: "/images/tradicionvsmodernidad.jpg",
    fullContent: "El mundo del toreo se encuentra en una encrucijada entre la preservación de sus tradiciones milenarias y la necesidad de adaptarse a los tiempos modernos. Este debate no es nuevo, pero cobra especial relevancia en el siglo XXI. ¿Cómo puede la tauromaquia mantener su esencia mientras evoluciona para conectar con las nuevas generaciones? Este artículo explora las diferentes perspectivas sobre esta cuestión fundamental, analizando tanto las voces que abogan por la tradición pura como aquellas que proponen una modernización respetuosa del arte del toreo."
              },
  ];

  const news = allNews.find(n => n.id === Number(id));

  if (!news) return <h2>Noticia no encontrada</h2>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <img src={news.image} alt={news.title} className="w-full h-64 object-cover rounded-lg mb-6" />
      <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold">
        {news.category}
      </span>
      <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-3">{news.title}</h1>
      <p className="text-gray-500 text-sm mb-6">{news.date}</p>
      <p className="text-lg text-gray-700 leading-relaxed">{news.fullContent}</p>
    </div>
  );
}
