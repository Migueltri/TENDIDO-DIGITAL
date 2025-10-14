import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { featuredNews, latestNews } from "../../data/newsData";

export default function Noticia() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    const all = [...featuredNews, ...latestNews];
    const found = all.find(p => p.id.toString() === id);
    setPost(found || null);
  }, [id]);

  if (!post) return <p className="p-10 text-center text-gray-600">Cargando noticia...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
      <img src={`/${post.image}`} alt={post.title} className="w-full rounded-xl mb-8" />
      <div className="text-gray-800 leading-relaxed space-y-4">
        {post.fullContent.split("\n\n").map((p: string, i: number) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
