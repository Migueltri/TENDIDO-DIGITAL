export default {
  name: 'news',
  title: 'Noticia',
  type: 'document',
  fields: [
    { name: 'title', title: 'Título', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
    { name: 'date', title: 'Fecha', type: 'datetime' },
    { name: 'description', title: 'Descripción corta', type: 'text' },
    {
      name: 'mainImage',
      title: 'Imagen principal',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'body',
      title: 'Contenido',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }]
    },
    { name: 'published', title: 'Publicado', type: 'boolean', initialValue: true }
  ]
}