import { useRouter } from "next/router";
import { entrevistasData } from "@/data/entrevistasData";

export default function EntrevistaPage() {
  const router = useRouter();
  const { slug } = router.query;

  // Busca la entrevista que coincide con el slug
  const entrevista = entrevistasData.find((item) => item.slug === slug);

  if (!entrevista) {
    return (
      <main className="max-w-4xl mx-auto py-10">
        <h1 className="text-2xl font-bold text-red-700 mb-6">
          Entrevista no encontrada
        </h1>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-red-700 leading-tight">
        {entrevista.title}
      </h1>

      <p className="text-gray-500 text-sm mb-4">{entrevista.date}</p>

      <img
        src={entrevista.image}
        alt={entrevista.title}
        className="w-full rounded-lg mb-8"
      />

      <article className="prose prose-lg max-w-none">
        {entrevista.fullContent.split("\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>

      {entrevista.footerImage1 && (
        <figure className="mt-8">
          <img
            src={entrevista.footerImage1}
            alt={entrevista.footerImage1Caption}
            className="rounded-lg"
          />
          <figcaption className="text-sm text-gray-600 mt-2">
            {entrevista.footerImage1Caption}
          </figcaption>
        </figure>
      )}

      {entrevista.author && (
        <div className="mt-10 flex items-center space-x-4">
          <img
            src={entrevista.authorLogo}
            alt={entrevista.author}
            className="w-10 h-10 rounded-full"
          />
          <p className="text-gray-700 text-sm font-medium">
            Entrevista por {entrevista.author}
          </p>
        </div>
      )}
    </main>
  );
}
