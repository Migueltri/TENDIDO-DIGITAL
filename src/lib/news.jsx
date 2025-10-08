import { useEffect, useState } from 'react'
import { client, urlFor } from '../lib/sanity'
import { PortableText } from '@portabletext/react'

export default function Noticias() {
  const [news, setNews] = useState([])

  useEffect(() => {
    const query = `*[_type=="news" && published==true] | order(date desc)`
    client.fetch(query).then(setNews)
  }, [])

  return (
    <div>
      {news.map(n => (
        <article key={n._id}>
          <h2>{n.title}</h2>
          {n.mainImage && <img src={urlFor(n.mainImage).width(600).url()} alt={n.title}/>}
          <PortableText value={n.body}/>
        </article>
      ))}
    </div>
  )
}
