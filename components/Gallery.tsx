'use client'
import type { Translations } from '@/lib/translations'
import Image from 'next/image'

interface Props {
  t: Translations
  photos?: string[]
}

const DEFAULT_IMAGES = [
  'https://picsum.photos/seed/salon3/800/600',
  'https://picsum.photos/seed/salon4/800/600',
  'https://picsum.photos/seed/salon5/800/600',
  'https://picsum.photos/seed/salon6/800/600',
  'https://picsum.photos/seed/salon7/800/600',
  'https://picsum.photos/seed/salon8/800/600',
]

export default function Gallery({ t, photos: userPhotos }: Props) {
  const displayPhotos = userPhotos && userPhotos.length > 0 ? userPhotos : DEFAULT_IMAGES

  return (
    <section id="gallery" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">
            Our Work
          </span>
          <h2 className="text-4xl font-bold text-navy mt-2 mb-4">{t.gallery.title}</h2>
          <p className="text-gray-500 text-lg">{t.gallery.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {displayPhotos.map((src, i) => (
            <div
              key={i}
              className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer"
            >
              <Image
                src={src}
                alt={`Gallery photo ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized={src.startsWith('data:')}
              />
              <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/40 transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
