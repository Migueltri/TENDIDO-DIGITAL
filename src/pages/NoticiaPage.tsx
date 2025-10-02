import { useParams } from "react-router-dom";
import { featuredNews, latestNews } from "./home/page";

export default function NoticiaPage() {
  const { id } = useParams();
  const allNews = [...featuredNews, ...latestNews];
  const noticia = allNews.find(n => n.id === parseInt(id!));

  if (!noticia) return <div>Noticia no encontrada</div>;

  return (
    <div className="min-h-screen bg-white p-8">
      <img src={noticia.image} alt={noticia.title} className="w-full h-80 object-cover mb-8" />
      <h1 className="text-3xl font-bold mb-4">{noticia.title}</h1>
      <p className="text-gray-500 mb-2">{noticia.date}</p>
      <p className="mb-6">{noticia.excerpt}</p>
      <div className="text-gray-700 leading-relaxed">{noticia.fullContent}</div>
    </div>
  );
}
