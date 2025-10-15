import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

// importa las mismas noticias que defines en Home
import { featuredNews, latestNews } from "../../data/newsData";

export default function Noticia() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    const all = [...featuredNews, ...latestNews];
    const found = all.find((p) => p.id.toString() === id);
    setPost(found || null);
  }, [id]);

  if (!post) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Cargando noticia...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
        <p className="text-gray-500 mb-8">{post.date}</p>

        <img
          src={`/${post.image}`}
          alt={post.title}
          className="w-full rounded-xl mb-8"
        />

        <div className="text-gray-800 leading-relaxed space-y-4">
          {post.fullContent.split("\n\n").map((paragraph: string, i: number) => (
            <p key={i} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
