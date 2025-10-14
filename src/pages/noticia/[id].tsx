import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Article {
  id: number;
  title: string;
  image: string;
  date: string;
  category?: string;
  fullContent: string;
  excerpt?: string;
}

// ⚠️  aquí podrías importar tus datos reales
// o traerlos desde una API o un archivo común
import { featuredNews, latestNews } from '../home/page';

export default function Noticia() {
  const router = useRouter();
  const { id } = router.query;

  const [post, setPost] = useState<Article | null>(null);

  useEffect(() => {
    if (id) {
      const allPosts = [...featuredNews, ...latestNews];
      const found = allPosts.find((p) => p.id.toString() === id.toString());
      setPost(found || null);
    }
  }, [id]);

  if (!post) return <p className="p-10 text-center text-gray-600">Cargando noticia...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
      <p className="text-gray-500 mb-4">{post.date}</p>
      <img src={`/${post.image}`} alt={post.title} className="w-full rounded-xl mb-8" />

      <div className="text-gray-800 leading-relaxed space-y-4">
        {post.fullContent.split("\n\n").map((paragraph, i) => (
          <p key={i} className="whitespace-pre-line">{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
