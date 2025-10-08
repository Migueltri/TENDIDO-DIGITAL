import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 'TU_PROJECT_ID', // cópialo de manage.sanity.io
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(client)
export const urlFor = (src) => builder.image(src)
