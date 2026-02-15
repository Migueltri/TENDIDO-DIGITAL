import React, { useState, useEffect } from 'react';

// 1. Definimos la estructura de los datos (Interface en TypeScript)
interface Article {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  category: string;
  date: string;
  authorId: string;
}

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Cargamos el archivo JSON generado por el CMS
    // Si tu archivo está en 'public/data/db.json', la ruta fetch es '/data/db.json'
    fetch('/data/db.json')
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar el archivo de noticias");
        return res.json();
      })
      .then((data) => {
        // El CMS guarda los artículos dentro de la propiedad "articles"
        if (data && data.articles) {
            setArticles(data.articles);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error cargando noticias:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando noticias...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Últimas Noticias</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <article key={article.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
            </div>
            <div className="p-6">
              <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-red-600 uppercase bg-red-50 rounded-full">
                {article.category}
              </span>
              <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                {article.title}
              </h2>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {article.summary}
              </p>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(article.date).toLocaleDateString()}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
