import { useRouter } from "next/router";

export default function EntrevistaPage() {
  const router = useRouter();
  const { slug } = router.query;

  // Aquí podrías cargar los datos reales por slug
  // Por ejemplo, buscar en tu array latestNews o hacer una llamada a la API

  return (
    <main className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-red-700 capitalize">
        Entrevista: {slug}
      </h1>
      <p>Aquí mostrarás el contenido completo de la entrevista {slug}.</p>
    </main>
  );
}
