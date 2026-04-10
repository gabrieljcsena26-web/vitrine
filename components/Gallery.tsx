'use client'
import type { Translations } from '@/lib/translations'
import Image from 'next/image'

interface Props {
  t: Translations
}

const images = [
  { seed: 'salon3', w: 800, h: 600 },
  { seed: 'salon4', w: 800, h: 600 },
  { seed: 'salon5', w: 800, h: 600 },
  { seed: 'salon6', w: 800, h: 600 },
  { seed: 'salon7', w: 800, h: 600 },
  { seed: 'salon8', w: 800, h: 600 },
]

export default function Gallery({ t }: Props) {
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
          {images.map((img, i) => (
            <div
              key={i}
              className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer"
            >
              <Image
                src={`https://picsum.photos/seed/${img.seed}/${img.w}/${img.h}`}
                alt={`Gallery ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/40 transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
